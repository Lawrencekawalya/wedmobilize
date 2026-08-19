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
        $status = strcasecmp($providerStatus, 'Success') === 0 ? 'delivered' : 'delivery_failed';

        $recipient = OutboundMessageRecipient::query()
            ->where('provider_reference', $data['MsgFollowUpUniqueCode'])
            ->where('phone', $phone)
            ->latest('id')
            ->first();

        if ($recipient === null) {
            return response()->json(['message' => 'Delivery report accepted.']);
        }

        $recipient->update([
            'status' => $status,
            'provider_status' => $providerStatus,
            'delivered_at' => $status === 'delivered' ? now() : null,
        ]);

        return response()->json(['message' => 'Delivery report updated.']);
    }
}
