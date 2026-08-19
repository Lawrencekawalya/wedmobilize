<?php

namespace App\Services\Sms;

use App\Models\SmsMessage;
use Illuminate\Support\Facades\Log;

class LogSmsProvider implements SmsProvider
{
    public function send(SmsMessage $message): SmsMessage
    {
        Log::info('WedMobilize SMS queued with logging provider.', ['sms_message_id' => $message->id, 'recipient' => $message->recipient_phone]);

        return $message->fresh();
    }
}
