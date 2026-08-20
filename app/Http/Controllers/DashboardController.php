<?php

namespace App\Http\Controllers;

use App\Models\OutboundMessageRecipient;
use App\Services\Dashboard\DashboardAnalytics;
use App\Services\EgoSms\EgoSmsClient;
use App\Services\EgoSms\EgoSmsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, EgoSmsClient $egoSms, DashboardAnalytics $analytics): Response
    {
        $user = $request->user();
        $messages = $user->outboundMessages();
        $smsConfigured = collect(['endpoint', 'username', 'password', 'sender_id'])
            ->every(fn (string $key) => filled(config("services.egosms.{$key}")));
        $balance = null;

        if ($smsConfigured) {
            try {
                $balance = Cache::remember('egosms.balance', 60, fn () => $egoSms->balance());
            } catch (EgoSmsException) {
                $balance = null;
            }
        }

        $deliveryStats = OutboundMessageRecipient::query()
            ->whereHas('outboundMessage', fn ($query) => $query->where('user_id', $user->id))
            ->selectRaw("SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered")
            ->selectRaw("SUM(CASE WHEN status = 'delivery_failed' THEN 1 ELSE 0 END) as delivery_failed")
            ->first();
        $delivered = (int) ($deliveryStats?->getAttribute('delivered') ?? 0);
        $deliveryFailed = (int) ($deliveryStats?->getAttribute('delivery_failed') ?? 0);
        $finalDeliveryReports = $delivered + $deliveryFailed;
        $localSmsRate = max(0, (float) config('services.egosms.local_sms_rate', 35));

        return Inertia::render('dashboard', [
            'summary' => [
                'contacts' => $user->contacts()->where('status', 'active')->whereNull('archived_at')->count(),
                'groups' => $user->contactGroups()->count(),
                'messages_sent' => (int) (clone $messages)->sum('submitted_count'),
                'scheduled' => (clone $messages)->where('status', 'scheduled')->count(),
                'delivery_rate' => $finalDeliveryReports > 0 ? round(($delivered / $finalDeliveryReports) * 100, 1) : null,
                'delivered' => $delivered,
                'delivery_failed' => $deliveryFailed,
                'campaigns' => $user->messageCampaigns()->count(),
            ],
            'recentMessages' => (clone $messages)
                ->latest()
                ->limit(6)
                ->get([
                    'id', 'body', 'status', 'recipient_count', 'submitted_count',
                    'failed_count', 'sms_parts', 'estimated_units', 'scheduled_at',
                    'submitted_at', 'created_at',
                ]),
            'sms' => [
                'configured' => $smsConfigured,
                'balance' => $balance,
                'sender_id' => config('services.egosms.sender_id'),
                'local_rate' => $localSmsRate,
                'estimated_remaining' => $balance !== null && $localSmsRate > 0
                    ? (int) floor($balance / $localSmsRate)
                    : null,
            ],
            'analytics' => $analytics->for($user),
        ]);
    }
}
