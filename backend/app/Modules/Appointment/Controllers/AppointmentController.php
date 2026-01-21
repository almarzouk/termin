<?php

namespace App\Modules\Appointment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Appointment\Requests\CreateAppointmentRequest;
use App\Modules\Appointment\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Clinic;
use App\Services\SubscriptionLimitService;
use App\Services\RecurringAppointmentService;
use App\Services\AppointmentReminderService;
use App\Services\CancellationService;
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
            'doctor.user', // Ensure doctor relationship is loaded
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
                // Patients see only their own appointments
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
        // Check if patient exists, if not create one automatically
        $patient = \App\Modules\Patient\Models\Patient::find($request->patient_id);
        if (!$patient) {
            // Check if patient exists for current user
            $user = auth()->user();
            $existingPatient = \App\Modules\Patient\Models\Patient::where('user_id', $user->id)->first();

            if (!$existingPatient) {
                // Auto-create patient record for the current user
                $nameParts = explode(' ', $user->name, 2);
                $patient = \App\Modules\Patient\Models\Patient::create([
                    'user_id' => $user->id,
                    'patient_type' => 'self',
                    'first_name' => $nameParts[0] ?? $user->name ?? 'Unknown',
                    'last_name' => $nameParts[1] ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'gender' => $user->gender,
                    'date_of_birth' => $user->date_of_birth,
                ]);

                // Update request with new patient_id
                $request->merge(['patient_id' => $patient->id]);
            } else {
                $patient = $existingPatient;
                $request->merge(['patient_id' => $patient->id]);
            }
        }

        // Check subscription limits ONLY if current user is the clinic owner
        // Patients booking appointments should NOT be checked for subscription
        $currentUser = auth()->user();
        $clinic = Clinic::find($request->clinic_id);

        if ($clinic && $clinic->owner_id && $clinic->owner_id === $currentUser->id) {
            // Only check limits if the current user IS the clinic owner
            $limitService = new SubscriptionLimitService();
            $limitCheck = $limitService->canCreateAppointment($currentUser);

            if (!$limitCheck['allowed']) {
                return response()->json([
                    'success' => false,
                    'message' => $limitCheck['message'],
                    'current' => $limitCheck['current'],
                    'limit' => $limitCheck['limit'],
                ], 403);
            }
        }

        try {
            // Get service duration if service_id is provided
            $duration = 30; // Default duration
            if ($request->service_id) {
                $service = Service::findOrFail($request->service_id);
                $duration = $service->duration;
            }

            // Combine date and time to create full DateTime
            $startDateTime = Carbon::parse($request->appointment_date . ' ' . $request->start_time);
            $endDateTime = $startDateTime->copy()->addMinutes($duration);

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
     * Cancel an appointment with policy enforcement
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        $appointment = Appointment::findOrFail($id);

        // Check authorization
        \Log::info('Cancel appointment authorization check:', [
            'appointment_id' => $id,
            'appointment_user_id' => $appointment->user_id,
            'current_user_id' => auth()->id(),
            'user_roles' => auth()->user()->roles->pluck('name'),
            'can_modify' => $this->canModifyAppointment($appointment)
        ]);

        if (!$this->canModifyAppointment($appointment)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Termin zu stornieren.',
            ], 403);
        }

        try {
            $cancellationService = new CancellationService();
            $result = $cancellationService->processCancel(
                $appointment,
                $request->cancellation_reason,
                auth()->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Termin erfolgreich storniert.',
                'data' => $result['appointment'],
                'fee' => $result['fee'],
                'is_late' => $result['is_late'],
            ]);
        } catch (\Exception $e) {
            \Log::error('Appointment cancellation error:', [
                'appointment_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 422);
        }
    }

    /**
     * Confirm an appointment
     */
    public function confirm($id)
    {
        $appointment = Appointment::findOrFail($id);

        \Log::info('Confirm appointment check:', [
            'appointment_id' => $id,
            'user_id' => auth()->id(),
            'user_roles' => auth()->user()->roles->pluck('name'),
            'appointment_status' => $appointment->status
        ]);

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
            \Log::error('Appointment confirmation error:', [
                'appointment_id' => $id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Bestätigen des Termins.',
                'error' => config('app.debug') ? $e->getMessage() : null,
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
     * Create recurring appointment series
     */
    public function createRecurring(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'branch_id' => 'nullable|exists:clinic_branches,id',
            'patient_id' => 'required|exists:patients,id',
            'service_id' => 'required|exists:services,id',
            'staff_id' => 'nullable|exists:clinic_staff,id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'recurring_pattern' => 'required|in:daily,weekly,monthly,yearly',
            'recurring_interval' => 'nullable|integer|min:1',
            'recurring_days' => 'nullable|array',
            'recurring_day_of_month' => 'nullable|integer|min:1|max:31',
            'recurring_end_date' => 'nullable|date|after:start_time',
            'recurring_count' => 'nullable|integer|min:2|max:100',
        ]);

        try {
            $service = Service::findOrFail($request->service_id);
            $startDateTime = Carbon::parse($request->start_time);
            $endDateTime = $startDateTime->copy()->addMinutes($service->duration);

            $data = [
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
                'recurring_pattern' => $request->recurring_pattern,
                'recurring_interval' => $request->recurring_interval ?? 1,
                'recurring_days' => $request->recurring_days,
                'recurring_day_of_month' => $request->recurring_day_of_month,
                'recurring_end_date' => $request->recurring_end_date,
                'recurring_count' => $request->recurring_count,
            ];

            $recurringService = new RecurringAppointmentService();
            $parent = $recurringService->createRecurringSeries($data);

            return response()->json([
                'success' => true,
                'message' => 'Wiederkehrende Termine erfolgreich erstellt.',
                'data' => $parent,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der wiederkehrenden Termine.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recurring series appointments
     */
    public function getRecurringSeries($id)
    {
        $appointment = Appointment::with('recurringChildren')->findOrFail($id);

        if (!$appointment->isRecurring()) {
            return response()->json([
                'success' => false,
                'message' => 'Dies ist kein wiederkehrender Termin.',
            ], 422);
        }

        $parent = $appointment->isRecurringChild()
            ? $appointment->recurringParent
            : $appointment;

        return response()->json([
            'success' => true,
            'data' => [
                'parent' => $parent,
                'children' => $parent->recurringChildren,
                'total_count' => $parent->recurringChildren->count() + 1,
            ],
        ]);
    }

    /**
     * Update recurring series
     */
    public function updateRecurringSeries(Request $request, $id)
    {
        try {
            $recurringService = new RecurringAppointmentService();
            $result = $recurringService->updateSeries($id, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Wiederkehrende Termine aktualisiert.',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete recurring series
     */
    public function deleteRecurringSeries($id)
    {
        try {
            $recurringService = new RecurringAppointmentService();
            $recurringService->deleteSeries($id);

            return response()->json([
                'success' => true,
                'message' => 'Alle wiederkehrenden Termine gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check cancellation policy
     */
    public function checkCancellationPolicy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $cancellationService = new CancellationService();
        $result = $cancellationService->canCancel($appointment, auth()->user());

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get cancellation statistics
     */
    public function getCancellationStats(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $cancellationService = new CancellationService();
        $stats = $cancellationService->getStatistics(
            $request->clinic_id,
            $request->start_date ? Carbon::parse($request->start_date) : null,
            $request->end_date ? Carbon::parse($request->end_date) : null
        );

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Schedule reminders for appointment
     */
    public function scheduleReminders(Request $request, $id)
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'timings' => 'required|array',
            'timings.*' => 'integer|in:1440,720,360,60',
            'channel' => 'required|in:email,sms,both',
        ]);

        $appointment = Appointment::findOrFail($id);
        $reminderService = new AppointmentReminderService();

        $reminderService->scheduleReminders($appointment, [
            'enabled' => $request->enabled,
            'timings' => $request->timings,
            'channel' => $request->channel,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Erinnerungen geplant.',
        ]);
    }

    /**
     * Get appointment reminders
     */
    public function getReminders($id)
    {
        $appointment = Appointment::with('reminders')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $appointment->reminders,
        ]);
    }

    /**
     * Get available time slots for a date based on working hours
     */
    private function getAvailableTimeSlots($clinicId, $serviceId, $date, $staffId = null)
    {
        $service = Service::findOrFail($serviceId);
        $slots = [];

        // Generate default working hours (9 AM - 5 PM)
        $start = Carbon::parse($date)->setTime(9, 0);
        $end = Carbon::parse($date)->setTime(17, 0);

        while ($start->lt($end)) {
            $slotStart = $start->format('H:i');
            $slotEnd = $start->copy()->addMinutes($service->duration)->format('H:i');

            // Check if slot end time is within working hours
            if ($start->copy()->addMinutes($service->duration)->lte($end)) {
                if ($this->isTimeSlotAvailable($clinicId, $date, $slotStart, $slotEnd, $staffId)) {
                    $slots[] = [
                        'start_time' => $slotStart,
                        'end_time' => $slotEnd,
                        'available' => true,
                    ];
                }
            }

            $start->addMinutes(30); // 30-minute intervals
        }

        return $slots;
    }

    /**
     * Check if a time slot is available
     */
    private function isTimeSlotAvailable($clinicId, $date, $startTime, $endTime, $staffId = null, $excludeAppointmentId = null)
    {
        // Combine date with time to create full datetime strings for comparison
        $requestStartDateTime = $date . ' ' . $startTime;
        $requestEndDateTime = $date . ' ' . $endTime;

        $query = Appointment::where('clinic_id', $clinicId)
            ->whereDate('start_time', $date) // Use whereDate on start_time instead of appointment_date
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($requestStartDateTime, $requestEndDateTime) {
                // Check for any overlap:
                // 1. New appointment starts during existing appointment
                $q->whereBetween('start_time', [$requestStartDateTime, $requestEndDateTime])
                    // 2. New appointment ends during existing appointment
                    ->orWhereBetween('end_time', [$requestStartDateTime, $requestEndDateTime])
                    // 3. New appointment completely contains existing appointment
                    ->orWhere(function ($q2) use ($requestStartDateTime, $requestEndDateTime) {
                        $q2->where('start_time', '>=', $requestStartDateTime)
                            ->where('end_time', '<=', $requestEndDateTime);
                    })
                    // 4. Existing appointment completely contains new appointment
                    ->orWhere(function ($q3) use ($requestStartDateTime, $requestEndDateTime) {
                        $q3->where('start_time', '<=', $requestStartDateTime)
                            ->where('end_time', '>=', $requestEndDateTime);
                    });
            });

        if ($staffId) {
            $query->where('staff_id', $staffId);
        }

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        $conflictingAppointments = $query->get(['id', 'start_time', 'end_time', 'staff_id']);
        
        if ($conflictingAppointments->count() > 0) {
            \Log::warning('Time slot conflict detected:', [
                'clinic_id' => $clinicId,
                'date' => $date,
                'requested_start' => $requestStartDateTime,
                'requested_end' => $requestEndDateTime,
                'staff_id' => $staffId,
                'conflicting_appointments' => $conflictingAppointments->toArray(),
            ]);
        } else {
            \Log::info('No conflicts found for time slot:', [
                'clinic_id' => $clinicId,
                'date' => $date,
                'requested_start' => $requestStartDateTime,
                'requested_end' => $requestEndDateTime,
                'staff_id' => $staffId,
            ]);
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
