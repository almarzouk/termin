<?php

namespace Database\Factories;

use App\Models\ClinicBranch;
use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClinicBranchFactory extends Factory
{
    protected $model = ClinicBranch::class;

    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'name' => $this->faker->company . ' Filiale',
            'email' => $this->faker->companyEmail(),
            'phone' => '+49' . $this->faker->numerify('##########'),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'postal_code' => $this->faker->postcode(),
            'country' => 'Deutschland',
            'is_active' => true,
        ];
    }
}
