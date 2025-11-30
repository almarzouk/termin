<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;
use App\Models\Clinic;
use App\Models\Patient;

class ActivityLogSeeder extends Seeder
{
    public function run()
    {
        $admin = User::first();

        if (!$admin) {
            $this->command->warn('No users found. Skipping ActivityLogSeeder.');
            return;
        }

        // Sample activity logs
        $activities = [
            [
                'log_name' => 'default',
                'description' => 'Admin hat sich angemeldet',
                'event' => 'login',
                'causer_type' => User::class,
                'causer_id' => $admin->id,
                'properties' => json_encode(['ip' => '192.168.1.1']),
            ],
            [
                'log_name' => 'default',
                'description' => 'Neue Klinik wurde erstellt',
                'event' => 'created',
                'causer_type' => User::class,
                'causer_id' => $admin->id,
                'subject_type' => Clinic::class,
                'subject_id' => Clinic::first()?->id,
                'properties' => json_encode(['ip' => '192.168.1.1']),
            ],
            [
                'log_name' => 'default',
                'description' => 'Klinikdaten wurden aktualisiert',
                'event' => 'updated',
                'causer_type' => User::class,
                'causer_id' => $admin->id,
                'subject_type' => Clinic::class,
                'subject_id' => Clinic::first()?->id,
                'properties' => json_encode(['ip' => '192.168.1.1', 'old' => ['name' => 'Old Name'], 'attributes' => ['name' => 'New Name']]),
            ],
            [
                'log_name' => 'default',
                'description' => 'Patientendaten angesehen',
                'event' => 'view',
                'causer_type' => User::class,
                'causer_id' => $admin->id,
                'subject_type' => Patient::class,
                'subject_id' => Patient::first()?->id,
                'properties' => json_encode(['ip' => '192.168.1.2']),
            ],
            [
                'log_name' => 'default',
                'description' => 'Benutzereinstellungen aktualisiert',
                'event' => 'updated',
                'causer_type' => User::class,
                'causer_id' => $admin->id,
                'subject_type' => User::class,
                'subject_id' => $admin->id,
                'properties' => json_encode(['ip' => '192.168.1.1']),
            ],
        ];

        foreach ($activities as $activity) {
            Activity::create($activity);
        }

        $this->command->info('Activity logs seeded successfully!');
    }
}
