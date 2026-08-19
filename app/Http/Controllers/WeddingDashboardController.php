<?php

namespace App\Http\Controllers;

use App\Models\Wedding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeddingDashboardController extends Controller
{
    public function __invoke(Request $request, Wedding $wedding): Response
    {
        $this->authorize('view', $wedding);
        $nextMeeting = $wedding->meetings()->where('status', 'upcoming')->whereDate('meeting_date', '>=', today())->orderBy('meeting_date')->orderBy('start_time')->first();

        return Inertia::render('weddings/dashboard', [
            'wedding' => $wedding,
            'stats' => ['guests' => $wedding->guests()->count(), 'contributionTarget' => $wedding->contribution_target ?? 0, 'contributionsCollected' => $wedding->contributions()->sum('amount_paid'), 'upcomingMeetings' => $wedding->meetings()->where('status', 'upcoming')->whereDate('meeting_date', '>=', today())->count(), 'smsSent' => $wedding->smsMessages()->where('status', 'sent')->count()],
            'daysUntilWedding' => max(0, today()->diffInDays($wedding->wedding_date, false)),
            'nextMeeting' => $nextMeeting,
        ]);
    }
}
