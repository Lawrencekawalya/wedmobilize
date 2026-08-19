<?php

namespace App\Models;

use Database\Factories\ContributionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contribution extends Model
{
    /** @use HasFactory<ContributionFactory> */
    use HasFactory;

    protected $fillable = ['wedding_id', 'guest_id', 'contributor_name', 'phone_number', 'amount_pledged', 'amount_paid', 'payment_date', 'payment_method', 'reference', 'notes'];

    protected function casts(): array
    {
        return ['amount_pledged' => 'integer', 'amount_paid' => 'integer', 'payment_date' => 'date'];
    }

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }

    /** @return BelongsTo<Guest, $this> */
    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }
}
