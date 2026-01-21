<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Carbon\Carbon;

class AppointmentReminderService
{
    /**
     * Schedule reminders for an appointment
     *
     * @param Appointment $appointment
     * @param array $reminderSettings ['enabled' => true, 'timings' => [1440, 720, 60], 'channel' => 'email']
     */
    public function scheduleReminders(Appointment $appointment, array $reminderSettings)
    {
        if (!isset($reminderSettings['enabled']) || !$reminderSettings['enabled']) {
            return;
        }

        $timings = $reminderSettings['timings'] ?? [1440]; // Default: 24 hours before
        $channel = $reminderSettings['channel'] ?? 'email';

        foreach ($timings as $minutesBefore) {
            $scheduledFor = Carbon::parse($appointment->start_time)->subMinutes($minutesBefore);

            // Don't schedule reminders in the past
            if ($scheduledFor->isPast()) {
                continue;
            }

            AppointmentReminder::create([
                'appointment_id' => $appointment->id,
                'clinic_id' => $appointment->clinic_id,
                'reminder_type' => $this->getReminderType($minutesBefore),
                'channel' => $channel,
                'minutes_before' => $minutesBefore,
                'scheduled_for' => $scheduledFor,
                'status' => 'pending',
                'recipient' => $this->getRecipient($appointment, $channel),
                'metadata' => [
                    'patient_name' => $appointment->patient->name ?? '',
                    'service_name' => $appointment->service->name ?? '',
                    'appointment_time' => $appointment->start_time->format('Y-m-d H:i'),
                ],
            ]);
        }
    }

    /**
     * Get reminder type based on timing
     */
    private function getReminderType(int $minutesBefore)
    {
        return match ($minutesBefore) {
            1440 => '24h_before',
            720 => '12h_before',
            360 => '6h_before',
            60 => '1h_before',
            default => 'custom',
        };
    }

    /**
     * Get recipient based on channel
     */
    private function getRecipient(Appointment $appointment, string $channel)
    {
        if ($channel === 'email') {
            return $appointment->patient->email ?? $appointment->patient->user->email ?? null;
        }

        if ($channel === 'sms') {
            return $appointment->patient->phone ?? null;
        }

        return null;
    }

    /**
     * Cancel all pending reminders for an appointment
     */
    public function cancelReminders(int $appointmentId)
    {
        AppointmentReminder::where('appointment_id', $appointmentId)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }

    /**
     * Process due reminders
     * This method should be called by a scheduled command
     */
    public function processDueReminders()
    {
        $dueReminders = AppointmentReminder::due()->get();

        foreach ($dueReminders as $reminder) {
            try {
                $this->sendReminder($reminder);
            } catch (\Exception $e) {
                $reminder->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        return $dueReminders->count();
    }

    /**
     * Send a single reminder
     */
    private function sendReminder(AppointmentReminder $reminder)
    {
        $appointment = $reminder->appointment;

        if (!$appointment) {
            throw new \Exception('Appointment not found');
        }

        // Skip if appointment is cancelled or completed
        if (in_array($appointment->status, ['cancelled', 'completed'])) {
            $reminder->update(['status' => 'cancelled']);
            return;
        }

        // Send based on channel
        if ($reminder->channel === 'email') {
            $this->sendEmailReminder($reminder, $appointment);
        } elseif ($reminder->channel === 'sms') {
            $this->sendSmsReminder($reminder, $appointment);
        }

        $reminder->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Send email reminder
     */
    private function sendEmailReminder(AppointmentReminder $reminder, Appointment $appointment)
    {
        // TODO: Implement email sending via Laravel Mail
        // Mail::to($reminder->recipient)->send(new AppointmentReminderMail($appointment));

        // For now, just log
        \Log::info("Email reminder sent for appointment {$appointment->id} to {$reminder->recipient}");
    }

    /**
     * Send SMS reminder
     */
    private function sendSmsReminder(AppointmentReminder $reminder, Appointment $appointment)
    {
        // TODO: Implement SMS sending via Twilio or similar service

        // For now, just log
        \Log::info("SMS reminder sent for appointment {$appointment->id} to {$reminder->recipient}");
    }
}
