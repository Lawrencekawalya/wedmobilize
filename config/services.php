<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'egosms' => [
        'endpoint' => env('EGOSMS_ENDPOINT', 'https://comms.egosms.co/api/v1/json/'),
        'username' => env('EGOSMS_USERNAME'),
        'password' => env('EGOSMS_PASSWORD'),
        'sender_id' => env('EGOSMS_SENDER_ID'),
        'priority' => env('EGOSMS_PRIORITY', '0'),
        'batch_size' => (int) env('EGOSMS_BATCH_SIZE', 500),
        'webhook_token' => env('EGOSMS_WEBHOOK_TOKEN'),
        'local_sms_rate' => (float) env('EGOSMS_LOCAL_SMS_RATE', 35),
        'sending_enabled' => env('EGOSMS_SENDING_ENABLED', true),
        'enforce_balance' => env('EGOSMS_ENFORCE_BALANCE', true),
        'max_recipients_per_send' => (int) env('EGOSMS_MAX_RECIPIENTS_PER_SEND', 500),
        'max_units_per_send' => (int) env('EGOSMS_MAX_UNITS_PER_SEND', 1000),
        'unit_limit_per_minute' => (int) env('EGOSMS_UNIT_LIMIT_PER_MINUTE', 1000),
        'daily_unit_limit' => (int) env('EGOSMS_DAILY_UNIT_LIMIT', 5000),
        'send_requests_per_minute' => (int) env('EGOSMS_SEND_REQUESTS_PER_MINUTE', 3),
        'dispatch_lock_seconds' => (int) env('EGOSMS_DISPATCH_LOCK_SECONDS', 120),
    ],

];
