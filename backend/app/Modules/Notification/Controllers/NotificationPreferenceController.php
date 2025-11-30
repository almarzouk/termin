<?php

namespace App\Modules\Notification\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Requests\UpdateNotificationPreferencesRequest;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    /**
     * Get user's notification preferences
     */
    public function show()
    {
        $preferences = NotificationPreference::firstOrCreate(
            ['user_id' => auth()->id()],
            [
                'email_notifications' => true,
                'sms_notifications' => false,
                'push_notifications' => true,
                'appointment_reminders' => true,
                'appointment_confirmations' => true,
                'prescription_reminders' => true,
                'follow_up_reminders' => true,
                'marketing_emails' => false,
                'reminder_hours_before' => 24,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $preferences,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function update(UpdateNotificationPreferencesRequest $request)
    {
        try {
            $preferences = NotificationPreference::updateOrCreate(
                ['user_id' => auth()->id()],
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Benachrichtigungseinstellungen erfolgreich aktualisiert.',
                'data' => $preferences,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren der Einstellungen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset preferences to default
     */
    public function reset()
    {
        try {
            $preferences = NotificationPreference::updateOrCreate(
                ['user_id' => auth()->id()],
                [
                    'email_notifications' => true,
                    'sms_notifications' => false,
                    'push_notifications' => true,
                    'appointment_reminders' => true,
                    'appointment_confirmations' => true,
                    'prescription_reminders' => true,
                    'follow_up_reminders' => true,
                    'marketing_emails' => false,
                    'reminder_hours_before' => 24,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Einstellungen auf Standard zurückgesetzt.',
                'data' => $preferences,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Zurücksetzen der Einstellungen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
