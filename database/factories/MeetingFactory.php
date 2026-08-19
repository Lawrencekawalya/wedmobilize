<?php

namespace Database\Factories;

use App\Models\Meeting;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Meeting> */
class MeetingFactory extends Factory
{
    public function definition(): array
    {
        return ['wedding_id' => Wedding::factory(), 'title' => 'Wedding Planning Meeting', 'meeting_date' => fake()->dateTimeBetween('+1 day', '+6 months')->format('Y-m-d'), 'start_time' => '14:00', 'venue' => fake()->company().' Hall', 'agenda' => fake()->sentence(), 'status' => 'upcoming'];
    }
}
