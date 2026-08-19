<?php

namespace Database\Seeders;

use App\Models\Contribution;
use App\Models\Guest;
use App\Models\Meeting;
use App\Models\SmsMessage;
use App\Models\User;
use App\Models\Wedding;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create(['name' => 'Sarah Nansubuga', 'email' => 'sarah@example.com']);
        $wedding = Wedding::factory()->create(['name' => 'Sarah & Peter Wedding', 'bride_name' => 'Sarah', 'groom_name' => 'Peter', 'wedding_date' => '2026-12-15']);
        $wedding->memberships()->create(['user_id' => $user->id, 'role' => 'owner']);
        Guest::factory(12)->create(['wedding_id' => $wedding->id]);
        Contribution::factory(4)->create(['wedding_id' => $wedding->id]);
        Meeting::factory()->create(['wedding_id' => $wedding->id, 'title' => '3rd Last Wedding Planning Meeting', 'meeting_date' => '2026-11-15']);
        SmsMessage::factory(3)->create(['wedding_id' => $wedding->id, 'user_id' => $user->id]);
    }
}
