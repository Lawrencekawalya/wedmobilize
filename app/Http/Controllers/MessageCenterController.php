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

        return Inertia::render('message-center/index', [
            'section' => $section,
            'contacts' => $request->user()
                ->contacts()
                ->whereNull('archived_at')
                ->whereNull('opted_out_at')
                ->orderBy('name')
                ->orderBy('phone')
                ->get(['id', 'name', 'phone']),
            'groups' => $request->user()
                ->contactGroups()
                ->withCount('contacts')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }
}
