<?php

namespace Tests\Feature\Analytics;

use App\Models\Appointment;
use App\Models\ClinicBranch;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Service;
use App\Models\ClinicStaff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Clinic $clinic;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('super_admin');
        $this->token = $this->admin->createToken('test-token')->plainTextToken;

        $this->clinic = Clinic::factory()->create();
    }

    /**
     * Test dashboard overview endpoint.
     */
    public function test_admin_can_get_dashboard_overview(): void
    {
        $response = $this->getJson('/api/analytics/dashboard/overview?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_appointments',
                    'total_patients',
                    'total_revenue',
                    'total_staff',
                    'appointment_status_breakdown',
                    'revenue_comparison',
                ],
            ]);
    }

    /**
     * Test dashboard KPIs endpoint.
     */
    public function test_admin_can_get_dashboard_kpis(): void
    {
        $response = $this->getJson('/api/analytics/dashboard/kpis?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'appointment_completion_rate',
                    'average_appointment_duration',
                    'patient_retention_rate',
                    'revenue_per_appointment',
                    'no_show_rate',
                    'cancellation_rate',
                    'staff_utilization_rate',
                ],
            ]);
    }

    /**
     * Test revenue analytics endpoint.
     */
    public function test_admin_can_get_revenue_analytics(): void
    {
        // Create test data
        $branch = ClinicBranch::factory()->create(['clinic_id' => $this->clinic->id]);
        $service = Service::factory()->create(['clinic_id' => $this->clinic->id]);
        $staffUser = User::factory()->create();
        $staff = ClinicStaff::factory()->create([
            'clinic_id' => $this->clinic->id,
            'user_id' => $staffUser->id,
        ]);
        $patientUser = User::factory()->create();
        $patient = Patient::factory()->create(['user_id' => $patientUser->id]);

        $appointment = Appointment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'branch_id' => $branch->id,
            'patient_id' => $patient->id,
            'service_id' => $service->id,
            'staff_id' => $staff->id,
            'status' => 'completed',
        ]);

        Payment::factory()->create([
            'clinic_id' => $this->clinic->id,
            'appointment_id' => $appointment->id,
            'amount' => 100.00,
            'status' => 'succeeded',
            'paid_at' => now(),
        ]);

        $response = $this->getJson('/api/analytics/revenue?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_revenue',
                    'revenue_by_payment_method',
                    'revenue_by_service',
                    'revenue_by_branch',
                ],
            ]);
    }

    /**
     * Test revenue trend endpoint.
     */
    public function test_admin_can_get_revenue_trend(): void
    {
        $response = $this->getJson('/api/analytics/revenue/trend?period=month&group_by=day', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'trend',
                    'group_by',
                ],
            ]);
    }

    /**
     * Test appointment analytics endpoint.
     */
    public function test_admin_can_get_appointment_analytics(): void
    {
        $response = $this->getJson('/api/analytics/appointments?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_appointments',
                    'status_breakdown',
                    'appointments_by_service',
                    'appointments_by_staff',
                ],
            ]);
    }

    /**
     * Test patient analytics endpoint.
     */
    public function test_admin_can_get_patient_analytics(): void
    {
        $response = $this->getJson('/api/analytics/patients?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_patients',
                    'new_patients',
                    'returning_patients',
                    'patient_retention_rate',
                ],
            ]);
    }

    /**
     * Test staff performance endpoint.
     */
    public function test_admin_can_get_staff_performance(): void
    {
        $response = $this->getJson('/api/analytics/staff?period=month', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_staff',
                    'staff_by_specialization',
                    'top_performing_staff',
                ],
            ]);
    }

    /**
     * Test unauthorized user cannot access analytics.
     */
    public function test_unauthorized_user_cannot_access_analytics(): void
    {
        $response = $this->getJson('/api/analytics/dashboard/overview');

        $response->assertStatus(401);
    }

    /**
     * Test regular user cannot access analytics.
     */
    public function test_regular_user_cannot_access_analytics(): void
    {
        $user = User::factory()->create();
        $user->assignRole('customer');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->getJson('/api/analytics/dashboard/overview', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(403);
    }
}
