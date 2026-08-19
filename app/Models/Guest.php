<?php

namespace App\Models;

use Database\Factories\GuestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guest extends Model
{
    /** @use HasFactory<GuestFactory> */
    use HasFactory;

    protected $fillable = ['wedding_id', 'name', 'phone_number', 'email', 'gender', 'category', 'invitation_status', 'attendance_status', 'notes'];

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
