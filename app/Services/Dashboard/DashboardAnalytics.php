<?php

namespace App\Services\Dashboard;

use App\Models\OutboundMessage;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * @phpstan-type DailyActivity array{date: string, label: string, total: int, accepted: int, delivered: int, failed: int}
 * @phpstan-type MonthlyActivity array{month: int, label: string, total: int, accepted: int, delivered: int, failed: int}
 * @phpstan-type NetworkCount array{recipients: int, units: int}
 */
class DashboardAnalytics
{
    /**
     * @return array{
     *     daily: list<array{date: string, label: string, total: int, accepted: int, delivered: int, failed: int}>,
     *     monthly: list<array{month: int, label: string, total: int, accepted: int, delivered: int, failed: int}>,
     *     networks: list<array{name: string, recipients: int, units: int, percentage: float}>,
     *     spending: array{units: int, estimated_cost: float, provider_reported_cost: int},
     *     upcoming: list<array{id: int, body: string, recipient_count: int, sms_parts: int, estimated_units: int, scheduled_at: string}>,
     *     contact_health: array{missing_name: int, without_group: int}
     * }
     */
    public function for(User $user): array
    {
        $today = today();
        $startOfWeek = $today->copy()->subDays(6);
        $startOfYear = $today->copy()->startOfYear();
        $messages = $user->outboundMessages()
            ->where('status', '!=', 'scheduled')
            ->where('created_at', '>=', $startOfYear)
            ->with(['recipients:id,outbound_message_id,phone,status'])
            ->get(['id', 'sms_parts', 'cost', 'submitted_at', 'created_at']);

        /** @var array<string, DailyActivity> $daily */
        $daily = [];
        foreach (range(0, 6) as $offset) {
            $date = $startOfWeek->copy()->addDays($offset);
            $daily[$date->toDateString()] = [
                'date' => $date->toDateString(),
                'label' => $date->format('D'),
                'total' => 0,
                'accepted' => 0,
                'delivered' => 0,
                'failed' => 0,
            ];
        }
        /** @var array<int, MonthlyActivity> $monthly */
        $monthly = [];
        foreach (range(1, 12) as $month) {
            $monthly[$month] = [
                'month' => $month,
                'label' => Carbon::create(null, $month)->format('M'),
                'total' => 0,
                'accepted' => 0,
                'delivered' => 0,
                'failed' => 0,
            ];
        }
        /** @var array<string, NetworkCount> $networks */
        $networks = [
            'MTN Uganda' => ['recipients' => 0, 'units' => 0],
            'Airtel Uganda' => ['recipients' => 0, 'units' => 0],
            'Other local' => ['recipients' => 0, 'units' => 0],
        ];
        $currentMonthUnits = 0;

        foreach ($messages as $message) {
            $sentAt = $this->sentAt($message);
            $dateKey = $sentAt->toDateString();
            $month = $sentAt->month;
            $parts = max(1, (int) $message->sms_parts);

            foreach ($message->recipients as $recipient) {
                $status = (string) $recipient->status;
                $accepted = in_array($status, ['submitted', 'sent', 'delivered', 'delivery_failed'], true);
                $delivered = $status === 'delivered';
                $failed = in_array($status, ['failed', 'delivery_failed'], true);

                if (isset($daily[$dateKey])) {
                    $this->incrementActivity($daily[$dateKey], $accepted, $delivered, $failed);
                }
                if (isset($monthly[$month])) {
                    $this->incrementActivity($monthly[$month], $accepted, $delivered, $failed);
                }
                if ($sentAt->isSameMonth($today) && $accepted) {
                    $network = $this->networkFor((string) $recipient->phone);
                    $networkData = $networks[$network];
                    $networkData['recipients']++;
                    $networkData['units'] += $parts;
                    $networks[$network] = $networkData;
                    $currentMonthUnits += $parts;
                }
            }
        }

        $networkRecipientTotal = array_sum(array_column($networks, 'recipients'));
        $rate = max(0, (float) config('services.egosms.local_sms_rate', 35));
        $providerReportedCost = (int) $messages
            ->filter(fn (OutboundMessage $message) => $this->sentAt($message)->isSameMonth($today))
            ->sum('cost');
        $activeContacts = $user->contacts()->where('status', 'active')->whereNull('archived_at');
        $networkUsage = [];
        foreach ($networks as $name => $data) {
            $networkUsage[] = [
                'name' => $name,
                'recipients' => $data['recipients'],
                'units' => $data['units'],
                'percentage' => $networkRecipientTotal > 0
                    ? (float) round(($data['recipients'] / $networkRecipientTotal) * 100, 1)
                    : 0.0,
            ];
        }
        $upcoming = [];
        $scheduledMessages = $user->outboundMessages()
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at')
            ->limit(5)
            ->get(['id', 'body', 'recipient_count', 'sms_parts', 'estimated_units', 'scheduled_at']);
        foreach ($scheduledMessages as $message) {
            $scheduledAt = $message->getAttribute('scheduled_at');
            $upcoming[] = [
                'id' => (int) $message->id,
                'body' => (string) $message->body,
                'recipient_count' => (int) $message->recipient_count,
                'sms_parts' => (int) $message->sms_parts,
                'estimated_units' => (int) $message->estimated_units,
                'scheduled_at' => $scheduledAt instanceof CarbonInterface
                    ? $scheduledAt->toIso8601String()
                    : Carbon::parse((string) $scheduledAt)->toIso8601String(),
            ];
        }

        return [
            'daily' => array_values($daily),
            'monthly' => array_values($monthly),
            'networks' => $networkUsage,
            'spending' => [
                'units' => $currentMonthUnits,
                'estimated_cost' => $currentMonthUnits * $rate,
                'provider_reported_cost' => $providerReportedCost,
            ],
            'upcoming' => $upcoming,
            'contact_health' => [
                'missing_name' => (clone $activeContacts)
                    ->where(fn ($query) => $query->whereNull('name')->orWhere('name', ''))
                    ->count(),
                'without_group' => (clone $activeContacts)->whereDoesntHave('groups')->count(),
            ],
        ];
    }

    /** @param DailyActivity|MonthlyActivity $bucket */
    private function incrementActivity(array &$bucket, bool $accepted, bool $delivered, bool $failed): void
    {
        $bucket['total'] = (int) $bucket['total'] + 1;
        $bucket['accepted'] = (int) $bucket['accepted'] + ($accepted ? 1 : 0);
        $bucket['delivered'] = (int) $bucket['delivered'] + ($delivered ? 1 : 0);
        $bucket['failed'] = (int) $bucket['failed'] + ($failed ? 1 : 0);
    }

    private function networkFor(string $phone): string
    {
        $nationalPrefix = substr($phone, 3, 2);

        return match (true) {
            in_array($nationalPrefix, ['76', '77', '78', '79'], true) => 'MTN Uganda',
            in_array($nationalPrefix, ['70', '74', '75'], true) => 'Airtel Uganda',
            default => 'Other local',
        };
    }

    private function sentAt(OutboundMessage $message): CarbonInterface
    {
        $value = $message->getAttribute('submitted_at') ?? $message->getAttribute('created_at');

        return $value instanceof CarbonInterface ? $value : Carbon::parse((string) $value);
    }
}
