<?php

namespace Database\Factories;

use App\Models\SmsMessage;
use App\Models\Wedding;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SmsMessage> */
class SmsMessageFactory extends Factory
{
    public function definition(): array
    {
        return ['wedding_id' => Wedding::factory(), 'recipient_phone' => '+256'.fake()->numerify('7########'), 'recipient_name' => fake()->name(), 'message' => fake()->sentence(), 'message_type' => 'announcement', 'status' => 'pending', 'provider' => 'log'];
    }
}
