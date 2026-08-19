<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingMembership;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WeddingMembership> */
class WeddingMembershipFactory extends Factory
{
    public function definition(): array
    {
        return ['wedding_id' => Wedding::factory(), 'user_id' => User::factory(), 'role' => 'committee_member'];
    }
}
