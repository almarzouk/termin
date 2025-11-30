<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        $allergies = $this->faker->optional(0.5)->passthrough(
            $this->faker->randomElements(['Penicillin', 'Pollen', 'Nuts'], $this->faker->numberBetween(0, 2))
        );
        $diseases = $this->faker->optional(0.5)->passthrough(
            $this->faker->randomElements(['Diabetes', 'Hypertension', 'Asthma'], $this->faker->numberBetween(0, 2))
        );

        return [
            'user_id' => User::factory(),
            'patient_type' => 'self',
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'date_of_birth' => $this->faker->date(),
            'blood_type' => $this->faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'allergies' => $allergies ? json_encode($allergies) : null,
            'chronic_diseases' => $diseases ? json_encode($diseases) : null,
        ];
    }
}
