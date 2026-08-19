<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactImportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::post('contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::put('contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::get('contacts/import', [ContactImportController::class, 'create'])->name('contacts.import.create');
    Route::post('contacts/import/preview', [ContactImportController::class, 'preview'])->name('contacts.import.preview');
    Route::post('contacts/import/confirm', [ContactImportController::class, 'confirm'])->name('contacts.import.confirm');
    Route::post('contacts/groups', [ContactController::class, 'storeGroup'])->name('contacts.groups.store');
    Route::put('contacts/groups/{group}', [ContactController::class, 'updateGroup'])->name('contacts.groups.update');
    Route::delete('contacts/groups/{group}', [ContactController::class, 'destroyGroup'])->name('contacts.groups.destroy');

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
