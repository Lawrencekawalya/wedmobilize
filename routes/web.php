<?php

use App\Http\Controllers\GuestController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\SmsMessageController;
use App\Http\Controllers\WeddingController;
use App\Http\Controllers\WeddingDashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $wedding = request()->user()->weddingMemberships()->with('wedding')->first()?->wedding;

        return $wedding ? to_route('weddings.dashboard', $wedding) : to_route('weddings.create');
    })->name('dashboard');

    Route::get('weddings/create', [WeddingController::class, 'create'])->name('weddings.create');
    Route::post('weddings', [WeddingController::class, 'store'])->name('weddings.store');
    Route::prefix('weddings/{wedding}')->group(function () {
        Route::get('dashboard', WeddingDashboardController::class)->name('weddings.dashboard');
        Route::get('guests', [GuestController::class, 'index'])->name('guests.index');
        Route::post('guests', [GuestController::class, 'store'])->name('guests.store');
        Route::patch('guests/{guest}', [GuestController::class, 'update'])->name('guests.update');
        Route::delete('guests/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');
        Route::get('meetings', [MeetingController::class, 'index'])->name('meetings.index');
        Route::post('meetings', [MeetingController::class, 'store'])->name('meetings.store');
        Route::get('meetings/{meeting}', [MeetingController::class, 'show'])->name('meetings.show');
        Route::patch('meetings/{meeting}', [MeetingController::class, 'update'])->name('meetings.update');
        Route::delete('meetings/{meeting}', [MeetingController::class, 'destroy'])->name('meetings.destroy');
        Route::get('messages', [SmsMessageController::class, 'index'])->name('messages.index');
        Route::post('messages', [SmsMessageController::class, 'store'])->name('messages.store');
    });
});

require __DIR__.'/settings.php';
