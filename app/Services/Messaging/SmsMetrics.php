<?php

namespace App\Services\Messaging;

class SmsMetrics
{
    /** @return array{encoding: string, characters: int, parts: int} */
    public function calculate(string $message): array
    {
        $gsm = preg_match('/^[\x{000A}\x{000D}\x{0020}-\x{007E}£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ¤¡ÄÖÑÜ§¿äöñüà^{}\\\[~\]|€]*$/u', $message) === 1;
        $characters = mb_strlen($message);
        $single = $gsm ? 160 : 70;
        $multipart = $gsm ? 153 : 67;
        $parts = $characters <= $single ? 1 : (int) ceil($characters / $multipart);

        return ['encoding' => $gsm ? 'GSM-7' : 'Unicode', 'characters' => $characters, 'parts' => max(1, $parts)];
    }
}
