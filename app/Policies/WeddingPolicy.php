<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wedding;
use App\Models\WeddingMembership;

class WeddingPolicy
{
    public function view(User $user, Wedding $wedding): bool
    {
        return $wedding->memberships()->where('user_id', $user->id)->exists();
    }

    public function manage(User $user, Wedding $wedding): bool
    {
        return $wedding->memberships()->where('user_id', $user->id)->whereIn('role', WeddingMembership::MANAGER_ROLES)->exists();
    }
}
