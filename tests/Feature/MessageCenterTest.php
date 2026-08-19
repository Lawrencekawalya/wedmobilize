<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MessageCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_center_only_lists_the_users_eligible_recipients(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $activeContact = $user->contacts()->create([
            'name' => 'Sarah Namusoke',
            'phone' => '256777071434',
        ]);
        $user->contacts()->create([
            'name' => 'Opted out guest',
            'phone' => '256700000001',
            'opted_out_at' => now(),
        ]);
        $otherUser->contacts()->create([
            'name' => 'Another account',
            'phone' => '256700000002',
        ]);
        $group = $user->contactGroups()->create(['name' => 'Family']);
        $group->contacts()->attach($activeContact);

        $this->actingAs($user)
            ->get('/messages/single-bulk')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('message-center/index')
                ->where('section', 'single-bulk')
                ->has('contacts', 1)
                ->where('contacts.0.id', $activeContact->id)
                ->has('groups', 1)
                ->where('groups.0.id', $group->id)
                ->where('groups.0.contacts_count', 1)
                ->where('groups.0.contact_ids.0', $activeContact->id));
    }

    public function test_unknown_message_center_sections_return_not_found(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/messages/unknown')
            ->assertNotFound();
    }
}
