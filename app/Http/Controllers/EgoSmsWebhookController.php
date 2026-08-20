<?php

namespace App\Http\Controllers;

use App\Models\OutboundMessageRecipient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EgoSmsWebhookController extends Controller
{
    public function delivery(Request $request, string $token): JsonResponse
    {
        $configuredToken = (string) config('services.egosms.webhook_token');
        abort_if($configuredToken === '' || ! hash_equals($configuredToken, $token), 404);

        $data = $request->validate([
            'MsgFollowUpUniqueCode' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:30'],
            'Status' => ['required', 'string', 'max:100'],
        ]);

        $phone = preg_replace('/\D+/', '', $data['number']);
        $providerStatus = trim($data['Status']);
        $status = $this->mapStatus($providerStatus);

        $recipient = OutboundMessageRecipient::query()
            ->where('provider_reference', $data['MsgFollowUpUniqueCode'])
            ->where('phone', $phone)
            ->latest('id')
            ->first();

        if ($recipient === null) {
            return response()->json(['message' => 'Delivery report accepted.']);
        }

        $updates = ['provider_status' => $providerStatus];

        if ($status !== null && $recipient->status !== 'delivered') {
            $updates['status'] = $status;
            $updates['delivered_at'] = $status === 'delivered' ? now() : null;
        }

        $recipient->update($updates);

        return response()->json(['message' => 'Delivery report updated.']);
    }

    private function mapStatus(string $providerStatus): ?string
    {
        $normalized = strtolower((string) preg_replace('/[^a-z0-9]+/i', '', $providerStatus));

        return match ($normalized) {
            // EgoSMS defines Sent as its successful delivery outcome.
            'success', 'delivered', 'delivrd', 'sent' => 'delivered',
            'submitted', 'accepted', 'acceptd', 'enroute', 'queued' => 'submitted',
            'failed', 'failure', 'undelivered', 'undeliv', 'rejected', 'rejectd',
            'expired', 'deleted', 'blocked', 'error' => 'delivery_failed',
            default => null,
        };
    }
}
