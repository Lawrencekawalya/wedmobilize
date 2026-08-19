<?php

namespace App\Http\Controllers;

use App\Http\Requests\SmsMessageRequest;
use App\Models\Wedding;
use App\Services\Sms\SmsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SmsMessageController extends Controller
{
    public function index(Wedding $wedding): Response
    {
        $this->authorize('view', $wedding);

        return Inertia::render('messages/index', ['wedding' => $wedding, 'guests' => $wedding->guests()->whereNotNull('phone_number')->orderBy('name')->get(['id', 'name', 'phone_number']), 'messages' => $wedding->smsMessages()->latest()->paginate(10)]);
    }

    public function store(SmsMessageRequest $request, Wedding $wedding, SmsService $sms): RedirectResponse
    {
        $this->authorize('manage', $wedding);
        foreach ($request->validated('recipients') as $recipient) {
            $message = $wedding->smsMessages()->create(['user_id' => $request->user()->id, 'recipient_phone' => $recipient['phone_number'], 'recipient_name' => $recipient['name'] ?? null, 'message' => $request->validated('message'), 'message_type' => $request->validated('message_type'), 'status' => 'pending', 'provider' => config('sms.default')]);
            $sms->send($message);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Messages recorded for delivery.']);

        return back();
    }
}
