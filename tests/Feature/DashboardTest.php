<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_summarizes_only_the_authenticated_users_data(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $user->contacts()->create(['phone' => '256777071434']);
        $user->contacts()->create(['phone' => '256700111222', 'status' => 'inactive']);
        $other->contacts()->create(['phone' => '256700111333']);
        $user->contactGroups()->create(['name' => 'Family']);
        $user->messageCampaigns()->create(['name' => 'Committee', 'contact_ids' => []]);

        $sent = $user->outboundMessages()->create([
            'body' => 'Sent update', 'recipient_mode' => 'all', 'sender_id' => 'WedMobilize',
            'status' => 'submitted', 'recipient_count' => 2, 'submitted_count' => 2,
        ]);
        $sent->recipients()->create(['phone' => '256777071434', 'status' => 'delivered']);
        $sent->recipients()->create(['phone' => '256700111222', 'status' => 'delivery_failed']);
        $user->outboundMessages()->create([
            'body' => 'Scheduled update', 'recipient_mode' => 'contacts', 'sender_id' => 'WedMobilize',
            'status' => 'scheduled', 'recipient_count' => 1, 'scheduled_at' => now()->addHour(),
        ]);
        $other->outboundMessages()->create([
            'body' => 'Other account', 'recipient_mode' => 'all', 'sender_id' => 'Other',
            'status' => 'submitted', 'recipient_count' => 10, 'submitted_count' => 10,
        ]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('summary.contacts', 1)
            ->where('summary.groups', 1)
            ->where('summary.messages_sent', 2)
            ->where('summary.scheduled', 1)
            ->where('summary.delivery_rate', 50)
            ->where('summary.campaigns', 1)
            ->has('recentMessages', 2)
            ->where('recentMessages.0.body', 'Scheduled update'));
    }
}
