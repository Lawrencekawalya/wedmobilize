<?php

namespace App\Models;

use Database\Factories\WeddingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wedding extends Model
{
    /** @use HasFactory<WeddingFactory> */
    use HasFactory;

    protected $fillable = ['name', 'bride_name', 'groom_name', 'wedding_date', 'venue', 'contribution_target', 'primary_contact_phone', 'description', 'status'];

    protected function casts(): array
    {
        return ['wedding_date' => 'date', 'contribution_target' => 'integer'];
    }

    /** @return HasMany<WeddingMembership, $this> */
    public function memberships(): HasMany
    {
        return $this->hasMany(WeddingMembership::class);
    }

    /** @return HasMany<Guest, $this> */
    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    /** @return HasMany<Meeting, $this> */
    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    /** @return HasMany<SmsMessage, $this> */
    public function smsMessages(): HasMany
    {
        return $this->hasMany(SmsMessage::class);
    }

    /** @return HasMany<Contribution, $this> */
    public function contributions(): HasMany
    {
        return $this->hasMany(Contribution::class);
    }
}
