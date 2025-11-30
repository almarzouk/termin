<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        // جلب المستخدمين من نوع customer
        $customers = User::whereHas('roles', function($q) {
            $q->where('name', 'customer');
        })->get();

        if ($customers->isEmpty()) {
            echo "⚠️  No customers found. Please run UsersSeeder first.\n";
            return;
        }

        $germanPatients = [
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Emma',
                'last_name' => 'Becker',
                'gender' => 'female',
                'date_of_birth' => '1996-03-15',
                'phone' => '+49 30 11111111',
                'email' => 'emma.becker@email.de',
                'blood_type' => 'A+',
                'allergies' => json_encode(['Pollen', 'Nüsse']),
                'chronic_diseases' => json_encode([]),
                'notes' => 'Regelmäßige Patientin, sehr kooperativ',
            ],
            [
                'user_id' => $customers->count() > 1 ? $customers->skip(1)->first()->id : $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Felix',
                'last_name' => 'Schneider',
                'gender' => 'male',
                'date_of_birth' => '1985-07-22',
                'phone' => '+49 30 22222222',
                'email' => 'felix.schneider@email.de',
                'blood_type' => 'O+',
                'allergies' => json_encode(['Penicillin']),
                'chronic_diseases' => json_encode(['Bluthochdruck']),
                'notes' => 'Benötigt regelmäßige Blutdruckkontrolle',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'family_member',
                'first_name' => 'Sophie',
                'last_name' => 'Becker',
                'gender' => 'female',
                'date_of_birth' => '2015-05-10',
                'phone' => '+49 30 11111111',
                'email' => null,
                'blood_type' => 'A+',
                'allergies' => json_encode([]),
                'chronic_diseases' => json_encode([]),
                'notes' => 'Tochter von Emma Becker, Kinderärztin Dr. Schmidt',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Lukas',
                'last_name' => 'Fischer',
                'gender' => 'male',
                'date_of_birth' => '1992-11-03',
                'phone' => '+49 30 33333333',
                'email' => 'lukas.fischer@email.de',
                'blood_type' => 'B+',
                'allergies' => json_encode(['Latex']),
                'chronic_diseases' => json_encode([]),
                'notes' => 'Sportler, regelmäßige Vorsorgeuntersuchungen',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Anna',
                'last_name' => 'Weber',
                'gender' => 'female',
                'date_of_birth' => '1978-09-18',
                'phone' => '+49 30 44444444',
                'email' => 'anna.weber@email.de',
                'blood_type' => 'AB+',
                'allergies' => json_encode(['Milchprodukte']),
                'chronic_diseases' => json_encode(['Diabetes Typ 2', 'Asthma']),
                'notes' => 'Diabetikerin, benötigt Insulinüberwachung',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Max',
                'last_name' => 'Hoffmann',
                'gender' => 'male',
                'date_of_birth' => '2000-01-25',
                'phone' => '+49 30 55555555',
                'email' => 'max.hoffmann@email.de',
                'blood_type' => 'O-',
                'allergies' => json_encode([]),
                'chronic_diseases' => json_encode([]),
                'notes' => 'Student, seltene Besuche',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Lisa',
                'last_name' => 'Bauer',
                'gender' => 'female',
                'date_of_birth' => '1989-12-12',
                'phone' => '+49 30 66666666',
                'email' => 'lisa.bauer@email.de',
                'blood_type' => 'A-',
                'allergies' => json_encode(['Bienenstiche']),
                'chronic_diseases' => json_encode([]),
                'notes' => 'Schwanger, regelmäßige Vorsorge bei Dr. Hoffmann',
            ],
            [
                'user_id' => $customers->first()->id,
                'patient_type' => 'self',
                'first_name' => 'Tom',
                'last_name' => 'Schulz',
                'gender' => 'male',
                'date_of_birth' => '1965-04-30',
                'phone' => '+49 30 77777777',
                'email' => 'tom.schulz@email.de',
                'blood_type' => 'B-',
                'allergies' => json_encode([]),
                'chronic_diseases' => json_encode(['Arthritis', 'Bluthochdruck']),
                'notes' => 'Älterer Patient, benötigt regelmäßige orthopädische Betreuung',
            ],
        ];

        foreach ($germanPatients as $patientData) {
            Patient::create($patientData);
        }

        echo "✅ Created " . count($germanPatients) . " German patients\n";
    }
}
