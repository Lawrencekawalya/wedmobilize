<?php

namespace App\Services\Messaging;

use App\Models\OutboundMessage;
use App\Models\User;
use App\Services\EgoSms\EgoSmsClient;
use App\Services\EgoSms\EgoSmsException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SendSmsService
{
    public function __construct(
        private readonly RecipientResolver $recipientResolver,
        private readonly EgoSmsClient $client,
    ) {}

    /**
     * @param  list<int>  $groupIds
     * @param  list<int>  $contactIds
     */
    public function send(User $user, string $mode, string $body, array $groupIds = [], array $contactIds = []): OutboundMessage
    {
        $contacts = $this->recipientResolver->resolve($user, $mode, $groupIds, $contactIds);
        $senderId = (string) config('services.egosms.sender_id');

        $outboundMessage = DB::transaction(function () use ($user, $mode, $body, $contacts, $senderId) {
            $message = $user->outboundMessages()->create([
                'body' => $body,
                'recipient_mode' => $mode,
                'provider' => 'egosms',
                'sender_id' => $senderId,
                'status' => 'processing',
                'recipient_count' => $contacts->count(),
            ]);

            $message->recipients()->createMany($contacts->map(fn ($contact) => [
                'contact_id' => $contact->id,
                'name' => $contact->name,
                'phone' => $contact->phone,
            ])->all());

            return $message;
        });

        $batchSize = max(1, min((int) config('services.egosms.batch_size', 500), 1000));
        $totalCost = 0;
        $hasCost = false;
        $errors = [];

        $outboundMessage->recipients()->get()->chunk($batchSize)->each(function (Collection $batch) use ($outboundMessage, $body, &$totalCost, &$hasCost, &$errors) {
            try {
                $result = $this->client->send($batch->map(fn ($recipient) => [
                    'phone' => $recipient->phone,
                    'message' => $body,
                ])->values()->all());

                if ($result['cost'] !== null) {
                    $totalCost += $result['cost'];
                    $hasCost = true;
                }

                $outboundMessage->recipients()
                    ->whereKey($batch->pluck('id'))
                    ->update([
                        'status' => 'submitted',
                        'provider_reference' => $result['reference'],
                        'provider_status' => 'OK',
                        'submitted_at' => now(),
                    ]);
            } catch (EgoSmsException $exception) {
                $errors[] = $exception->getMessage();
                $outboundMessage->recipients()
                    ->whereKey($batch->pluck('id'))
                    ->update([
                        'status' => 'failed',
                        'provider_status' => 'Failed',
                        'error_message' => $exception->getMessage(),
                    ]);
            }
        });

        $submittedCount = $outboundMessage->recipients()->where('status', 'submitted')->count();
        $failedCount = $outboundMessage->recipient_count - $submittedCount;
        $status = $submittedCount === 0 ? 'failed' : ($failedCount > 0 ? 'partially_failed' : 'submitted');

        $outboundMessage->update([
            'status' => $status,
            'submitted_count' => $submittedCount,
            'failed_count' => $failedCount,
            'cost' => $hasCost ? $totalCost : null,
            'error_message' => $errors === [] ? null : implode(' ', array_unique($errors)),
            'submitted_at' => $submittedCount > 0 ? now() : null,
        ]);

        return $outboundMessage->refresh();
    }
}
