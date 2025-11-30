<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\ClinicBranch;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Service;
use App\Models\ClinicStaff;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        $startTime = $this->faker->dateTimeBetween('now', '+30 days');
        $endTime = (clone $startTime)->modify('+30 minutes');

        return [
            'clinic_id' => Clinic::factory(),
            'branch_id' => ClinicBranch::factory(),
            'patient_id' => Patient::factory(),
            'service_id' => Service::factory(),
            'staff_id' => ClinicStaff::factory(),
            'user_id' => User::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']),
            'customer_notes' => $this->faker->optional()->sentence(),
            'staff_notes' => null,
            'cancellation_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
