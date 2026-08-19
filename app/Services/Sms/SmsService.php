<?php

namespace App\Services\Sms;

use App\Models\SmsMessage;

class SmsService
{
    public function __construct(private readonly SmsProvider $provider) {}

    public function send(SmsMessage $message): SmsMessage
    {
        return $this->provider->send($message);
    }
}
