<?php

namespace Database\Factories;

use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Wedding> */
class WeddingFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => fake()->lastName().' Wedding', 'bride_name' => fake()->firstNameFemale(), 'groom_name' => fake()->firstNameMale(), 'wedding_date' => fake()->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d'), 'venue' => fake()->company().' Gardens', 'contribution_target' => fake()->numberBetween(1_000_000, 20_000_000), 'primary_contact_phone' => '+256'.fake()->numerify('7########'), 'description' => fake()->sentence(), 'status' => 'planning'];
    }
}
