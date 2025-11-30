<?php

namespace Database\Factories;

use App\Models\ClinicStaff;
use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClinicStaffFactory extends Factory
{
    protected $model = ClinicStaff::class;

    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['doctor', 'nurse', 'receptionist', 'manager']),
            'specialty' => $this->faker->randomElement([
                'General Practitioner',
                'Cardiologist',
                'Dermatologist',
                'Pediatrician',
                'Orthopedist',
            ]),
            'license_number' => $this->faker->numerify('LIC-######'),
            'bio' => $this->faker->paragraph(),
            'experience_years' => $this->faker->numberBetween(1, 30),
            'is_active' => true,
        ];
    }
}
