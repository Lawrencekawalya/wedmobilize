<?php

namespace App\Models;

use Database\Factories\WeddingMembershipFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingMembership extends Model
{
    /** @use HasFactory<WeddingMembershipFactory> */
    use HasFactory;

    public const MANAGER_ROLES = ['owner', 'administrator'];

    protected $fillable = ['wedding_id', 'user_id', 'role'];

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
