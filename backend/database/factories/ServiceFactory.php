<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Clinic;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'clinic_id' => Clinic::factory(),
            'name' => $this->faker->randomElement([
                'Allgemeine Untersuchung',
                'Zahnreinigung',
                'Augenuntersuchung',
                'Bluttest',
                'Röntgen',
                'Physiotherapie',
            ]),
            'description' => $this->faker->paragraph(),
            'duration' => $this->faker->randomElement([15, 30, 45, 60]),
            'price' => $this->faker->randomFloat(2, 20, 200),
            'is_active' => true,
        ];
    }
}
