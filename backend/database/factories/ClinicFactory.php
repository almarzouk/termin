<?php

namespace Database\Factories;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ClinicFactory extends Factory
{
    protected $model = Clinic::class;

    public function definition(): array
    {
        $name = $this->faker->company . ' Klinik';

        return [
            'owner_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'clinic_type' => $this->faker->randomElement(['general', 'dental', 'eye', 'skin', 'orthopedic']),
            'description' => $this->faker->paragraph(),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => '+49' . $this->faker->numerify('##########'),
            'website' => $this->faker->url(),
            'logo' => null,
            'specialties' => json_encode(['general_medicine', 'cardiology']),
            'languages' => json_encode(['de', 'en']),
            'is_active' => true,
            'subscription_id' => null,
            'settings' => json_encode([
                'booking_buffer' => 15,
                'cancellation_policy' => '24 hours',
            ]),
        ];
    }
}
