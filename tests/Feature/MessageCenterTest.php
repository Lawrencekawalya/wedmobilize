<?php

namespace Tests\Feature;

use App\Models\OutboundMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
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

    public function test_sent_webhook_status_is_not_misclassified_as_delivery_failure(): void
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
        $this->assertSame('sent', $recipient->status);
        $this->assertSame('Sent', $recipient->provider_status);
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
        ]);
    }
}
