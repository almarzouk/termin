<?php

namespace App\Modules\Appointment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Appointment\Requests\CreateAppointmentRequest;
use App\Modules\Appointment\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Clinic;
use App\Models\WorkingHours;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::with([
            'clinic',
            'branch',
            'patient',
            'service',
            'staff.user',
            'user'
        ]);

        // Role-based filtering
        if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            if (auth()->user()->hasAnyRole(['doctor', 'nurse', 'receptionist'])) {
                // Staff sees appointments for their clinic
                $staffRecord = auth()->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $query->where('clinic_id', $staffRecord->clinic_id);
                }
            } else {
                // Customers see only their own appointments
                $query->where('user_id', auth()->id());
            }
        }

        // Filter by clinic
        if ($request->has('clinic_id')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        // Filter by branch
        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        // Filter by patient
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filter by staff
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        // Filter upcoming appointments
        if ($request->has('upcoming') && $request->upcoming) {
            $query->upcoming();
        }

        // Filter today's appointments
        if ($request->has('today') && $request->today) {
            $query->today();
        }

        // Sort by date and time
        $query->orderBy('appointment_date', $request->get('sort_order', 'asc'))
            ->orderBy('start_time', 'asc');

        $appointments = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    /**
     * Check availability for an appointment
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date|after_or_equal:today',
            'staff_id' => 'nullable|exists:clinic_staff,id',
        ]);

        $service = Service::findOrFail($request->service_id);
        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->dayOfWeek; // 0 = Sunday, 6 = Saturday

        // Get available time slots
        $timeSlots = $this->getAvailableTimeSlots(
            $request->clinic_id,
            $request->service_id,
            $request->date,
            $request->staff_id
        );

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $request->date,
                'service' => $service->only(['id', 'name', 'duration', 'price']),
                'available_slots' => $timeSlots,
            ],
        ]);
    }

    /**
     * Store a newly created appointment
     */
    public function store(CreateAppointmentRequest $request)
    {
        try {
            $service = Service::findOrFail($request->service_id);

            // Combine date and time to create full DateTime
            $startDateTime = Carbon::parse($request->appointment_date . ' ' . $request->start_time);
            $endDateTime = $startDateTime->copy()->addMinutes($service->duration);

            // Check if time slot is available
            $isAvailable = $this->isTimeSlotAvailable(
                $request->clinic_id,
                $request->appointment_date,
                $request->start_time,
                $endDateTime->format('H:i:s'),
                $request->staff_id
            );

            if (!$isAvailable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dieser Zeitslot ist nicht verfügbar.',
                ], 422);
            }

            $appointment = Appointment::create([
                'clinic_id' => $request->clinic_id,
                'branch_id' => $request->branch_id,
                'patient_id' => $request->patient_id,
                'service_id' => $request->service_id,
                'staff_id' => $request->staff_id,
                'user_id' => auth()->id(),
                'start_time' => $startDateTime,
                'end_time' => $endDateTime,
                'status' => 'pending',
                'customer_notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich gebucht.',
                'data' => $appointment->load(['clinic', 'patient', 'service', 'staff.user']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen des Termins.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified appointment
     */
    public function show($id)
    {
        $appointment = Appointment::with([
            'clinic',
            'branch',
            'patient',
            'service',
            'staff.user',
            'user',
            'medicalRecord',
            'history.changedBy'
        ])->findOrFail($id);

        // Check authorization
        if (!$this->canAccessAppointment($appointment)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Termin anzuzeigen.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $appointment,
        ]);
    }

    /**
     * Update the specified appointment
     */
    public function update(UpdateAppointmentRequest $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        // Check authorization
        if (!$this->canModifyAppointment($appointment)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Termin zu ändern.',
            ], 403);
        }

        // Prevent modifying completed or cancelled appointments
        if (in_array($appointment->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Abgeschlossene oder stornierte Termine können nicht geändert werden.',
            ], 422);
        }

        try {
            // If date or time is being changed, check availability
            if ($request->has('appointment_date') || $request->has('start_time')) {
                $date = $request->appointment_date ?? $appointment->appointment_date;
                $startTime = $request->start_time ?? $appointment->start_time;
                $service = $appointment->service;
                $endTime = Carbon::parse($startTime)->addMinutes($service->duration)->format('H:i');

                $isAvailable = $this->isTimeSlotAvailable(
                    $appointment->clinic_id,
                    $date,
                    $startTime,
                    $endTime,
                    $request->staff_id ?? $appointment->staff_id,
                    $appointment->id
                );

                if (!$isAvailable) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Dieser Zeitslot ist nicht verfügbar.',
                    ], 422);
                }

                $appointment->end_time = $endTime;
            }

            $appointment->update($request->except(['end_time']));

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich aktualisiert.',
                'data' => $appointment->load(['clinic', 'patient', 'service', 'staff.user']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des Termins.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an appointment
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ], [
            'cancellation_reason.required' => 'Bitte geben Sie einen Grund für die Stornierung an.',
        ]);

        $appointment = Appointment::findOrFail($id);

        // Check authorization
        if (!$this->canModifyAppointment($appointment)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Termin zu stornieren.',
            ], 403);
        }

        if (in_array($appointment->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Dieser Termin kann nicht storniert werden.',
            ], 422);
        }

        try {
            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->cancellation_reason,
                'cancelled_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich storniert.',
                'data' => $appointment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Stornieren des Termins.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm an appointment
     */
    public function confirm($id)
    {
        $appointment = Appointment::findOrFail($id);

        // Only staff can confirm
        if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Termine zu bestätigen.',
            ], 403);
        }

        if ($appointment->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Nur ausstehende Termine können bestätigt werden.',
            ], 422);
        }

        try {
            $appointment->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich bestätigt.',
                'data' => $appointment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Bestätigen des Termins.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete an appointment
     */
    public function complete($id)
    {
        $appointment = Appointment::findOrFail($id);

        // Only staff can complete
        if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Termine abzuschließen.',
            ], 403);
        }

        if (!in_array($appointment->status, ['confirmed', 'pending'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nur bestätigte Termine können abgeschlossen werden.',
            ], 422);
        }

        try {
            $appointment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich abgeschlossen.',
                'data' => $appointment,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abschließen des Termins.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available time slots for a date based on working hours
     */
    private function getAvailableTimeSlots($clinicId, $serviceId, $date, $staffId = null)
    {
        $service = Service::findOrFail($serviceId);
        $slots = [];

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        // Get working hours for the clinic or specific staff
        $workingHoursQuery = WorkingHours::where('clinic_id', $clinicId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true);

        if ($staffId) {
            $workingHoursQuery->where('staff_id', $staffId);
        } else {
            $workingHoursQuery->whereNull('staff_id'); // Get clinic-wide working hours
        }

        $workingHours = $workingHoursQuery->get();

        // If no working hours found, return empty slots
        if ($workingHours->isEmpty()) {
            return $slots;
        }

        // Generate slots for each working hours period
        foreach ($workingHours as $hours) {
            $start = Carbon::parse($date)->setTimeFromTimeString($hours->start_time);
            $end = Carbon::parse($date)->setTimeFromTimeString($hours->end_time);

            while ($start->lt($end)) {
                $slotStart = $start->format('H:i');
                $slotEnd = $start->copy()->addMinutes($service->duration)->format('H:i');

                // Check if slot end time is within working hours
                if ($start->copy()->addMinutes($service->duration)->lte($end)) {
                    if ($this->isTimeSlotAvailable($clinicId, $date, $slotStart, $slotEnd, $staffId)) {
                        $slots[] = [
                            'start_time' => $slotStart,
                            'end_time' => $slotEnd,
                        ];
                    }
                }

                $start->addMinutes(30); // 30-minute intervals
            }
        }

        return $slots;
    }

    /**
     * Check if a time slot is available
     */
    private function isTimeSlotAvailable($clinicId, $date, $startTime, $endTime, $staffId = null, $excludeAppointmentId = null)
    {
        $query = Appointment::where('clinic_id', $clinicId)
            ->where('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q2) use ($startTime, $endTime) {
                        $q2->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            });

        if ($staffId) {
            $query->where('staff_id', $staffId);
        }

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        return !$query->exists();
    }

    /**
     * Check if user can access appointment
     */
    private function canAccessAppointment(Appointment $appointment): bool
    {
        if (auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            return true;
        }

        return $appointment->user_id === auth()->id();
    }

    /**
     * Check if user can modify appointment
     */
    private function canModifyAppointment(Appointment $appointment): bool
    {
        if (auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'receptionist'])) {
            return true;
        }

        // Users can modify their own appointments
        return $appointment->user_id === auth()->id();
    }
}
