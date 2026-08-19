<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Contact extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'status', 'custom_fields', 'notes', 'opted_out_at', 'archived_at'];

    protected function casts(): array
    {
        return ['custom_fields' => 'array', 'opted_out_at' => 'datetime', 'archived_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsToMany<ContactGroup, $this> */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(ContactGroup::class, 'contact_group_members')->withTimestamps();
    }
}
