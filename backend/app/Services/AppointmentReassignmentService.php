<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentReassignment;
use App\Models\BulkCancellationOperation;
use App\Models\ClinicStaff;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentReassignmentService
{
    protected DoctorAvailabilityService $availabilityService;
    protected NotificationService $notificationService;

    public function __construct(
        DoctorAvailabilityService $availabilityService,
        NotificationService $notificationService
    ) {
        $this->availabilityService = $availabilityService;
        $this->notificationService = $notificationService;
    }

    /**
     * Reassign a single appointment to a new doctor
     */
    public function reassignAppointment(
        Appointment $appointment,
        BulkCancellationOperation $operation,
        ?int $newStaffId = null,
        ?Carbon $newStartTime = null
    ): AppointmentReassignment {
        DB::beginTransaction();

        try {
            // Get original staff info
            $originalStaff = $appointment->staff;

            // If no new staff specified, find the best available doctor
            if (!$newStaffId) {
                $bestDoctor = $this->availabilityService->findBestDoctorForReassignment(
                    $appointment->clinic_id,
                    $originalStaff->specialty ?? 'Allgemein',
                    Carbon::parse($appointment->start_time),
                    $originalStaff->id
                );

                if (!$bestDoctor) {
                    throw new \Exception('No available doctors found for reassignment');
                }

                $newStaffId = $bestDoctor['doctor']->id;

                // Use the first available slot if no new time specified
                if (!$newStartTime && !empty($bestDoctor['available_slots'])) {
                    $newStartTime = Carbon::parse($bestDoctor['available_slots'][0]['datetime']);
                }
            }

            $finalNewStartTime = $newStartTime ?? $appointment->start_time;

            // Check if time/date changed - only requires approval if time changed
            $timeChanged = Carbon::parse($appointment->start_time)->format('Y-m-d H:i')
                        !== Carbon::parse($finalNewStartTime)->format('Y-m-d H:i');

            // Create reassignment record
            $reassignment = AppointmentReassignment::create([
                'bulk_operation_id' => $operation->id,
                'appointment_id' => $appointment->id,
                'original_staff_id' => $originalStaff->id,
                'new_staff_id' => $newStaffId,
                'original_start_time' => $appointment->start_time,
                'new_start_time' => $finalNewStartTime,
                'status' => 'pending',
            ]);

            // If time hasn't changed (same date and time, only doctor changed)
            // Auto-approve the reassignment
            if (!$timeChanged) {
                // Update appointment immediately
                $appointment->update([
                    'staff_id' => $newStaffId,
                    'status' => 'confirmed',
                ]);

                // Mark reassignment as auto-approved
                $reassignment->update([
                    'status' => 'completed',
                    'patient_response' => 'auto_approved',
                    'response_at' => now(),
                ]);

                Log::info('Appointment auto-approved (same time, different doctor)', [
                    'appointment_id' => $appointment->id,
                    'reassignment_id' => $reassignment->id,
                    'from_staff' => $originalStaff->id,
                    'to_staff' => $newStaffId,
                    'time' => $finalNewStartTime,
                ]);
            } else {
                // Time changed - send notification and wait for patient approval
                $this->sendPatientNotification($reassignment);

                Log::info('Appointment requires patient approval (time changed)', [
                    'appointment_id' => $appointment->id,
                    'reassignment_id' => $reassignment->id,
                    'from_staff' => $originalStaff->id,
                    'to_staff' => $newStaffId,
                    'original_time' => $appointment->start_time,
                    'new_time' => $finalNewStartTime,
                ]);
            }

            // Update bulk operation stats (increment reassigned count)
            $operation->increment('reassigned_appointments');

            DB::commit();

            Log::info('Appointment reassignment completed', [
                'appointment_id' => $appointment->id,
                'reassignment_id' => $reassignment->id,
                'time_changed' => $timeChanged,
                'status' => $reassignment->status,
            ]);

            return $reassignment;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to reassign appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Process patient approval for reassignment
     */
    public function processPatientApproval(AppointmentReassignment $reassignment): void
    {
        DB::beginTransaction();

        try {
            $appointment = $reassignment->appointment;

            // Update appointment with new details
            $appointment->update([
                'staff_id' => $reassignment->new_staff_id,
                'start_time' => $reassignment->new_start_time,
                'status' => 'confirmed',
            ]);

            // Mark reassignment as completed
            $reassignment->markAsCompleted();

            // Update bulk operation stats
            $this->updateBulkOperationStats($reassignment->bulk_operation_id);

            DB::commit();

            Log::info('Patient approved reassignment', [
                'reassignment_id' => $reassignment->id,
                'appointment_id' => $appointment->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to process patient approval', [
                'reassignment_id' => $reassignment->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Process patient rejection
     */
    public function processPatientRejection(
        AppointmentReassignment $reassignment,
        string $reason
    ): void {
        DB::beginTransaction();

        try {
            // Mark reassignment as rejected
            $reassignment->markAsPatientRejected($reason);

            // Cancel the original appointment
            $appointment = $reassignment->appointment;
            $appointment->update(['status' => 'cancelled']);

            // Update bulk operation stats
            $this->updateBulkOperationStats($reassignment->bulk_operation_id);

            DB::commit();

            Log::info('Patient rejected reassignment', [
                'reassignment_id' => $reassignment->id,
                'appointment_id' => $appointment->id,
                'reason' => $reason,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to process patient rejection', [
                'reassignment_id' => $reassignment->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Send notification to patient about reassignment
     */
    protected function sendPatientNotification(AppointmentReassignment $reassignment): void
    {
        $appointment = $reassignment->appointment;
        $patient = $appointment->patient;
        $newStaff = ClinicStaff::find($reassignment->new_staff_id);

        $notificationData = [
            'patient_name' => $patient->user->name,
            'original_doctor' => $reassignment->originalStaff->user->name,
            'new_doctor' => $newStaff->user->name,
            'original_time' => Carbon::parse($reassignment->original_start_time)->format('d.m.Y H:i'),
            'new_time' => Carbon::parse($reassignment->new_start_time)->format('d.m.Y H:i'),
            'clinic_name' => $appointment->clinic->name,
            'approval_link' => url("/api/appointments/reassignment/{$reassignment->id}/approve"),
            'rejection_link' => url("/api/appointments/reassignment/{$reassignment->id}/reject"),
        ];

        $this->notificationService->sendReassignmentNotification(
            $patient->user,
            $notificationData
        );

        $reassignment->markAsPatientNotified(json_encode($notificationData));
    }

    /**
     * Update bulk operation statistics
     */
    protected function updateBulkOperationStats(int $operationId): void
    {
        $operation = BulkCancellationOperation::find($operationId);

        if (!$operation) {
            return;
        }

        $reassignments = $operation->reassignments;

        $operation->update([
            'cancelled_appointments' => $reassignments->whereIn('status', ['patient_rejected', 'failed'])->count(),
            'reassigned_appointments' => $reassignments->where('status', 'completed')->count(),
            'failed_reassignments' => $reassignments->where('status', 'failed')->count(),
        ]);
    }

    /**
     * Get reassignment suggestions for an appointment
     */
    public function getReassignmentSuggestions(Appointment $appointment): array
    {
        $originalStaff = $appointment->staff;
        $originalDateTime = Carbon::parse($appointment->start_time);

        // Find available doctors at the same time
        $availableDoctors = $this->availabilityService->findAvailableDoctors(
            $appointment->clinic_id,
            $originalStaff->specialty ?? 'Allgemein',
            $originalDateTime,
            $originalStaff->id
        );

        $suggestions = [];

        foreach ($availableDoctors as $doctorData) {
            $doctor = $doctorData['doctor'];

            $suggestions[] = [
                'staff_id' => $doctor->id,
                'doctor_name' => $doctor->user->name,
                'specialty' => $doctor->specialty,
                'workload' => $doctorData['workload'],
                'available_at_same_time' => true,
                'alternative_slots' => [],
            ];
        }

        // If no doctors available at same time, find alternatives
        if (empty($suggestions)) {
            $allDoctors = ClinicStaff::where('clinic_id', $appointment->clinic_id)
                ->when($originalStaff->specialty, function ($query, $specialty) {
                    return $query->where('specialty', $specialty);
                })
                ->where('is_active', 1)
                ->where('id', '!=', $originalStaff->id)
                ->get();

            foreach ($allDoctors as $doctor) {
                $alternativeSlots = $this->availabilityService->getAlternativeSlots(
                    $doctor,
                    $originalDateTime,
                    7 // Search for next 7 days
                );

                if (!empty($alternativeSlots)) {
                    $suggestions[] = [
                        'staff_id' => $doctor->id,
                        'doctor_name' => $doctor->user->name,
                        'specialty' => $doctor->specialty,
                        'workload' => $this->availabilityService->getDoctorWorkload(
                            $doctor->id,
                            $originalDateTime->format('Y-m-d')
                        ),
                        'available_at_same_time' => false,
                        'alternative_slots' => $alternativeSlots,
                    ];
                }
            }
        }

        return $suggestions;
    }
}
