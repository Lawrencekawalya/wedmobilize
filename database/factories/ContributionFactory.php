<?php

namespace Database\Factories;

use App\Models\Contribution;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Contribution> */
class ContributionFactory extends Factory
{
    public function definition(): array
    {
        $pledged = fake()->numberBetween(50_000, 500_000);

        return ['wedding_id' => Wedding::factory(), 'contributor_name' => fake()->name(), 'phone_number' => '+256'.fake()->numerify('7########'), 'amount_pledged' => $pledged, 'amount_paid' => fake()->numberBetween(0, $pledged)];
    }
}
