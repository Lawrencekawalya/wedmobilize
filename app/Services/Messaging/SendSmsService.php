<?php

namespace App\Services\Messaging;

use App\Models\OutboundMessage;
use App\Models\User;
use App\Services\EgoSms\EgoSmsClient;
use App\Services\EgoSms\EgoSmsException;
use App\Services\EgoSms\EgoSmsUnknownOutcomeException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SendSmsService
{
    public function __construct(
        private readonly RecipientResolver $recipientResolver,
        private readonly EgoSmsClient $client,
        private readonly SmsSendGuard $guard,
        private readonly SmsMetrics $metrics,
    ) {}

    /**
     * @param  list<int>  $groupIds
     * @param  list<int>  $contactIds
     */
    public function send(
        User $user,
        string $mode,
        string $body,
        array $groupIds = [],
        array $contactIds = [],
        ?Carbon $scheduledAt = null,
        ?string $campaignName = null,
        ?int $templateId = null,
        ?string $idempotencyKey = null,
    ): OutboundMessage {
        $this->guard->assertSendingEnabled();
        $contacts = $this->recipientResolver->resolve($user, $mode, $groupIds, $contactIds);
        $senderId = (string) config('services.egosms.sender_id');
        $metrics = $this->metrics->calculate($body);
        $estimatedUnits = $metrics['parts'] * $contacts->count();
        $idempotencyKey ??= (string) str()->uuid();
        $fingerprint = hash('sha256', json_encode([
            'body' => $body,
            'mode' => $mode,
            'contacts' => $contacts->pluck('id')->sort()->values()->all(),
            'scheduled_at' => $scheduledAt?->toIso8601String(),
            'campaign_name' => $campaignName,
            'template_id' => $templateId,
        ], JSON_THROW_ON_ERROR));

        /** @var array{0: OutboundMessage, 1: bool} $result */
        $result = DB::transaction(function () use ($user, $mode, $body, $contacts, $senderId, $metrics, $estimatedUnits, $scheduledAt, $campaignName, $templateId, $idempotencyKey, $fingerprint): array {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $existing = OutboundMessage::query()
                ->where('user_id', $user->id)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing !== null) {
                if (! hash_equals((string) $existing->request_fingerprint, $fingerprint)) {
                    throw ValidationException::withMessages([
                        'message' => 'This send key was already used for different message data. Refresh the composer and try again.',
                    ]);
                }

                return [$existing, false];
            }

            $this->guard->reserve($user, $contacts->count(), $estimatedUnits, $scheduledAt);
            $campaign = filled($campaignName)
                ? $user->messageCampaigns()->updateOrCreate(
                    ['name' => $campaignName],
                    ['contact_ids' => $contacts->pluck('id')->all()],
                )
                : null;
            $message = $user->outboundMessages()->create([
                'idempotency_key' => $idempotencyKey,
                'request_fingerprint' => $fingerprint,
                'body' => $body,
                'message_template_id' => $templateId,
                'message_campaign_id' => $campaign?->id,
                'recipient_mode' => $mode,
                'provider' => 'egosms',
                'sender_id' => $senderId,
                'status' => $scheduledAt === null ? 'pending' : 'scheduled',
                'recipient_count' => $contacts->count(),
                'sms_parts' => $metrics['parts'],
                'estimated_units' => $estimatedUnits,
                'scheduled_at' => $scheduledAt,
            ]);

            $message->recipients()->createMany($contacts->map(fn ($contact) => [
                'contact_id' => $contact->id,
                'name' => $contact->name,
                'phone' => $contact->phone,
            ])->all());

            return [$message, true];
        }, 3);

        [$outboundMessage, $created] = $result;

        return ! $created || $scheduledAt !== null
            ? $outboundMessage->refresh()
            : $this->dispatch($outboundMessage);
    }

    public function dispatch(OutboundMessage $outboundMessage): OutboundMessage
    {
        $claimed = OutboundMessage::query()
            ->whereKey($outboundMessage->id)
            ->whereIn('status', ['pending', 'scheduled'])
            ->update(['status' => 'processing', 'error_message' => null]);

        if ($claimed !== 1) {
            return $outboundMessage->refresh();
        }

        $lock = Cache::lock('egosms:provider-dispatch', max(30, (int) config('services.egosms.dispatch_lock_seconds', 120)));
        if (! $lock->get()) {
            $outboundMessage->recipients()->where('status', 'pending')->update([
                'status' => 'failed',
                'provider_status' => 'Blocked',
                'error_message' => 'Another SMS dispatch is in progress.',
            ]);
            $outboundMessage->update([
                'status' => 'failed',
                'failed_count' => $outboundMessage->recipient_count,
                'error_message' => 'Another SMS dispatch is in progress. This message was not sent; submit it again with a new request.',
            ]);

            return $outboundMessage->refresh();
        }

        try {
            $this->guard->assertSendingEnabled();
            $this->guard->assertSufficientBalance($outboundMessage->estimated_units);

            return $this->dispatchClaimed($outboundMessage);
        } catch (ValidationException|EgoSmsException $exception) {
            $outboundMessage->recipients()->where('status', 'pending')->update([
                'status' => 'failed',
                'provider_status' => 'Blocked',
                'error_message' => $exception->getMessage(),
            ]);
            $outboundMessage->update([
                'status' => 'failed',
                'failed_count' => $outboundMessage->recipient_count,
                'error_message' => $exception->getMessage(),
            ]);

            return $outboundMessage->refresh();
        } finally {
            $lock->release();
        }
    }

    private function dispatchClaimed(OutboundMessage $outboundMessage): OutboundMessage
    {
        $batchSize = max(1, min((int) config('services.egosms.batch_size', 500), 1000));
        $totalCost = 0;
        $hasCost = false;
        $errors = [];

        $outboundMessage->recipients()->where('status', 'pending')->get()->chunk($batchSize)
            ->each(function (Collection $batch) use ($outboundMessage, &$totalCost, &$hasCost, &$errors): void {
                try {
                    $result = $this->client->send($batch->map(fn ($recipient) => [
                        'phone' => $recipient->phone,
                        'message' => $outboundMessage->body,
                    ])->values()->all());
                    if ($result['cost'] !== null) {
                        $totalCost += $result['cost'];
                        $hasCost = true;
                    }
                    $outboundMessage->recipients()->whereKey($batch->pluck('id'))->update([
                        'status' => 'submitted',
                        'provider_reference' => $result['reference'],
                        'provider_status' => 'OK',
                        'submitted_at' => now(),
                    ]);
                } catch (EgoSmsUnknownOutcomeException $exception) {
                    $errors[] = $exception->getMessage();
                    $outboundMessage->recipients()->whereKey($batch->pluck('id'))->update([
                        'status' => 'unknown',
                        'provider_status' => 'Unknown',
                        'error_message' => $exception->getMessage(),
                    ]);
                } catch (EgoSmsException $exception) {
                    $errors[] = $exception->getMessage();
                    $outboundMessage->recipients()->whereKey($batch->pluck('id'))->update([
                        'status' => 'failed',
                        'provider_status' => 'Failed',
                        'error_message' => $exception->getMessage(),
                    ]);
                }
            });

        $submittedCount = $outboundMessage->recipients()->where('status', 'submitted')->count();
        $failedCount = $outboundMessage->recipients()->where('status', 'failed')->count();
        $unknownCount = $outboundMessage->recipients()->where('status', 'unknown')->count();
        $status = match (true) {
            $unknownCount === $outboundMessage->recipient_count => 'unknown',
            $unknownCount > 0 => 'partially_unknown',
            $submittedCount === 0 => 'failed',
            $failedCount > 0 => 'partially_failed',
            default => 'submitted',
        };

        $outboundMessage->update([
            'status' => $status,
            'submitted_count' => $submittedCount,
            'failed_count' => $failedCount,
            'unknown_count' => $unknownCount,
            'cost' => $hasCost ? $totalCost : null,
            'error_message' => $errors === [] ? null : implode(' ', array_unique($errors)),
            'submitted_at' => $submittedCount > 0 ? now() : null,
        ]);
        Cache::forget('egosms.balance');

        return $outboundMessage->refresh();
    }
}
