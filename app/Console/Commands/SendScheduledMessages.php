<?php

namespace App\Console\Commands;

use App\Models\OutboundMessage;
use App\Services\Messaging\SendSmsService;
use Illuminate\Console\Command;

class SendScheduledMessages extends Command
{
    protected $signature = 'messages:send-scheduled';

    protected $description = 'Submit due scheduled SMS messages to EgoSMS';

    public function handle(SendSmsService $service): int
    {
        OutboundMessage::query()->where('status', 'scheduled')->where('scheduled_at', '<=', now())
            ->orderBy('id')->eachById(fn (OutboundMessage $message) => $service->dispatch($message));

        return self::SUCCESS;
    }
}
