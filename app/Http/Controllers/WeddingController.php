<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWeddingRequest;
use App\Models\Wedding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WeddingController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('weddings/create');
    }

    public function store(StoreWeddingRequest $request): RedirectResponse
    {
        $wedding = DB::transaction(function () use ($request): Wedding {
            $wedding = Wedding::create($request->validated());
            $wedding->memberships()->create(['user_id' => $request->user()->id, 'role' => 'owner']);

            return $wedding;
        });

        $request->session()->put('current_wedding_id', $wedding->id);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Your wedding workspace is ready.']);

        return to_route('weddings.dashboard', $wedding);
    }
}
