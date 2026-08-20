<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_management_page_only_loads_a_thirteen_contact_preview(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        foreach (range(1, 15) as $index) {
            $user->contacts()->create([
                'name' => "Contact {$index}",
                'phone' => '256700'.str_pad((string) $index, 6, '0', STR_PAD_LEFT),
            ]);
        }
        $otherUser->contacts()->create([
            'name' => 'Private contact',
            'phone' => '256799999999',
        ]);

        $this->actingAs($user)
            ->get('/contacts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('contacts/index')
                ->where('contactsTotal', 15)
                ->has('contacts', 13));
    }

    public function test_contact_management_page_only_features_the_group_with_the_most_contacts(): void
    {
        $user = User::factory()->create();
        $smallGroup = $user->contactGroups()->create(['name' => 'Small group']);
        $largeGroup = $user->contactGroups()->create(['name' => 'Large group']);

        foreach (range(1, 3) as $index) {
            $contact = $user->contacts()->create([
                'name' => "Group contact {$index}",
                'phone' => '256702'.str_pad((string) $index, 6, '0', STR_PAD_LEFT),
            ]);
            $largeGroup->contacts()->attach($contact);
        }

        $smallGroup->contacts()->attach($user->contacts()->create([
            'name' => 'Small group contact',
            'phone' => '256703000001',
        ]));

        $this->actingAs($user)
            ->get('/contacts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('contacts/index')
                ->where('groupsTotal', 2)
                ->where('featuredGroup.id', $largeGroup->id)
                ->where('featuredGroup.contacts_count', 3));
    }

    public function test_complete_contact_list_is_paginated_at_sixty_contacts(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 65) as $index) {
            $user->contacts()->create([
                'name' => "Contact {$index}",
                'phone' => '256701'.str_pad((string) $index, 6, '0', STR_PAD_LEFT),
            ]);
        }

        $this->actingAs($user)
            ->get('/contacts/all')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('contacts/list')
                ->where('contacts.total', 65)
                ->where('contacts.per_page', 60)
                ->where('contacts.current_page', 1)
                ->where('contacts.last_page', 2)
                ->has('contacts.data', 60));

        $this->get('/contacts/all?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('contacts.current_page', 2)
                ->has('contacts.data', 5));
    }

    public function test_complete_contact_list_searches_contact_and_group_fields(): void
    {
        $user = User::factory()->create();
        $contact = $user->contacts()->create([
            'name' => 'Sarah Namusoke',
            'phone' => '256777071434',
            'email' => 'sarah@example.com',
        ]);
        $group = $user->contactGroups()->create(['name' => 'Vendors']);
        $group->contacts()->attach($contact);
        $user->contacts()->create([
            'name' => 'Peter Okello',
            'phone' => '256700111222',
        ]);

        $this->actingAs($user)
            ->get('/contacts/all?search=Vendors')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'Vendors')
                ->where('contacts.total', 1)
                ->where('contacts.data.0.id', $contact->id));
    }

    public function test_complete_group_list_is_paginated_at_sixty_groups(): void
    {
        $user = User::factory()->create();

        foreach (range(1, 65) as $index) {
            $user->contactGroups()->create(['name' => "Group {$index}"]);
        }

        $this->actingAs($user)
            ->get('/contacts/groups')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('contacts/groups')
                ->where('groups.total', 65)
                ->where('groups.per_page', 60)
                ->where('groups.current_page', 1)
                ->where('groups.last_page', 2)
                ->has('groups.data', 60));

        $this->get('/contacts/groups?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('groups.current_page', 2)
                ->has('groups.data', 5));
    }
}
