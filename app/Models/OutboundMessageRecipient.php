<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string|null $name
 * @property string $phone
 * @property string $status
 * @property string|null $provider_reference
 * @property string|null $provider_status
 */
class OutboundMessageRecipient extends Model
{
    protected $fillable = [
        'contact_id',
        'name',
        'phone',
        'status',
        'provider_reference',
        'provider_status',
        'error_message',
        'submitted_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'delivered_at' => 'datetime'];
    }

    /** @return BelongsTo<OutboundMessage, $this> */
    public function outboundMessage(): BelongsTo
    {
        return $this->belongsTo(OutboundMessage::class);
    }

    /** @return BelongsTo<Contact, $this> */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
