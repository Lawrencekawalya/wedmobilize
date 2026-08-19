<?php

use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::post('contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::post('contacts/groups', [ContactController::class, 'storeGroup'])->name('contacts.groups.store');

    Route::inertia('messages/single-bulk', 'message-center/index', [
        'section' => 'single-bulk',
    ])->name('messages.single-bulk');
    Route::inertia('messages/custom', 'message-center/index', [
        'section' => 'custom',
    ])->name('messages.custom');
    Route::inertia('messages/scheduled', 'message-center/index', [
        'section' => 'scheduled',
    ])->name('messages.scheduled');
    Route::inertia('messages/inbox', 'message-center/index', [
        'section' => 'inbox',
    ])->name('messages.inbox');
    Route::inertia('messages/outbox', 'message-center/index', [
        'section' => 'outbox',
    ])->name('messages.outbox');
    Route::inertia('messages/templates', 'message-center/index', [
        'section' => 'templates',
    ])->name('messages.templates');
});

require __DIR__.'/settings.php';
