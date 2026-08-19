<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutboundMessage extends Model
{
    protected $fillable = [
        'body',
        'message_template_id',
        'message_campaign_id',
        'recipient_mode',
        'provider',
        'sender_id',
        'status',
        'recipient_count',
        'sms_parts',
        'estimated_units',
        'submitted_count',
        'failed_count',
        'cost',
        'error_message',
        'submitted_at',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'scheduled_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OutboundMessageRecipient, $this> */
    public function recipients(): HasMany
    {
        return $this->hasMany(OutboundMessageRecipient::class);
    }
}
