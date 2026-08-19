<?php

namespace Database\Factories;

use App\Models\Guest;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Guest> */
class GuestFactory extends Factory
{
    public function definition(): array
    {
        return ['wedding_id' => Wedding::factory(), 'name' => fake()->name(), 'phone_number' => '+256'.fake()->numerify('7########'), 'email' => fake()->safeEmail(), 'category' => fake()->randomElement(['family', 'friend', 'committee', 'workmate', 'vip', 'other']), 'invitation_status' => 'not_invited', 'attendance_status' => 'unknown'];
    }
}
