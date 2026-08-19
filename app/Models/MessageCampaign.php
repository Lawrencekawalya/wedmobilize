<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property list<int> $contact_ids */
class MessageCampaign extends Model
{
    protected $fillable = ['name', 'contact_ids'];

    protected function casts(): array
    {
        return ['contact_ids' => 'array'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
