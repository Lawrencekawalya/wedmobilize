<?php

return [
    'default' => env('SMS_PROVIDER', 'log'),
    'pahappa' => [
        'api_key' => env('PAHAPPA_SMS_API_KEY'),
        'username' => env('PAHAPPA_SMS_USERNAME'),
        'sender_id' => env('PAHAPPA_SMS_SENDER_ID'),
        'base_url' => env('PAHAPPA_SMS_BASE_URL'),
    ],
];
