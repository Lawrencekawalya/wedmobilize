<?php

namespace App\Policies;

use App\Models\Meeting;
use App\Models\User;

class MeetingPolicy
{
    public function view(User $user, Meeting $meeting): bool
    {
        return $meeting->wedding->memberships()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Meeting $meeting): bool
    {
        return app(WeddingPolicy::class)->manage($user, $meeting->wedding);
    }

    public function delete(User $user, Meeting $meeting): bool
    {
        return $this->update($user, $meeting);
    }
}
