<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageCenterController extends Controller
{
    /** @var list<string> */
    private const SECTIONS = [
        'single-bulk',
        'custom',
        'scheduled',
        'inbox',
        'outbox',
        'templates',
    ];

    public function show(Request $request, string $section): Response
    {
        abort_unless(in_array($section, self::SECTIONS, true), 404);

        $contacts = $request->user()
            ->contacts()
            ->where('status', 'active')
            ->whereNull('archived_at')
            ->whereNull('opted_out_at')
            ->orderBy('name')
            ->orderBy('phone')
            ->get(['id', 'name', 'phone']);
        $eligibleContactIds = $contacts->pluck('id');
        $groups = $request->user()
            ->contactGroups()
            ->with(['contacts' => fn ($query) => $query
                ->whereIn('contacts.id', $eligibleContactIds)
                ->select('contacts.id')])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($group) => [
                'id' => $group->id,
                'name' => $group->name,
                'contacts_count' => $group->contacts->count(),
                'contact_ids' => $group->contacts->pluck('id')->values(),
            ]);

        return Inertia::render('message-center/index', [
            'section' => $section,
            'contacts' => $contacts,
            'groups' => $groups,
        ]);
    }
}
