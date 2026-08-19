<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendSmsRequest;
use App\Services\Messaging\SendSmsService;
use Illuminate\Http\RedirectResponse;
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

        $messages = $section === 'outbox'
            ? $request->user()->outboundMessages()
                ->latest()
                ->limit(50)
                ->select([
                    'id', 'body', 'recipient_mode', 'sender_id', 'status',
                    'recipient_count', 'submitted_count', 'failed_count',
                    'cost', 'error_message', 'submitted_at', 'created_at',
                ])
                ->withCount([
                    'recipients as sent_count' => fn ($query) => $query->where('status', 'sent'),
                    'recipients as delivered_count' => fn ($query) => $query->where('status', 'delivered'),
                    'recipients as delivery_failed_count' => fn ($query) => $query->where('status', 'delivery_failed'),
                ])
                ->get()
            : [];

        return Inertia::render('message-center/index', [
            'section' => $section,
            'contacts' => $contacts,
            'groups' => $groups,
            'messages' => $messages,
            'smsConfigured' => collect(['endpoint', 'username', 'password', 'sender_id'])
                ->every(fn (string $key) => filled(config("services.egosms.{$key}"))),
        ]);
    }

    public function send(SendSmsRequest $request, SendSmsService $service): RedirectResponse
    {
        $data = $request->validated();
        $message = $service->send(
            $request->user(),
            $data['recipient_mode'],
            $data['message'],
            $data['group_ids'] ?? [],
            $data['contact_ids'] ?? [],
        );

        if ($message->status === 'failed') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'EgoSMS did not accept the message. Review it in Outbox.',
            ]);
        } elseif ($message->status === 'partially_failed') {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => "{$message->submitted_count} messages submitted; {$message->failed_count} failed.",
            ]);
        } else {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "{$message->submitted_count} messages submitted to EgoSMS.",
            ]);
        }

        return to_route('messages.show', ['section' => 'outbox']);
    }
}
