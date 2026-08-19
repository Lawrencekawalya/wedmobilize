<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\Meeting;
use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeddingWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_creates_a_wedding_and_becomes_owner(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post(route('weddings.store'), ['name' => 'Sarah & Peter Wedding', 'bride_name' => 'Sarah', 'groom_name' => 'Peter', 'wedding_date' => '2026-12-15', 'contribution_target' => 10_000_000])->assertRedirect();
        $this->assertDatabaseHas('weddings', ['name' => 'Sarah & Peter Wedding']);
        $this->assertDatabaseHas('wedding_memberships', ['user_id' => $user->id, 'role' => 'owner']);
    }

    public function test_users_cannot_access_another_wedding_workspace(): void
    {
        $user = User::factory()->create();
        $wedding = Wedding::factory()->create();
        $this->actingAs($user)->get(route('weddings.dashboard', $wedding))->assertForbidden();
    }

    public function test_managers_can_manage_guests_but_records_are_isolated(): void
    {
        $user = User::factory()->create();
        $wedding = Wedding::factory()->create();
        $other = Wedding::factory()->create();
        WeddingMembership::factory()->create(['user_id' => $user->id, 'wedding_id' => $wedding->id, 'role' => 'owner']);
        $this->actingAs($user)->post(route('guests.store', $wedding), ['name' => 'Grace', 'category' => 'family', 'invitation_status' => 'invited', 'attendance_status' => 'unknown'])->assertRedirect();
        $guest = Guest::factory()->create(['wedding_id' => $other->id]);
        $this->actingAs($user)->delete(route('guests.destroy', [$wedding, $guest]))->assertNotFound();
    }

    public function test_meeting_and_sms_routes_are_wedding_scoped(): void
    {
        $user = User::factory()->create();
        $wedding = Wedding::factory()->create();
        $other = Wedding::factory()->create();
        WeddingMembership::factory()->create(['user_id' => $user->id, 'wedding_id' => $wedding->id, 'role' => 'owner']);
        $meeting = Meeting::factory()->create(['wedding_id' => $other->id]);
        $this->actingAs($user)->get(route('meetings.show', [$wedding, $meeting]))->assertNotFound();
        $this->actingAs($user)->post(route('messages.store', $wedding), ['recipients' => [['phone_number' => '+256700000001', 'name' => 'Grace']], 'message' => 'Hello', 'message_type' => 'announcement'])->assertRedirect();
        $this->assertDatabaseHas('sms_messages', ['wedding_id' => $wedding->id, 'status' => 'pending']);
    }
}
