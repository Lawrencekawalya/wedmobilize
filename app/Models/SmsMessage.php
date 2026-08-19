<?php

namespace App\Models;

use Database\Factories\SmsMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsMessage extends Model
{
    /** @use HasFactory<SmsMessageFactory> */
    use HasFactory;

    protected $fillable = ['wedding_id', 'user_id', 'recipient_phone', 'recipient_name', 'message', 'message_type', 'status', 'provider', 'provider_message_id', 'failure_reason', 'sent_at'];

    protected function casts(): array
    {
        return ['sent_at' => 'datetime'];
    }

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
