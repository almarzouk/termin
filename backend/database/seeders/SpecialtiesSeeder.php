<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpecialtiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $humanSpecialties = [
            'Allgemeinmedizin',
            'Innere Medizin',
            'Kardiologie',
            'Dermatologie',
            'Zahnmedizin',
            'Kieferorthopädie',
            'Gynäkologie',
            'Pädiatrie',
            'Orthopädie',
            'Neurologie',
            'Psychiatrie',
            'Augenheilkunde',
            'HNO (Hals-Nasen-Ohren)',
            'Urologie',
            'Radiologie',
            'Physiotherapie',
        ];

        $veterinarySpecialties = [
            'Kleintiermedizin',
            'Großtiermedizin',
            'Pferdmedizin',
            'Vogelmedizin',
            'Exotische Tiere',
            'Tierchirurgie',
            'Tierradiologie',
            'Verhaltensmedizin',
        ];

        DB::table('settings')->insert([
            [
                'key' => 'human_specialties',
                'value' => json_encode($humanSpecialties),
                'type' => 'json',
                'description' => 'Available specialties for human medical clinics',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'veterinary_specialties',
                'value' => json_encode($veterinarySpecialties),
                'type' => 'json',
                'description' => 'Available specialties for veterinary clinics',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

