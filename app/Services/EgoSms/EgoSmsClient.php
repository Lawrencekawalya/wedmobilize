<?php

namespace App\Services\EgoSms;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Throwable;

class EgoSmsClient
{
    /**
     * @param  array<int, array{phone: string, message: string}>  $messages
     * @return array{reference: string, cost: int|null, message: string}
     */
    public function send(array $messages): array
    {
        $endpoint = (string) config('services.egosms.endpoint');
        $username = (string) config('services.egosms.username');
        $password = (string) config('services.egosms.password');
        $senderId = (string) config('services.egosms.sender_id');
        $priority = (string) config('services.egosms.priority', '0');

        if ($endpoint === '' || $username === '' || $password === '' || $senderId === '') {
            throw new EgoSmsException('EgoSMS is not fully configured.');
        }

        if (mb_strlen($senderId) > 11) {
            throw new EgoSmsException('The configured EgoSMS sender ID must not exceed 11 characters.');
        }

        try {
            $response = Http::asJson()
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(30)
                ->post($endpoint, [
                    'method' => 'SendSms',
                    'userdata' => [
                        'username' => $username,
                        'password' => $password,
                    ],
                    'msgdata' => array_map(fn (array $message) => [
                        'number' => $message['phone'],
                        'message' => $message['message'],
                        'senderid' => $senderId,
                        'priority' => $priority,
                    ], $messages),
                ]);
        } catch (ConnectionException $exception) {
            throw new EgoSmsException('Could not connect to EgoSMS. The delivery result is unknown.', previous: $exception);
        } catch (Throwable $exception) {
            throw new EgoSmsException('EgoSMS request failed before a response was received.', previous: $exception);
        }

        if (! $response->successful()) {
            throw new EgoSmsException("EgoSMS returned HTTP {$response->status()}.");
        }

        $data = $response->json();
        if (! is_array($data)) {
            throw new EgoSmsException('EgoSMS returned an invalid response.');
        }

        if (strcasecmp((string) ($data['Status'] ?? ''), 'OK') !== 0) {
            $message = trim((string) ($data['Message'] ?? 'EgoSMS rejected the request.'));
            throw new EgoSmsException($message !== '' ? $message : 'EgoSMS rejected the request.');
        }

        $reference = trim((string) ($data['MsgFollowUpUniqueCode'] ?? ''));
        if ($reference === '') {
            throw new EgoSmsException('EgoSMS accepted the request without returning a tracking code.');
        }

        $cost = filter_var($data['Cost'] ?? null, FILTER_VALIDATE_INT);

        return [
            'reference' => $reference,
            'cost' => $cost === false ? null : $cost,
            'message' => (string) ($data['Message'] ?? 'Successfully submitted.'),
        ];
    }
}
