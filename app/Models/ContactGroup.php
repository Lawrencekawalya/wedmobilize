<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContactGroup extends Model
{
    protected $fillable = ['name', 'description'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsToMany<Contact, $this> */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class, 'contact_group_members')->withTimestamps();
    }
}
