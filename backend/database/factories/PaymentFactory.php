<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'clinic_id' => \App\Models\Clinic::factory(),
            'amount' => $this->faker->randomFloat(2, 20, 500),
            'currency' => 'EUR',
            'status' => $this->faker->randomElement(['pending', 'succeeded', 'failed', 'refunded']),
            'payment_method' => $this->faker->randomElement(['card', 'paypal', 'bank_transfer']),
            'paid_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    public function succeeded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'succeeded',
            'paid_at' => now(),
        ]);
    }
}
