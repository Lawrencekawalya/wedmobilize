<?php

namespace App\Policies;

use App\Models\Guest;
use App\Models\User;

class GuestPolicy
{
    public function view(User $user, Guest $guest): bool
    {
        return $guest->wedding->memberships()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Guest $guest): bool
    {
        return app(WeddingPolicy::class)->manage($user, $guest->wedding);
    }

    public function delete(User $user, Guest $guest): bool
    {
        return $this->update($user, $guest);
    }
}
