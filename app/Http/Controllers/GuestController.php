<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuestRequest;
use App\Models\Guest;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    public function index(Request $request, Wedding $wedding): Response
    {
        $this->authorize('view', $wedding);
        $query = $wedding->guests()->orderBy('name');
        if ($search = $request->string('search')->trim()->value()) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('phone_number', 'like', "%{$search}%"));
        }
        foreach (['category', 'invitation_status', 'attendance_status'] as $filter) {
            if ($value = $request->string($filter)->value()) {
                $query->where($filter, $value);
            }
        }

        return Inertia::render('guests/index', ['wedding' => $wedding, 'guests' => $query->paginate(12)->withQueryString(), 'filters' => $request->only(['search', 'category', 'invitation_status', 'attendance_status'])]);
    }

    public function store(GuestRequest $request, Wedding $wedding): RedirectResponse
    {
        $this->authorize('manage', $wedding);
        $wedding->guests()->create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Guest added.']);

        return back();
    }

    public function update(GuestRequest $request, Wedding $wedding, Guest $guest): RedirectResponse
    {
        abort_unless($guest->wedding_id === $wedding->id, 404);
        $this->authorize('update', $guest);
        $guest->update($request->validated());

        return back();
    }

    public function destroy(Wedding $wedding, Guest $guest): RedirectResponse
    {
        abort_unless($guest->wedding_id === $wedding->id, 404);
        $this->authorize('delete', $guest);
        $guest->delete();

        return back();
    }
}
