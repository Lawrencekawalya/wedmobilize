<?php

namespace App\Services\Sms;

use App\Models\SmsMessage;

interface SmsProvider
{
    public function send(SmsMessage $message): SmsMessage;
}
