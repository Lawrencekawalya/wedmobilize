<?php

namespace App\Http\Controllers;

use App\Http\Requests\MeetingRequest;
use App\Models\Meeting;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MeetingController extends Controller
{
    public function index(Wedding $wedding): Response
    {
        $this->authorize('view', $wedding);

        return Inertia::render('meetings/index', ['wedding' => $wedding, 'meetings' => $wedding->meetings()->orderBy('meeting_date')->orderBy('start_time')->paginate(12)]);
    }

    public function show(Wedding $wedding, Meeting $meeting): Response
    {
        abort_unless($meeting->wedding_id === $wedding->id, 404);
        $this->authorize('view', $meeting);

        return Inertia::render('meetings/show', ['wedding' => $wedding, 'meeting' => $meeting]);
    }

    public function store(MeetingRequest $request, Wedding $wedding): RedirectResponse
    {
        $this->authorize('manage', $wedding);
        $wedding->meetings()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Meeting scheduled.']);

        return back();
    }

    public function update(MeetingRequest $request, Wedding $wedding, Meeting $meeting): RedirectResponse
    {
        abort_unless($meeting->wedding_id === $wedding->id, 404);
        $this->authorize('update', $meeting);
        $meeting->update($request->validated());

        return back();
    }

    public function destroy(Wedding $wedding, Meeting $meeting): RedirectResponse
    {
        abort_unless($meeting->wedding_id === $wedding->id, 404);
        $this->authorize('delete', $meeting);
        $meeting->delete();

        return to_route('meetings.index', $wedding);
    }
}
