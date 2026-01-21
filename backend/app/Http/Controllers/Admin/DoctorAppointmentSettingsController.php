<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClinicStaff;
use Illuminate\Http\Request;

class DoctorAppointmentSettingsController extends Controller
{
    /**
     * Get doctor appointment settings
     */
    public function show($staffId)
    {
        $staff = ClinicStaff::with(['user', 'clinic'])->findOrFail($staffId);

        // Check authorization
        $user = auth()->user();
        if (!$user->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            // Doctor can only view their own settings
            if ($staff->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        } elseif ($user->hasRole('clinic_owner')) {
            // Clinic owner can only view settings of their clinic's staff
            $clinicOwner = $user->clinicOwner;

            if (!$clinicOwner || $staff->clinic_id !== $clinicOwner->clinic_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie können nur Einstellungen für Personal Ihrer eigenen Klinik anzeigen',
                ], 403);
            }
        } elseif ($user->hasRole('clinic_manager')) {
            // Clinic manager can only view settings of their clinic's staff
            $managerClinic = $user->clinicStaff()->first();

            if (!$managerClinic || $staff->clinic_id !== $managerClinic->clinic_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie können nur Einstellungen für Personal Ihrer eigenen Klinik anzeigen',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'staff_id' => $staff->id,
                'staff_name' => $staff->user->name,
                'clinic_name' => $staff->clinic->name,
                'max_daily_appointments' => $staff->max_daily_appointments,
                'appointment_duration_minutes' => $staff->appointment_duration_minutes,
                'allow_online_booking' => $staff->allow_online_booking,
                'is_active' => $staff->is_active,
            ],
        ]);
    }

    /**
     * Update doctor appointment settings
     */
    public function update(Request $request, $staffId)
    {
        $request->validate([
            'max_daily_appointments' => 'required|integer|min:1|max:100',
            'appointment_duration_minutes' => 'required|integer|min:10|max:180',
            'allow_online_booking' => 'required|boolean',
        ]);

        $staff = ClinicStaff::findOrFail($staffId);

        // Check authorization
        $user = auth()->user();
        if (!$user->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nur Administratoren können Termineinstellungen ändern',
            ], 403);
        }

        if ($user->hasRole('clinic_owner')) {
            // Clinic owner can only update settings of their clinic's staff
            $clinicOwner = $user->clinicOwner;

            if (!$clinicOwner || $staff->clinic_id !== $clinicOwner->clinic_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie können nur Einstellungen für Personal Ihrer eigenen Klinik aktualisieren',
                ], 403);
            }
        } elseif ($user->hasRole('clinic_manager')) {
            // Clinic manager can only update settings of their clinic's staff
            $managerClinic = $user->clinicStaff()->first();

            if (!$managerClinic || $staff->clinic_id !== $managerClinic->clinic_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie können nur Einstellungen für Personal Ihrer eigenen Klinik aktualisieren',
                ], 403);
            }
        }

        $staff->update([
            'max_daily_appointments' => $request->max_daily_appointments,
            'appointment_duration_minutes' => $request->appointment_duration_minutes,
            'allow_online_booking' => $request->allow_online_booking,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Termineinstellungen erfolgreich aktualisiert',
            'data' => [
                'staff_id' => $staff->id,
                'max_daily_appointments' => $staff->max_daily_appointments,
                'appointment_duration_minutes' => $staff->appointment_duration_minutes,
                'allow_online_booking' => $staff->allow_online_booking,
            ],
        ]);
    }

    /**
     * Get daily appointment statistics for a doctor
     */
    public function dailyStats($staffId, Request $request)
    {
        $staff = ClinicStaff::findOrFail($staffId);

        // Check authorization
        $user = auth()->user();
        if (!$user->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            if ($staff->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        }

        $date = $request->date ?? now()->format('Y-m-d');

        $appointments = $staff->appointments()
            ->where('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->get();

        $bookedCount = $appointments->count();
        $availableSlots = $staff->max_daily_appointments - $bookedCount;

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'max_daily_appointments' => $staff->max_daily_appointments,
                'booked_appointments' => $bookedCount,
                'available_slots' => max(0, $availableSlots),
                'utilization_percentage' => $staff->max_daily_appointments > 0
                    ? round(($bookedCount / $staff->max_daily_appointments) * 100, 2)
                    : 0,
                'appointments' => $appointments->map(function ($apt) {
                    return [
                        'id' => $apt->id,
                        'patient_name' => $apt->patient->user->name ?? $apt->patient->first_name . ' ' . $apt->patient->last_name,
                        'appointment_time' => $apt->start_time,
                        'service' => $apt->service->name ?? null,
                        'status' => $apt->status,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Get weekly appointment statistics
     */
    public function weeklyStats($staffId, Request $request)
    {
        $staff = ClinicStaff::findOrFail($staffId);

        // Check authorization
        $user = auth()->user();
        if (!$user->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            if ($staff->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }
        }

        $startDate = $request->start_date ?? now()->startOfWeek()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfWeek()->format('Y-m-d');

        $appointments = $staff->appointments()
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->get()
            ->groupBy('appointment_date');

        $weeklyData = [];
        $currentDate = \Carbon\Carbon::parse($startDate);
        $endDateCarbon = \Carbon\Carbon::parse($endDate);

        while ($currentDate->lte($endDateCarbon)) {
            $dateStr = $currentDate->format('Y-m-d');
            $dayAppointments = $appointments->get($dateStr, collect());

            $weeklyData[] = [
                'date' => $dateStr,
                'day_name' => $currentDate->locale('de')->dayName,
                'booked_appointments' => $dayAppointments->count(),
                'max_daily_appointments' => $staff->max_daily_appointments,
                'available_slots' => max(0, $staff->max_daily_appointments - $dayAppointments->count()),
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_appointments' => $appointments->flatten()->count(),
                'daily_breakdown' => $weeklyData,
            ],
        ]);
    }
}
