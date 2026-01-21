<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BulkCancellationOperation;
use App\Models\ClinicStaff;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BulkCancellationService
{
    protected AppointmentReassignmentService $reassignmentService;
    protected DoctorAvailabilityService $availabilityService;

    public function __construct(
        AppointmentReassignmentService $reassignmentService,
        DoctorAvailabilityService $availabilityService
    ) {
        $this->reassignmentService = $reassignmentService;
        $this->availabilityService = $availabilityService;
    }

    /**
     * Create a bulk cancellation operation
     */
    public function createOperation(array $data): BulkCancellationOperation
    {
        DB::beginTransaction();

        try {
            // Count affected appointments
            $totalAppointments = $this->countAffectedAppointments(
                $data['staff_id'],
                $data['start_date'],
                $data['end_date']
            );

            $operation = BulkCancellationOperation::create([
                'clinic_id' => $data['clinic_id'],
                'staff_id' => $data['staff_id'],
                'initiated_by' => $data['initiated_by'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'reason' => $data['reason'],
                'reason_details' => $data['reason_details'] ?? null,
                'status' => 'pending',
                'total_appointments' => $totalAppointments,
            ]);

            DB::commit();

            Log::info('Bulk cancellation operation created', [
                'operation_id' => $operation->id,
                'staff_id' => $data['staff_id'],
                'total_appointments' => $totalAppointments,
            ]);

            return $operation;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create bulk cancellation operation', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Execute the bulk cancellation and reassignment
     */
    public function executeOperation(BulkCancellationOperation $operation): void
    {
        $operation->markAsInProgress();

        try {
            // Create unavailability period for the doctor
            \App\Models\StaffUnavailabilityPeriod::create([
                'staff_id' => $operation->staff_id,
                'start_date' => $operation->start_date,
                'end_date' => $operation->end_date,
                'reason' => $operation->reason,
                'notes' => $operation->notes,
                'bulk_operation_id' => $operation->id,
            ]);

            Log::info('Created unavailability period', [
                'operation_id' => $operation->id,
                'staff_id' => $operation->staff_id,
                'start_date' => $operation->start_date->format('Y-m-d'),
                'end_date' => $operation->end_date->format('Y-m-d'),
            ]);

            // Get all affected appointments
            $appointments = $this->getAffectedAppointments(
                $operation->staff_id,
                $operation->start_date->format('Y-m-d'),
                $operation->end_date->format('Y-m-d')
            );

            Log::info('Starting bulk reassignment', [
                'operation_id' => $operation->id,
                'total_appointments' => $appointments->count(),
            ]);

            foreach ($appointments as $appointment) {
                try {
                    // Try to reassign the appointment
                    $this->reassignmentService->reassignAppointment(
                        $appointment,
                        $operation
                    );
                } catch (\Exception $e) {
                    Log::error('Failed to reassign appointment', [
                        'operation_id' => $operation->id,
                        'appointment_id' => $appointment->id,
                        'error' => $e->getMessage(),
                    ]);

                    // Mark appointment as cancelled if reassignment fails
                    $appointment->update(['status' => 'cancelled']);

                    $operation->increment('failed_reassignments');
                }
            }

            $operation->markAsCompleted();

            Log::info('Bulk cancellation operation completed', [
                'operation_id' => $operation->id,
                'reassigned' => $operation->reassigned_appointments,
                'failed' => $operation->failed_reassignments,
            ]);
        } catch (\Exception $e) {
            $operation->update(['status' => 'cancelled']);

            Log::error('Bulk cancellation operation failed', [
                'operation_id' => $operation->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get all appointments affected by the operation
     */
    protected function getAffectedAppointments(
        int $staffId,
        string $startDate,
        string $endDate
    ) {
        return Appointment::where('staff_id', $staffId)
            ->whereBetween('start_time', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59',
            ])
            ->whereIn('status', ['pending', 'confirmed'])
            ->with(['patient.user', 'staff.user', 'clinic'])
            ->get();
    }

    /**
     * Count appointments that will be affected
     */
    protected function countAffectedAppointments(
        int $staffId,
        string $startDate,
        string $endDate
    ): int {
        return Appointment::where('staff_id', $staffId)
            ->whereBetween('start_time', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59',
            ])
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();
    }

    /**
     * Preview what will happen before executing
     */
    public function previewOperation(int $staffId, string $startDate, string $endDate): array
    {
        $appointments = $this->getAffectedAppointments($staffId, $startDate, $endDate);
        $staff = ClinicStaff::with('user')->find($staffId);

        $preview = [
            'total_appointments' => $appointments->count(),
            'appointments_by_date' => [],
            'potentially_available_doctors' => [],
            'estimated_success_rate' => 0,
        ];

        // Group appointments by date
        foreach ($appointments as $appointment) {
            $date = Carbon::parse($appointment->start_time)->format('Y-m-d');

            if (!isset($preview['appointments_by_date'][$date])) {
                $preview['appointments_by_date'][$date] = [];
            }

            $preview['appointments_by_date'][$date][] = [
                'id' => $appointment->id,
                'patient_name' => $appointment->patient->user->name,
                'start_time' => $appointment->start_time,
                'service' => $appointment->service->name ?? 'N/A',
            ];
        }

        // Check for available doctors
        $reassignableCount = 0;

        Log::info('Preview: Checking available doctors', [
            'staff_id' => $staff->id,
            'staff_specialty' => $staff->specialty,
            'clinic_id' => $staff->clinic_id,
            'total_appointments' => $appointments->count(),
        ]);

        foreach ($appointments as $appointment) {
            $availableDoctors = $this->availabilityService->findAvailableDoctors(
                $appointment->clinic_id,
                $staff->specialty ?? 'Allgemein',
                Carbon::parse($appointment->start_time),
                $staff->id
            );

            Log::info('Available doctors for appointment', [
                'appointment_id' => $appointment->id,
                'appointment_time' => $appointment->start_time,
                'available_count' => $availableDoctors->count(),
            ]);

            if ($availableDoctors->count() > 0) {
                $reassignableCount++;
            }
        }

        $preview['estimated_success_rate'] = $appointments->count() > 0
            ? round(($reassignableCount / $appointments->count()) * 100, 2)
            : 0;

        // Get list of potentially available doctors
        $allDoctors = ClinicStaff::where('clinic_id', $staff->clinic_id)
            ->when($staff->specialty, function ($query, $specialty) {
                return $query->where('specialty', $specialty);
            })
            ->where('is_active', 1)
            ->where('id', '!=', $staffId)
            ->with('user')
            ->get();

        $preview['potentially_available_doctors'] = $allDoctors->map(function ($doctor) use ($startDate) {
            return [
                'id' => $doctor->id,
                'name' => $doctor->user->name,
                'specialty' => $doctor->specialty,
                'current_workload' => $this->availabilityService->getDoctorWorkload(
                    $doctor->id,
                    $startDate
                ),
            ];
        })->toArray();

        return $preview;
    }

    /**
     * Cancel an operation
     */
    public function cancelOperation(BulkCancellationOperation $operation): void
    {
        if ($operation->status === 'completed') {
            throw new \Exception('Cannot cancel a completed operation');
        }

        DB::beginTransaction();

        try {
            // Cancel all pending reassignments
            $operation->reassignments()
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);

            $operation->update(['status' => 'cancelled']);

            DB::commit();

            Log::info('Bulk cancellation operation cancelled', [
                'operation_id' => $operation->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to cancel operation', [
                'operation_id' => $operation->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get operation statistics
     */
    public function getOperationStats(BulkCancellationOperation $operation): array
    {
        $reassignments = $operation->reassignments;

        return [
            'total_appointments' => $operation->total_appointments,
            'reassigned' => $operation->reassigned_appointments,
            'cancelled' => $operation->cancelled_appointments,
            'failed' => $operation->failed_reassignments,
            'success_rate' => $operation->success_rate,
            'status_breakdown' => [
                'pending' => $reassignments->where('status', 'pending')->count(),
                'patient_notified' => $reassignments->where('status', 'patient_notified')->count(),
                'patient_approved' => $reassignments->where('status', 'patient_approved')->count(),
                'patient_rejected' => $reassignments->where('status', 'patient_rejected')->count(),
                'completed' => $reassignments->where('status', 'completed')->count(),
                'failed' => $reassignments->where('status', 'failed')->count(),
            ],
        ];
    }
}
