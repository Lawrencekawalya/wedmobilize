<?php

namespace App\Services\Messaging;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class RecipientResolver
{
    /**
     * @param  list<int>  $groupIds
     * @param  list<int>  $contactIds
     * @return Collection<int, Contact>
     */
    public function resolve(User $user, string $mode, array $groupIds = [], array $contactIds = []): Collection
    {
        $query = $this->eligibleQuery($user);

        if ($mode === 'groups') {
            $requestedGroupIds = collect($groupIds)->unique()->values();
            $ownedGroupIds = $user->contactGroups()
                ->whereIn('id', $requestedGroupIds)
                ->pluck('id');

            if ($ownedGroupIds->count() !== $requestedGroupIds->count()) {
                throw ValidationException::withMessages(['group_ids' => 'One or more selected groups are unavailable.']);
            }

            $query->whereHas('groups', fn (Builder $builder) => $builder->whereIn('contact_groups.id', $ownedGroupIds));
        }

        if (in_array($mode, ['contacts', 'paste', 'file', 'campaign'], true)) {
            $requestedContactIds = collect($contactIds)->unique()->values();
            $query->whereIn('id', $requestedContactIds);
            $contacts = $query->get(['id', 'name', 'phone']);

            if ($contacts->count() !== $requestedContactIds->count()) {
                throw ValidationException::withMessages(['contact_ids' => 'One or more selected contacts are unavailable.']);
            }

            return $this->validatePhones($contacts);
        }

        return $this->validatePhones($query->get(['id', 'name', 'phone']));
    }

    /** @return Builder<Contact> */
    private function eligibleQuery(User $user): Builder
    {
        return Contact::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('archived_at')
            ->whereNull('opted_out_at');
    }

    /**
     * @param  Collection<int, Contact>  $contacts
     * @return Collection<int, Contact>
     */
    private function validatePhones(Collection $contacts): Collection
    {
        if ($contacts->isEmpty()) {
            throw ValidationException::withMessages(['recipient_mode' => 'No eligible contacts were found for this selection.']);
        }

        if ($contacts->contains(fn (Contact $contact) => preg_match('/^256\d{9}$/', $contact->phone) !== 1)) {
            throw ValidationException::withMessages([
                'recipient_mode' => 'One or more selected contacts have an invalid Ugandan phone number. Update them before sending.',
            ]);
        }

        return $contacts->unique('phone')->values();
    }
}
