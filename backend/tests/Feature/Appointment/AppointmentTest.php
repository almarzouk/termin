<?php

namespace Tests\Feature\Appointment;

use App\Models\Appointment;
use App\Models\ClinicBranch;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Service;
use App\Models\ClinicStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $patientUser;
    protected Patient $patient;
    protected Clinic $clinic;
    protected ClinicBranch $branch;
    protected Service $service;
    protected ClinicStaff $staff;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        // Create admin
        $this->admin = User::factory()->create();
        $this->admin->assignRole('super_admin');
        $this->token = $this->admin->createToken('test-token')->plainTextToken;

        // Create test data
        $this->clinic = Clinic::factory()->create();
        $this->branch = ClinicBranch::factory()->create(['clinic_id' => $this->clinic->id]);
        $this->service = Service::factory()->create(['clinic_id' => $this->clinic->id]);

        $staffUser = User::factory()->create();
        $this->staff = ClinicStaff::factory()->create([
            'clinic_id' => $this->clinic->id,
            'user_id' => $staffUser->id,
        ]);        $this->patientUser = User::factory()->create();
        $this->patient = Patient::factory()->create(['user_id' => $this->patientUser->id]);
    }

    /**
     * Test admin can create an appointment.
     */
    public function test_admin_can_create_appointment(): void
    {
        $appointmentData = [
            'clinic_id' => $this->clinic->id,
            'branch_id' => $this->branch->id,
            'patient_id' => $this->patient->id,
            'service_id' => $this->service->id,
            'staff_id' => $this->staff->id,
            'appointment_date' => now()->addDays(1)->format('Y-m-d'),
            'start_time' => '10:00:00',
            'end_time' => '10:30:00',
            'notes' => 'Test appointment',
        ];

        $response = $this->postJson('/api/appointments', $appointmentData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'appointment_date', 'status'],
            ]);

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $this->patient->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Test admin can list appointments.
     */
    public function test_admin_can_list_appointments(): void
    {
        Appointment::factory()->count(3)->create([
            'clinic_id' => $this->clinic->id,
            'branch_id' => $this->branch->id,
            'patient_id' => $this->patient->id,
            'service_id' => $this->service->id,
            'staff_id' => $this->staff->id,
        ]);

        $response = $this->getJson('/api/appointments', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'appointment_date', 'status'],
                    ],
                ],
            ]);
    }

    /**
     * Test admin can update appointment status.
     */
    public function test_admin_can_confirm_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'branch_id' => $this->branch->id,
            'patient_id' => $this->patient->id,
            'service_id' => $this->service->id,
            'staff_id' => $this->staff->id,
            'user_id' => $this->admin->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/appointments/{$appointment->id}/confirm", [], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test admin can cancel appointment.
     */
    public function test_admin_can_cancel_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'branch_id' => $this->branch->id,
            'patient_id' => $this->patient->id,
            'service_id' => $this->service->id,
            'staff_id' => $this->staff->id,
            'user_id' => $this->admin->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/appointments/{$appointment->id}/cancel", [
            'cancellation_reason' => 'Patient request',
        ], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Test appointment validation.
     */
    public function test_appointment_creation_requires_valid_data(): void
    {
        $response = $this->postJson('/api/appointments', [
            'clinic_id' => 999,
            'appointment_date' => 'invalid-date',
        ], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['clinic_id', 'appointment_date']);
    }

    /**
     * Test appointment filtering by status.
     */
    public function test_can_filter_appointments_by_status(): void
    {
        Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'branch_id' => $this->branch->id,
            'patient_id' => $this->patient->id,
            'service_id' => $this->service->id,
            'staff_id' => $this->staff->id,
            'status' => 'confirmed',
        ]);

        $response = $this->getJson('/api/appointments?status=confirmed', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200);
    }
}
