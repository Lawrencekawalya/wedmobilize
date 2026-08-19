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
        $contacts = $request->user()->contacts()->with('groups:id,name')->latest()->get();
        $groups = $request->user()->contactGroups()->withCount('contacts')->orderBy('name')->get();

        return Inertia::render('contacts/index', compact('contacts', 'groups'));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['nullable', 'string', 'max:255'], 'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:255'], 'group_ids' => ['array'], 'group_ids.*' => ['integer']]);
        $phone = preg_replace('/\D+/', '', $data['phone']);
        $contact = $request->user()->contacts()->updateOrCreate(['phone' => $phone], ['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null]);
        $contact->groups()->syncWithoutDetaching(ContactGroup::where('user_id', $request->user()->id)->whereIn('id', $data['group_ids'] ?? [])->pluck('id'));

        return back()->with('success', 'Contact saved.');
    }

    public function storeGroup(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:500']]);
        $request->user()->contactGroups()->create($data);

        return back()->with('success', 'Group created.');
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless($contact->user_id === $request->user()->id, 404);
        $data = $request->validate(['name' => ['nullable', 'string', 'max:255'], 'phone' => ['required', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:255'], 'group_ids' => ['array'], 'group_ids.*' => ['integer']]);
        $contact->update(['name' => $data['name'] ?? null, 'phone' => preg_replace('/\D+/', '', $data['phone']), 'email' => $data['email'] ?? null]);
        $contact->groups()->sync(ContactGroup::where('user_id', $request->user()->id)->whereIn('id', $data['group_ids'] ?? [])->pluck('id'));

        return back()->with('success', 'Contact updated.');
    }

    public function destroy(Request $request, Contact $contact): RedirectResponse
    {
        abort_unless($contact->user_id === $request->user()->id, 404);
        $contact->delete();

        return back()->with('success', 'Contact deleted.');
    }

    public function updateGroup(Request $request, ContactGroup $group): RedirectResponse
    {
        abort_unless($group->user_id === $request->user()->id, 404);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string', 'max:500']]);
        $group->update($data);

        return back()->with('success', 'Group updated.');
    }

    public function destroyGroup(Request $request, ContactGroup $group): RedirectResponse
    {
        abort_unless($group->user_id === $request->user()->id, 404);
        $group->delete();

        return back()->with('success', 'Group deleted. Contacts were kept.');
    }
}
