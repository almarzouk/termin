<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Doctor\Models\Doctor;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctors = [
            [
                'name' => 'Dr. med. Andreas Müller',
                'email' => 'a.mueller@klinik.de',
                'phone' => '+49 30 12345678',
                'specialty' => 'Kardiologie',
                'qualification' => 'Facharzt für Innere Medizin und Kardiologie',
                'experience_years' => 15,
                'consultation_fee' => 120.00,
                'bio' => 'Spezialist für Herzerkrankungen mit über 15 Jahren Erfahrung',
                'status' => 'active',
            ],
            [
                'name' => 'Dr. med. Sarah Schmidt',
                'email' => 's.schmidt@klinik.de',
                'phone' => '+49 30 23456789',
                'specialty' => 'Pädiatrie',
                'qualification' => 'Fachärztin für Kinder- und Jugendmedizin',
                'experience_years' => 8,
                'consultation_fee' => 100.00,
                'bio' => 'Kinderärztin mit Schwerpunkt Entwicklungsdiagnostik',
                'status' => 'active',
            ],
            [
                'name' => 'Dr. med. Michael Weber',
                'email' => 'm.weber@klinik.de',
                'phone' => '+49 30 34567890',
                'specialty' => 'Orthopädie',
                'qualification' => 'Facharzt für Orthopädie und Unfallchirurgie',
                'experience_years' => 12,
                'consultation_fee' => 110.00,
                'bio' => 'Spezialist für Gelenkerkrankungen und Sportmedizin',
                'status' => 'active',
            ],
            [
                'name' => 'Dr. med. Julia Becker',
                'email' => 'j.becker@klinik.de',
                'phone' => '+49 30 45678901',
                'specialty' => 'Dermatologie',
                'qualification' => 'Fachärztin für Haut- und Geschlechtskrankheiten',
                'experience_years' => 10,
                'consultation_fee' => 95.00,
                'bio' => 'Hautärztin mit Zusatzqualifikation in ästhetischer Dermatologie',
                'status' => 'active',
            ],
            [
                'name' => 'Dr. med. Thomas Fischer',
                'email' => 't.fischer@klinik.de',
                'phone' => '+49 30 56789012',
                'specialty' => 'Neurologie',
                'qualification' => 'Facharzt für Neurologie',
                'experience_years' => 20,
                'consultation_fee' => 130.00,
                'bio' => 'Neurologe mit Schwerpunkt Multiple Sklerose und Kopfschmerzen',
                'status' => 'active',
            ],
            [
                'name' => 'Dr. med. Anna Hoffmann',
                'email' => 'a.hoffmann@klinik.de',
                'phone' => '+49 30 67890123',
                'specialty' => 'Gynäkologie',
                'qualification' => 'Fachärztin für Frauenheilkunde und Geburtshilfe',
                'experience_years' => 14,
                'consultation_fee' => 105.00,
                'bio' => 'Frauenärztin mit Schwerpunkt Geburtshilfe',
                'status' => 'active',
            ],
        ];

        foreach ($doctors as $doctor) {
            Doctor::create($doctor);
        }
    }
}
