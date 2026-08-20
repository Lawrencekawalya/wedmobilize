<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ContactImportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EgoSmsWebhookController;
use App\Http\Controllers\MessageCenterController;
use App\Http\Controllers\MessageTemplateController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('terms', 'legal/terms')->name('terms');
Route::inertia('privacy', 'legal/privacy')->name('privacy');
Route::inertia('acceptable-use', 'legal/acceptable-use')->name('acceptable-use');
Route::post('webhooks/egosms/delivery/{token}', [EgoSmsWebhookController::class, 'delivery'])
    ->name('webhooks.egosms.delivery');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('contacts/all', [ContactController::class, 'list'])->name('contacts.list');
    Route::post('contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::put('contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::get('contacts/import', [ContactImportController::class, 'create'])->name('contacts.import.create');
    Route::post('contacts/import/preview', [ContactImportController::class, 'preview'])->name('contacts.import.preview');
    Route::post('contacts/import/confirm', [ContactImportController::class, 'confirm'])->name('contacts.import.confirm');
    Route::post('contacts/groups', [ContactController::class, 'storeGroup'])->name('contacts.groups.store');
    Route::put('contacts/groups/{group}', [ContactController::class, 'updateGroup'])->name('contacts.groups.update');
    Route::delete('contacts/groups/{group}', [ContactController::class, 'destroyGroup'])->name('contacts.groups.destroy');

    Route::post('messages/send', [MessageCenterController::class, 'send'])->name('messages.send');
    Route::post('messages/templates', [MessageTemplateController::class, 'store'])->name('messages.templates.store');
    Route::delete('messages/templates/{template}', [MessageTemplateController::class, 'destroy'])->name('messages.templates.destroy');
    Route::get('messages/{section}', [MessageCenterController::class, 'show'])
        ->whereIn('section', ['single-bulk', 'custom', 'scheduled', 'inbox', 'outbox', 'templates'])
        ->name('messages.show');
});

require __DIR__.'/settings.php';
