<?php

namespace Tests\Feature\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $patient;
    protected string $adminToken;
    protected string $patientToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('super_admin');
        $this->adminToken = $this->admin->createToken('test-token')->plainTextToken;

        $this->patient = User::factory()->create();
        $this->patient->assignRole('customer');
        $this->patientToken = $this->patient->createToken('test-token')->plainTextToken;
    }

    /**
     * Test user can list their notifications.
     */
    public function test_user_can_list_notifications(): void
    {
        Notification::factory()->count(3)->create([
            'user_id' => $this->patient->id,
        ]);

        $response = $this->getJson('/api/notifications', [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'type', 'title', 'message', 'read_at'],
                    ],
                ],
            ]);
    }

    /**
     * Test user can get unread count.
     */
    public function test_user_can_get_unread_count(): void
    {
        Notification::factory()->count(3)->create([
            'user_id' => $this->patient->id,
            'read_at' => null,
        ]);

        Notification::factory()->count(2)->create([
            'user_id' => $this->patient->id,
            'read_at' => now(),
        ]);

        $response = $this->getJson('/api/notifications/unread-count', [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'unread_count' => 3,
                ],
            ]);
    }

    /**
     * Test admin can create notification.
     */
    public function test_admin_can_create_notification(): void
    {
        $notificationData = [
            'user_id' => $this->patient->id,
            'type' => 'general',
            'title' => 'Test Notification',
            'message' => 'This is a test notification',
        ];

        $response = $this->postJson('/api/notifications', $notificationData, [
            'Authorization' => 'Bearer ' . $this->adminToken,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'type', 'title', 'message'],
            ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->patient->id,
            'type' => 'general',
        ]);
    }

    /**
     * Test user can mark notification as read.
     */
    public function test_user_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->patient->id,
            'read_at' => null,
        ]);

        $response = $this->patchJson("/api/notifications/{$notification->id}/read", [], [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
        ]);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    /**
     * Test user can mark all notifications as read.
     */
    public function test_user_can_mark_all_as_read(): void
    {
        Notification::factory()->count(3)->create([
            'user_id' => $this->patient->id,
            'read_at' => null,
        ]);

        $response = $this->postJson('/api/notifications/mark-all-read', [], [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200);

        $this->assertEquals(0, Notification::where('user_id', $this->patient->id)
            ->whereNull('read_at')
            ->count());
    }

    /**
     * Test user can delete notification.
     */
    public function test_user_can_delete_notification(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->patient->id,
        ]);

        $response = $this->deleteJson("/api/notifications/{$notification->id}", [], [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
            'deleted_at' => null,
        ]);
    }

    /**
     * Test user cannot access other user's notifications.
     */
    public function test_user_cannot_access_other_users_notifications(): void
    {
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $response = $this->getJson("/api/notifications/{$notification->id}", [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test notification filtering by type.
     */
    public function test_can_filter_notifications_by_type(): void
    {
        Notification::factory()->create([
            'user_id' => $this->patient->id,
            'type' => 'appointment_reminder',
        ]);

        $response = $this->getJson('/api/notifications?type=appointment_reminder', [
            'Authorization' => 'Bearer ' . $this->patientToken,
        ]);

        $response->assertStatus(200);
    }
}
