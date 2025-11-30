<?php

namespace Tests\Feature\Clinic;

use App\Models\Clinic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('super_admin');
        $this->token = $this->admin->createToken('test-token')->plainTextToken;
    }

    /**
     * Test admin can list all clinics.
     */
    public function test_admin_can_list_clinics(): void
    {
        Clinic::factory()->count(3)->create();

        $response = $this->getJson('/api/clinics', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'name', 'email', 'phone'],
                    ],
                ],
            ]);
    }

    /**
     * Test admin can create a clinic.
     */
    public function test_admin_can_create_clinic(): void
    {
        $clinicData = [
            'name' => 'Test Klinik',
            'email' => 'test@klinik.de',
            'phone' => '+491234567890',
            'clinic_type' => 'human',
            'branch_name' => 'Hauptfiliale',
            'address' => 'Test Straße 123',
            'city' => 'München',
            'postal_code' => '80331',
            'country' => 'Deutschland',
        ];

        $response = $this->postJson('/api/clinics', $clinicData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('clinics', [
            'email' => 'test@klinik.de',
        ]);
    }

    /**
     * Test admin can update a clinic.
     */
    public function test_admin_can_update_clinic(): void
    {
        $clinic = Clinic::factory()->create();

        $response = $this->putJson("/api/clinics/{$clinic->id}", [
            'name' => 'Updated Klinik',
            'email' => $clinic->email,
            'phone' => $clinic->phone,
        ], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('clinics', [
            'id' => $clinic->id,
            'name' => 'Updated Klinik',
        ]);
    }

    /**
     * Test admin can delete a clinic.
     */
    public function test_admin_can_delete_clinic(): void
    {
        $clinic = Clinic::factory()->create();

        $response = $this->deleteJson("/api/clinics/{$clinic->id}", [], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200);

        $this->assertSoftDeleted('clinics', [
            'id' => $clinic->id,
        ]);
    }

    /**
     * Test clinic validation.
     */
    public function test_clinic_creation_requires_valid_data(): void
    {
        $response = $this->postJson('/api/clinics', [
            'name' => '',
            'email' => 'invalid-email',
        ], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'phone']);
    }

    /**
     * Test unauthorized user cannot access clinics.
     */
    public function test_unauthorized_user_cannot_access_clinics(): void
    {
        $response = $this->getJson('/api/clinics');

        $response->assertStatus(401);
    }
}
