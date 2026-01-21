<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users
        $users = User::all();

        if ($users->count() === 0) {
            $this->command->warn('No users found. Please run UserSeeder first.');
            return;
        }

        $this->command->info('Creating test notifications...');

        foreach ($users as $user) {
            // Appointment notifications
            Notification::create([
                'user_id' => $user->id,
                'clinic_id' => 1,
                'type' => 'appointment_created',
                'title' => 'Neuer Termin gebucht',
                'message' => 'Ein neuer Termin wurde für Max Mustermann am 05.12.2025 um 10:00 Uhr gebucht.',
                'data' => [
                    'appointment_id' => 1,
                    'patient_name' => 'Max Mustermann',
                    'date' => '05.12.2025',
                    'time' => '10:00',
                ],
                'priority' => 'medium',
                'category' => 'appointment',
                'action_url' => '/admin/appointments/1',
                'action_text' => 'Termin ansehen',
                'is_read' => false,
                'created_at' => Carbon::now()->subHours(2),
            ]);

            Notification::create([
                'user_id' => $user->id,
                'clinic_id' => 1,
                'type' => 'appointment_confirmed',
                'title' => 'Termin bestätigt',
                'message' => 'Ihr Termin am 06.12.2025 um 14:30 Uhr wurde bestätigt.',
                'data' => [
                    'appointment_id' => 2,
                    'date' => '06.12.2025',
                    'time' => '14:30',
                ],
                'priority' => 'medium',
                'category' => 'appointment',
                'action_url' => '/admin/appointments/2',
                'action_text' => 'Details ansehen',
                'is_read' => true,
                'read_at' => Carbon::now()->subHour(),
                'created_at' => Carbon::now()->subHours(5),
            ]);

            Notification::create([
                'user_id' => $user->id,
                'clinic_id' => 1,
                'type' => 'appointment_cancelled',
                'title' => 'Termin abgesagt',
                'message' => 'Der Termin am 04.12.2025 um 09:00 Uhr wurde vom Patienten abgesagt.',
                'data' => [
                    'appointment_id' => 3,
                    'date' => '04.12.2025',
                    'time' => '09:00',
                ],
                'priority' => 'high',
                'category' => 'appointment',
                'action_url' => '/admin/appointments',
                'action_text' => 'Termine ansehen',
                'is_read' => false,
                'created_at' => Carbon::now()->subDays(1),
            ]);

            Notification::create([
                'user_id' => $user->id,
                'clinic_id' => 1,
                'type' => 'appointment_reminder',
                'title' => 'Terminerinnerung',
                'message' => 'Erinnerung: Sie haben morgen einen Termin am 04.12.2025 um 11:00 Uhr.',
                'data' => [
                    'appointment_id' => 4,
                    'date' => '04.12.2025',
                    'time' => '11:00',
                ],
                'priority' => 'high',
                'category' => 'appointment',
                'action_url' => '/admin/appointments/4',
                'action_text' => 'Termin ansehen',
                'is_read' => false,
                'created_at' => Carbon::now()->subHours(12),
            ]);

            // Payment notification
            Notification::create([
                'user_id' => $user->id,
                'clinic_id' => 1,
                'type' => 'payment_received',
                'title' => 'Zahlung erhalten',
                'message' => 'Zahlung in Höhe von €150.00 wurde erfolgreich empfangen.',
                'data' => [
                    'invoice_id' => 1,
                    'amount' => '150.00',
                ],
                'priority' => 'medium',
                'category' => 'payment',
                'action_url' => '/admin/invoices/1',
                'action_text' => 'Rechnung ansehen',
                'is_read' => true,
                'read_at' => Carbon::now()->subMinutes(30),
                'created_at' => Carbon::now()->subDays(2),
            ]);

            // System notification
            Notification::create([
                'user_id' => $user->id,
                'type' => 'system',
                'title' => 'Systemaktualisierung',
                'message' => 'Das System wurde erfolgreich auf Version 2.0 aktualisiert.',
                'data' => [
                    'version' => '2.0',
                ],
                'priority' => 'low',
                'category' => 'system',
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(3),
            ]);

            // Admin notification
            if ($user->hasRole(['super_admin', 'clinic_owner'])) {
                Notification::create([
                    'user_id' => $user->id,
                    'clinic_id' => 1,
                    'type' => 'admin',
                    'title' => 'Neue Bewertung',
                    'message' => 'Eine neue 5-Sterne-Bewertung wurde von einem Patienten abgegeben.',
                    'data' => [
                        'review_id' => 1,
                        'rating' => 5,
                    ],
                    'priority' => 'medium',
                    'category' => 'admin',
                    'action_url' => '/admin/reviews',
                    'action_text' => 'Bewertungen ansehen',
                    'is_read' => false,
                    'created_at' => Carbon::now()->subHours(6),
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'clinic_id' => 1,
                    'type' => 'admin',
                    'title' => 'Dringende Aktion erforderlich',
                    'message' => 'Ihr Abonnement läuft in 7 Tagen ab. Bitte erneuern Sie es.',
                    'data' => [
                        'subscription_id' => 1,
                        'days_remaining' => 7,
                    ],
                    'priority' => 'urgent',
                    'category' => 'admin',
                    'action_url' => '/admin/my-subscription',
                    'action_text' => 'Abonnement erneuern',
                    'is_read' => false,
                    'created_at' => Carbon::now()->subMinutes(30),
                ]);
            }
        }

        $this->command->info('✓ Test notifications created successfully!');
    }
}
