<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ContactGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $contactsQuery = $request->user()->contacts();
        $contactsTotal = (clone $contactsQuery)->count();
        $contacts = $contactsQuery->with('groups:id,name')->latest()->limit(10)->get();
        $groups = $request->user()->contactGroups()->withCount('contacts')->orderBy('name')->get();

        return Inertia::render('contacts/index', compact('contacts', 'contactsTotal', 'groups'));
    }

    public function list(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $contacts = $request->user()->contacts()
            ->with('groups:id,name')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('groups', fn ($query) => $query->where('name', 'like', "%{$search}%"));
            }))
            ->latest()
            ->paginate(60)
            ->withQueryString();
        $groups = $request->user()->contactGroups()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('contacts/list', [
            'contacts' => $contacts,
            'groups' => $groups,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['nullable', 'string', 'max:255'], 'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:255'], 'group_ids' => ['array'], 'group_ids.*' => ['integer']]);
        $phone = preg_replace('/\D+/', '', $data['phone']);
        $contact = $request->user()->contacts()->updateOrCreate(['phone' => $phone], ['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null]);
        $contact->groups()->syncWithoutDetaching(ContactGroup::where('user_id', $request->user()->id)->whereIn('id', $data['group_ids'] ?? [])->pluck('id'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contact saved.']);

        return back();
    }

    public function storeGroup(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:500']]);
        $request->user()->contactGroups()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contact group created.']);

        return back();
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless($contact->user_id === $request->user()->id, 404);
        $data = $request->validate(['name' => ['nullable', 'string', 'max:255'], 'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:255'], 'group_ids' => ['array'], 'group_ids.*' => ['integer']]);
        $contact->update(['name' => $data['name'] ?? null, 'phone' => preg_replace('/\D+/', '', $data['phone']), 'email' => $data['email'] ?? null]);
        $contact->groups()->sync(ContactGroup::where('user_id', $request->user()->id)->whereIn('id', $data['group_ids'] ?? [])->pluck('id'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contact updated.']);

        return back();
    }

    public function destroy(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless($contact->user_id === $request->user()->id, 404);
        $contact->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contact deleted.']);

        return back();
    }

    public function updateGroup(Request $request, ContactGroup $group): RedirectResponse
    {
        abort_unless($group->user_id === $request->user()->id, 404);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:500']]);
        $group->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contact group updated.']);

        return back();
    }

    public function destroyGroup(Request $request, ContactGroup $group): RedirectResponse
    {
        abort_unless($group->user_id === $request->user()->id, 404);
        $group->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Group deleted. Contacts were kept.']);

        return back();
    }
}
