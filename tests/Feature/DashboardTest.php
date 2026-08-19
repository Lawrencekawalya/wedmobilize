<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_without_a_wedding_are_sent_to_setup()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('weddings.create'));
    }

    public function test_members_can_visit_their_wedding_dashboard()
    {
        $user = User::factory()->create();
        $wedding = Wedding::factory()->create();
        WeddingMembership::factory()->create(['user_id' => $user->id, 'wedding_id' => $wedding->id, 'role' => 'owner']);

        $this->actingAs($user)->get(route('weddings.dashboard', $wedding))->assertOk();
    }
}
