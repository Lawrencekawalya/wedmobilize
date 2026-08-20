<?php

namespace Tests\Feature;

use App\Models\OutboundMessage;
use App\Models\User;
use App\Services\Messaging\SendSmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
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

    public function test_composer_estimates_remaining_sms_from_balance_and_configured_rate(): void
    {
        $this->configureEgoSms();
        config()->set('services.egosms.local_sms_rate', 35);
        Cache::forget('egosms.balance');
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK',
            'Balance' => 4895,
        ])]);

        $this->actingAs(User::factory()->create())
            ->get('/messages/single-bulk')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('smsBalance', 4895)
                ->where('smsLocalRate', 35)
                ->where('smsEstimatedRemaining', 139));
    }

    public function test_user_can_submit_an_sms_to_all_eligible_contacts(): void
    {
        $this->configureEgoSms();
        Http::fake([
            'comms.egosms.co/*' => Http::response([
                'Status' => 'OK',
                'Message' => 'Successfully Sent!',
                'Cost' => '70',
                'MsgFollowUpUniqueCode' => 'ApiMSG.123456789',
            ]),
        ]);

        $user = User::factory()->create();
        $first = $user->contacts()->create(['name' => 'Sarah', 'phone' => '256777071434']);
        $second = $user->contacts()->create(['name' => 'Peter', 'phone' => '256700111222']);
        $user->contacts()->create([
            'name' => 'Opted out',
            'phone' => '256700111333',
            'opted_out_at' => now(),
        ]);
        User::factory()->create()->contacts()->create([
            'name' => 'Other account',
            'phone' => '256700111444',
        ]);

        $this->actingAs($user)
            ->post('/messages/send', [
                'recipient_mode' => 'all',
                'message' => 'The ceremony begins at 2 PM.',
            ])
            ->assertRedirect('/messages/outbox');

        $message = OutboundMessage::query()->sole();
        $this->assertSame('submitted', $message->status);
        $this->assertSame(2, $message->recipient_count);
        $this->assertSame(2, $message->submitted_count);
        $this->assertSame(70, $message->cost);
        $this->assertEqualsCanonicalizing(
            [$first->id, $second->id],
            $message->recipients()->pluck('contact_id')->all(),
        );

        Http::assertSent(function (Request $request): bool {
            $payload = $request->data();

            return $request->url() === 'https://comms.egosms.co/api/v1/json/'
                && $payload['method'] === 'SendSms'
                && $payload['userdata']['username'] === 'test-user'
                && $payload['userdata']['password'] === 'test-key'
                && count($payload['msgdata']) === 2
                && $payload['msgdata'][0]['senderid'] === 'WedMobilize';
        });
    }

    public function test_group_selection_deduplicates_contacts_and_rejects_other_users_groups(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK',
            'Message' => 'Successfully Sent!',
            'Cost' => '35',
            'MsgFollowUpUniqueCode' => 'ApiMSG.group',
        ])]);

        $user = User::factory()->create();
        $contact = $user->contacts()->create(['name' => 'Sarah', 'phone' => '256777071434']);
        $family = $user->contactGroups()->create(['name' => 'Family']);
        $committee = $user->contactGroups()->create(['name' => 'Committee']);
        $family->contacts()->attach($contact);
        $committee->contacts()->attach($contact);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'groups',
            'group_ids' => [$family->id, $committee->id],
            'message' => 'One message only.',
        ])->assertRedirect('/messages/outbox');

        $this->assertSame(1, OutboundMessage::query()->sole()->recipient_count);

        $otherGroup = User::factory()->create()->contactGroups()->create(['name' => 'Private']);
        $this->actingAs($user)->from('/messages/single-bulk')->post('/messages/send', [
            'recipient_mode' => 'groups',
            'group_ids' => [$otherGroup->id],
            'message' => 'Should not send.',
        ])->assertRedirect('/messages/single-bulk')->assertSessionHasErrors('group_ids');

        Http::assertSentCount(1);
    }

    public function test_provider_failure_is_recorded_in_outbox(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'Failed',
            'Message' => 'Invalid sender ID',
        ])]);

        $user = User::factory()->create();
        $contact = $user->contacts()->create(['name' => 'Sarah', 'phone' => '256777071434']);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Hello Sarah.',
        ])->assertRedirect('/messages/outbox');

        $message = OutboundMessage::query()->sole();
        $this->assertSame('failed', $message->status);
        $this->assertSame(1, $message->failed_count);
        $this->assertSame('Invalid sender ID', $message->error_message);
    }

    public function test_delivery_webhook_updates_the_matching_recipient(): void
    {
        config()->set('services.egosms.webhook_token', 'delivery-secret');
        $user = User::factory()->create();
        $message = $user->outboundMessages()->create([
            'body' => 'Hello.',
            'recipient_mode' => 'all',
            'sender_id' => 'WedMobilize',
            'status' => 'submitted',
            'recipient_count' => 1,
            'submitted_count' => 1,
        ]);
        $recipient = $message->recipients()->create([
            'name' => 'Sarah',
            'phone' => '256777071434',
            'status' => 'submitted',
            'provider_reference' => 'ApiMSG.delivery',
        ]);

        $this->postJson('/webhooks/egosms/delivery/delivery-secret', [
            'MsgFollowUpUniqueCode' => 'ApiMSG.delivery',
            'number' => '+256777071434',
            'Status' => 'Success',
        ])->assertOk();

        $this->assertSame('delivered', $recipient->refresh()->status);
        $this->assertNotNull($recipient->delivered_at);
    }

    public function test_sent_webhook_status_is_counted_as_delivered_under_the_egosms_contract(): void
    {
        config()->set('services.egosms.webhook_token', 'delivery-secret');
        $user = User::factory()->create();
        $message = $user->outboundMessages()->create([
            'body' => 'Hello.',
            'recipient_mode' => 'all',
            'sender_id' => 'WedMobilize',
            'status' => 'submitted',
            'recipient_count' => 1,
            'submitted_count' => 1,
        ]);
        $recipient = $message->recipients()->create([
            'name' => 'Sarah',
            'phone' => '256777071434',
            'status' => 'submitted',
            'provider_reference' => 'ApiMSG.sent',
        ]);

        $this->postJson('/webhooks/egosms/delivery/delivery-secret', [
            'MsgFollowUpUniqueCode' => 'ApiMSG.sent',
            'number' => '+256777071434',
            'Status' => 'Sent',
        ])->assertOk();

        $recipient->refresh();
        $this->assertSame('delivered', $recipient->status);
        $this->assertSame('Sent', $recipient->provider_status);
        $this->assertNotNull($recipient->delivered_at);

        $this->actingAs($user)->get('/messages/outbox')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('messages.0.sent_count', 1)
            ->where('messages.0.delivered_count', 1)
            ->where('messages.0.delivery_failed_count', 0));
        $this->get(route('dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.delivered', 1)
            ->where('summary.delivery_failed', 0)
            ->where('summary.delivery_rate', 100));
    }

    public function test_pending_provider_status_does_not_create_a_false_delivery(): void
    {
        config()->set('services.egosms.webhook_token', 'delivery-secret');
        $user = User::factory()->create();
        $message = $user->outboundMessages()->create([
            'body' => 'Hello.',
            'recipient_mode' => 'all',
            'sender_id' => 'WedMobilize',
            'status' => 'submitted',
            'recipient_count' => 1,
            'submitted_count' => 1,
        ]);
        $recipient = $message->recipients()->create([
            'phone' => '256777071434',
            'status' => 'submitted',
            'provider_reference' => 'ApiMSG.pending',
        ]);

        $this->postJson('/webhooks/egosms/delivery/delivery-secret', [
            'MsgFollowUpUniqueCode' => 'ApiMSG.pending',
            'number' => '+256777071434',
            'Status' => 'Accepted',
        ])->assertOk();

        $recipient->refresh();
        $this->assertSame('submitted', $recipient->status);
        $this->assertNull($recipient->delivered_at);
    }

    public function test_unknown_webhook_status_does_not_create_a_false_failure(): void
    {
        config()->set('services.egosms.webhook_token', 'delivery-secret');
        $user = User::factory()->create();
        $message = $user->outboundMessages()->create([
            'body' => 'Hello.',
            'recipient_mode' => 'all',
            'sender_id' => 'WedMobilize',
            'status' => 'submitted',
            'recipient_count' => 1,
            'submitted_count' => 1,
        ]);
        $recipient = $message->recipients()->create([
            'name' => 'Sarah',
            'phone' => '256777071434',
            'status' => 'submitted',
            'provider_reference' => 'ApiMSG.unknown',
        ]);

        $this->postJson('/webhooks/egosms/delivery/delivery-secret', [
            'MsgFollowUpUniqueCode' => 'ApiMSG.unknown',
            'number' => '+256777071434',
            'Status' => 'ProviderSpecificStatus',
        ])->assertOk();

        $recipient->refresh();
        $this->assertSame('submitted', $recipient->status);
        $this->assertSame('ProviderSpecificStatus', $recipient->provider_status);
    }

    public function test_pasted_numbers_are_normalized_saved_as_contacts_and_sent(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK', 'Message' => 'Successfully Sent!', 'Cost' => '70',
            'MsgFollowUpUniqueCode' => 'ApiMSG.pasted',
        ])]);
        $user = User::factory()->create();

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'paste',
            'raw_numbers' => "0777071434\n+256700111222\n0777071434",
            'message' => 'Welcome to the event.',
            'send_timing' => 'now',
        ])->assertRedirect('/messages/outbox');

        $this->assertSame(2, $user->contacts()->count());
        $this->assertDatabaseHas('contacts', ['user_id' => $user->id, 'phone' => '256777071434', 'name' => null]);
        $this->assertSame(2, OutboundMessage::query()->sole()->recipient_count);
    }

    public function test_scheduled_message_waits_until_due_before_contacting_egosms(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK', 'Message' => 'Successfully Sent!', 'Cost' => '35',
            'MsgFollowUpUniqueCode' => 'ApiMSG.scheduled',
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);
        $scheduledAt = now()->addMinutes(10);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'This is scheduled.',
            'send_timing' => 'later',
            'scheduled_at' => $scheduledAt->toIso8601String(),
        ])->assertRedirect('/messages/scheduled');

        Http::assertNothingSent();
        $this->assertSame('scheduled', OutboundMessage::query()->sole()->status);

        $this->travelTo($scheduledAt->addSecond());
        $this->artisan('messages:send-scheduled')->assertSuccessful();
        $this->assertSame('submitted', OutboundMessage::query()->sole()->refresh()->status);
        Http::assertSentCount(1);
    }

    public function test_repeated_idempotency_key_never_submits_the_same_message_twice(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK', 'Message' => 'Successfully Sent!', 'Cost' => '35',
            'MsgFollowUpUniqueCode' => 'ApiMSG.idempotent',
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);
        $key = (string) Str::uuid();
        $payload = [
            'idempotency_key' => $key,
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Send this exactly once.',
        ];

        $this->actingAs($user)->post('/messages/send', $payload)->assertRedirect('/messages/outbox');
        $this->actingAs($user)->post('/messages/send', $payload)->assertRedirect('/messages/outbox');

        $this->assertSame(1, OutboundMessage::query()->count());
        Http::assertSentCount(1);
    }

    public function test_dispatch_claim_prevents_a_submitted_message_from_being_sent_again(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK', 'Message' => 'Successfully Sent!', 'Cost' => '35',
            'MsgFollowUpUniqueCode' => 'ApiMSG.claimed',
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Claim once.',
        ])->assertRedirect('/messages/outbox');

        app(SendSmsService::class)->dispatch(OutboundMessage::query()->sole());

        Http::assertSentCount(1);
    }

    public function test_emergency_switch_blocks_sending_before_an_outbound_record_is_created(): void
    {
        $this->configureEgoSms();
        config()->set('services.egosms.sending_enabled', false);
        Http::fake();
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->from('/messages/single-bulk')->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Must be blocked.',
        ])->assertRedirect('/messages/single-bulk')->assertSessionHasErrors('message');

        $this->assertDatabaseCount('outbound_messages', 0);
        Http::assertNothingSent();
    }

    public function test_weighted_unit_limit_blocks_an_oversized_send(): void
    {
        $this->configureEgoSms();
        config()->set('services.egosms.max_units_per_send', 1);
        Http::fake();
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->from('/messages/single-bulk')->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => str_repeat('a', 161),
        ])->assertRedirect('/messages/single-bulk')->assertSessionHasErrors('message');

        $this->assertDatabaseCount('outbound_messages', 0);
        Http::assertNothingSent();
    }

    public function test_ambiguous_provider_timeout_is_recorded_and_never_retried_automatically(): void
    {
        $this->configureEgoSms();
        Http::fake(fn () => Http::failedConnection('Timed out'));
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Do not retry this timeout.',
        ])->assertRedirect('/messages/outbox');

        $message = OutboundMessage::query()->sole();
        $this->assertSame('unknown', $message->status);
        $this->assertSame(1, $message->unknown_count);
        $this->assertSame('unknown', $message->recipients()->sole()->status);

        app(SendSmsService::class)->dispatch($message);
        Http::assertSentCount(1);
    }

    public function test_balance_guard_blocks_a_send_that_would_exceed_available_credit(): void
    {
        $this->configureEgoSms();
        config()->set('services.egosms.enforce_balance', true);
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK',
            'Balance' => 10,
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Credit must be checked before sending.',
        ])->assertRedirect('/messages/outbox');

        $message = OutboundMessage::query()->sole();
        $this->assertSame('failed', $message->status);
        $this->assertStringContainsString('Insufficient EgoSMS balance', (string) $message->error_message);
        $this->assertSame('failed', $message->recipients()->sole()->status);
        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request['method'] === 'Balance');
    }

    public function test_an_idempotency_key_cannot_be_reused_for_different_content(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK', 'Message' => 'Successfully Sent!', 'Cost' => '35',
            'MsgFollowUpUniqueCode' => 'ApiMSG.collision',
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);
        $key = (string) Str::uuid();

        $this->actingAs($user)->post('/messages/send', [
            'idempotency_key' => $key,
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Original content.',
        ])->assertRedirect('/messages/outbox');
        $this->actingAs($user)->from('/messages/single-bulk')->post('/messages/send', [
            'idempotency_key' => $key,
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Changed content.',
        ])->assertRedirect('/messages/single-bulk')->assertSessionHasErrors('message');

        $this->assertSame(1, OutboundMessage::query()->count());
        Http::assertSentCount(1);
    }

    public function test_provider_success_without_a_reference_is_treated_as_unknown(): void
    {
        $this->configureEgoSms();
        Http::fake(['comms.egosms.co/*' => Http::response([
            'Status' => 'OK',
            'Message' => 'Successfully Sent!',
        ])]);
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);

        $this->actingAs($user)->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'A reference is required.',
        ])->assertRedirect('/messages/outbox');

        $message = OutboundMessage::query()->sole();
        $this->assertSame('unknown', $message->status);
        $this->assertSame(1, $message->unknown_count);
        app(SendSmsService::class)->dispatch($message);
        Http::assertSentCount(1);
    }

    public function test_daily_quota_counts_messages_scheduled_for_the_same_future_date(): void
    {
        $this->configureEgoSms();
        config()->set('services.egosms.daily_unit_limit', 2);
        Http::fake();
        $user = User::factory()->create();
        $contact = $user->contacts()->create(['phone' => '256777071434']);
        $sendAt = now()->addDays(2);

        $user->outboundMessages()->create([
            'body' => 'Already reserved.',
            'recipient_mode' => 'contacts',
            'provider' => 'egosms',
            'sender_id' => 'WedMobilize',
            'status' => 'scheduled',
            'recipient_count' => 1,
            'sms_parts' => 2,
            'estimated_units' => 2,
            'scheduled_at' => $sendAt,
        ]);

        $this->actingAs($user)->from('/messages/single-bulk')->post('/messages/send', [
            'recipient_mode' => 'contacts',
            'contact_ids' => [$contact->id],
            'message' => 'Would exceed that date.',
            'send_timing' => 'later',
            'scheduled_at' => $sendAt->addHour()->toIso8601String(),
        ])->assertRedirect('/messages/single-bulk')->assertSessionHasErrors('message');

        $this->assertDatabaseCount('outbound_messages', 1);
        Http::assertNothingSent();
    }

    private function configureEgoSms(): void
    {
        config()->set('services.egosms', [
            'endpoint' => 'https://comms.egosms.co/api/v1/json/',
            'username' => 'test-user',
            'password' => 'test-key',
            'sender_id' => 'WedMobilize',
            'priority' => '0',
            'batch_size' => 500,
            'webhook_token' => 'delivery-secret',
            'local_sms_rate' => 35,
            'sending_enabled' => true,
            'enforce_balance' => false,
            'max_recipients_per_send' => 500,
            'max_units_per_send' => 1000,
            'unit_limit_per_minute' => 1000,
            'daily_unit_limit' => 5000,
            'send_requests_per_minute' => 100,
            'dispatch_lock_seconds' => 120,
        ]);
    }
}
