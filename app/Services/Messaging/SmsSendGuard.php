<?php

namespace App\Services\Messaging;

use App\Models\OutboundMessage;
use App\Models\User;
use App\Services\EgoSms\EgoSmsClient;
use App\Services\EgoSms\EgoSmsException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class SmsSendGuard
{
    public function __construct(private readonly EgoSmsClient $client) {}

    public function assertSendingEnabled(): void
    {
        if (! (bool) config('services.egosms.sending_enabled', true)) {
            throw ValidationException::withMessages([
                'message' => 'SMS sending is temporarily disabled by the administrator.',
            ]);
        }
    }

    public function reserve(User $user, int $recipients, int $units, ?Carbon $scheduledAt = null): void
    {
        $this->assertSendingEnabled();

        $maxRecipients = max(1, (int) config('services.egosms.max_recipients_per_send', 500));
        $maxUnits = max(1, (int) config('services.egosms.max_units_per_send', 1000));
        $minuteLimit = max(1, (int) config('services.egosms.unit_limit_per_minute', 1000));
        $dailyLimit = max(1, (int) config('services.egosms.daily_unit_limit', 5000));

        if ($recipients > $maxRecipients) {
            throw ValidationException::withMessages([
                'recipient_mode' => "This send exceeds the {$maxRecipients}-recipient safety limit.",
            ]);
        }

        if ($units > $maxUnits) {
            throw ValidationException::withMessages([
                'message' => "This message requires {$units} SMS units and exceeds the {$maxUnits}-unit safety limit.",
            ]);
        }

        $sendDate = ($scheduledAt ?? now())->toDateString();
        $usedOnSendDate = OutboundMessage::query()
            ->where('user_id', $user->id)
            ->where(function ($query) use ($sendDate): void {
                $query->whereDate('scheduled_at', $sendDate)
                    ->orWhere(function ($query) use ($sendDate): void {
                        $query->whereNull('scheduled_at')->whereDate('created_at', $sendDate);
                    });
            })
            ->whereNotIn('status', ['failed'])
            ->sum('estimated_units');

        if ($usedOnSendDate + $units > $dailyLimit) {
            throw ValidationException::withMessages([
                'message' => "This send would exceed the {$dailyLimit}-unit SMS limit for {$sendDate}.",
            ]);
        }

        $rateKey = "sms-units:{$user->id}";
        if (RateLimiter::attempts($rateKey) + $units > $minuteLimit) {
            throw ValidationException::withMessages([
                'message' => 'Too many SMS units were requested in a short period. Wait one minute and try again.',
            ]);
        }

        RateLimiter::increment($rateKey, 60, $units);
    }

    /** @throws EgoSmsException */
    public function assertSufficientBalance(int $units): void
    {
        if (! (bool) config('services.egosms.enforce_balance', true)) {
            return;
        }

        $rate = max(0, (float) config('services.egosms.local_sms_rate', 35));
        $required = $units * $rate;
        $balance = $this->client->balance();

        if ($rate <= 0 || $balance < $required) {
            throw new EgoSmsException(sprintf(
                'Insufficient EgoSMS balance. This send needs approximately UGX %s; available balance is UGX %s.',
                number_format($required),
                number_format($balance),
            ));
        }
    }
}
