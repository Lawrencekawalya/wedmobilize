<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutboundMessage extends Model
{
    protected $fillable = [
        'body',
        'recipient_mode',
        'provider',
        'sender_id',
        'status',
        'recipient_count',
        'submitted_count',
        'failed_count',
        'cost',
        'error_message',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime'];
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
