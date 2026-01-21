<?php

namespace Database\Seeders;

use App\Models\EmergencyNotificationTemplate;
use Illuminate\Database\Seeder;

class EmergencyNotificationTemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // Email: Appointment Cancelled
            [
                'clinic_id' => null,
                'name' => 'Default - Termin storniert (Email)',
                'type' => 'email',
                'event' => 'appointment_cancelled',
                'subject' => 'Ihr Termin wurde storniert',
                'body' => 'Sehr geehrte/r {{patient_name}},

leider mussten wir Ihren Termin am {{original_time}} bei {{original_doctor}} stornieren.

Grund: {{reason}}

Bitte kontaktieren Sie uns unter {{clinic_phone}} oder {{clinic_email}}, um einen neuen Termin zu vereinbaren.

Mit freundlichen Grüßen,
{{clinic_name}}',
                'variables' => json_encode([
                    'patient_name',
                    'original_time',
                    'original_doctor',
                    'reason',
                    'clinic_name',
                    'clinic_phone',
                    'clinic_email',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],

            // Email: Appointment Reassigned
            [
                'clinic_id' => null,
                'name' => 'Default - Termin neu zugewiesen (Email)',
                'type' => 'email',
                'event' => 'appointment_reassigned',
                'subject' => 'Ihr Termin wurde neu zugewiesen',
                'body' => 'Sehr geehrte/r {{patient_name}},

Ihr Termin bei {{original_doctor}} am {{original_time}} wurde aufgrund unvorhergesehener Umstände neu zugewiesen.

✓ Neue Termindetails:
━━━━━━━━━━━━━━━━━━
Arzt/Ärztin: {{new_doctor}}
Datum & Uhrzeit: {{new_time}}
Klinik: {{clinic_name}}
Adresse: {{clinic_address}}

Bitte bestätigen oder lehnen Sie den neuen Termin innerhalb von 24 Stunden ab:

[Termin bestätigen] {{approval_link}}
[Termin ablehnen] {{rejection_link}}

Bei Fragen erreichen Sie uns unter:
Tel: {{clinic_phone}}
Email: {{clinic_email}}

Mit freundlichen Grüßen,
Ihr {{clinic_name}} Team',
                'variables' => json_encode([
                    'patient_name',
                    'original_doctor',
                    'original_time',
                    'new_doctor',
                    'new_time',
                    'clinic_name',
                    'clinic_address',
                    'clinic_phone',
                    'clinic_email',
                    'approval_link',
                    'rejection_link',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],

            // SMS: Appointment Cancelled
            [
                'clinic_id' => null,
                'name' => 'Default - Termin storniert (SMS)',
                'type' => 'sms',
                'event' => 'appointment_cancelled',
                'subject' => null,
                'body' => 'Hallo {{patient_name}}, Ihr Termin am {{original_time}} bei {{clinic_name}} wurde storniert. Grund: {{reason}}. Bitte kontaktieren Sie uns: {{clinic_phone}}',
                'variables' => json_encode([
                    'patient_name',
                    'original_time',
                    'clinic_name',
                    'reason',
                    'clinic_phone',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],

            // SMS: Appointment Reassigned
            [
                'clinic_id' => null,
                'name' => 'Default - Termin neu zugewiesen (SMS)',
                'type' => 'sms',
                'event' => 'appointment_reassigned',
                'subject' => null,
                'body' => 'Hallo {{patient_name}}, Ihr Termin wurde neu zugewiesen. Neuer Arzt: {{new_doctor}}, Zeit: {{new_time}}. Bitte bestätigen: {{approval_link}}',
                'variables' => json_encode([
                    'patient_name',
                    'new_doctor',
                    'new_time',
                    'approval_link',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],

            // In-App: Appointment Reassigned
            [
                'clinic_id' => null,
                'name' => 'Default - Termin neu zugewiesen (In-App)',
                'type' => 'in_app',
                'event' => 'appointment_reassigned',
                'subject' => 'Terminänderung erforderlich',
                'body' => 'Ihr Termin bei {{original_doctor}} am {{original_time}} wurde zu {{new_doctor}} am {{new_time}} verschoben. Bitte bestätigen Sie die Änderung.',
                'variables' => json_encode([
                    'original_doctor',
                    'original_time',
                    'new_doctor',
                    'new_time',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],

            // Patient Approval Request
            [
                'clinic_id' => null,
                'name' => 'Default - Bestätigung erforderlich (Email)',
                'type' => 'email',
                'event' => 'patient_approval_request',
                'subject' => 'Bitte bestätigen Sie Ihren neuen Termin',
                'body' => 'Sehr geehrte/r {{patient_name}},

wir benötigen Ihre Bestätigung für den neu zugewiesenen Termin.

Originaler Termin:
→ {{original_doctor}} am {{original_time}}

Neuer Termin:
→ {{new_doctor}} am {{new_time}}

Bitte wählen Sie eine Option:

✓ BESTÄTIGEN: {{approval_link}}
✗ ABLEHNEN: {{rejection_link}}

Hinweis: Falls Sie ablehnen, wird der Termin storniert und Sie müssen einen neuen Termin vereinbaren.

Mit freundlichen Grüßen,
{{clinic_name}}',
                'variables' => json_encode([
                    'patient_name',
                    'original_doctor',
                    'original_time',
                    'new_doctor',
                    'new_time',
                    'clinic_name',
                    'approval_link',
                    'rejection_link',
                ]),
                'is_active' => true,
                'is_default' => true,
            ],
        ];

        foreach ($templates as $template) {
            EmergencyNotificationTemplate::create($template);
        }
    }
}
