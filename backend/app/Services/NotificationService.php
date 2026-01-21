<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\EmergencyNotificationTemplate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Create a notification.
     */
    public function create(
        User $user,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?int $clinicId = null,
        string $priority = 'medium',
        string $category = 'general',
        ?string $actionUrl = null,
        ?string $actionText = null
    ): ?Notification {
        try {
            return Notification::create([
                'user_id' => $user->id,
                'clinic_id' => $clinicId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'priority' => $priority,
                'category' => $category,
                'action_url' => $actionUrl,
                'action_text' => $actionText,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating notification: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create appointment notification.
     */
    public function appointmentCreated(User $user, array $appointmentData, ?int $clinicId = null): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'appointment_created',
            title: 'Neuer Termin gebucht',
            message: "Ein neuer Termin wurde für {$appointmentData['patient_name']} am {$appointmentData['date']} um {$appointmentData['time']} gebucht.",
            data: $appointmentData,
            clinicId: $clinicId,
            priority: 'medium',
            category: 'appointment',
            actionUrl: "/admin/appointments/{$appointmentData['id']}",
            actionText: 'Termin ansehen'
        );
    }

    /**
     * Create appointment confirmation notification.
     */
    public function appointmentConfirmed(User $user, array $appointmentData, ?int $clinicId = null): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'appointment_confirmed',
            title: 'Termin bestätigt',
            message: "Ihr Termin am {$appointmentData['date']} um {$appointmentData['time']} wurde bestätigt.",
            data: $appointmentData,
            clinicId: $clinicId,
            priority: 'medium',
            category: 'appointment',
            actionUrl: "/admin/appointments/{$appointmentData['id']}",
            actionText: 'Termin ansehen'
        );
    }

    /**
     * Create appointment cancellation notification.
     */
    public function appointmentCancelled(User $user, array $appointmentData, ?int $clinicId = null): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'appointment_cancelled',
            title: 'Termin abgesagt',
            message: "Der Termin am {$appointmentData['date']} um {$appointmentData['time']} wurde abgesagt.",
            data: $appointmentData,
            clinicId: $clinicId,
            priority: 'high',
            category: 'appointment',
            actionUrl: "/admin/appointments",
            actionText: 'Termine ansehen'
        );
    }

    /**
     * Create appointment reminder notification.
     */
    public function appointmentReminder(User $user, array $appointmentData, ?int $clinicId = null): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'appointment_reminder',
            title: 'Terminerinnerung',
            message: "Erinnerung: Sie haben einen Termin morgen am {$appointmentData['date']} um {$appointmentData['time']}.",
            data: $appointmentData,
            clinicId: $clinicId,
            priority: 'high',
            category: 'appointment',
            actionUrl: "/admin/appointments/{$appointmentData['id']}",
            actionText: 'Termin ansehen'
        );
    }

    /**
     * Create payment notification.
     */
    public function paymentReceived(User $user, array $paymentData, ?int $clinicId = null): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'payment_received',
            title: 'Zahlung erhalten',
            message: "Zahlung in Höhe von €{$paymentData['amount']} wurde erfolgreich empfangen.",
            data: $paymentData,
            clinicId: $clinicId,
            priority: 'medium',
            category: 'payment',
            actionUrl: "/admin/invoices/{$paymentData['invoice_id']}",
            actionText: 'Rechnung ansehen'
        );
    }

    /**
     * Create system notification.
     */
    public function systemNotification(User $user, string $title, string $message, string $priority = 'low'): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'system',
            title: $title,
            message: $message,
            priority: $priority,
            category: 'system'
        );
    }

    /**
     * Create admin notification.
     */
    public function adminNotification(User $user, string $title, string $message, array $data = [], string $priority = 'medium'): ?Notification
    {
        return $this->create(
            user: $user,
            type: 'admin',
            title: $title,
            message: $message,
            data: $data,
            priority: $priority,
            category: 'admin'
        );
    }

    /**
     * Send notification to multiple users.
     */
    public function sendToMultiple(
        array $users,
        string $type,
        string $title,
        string $message,
        array $data = [],
        ?int $clinicId = null,
        string $priority = 'medium',
        string $category = 'general'
    ): int {
        $count = 0;
        foreach ($users as $user) {
            if ($this->create($user, $type, $title, $message, $data, $clinicId, $priority, $category)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Send reassignment notification to patient
     */
    public function sendReassignmentNotification(User $user, array $data): void
    {
        try {
            // Create in-app notification
            $this->create(
                user: $user,
                type: 'appointment_reassigned',
                title: 'Termin neu zugewiesen',
                message: "Ihr Termin wurde einem neuen Arzt zugewiesen. Bitte überprüfen Sie die Details.",
                data: $data,
                clinicId: $data['clinic_id'] ?? null,
                priority: 'high',
                category: 'appointment',
                actionUrl: "/patient/appointments/{$data['appointment_id']}",
                actionText: 'Details ansehen'
            );

            // Get or create default template for email
            $template = EmergencyNotificationTemplate::active()
                ->forEvent('appointment_reassigned')
                ->ofType('email')
                ->first();

            if (!$template) {
                $template = $this->getDefaultReassignmentTemplate();
            }

            // Render template with data
            $subject = $template->renderSubject($data);
            $body = $template->render($data);

            // Send email (simplified - you can integrate with your mail service)
            // Mail::to($user->email)->send(new AppointmentReassignmentMail($subject, $body));

            Log::info('Reassignment notification sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'template' => $template->name ?? 'default',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send reassignment notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send cancellation notification
     */
    public function sendCancellationNotification(User $user, array $data): void
    {
        try {
            // Create in-app notification
            $this->create(
                user: $user,
                type: 'appointment_cancelled',
                title: 'Termin storniert',
                message: "Ihr Termin wurde storniert. Bitte kontaktieren Sie uns für einen neuen Termin.",
                data: $data,
                clinicId: $data['clinic_id'] ?? null,
                priority: 'high',
                category: 'appointment'
            );

            $template = EmergencyNotificationTemplate::active()
                ->forEvent('appointment_cancelled')
                ->ofType('email')
                ->first();

            if (!$template) {
                $template = $this->getDefaultCancellationTemplate();
            }

            $subject = $template->renderSubject($data);
            $body = $template->render($data);

            Log::info('Cancellation notification sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send cancellation notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get default reassignment template
     */
    protected function getDefaultReassignmentTemplate(): EmergencyNotificationTemplate
    {
        return new EmergencyNotificationTemplate([
            'name' => 'Default Reassignment',
            'type' => 'email',
            'event' => 'appointment_reassigned',
            'subject' => 'Ihr Termin wurde neu zugewiesen',
            'body' => 'Sehr geehrte/r {{patient_name}},

Ihr Termin bei {{original_doctor}} am {{original_time}} wurde aufgrund unvorhergesehener Umstände neu zugewiesen.

Neue Termindetails:
- Arzt/Ärztin: {{new_doctor}}
- Datum und Uhrzeit: {{new_time}}
- Klinik: {{clinic_name}}

Bitte bestätigen oder lehnen Sie den neuen Termin ab:
- Bestätigen: {{approval_link}}
- Ablehnen: {{rejection_link}}

Mit freundlichen Grüßen,
Ihr Praxisteam',
            'is_default' => true,
            'is_active' => true,
        ]);
    }

    /**
     * Get default cancellation template
     */
    protected function getDefaultCancellationTemplate(): EmergencyNotificationTemplate
    {
        return new EmergencyNotificationTemplate([
            'name' => 'Default Cancellation',
            'type' => 'email',
            'event' => 'appointment_cancelled',
            'subject' => 'Ihr Termin wurde storniert',
            'body' => 'Sehr geehrte/r {{patient_name}},

Leider mussten wir Ihren Termin am {{original_time}} bei {{original_doctor}} stornieren.

Grund: {{reason}}

Bitte kontaktieren Sie uns, um einen neuen Termin zu vereinbaren.

Mit freundlichen Grüßen,
Ihr Praxisteam',
            'is_default' => true,
            'is_active' => true,
        ]);
    }
}
