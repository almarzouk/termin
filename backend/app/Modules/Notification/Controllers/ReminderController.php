<?php

namespace App\Modules\Notification\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Prescription;
use App\Models\MedicalRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    /**
     * Get upcoming appointment reminders
     */
    public function upcomingAppointments(Request $request)
    {
        $user = auth()->user();
        $hoursAhead = $request->hours_ahead ?? 72; // Default 3 days

        // Get user's appointments
        $appointments = Appointment::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', '>=', now())
            ->where('appointment_date', '<=', now()->addHours($hoursAhead))
            ->with(['clinic', 'service', 'staff.user'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'appointments' => $appointments,
                'count' => $appointments->count(),
            ],
        ]);
    }

    /**
     * Send appointment reminders
     */
    public function sendAppointmentReminders()
    {
        // Check authorization
        if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Erinnerungen zu senden.',
            ], 403);
        }

        $sent = 0;
        $failed = 0;

        // Get appointments in next 24 hours that need reminders
        $appointments = Appointment::whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('appointment_date', [
                now()->addHours(23),
                now()->addHours(25)
            ])
            ->with(['user', 'clinic', 'service', 'staff.user'])
            ->get();

        foreach ($appointments as $appointment) {
            try {
                // Check if reminder already sent
                $existingReminder = Notification::where('user_id', $appointment->user_id)
                    ->where('type', 'appointment_reminder')
                    ->whereJsonContains('data->appointment_id', $appointment->id)
                    ->where('created_at', '>=', now()->subHours(24))
                    ->exists();

                if (!$existingReminder) {
                    $this->createAppointmentReminder($appointment);
                    $sent++;
                }
            } catch (\Exception $e) {
                $failed++;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Erinnerungen gesendet: {$sent}, Fehlgeschlagen: {$failed}",
            'data' => [
                'sent' => $sent,
                'failed' => $failed,
            ],
        ]);
    }

    /**
     * Get prescription reminders
     */
    public function prescriptionReminders()
    {
        $user = auth()->user();

        // Get user's patient record
        $patient = $user->patient;
        if (!$patient) {
            return response()->json([
                'success' => true,
                'data' => [
                    'prescriptions' => [],
                    'count' => 0,
                ],
            ]);
        }

        // Get active prescriptions ending soon (within 3 days)
        $prescriptions = Prescription::whereHas('medicalRecord', function ($query) use ($patient) {
            $query->where('patient_id', $patient->id);
        })
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->where('end_date', '<=', now()->addDays(3))
            ->with(['medicalRecord.appointment.service'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'prescriptions' => $prescriptions,
                'count' => $prescriptions->count(),
            ],
        ]);
    }

    /**
     * Get follow-up reminders
     */
    public function followUpReminders()
    {
        $user = auth()->user();

        // Get user's patient record
        $patient = $user->patient;
        if (!$patient) {
            return response()->json([
                'success' => true,
                'data' => [
                    'follow_ups' => [],
                    'count' => 0,
                ],
            ]);
        }

        // Get medical records with upcoming follow-ups
        $followUps = MedicalRecord::where('patient_id', $patient->id)
            ->whereNotNull('follow_up_date')
            ->where('follow_up_date', '>=', now())
            ->where('follow_up_date', '<=', now()->addDays(7))
            ->with(['appointment.service', 'appointment.staff.user', 'clinic'])
            ->orderBy('follow_up_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'follow_ups' => $followUps,
                'count' => $followUps->count(),
            ],
        ]);
    }

    /**
     * Create appointment reminder notification
     */
    private function createAppointmentReminder(Appointment $appointment)
    {
        $appointmentDate = Carbon::parse($appointment->appointment_date . ' ' . $appointment->start_time);
        $formattedDate = $appointmentDate->format('d.m.Y');
        $formattedTime = $appointmentDate->format('H:i');

        Notification::create([
            'user_id' => $appointment->user_id,
            'type' => 'appointment_reminder',
            'title' => 'Terminerinnerung',
            'message' => "Ihr Termin bei {$appointment->clinic->name} ist morgen am {$formattedDate} um {$formattedTime} Uhr.",
            'data' => [
                'appointment_id' => $appointment->id,
                'clinic_name' => $appointment->clinic->name,
                'service_name' => $appointment->service->name,
                'appointment_date' => $formattedDate,
                'start_time' => $formattedTime,
            ],
        ]);
    }

    /**
     * Create appointment confirmation notification
     */
    public function sendAppointmentConfirmation(Appointment $appointment)
    {
        $appointmentDate = Carbon::parse($appointment->appointment_date . ' ' . $appointment->start_time);
        $formattedDate = $appointmentDate->format('d.m.Y');
        $formattedTime = $appointmentDate->format('H:i');

        Notification::create([
            'user_id' => $appointment->user_id,
            'type' => 'appointment_confirmed',
            'title' => 'Termin bestätigt',
            'message' => "Ihr Termin am {$formattedDate} um {$formattedTime} Uhr wurde bestätigt.",
            'data' => [
                'appointment_id' => $appointment->id,
                'clinic_name' => $appointment->clinic->name,
                'service_name' => $appointment->service->name,
                'appointment_date' => $formattedDate,
                'start_time' => $formattedTime,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bestätigungsbenachrichtigung gesendet.',
        ]);
    }

    /**
     * Create appointment cancellation notification
     */
    public function sendAppointmentCancellation(Appointment $appointment, $reason = null)
    {
        $appointmentDate = Carbon::parse($appointment->appointment_date . ' ' . $appointment->start_time);
        $formattedDate = $appointmentDate->format('d.m.Y');
        $formattedTime = $appointmentDate->format('H:i');

        $message = "Ihr Termin am {$formattedDate} um {$formattedTime} Uhr wurde storniert.";
        if ($reason) {
            $message .= " Grund: {$reason}";
        }

        Notification::create([
            'user_id' => $appointment->user_id,
            'type' => 'appointment_cancelled',
            'title' => 'Termin storniert',
            'message' => $message,
            'data' => [
                'appointment_id' => $appointment->id,
                'clinic_name' => $appointment->clinic->name,
                'service_name' => $appointment->service->name,
                'appointment_date' => $formattedDate,
                'start_time' => $formattedTime,
                'cancellation_reason' => $reason,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stornierungsbenachrichtigung gesendet.',
        ]);
    }
}
