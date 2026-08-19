<?php

namespace App\Services\Messaging;

class PhoneNumberService
{
    public function normalize(string $value): ?string
    {
        $phone = preg_replace('/\D+/', '', $value) ?? '';
        if (str_starts_with($phone, '0') && strlen($phone) === 10) {
            $phone = '256'.substr($phone, 1);
        } elseif (strlen($phone) === 9 && str_starts_with($phone, '7')) {
            $phone = '256'.$phone;
        }

        return preg_match('/^256\d{9}$/', $phone) === 1 ? $phone : null;
    }
}
