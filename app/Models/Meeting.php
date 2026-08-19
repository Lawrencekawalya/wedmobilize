<?php

namespace App\Models;

use Database\Factories\MeetingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Meeting extends Model
{
    /** @use HasFactory<MeetingFactory> */
    use HasFactory;

    protected $fillable = ['wedding_id', 'title', 'meeting_date', 'start_time', 'venue', 'agenda', 'notes', 'status'];

    protected function casts(): array
    {
        return ['meeting_date' => 'date'];
    }

    /** @return BelongsTo<Wedding, $this> */
    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
