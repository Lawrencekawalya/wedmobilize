<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendSmsRequest;
use App\Services\EgoSms\EgoSmsClient;
use App\Services\EgoSms\EgoSmsException;
use App\Services\Messaging\ContactIngestionService;
use App\Services\Messaging\SendSmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
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

        $messages = in_array($section, ['outbox', 'scheduled'], true)
            ? $request->user()->outboundMessages()
                ->when($section === 'scheduled', fn ($query) => $query->where('status', 'scheduled'))
                ->latest()
                ->limit(50)
                ->select([
                    'id', 'body', 'recipient_mode', 'sender_id', 'status',
                    'recipient_count', 'submitted_count', 'failed_count',
                    'cost', 'error_message', 'submitted_at', 'scheduled_at', 'created_at',
                ])
                ->withCount([
                    // Outbox counters are cumulative: every delivered SMS was also sent.
                    'recipients as sent_count' => fn ($query) => $query->whereIn('status', ['sent', 'delivered']),
                    'recipients as delivered_count' => fn ($query) => $query->where('status', 'delivered'),
                    'recipients as delivery_failed_count' => fn ($query) => $query->where('status', 'delivery_failed'),
                ])
                ->get()
            : [];

        $smsConfigured = collect(['endpoint', 'username', 'password', 'sender_id'])
            ->every(fn (string $key) => filled(config("services.egosms.{$key}")));
        $balance = null;
        if ($smsConfigured && $section === 'single-bulk') {
            try {
                $balance = Cache::remember('egosms.balance', 60, fn () => app(EgoSmsClient::class)->balance());
            } catch (EgoSmsException) {
                $balance = null;
            }
        }

        return Inertia::render('message-center/index', [
            'section' => $section,
            'contacts' => $contacts,
            'groups' => $groups,
            'messages' => $messages,
            'smsConfigured' => $smsConfigured,
            'smsBalance' => $balance,
            'senderId' => config('services.egosms.sender_id'),
            'templates' => $request->user()->messageTemplates()->orderBy('name')->get(['id', 'name', 'body']),
            'campaigns' => $request->user()->messageCampaigns()->latest()->get(['id', 'name', 'contact_ids']),
        ]);
    }

    public function send(SendSmsRequest $request, SendSmsService $service, ContactIngestionService $ingestion): RedirectResponse
    {
        $data = $request->validated();
        $mode = $data['recipient_mode'];
        $contactIds = $data['contact_ids'] ?? [];
        if ($mode === 'paste') {
            $contactIds = $ingestion->fromPasted($request->user(), $data['raw_numbers'])->pluck('id')->all();
        } elseif ($mode === 'file') {
            $contactIds = $ingestion->fromFile($request->user(), $request->file('recipient_file'))->pluck('id')->all();
        } elseif ($mode === 'campaign') {
            $campaign = $request->user()->messageCampaigns()->whereKey($data['campaign_id'])->firstOrFail();
            $contactIds = $campaign->contact_ids;
        }
        $effectiveMode = in_array($mode, ['paste', 'file', 'campaign'], true) ? $mode : $data['recipient_mode'];
        $message = $service->send(
            $request->user(),
            $effectiveMode,
            $data['message'],
            $data['group_ids'] ?? [],
            $contactIds,
            ($data['send_timing'] ?? 'now') === 'later' ? Carbon::parse($data['scheduled_at']) : null,
            $data['campaign_name'] ?? null,
            isset($data['template_id']) ? (int) $data['template_id'] : null,
        );

        if ($message->status === 'scheduled') {
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Message scheduled successfully.']);

            return to_route('messages.show', ['section' => 'scheduled']);
        }

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
