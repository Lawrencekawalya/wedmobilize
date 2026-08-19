<?php

namespace App\Http\Controllers;

use App\Models\MessageTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageTemplateController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'body' => ['required', 'string', 'max:640']]);
        $request->user()->messageTemplates()->updateOrCreate(['name' => $data['name']], ['body' => $data['body']]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Message template saved.']);

        return back();
    }

    public function destroy(Request $request, MessageTemplate $template): RedirectResponse
    {
        abort_unless($template->user_id === $request->user()->id, 404);
        $template->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Message template deleted.']);

        return back();
    }
}
