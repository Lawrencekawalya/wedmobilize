<?php

namespace App\Http\Controllers;

use App\Models\ContactGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ContactImportController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('contacts/import', ['groups' => $request->user()->contactGroups()->orderBy('name')->get(['id', 'name'])]);
    }

    public function preview(Request $request): Response
    {
        $request->validate(['file' => ['required', 'file', 'mimes:csv,xlsx', 'max:5120']]);
        $rows = IOFactory::load($request->file('file')->getRealPath())->getActiveSheet()->toArray(null, true, true, false);
        $headers = array_map(fn ($value) => strtolower(trim((string) $value)), array_shift($rows) ?? []);
        $phoneIndex = array_search('phone', $headers, true);
        $phoneIndex = $phoneIndex === false ? array_search('number', $headers, true) : $phoneIndex;
        $nameIndex = array_search('name', $headers, true);
        $emailIndex = array_search('email', $headers, true);
        $known = $request->user()->contacts()->pluck('id', 'phone')->all();
        $seen = [];
        $preview = [];
        foreach ($rows as $index => $row) {
            $phone = preg_replace('/\D+/', '', (string) ($row[$phoneIndex === false ? -1 : $phoneIndex] ?? ''));
            $status = ! preg_match('/^256\d{9}$/', $phone) ? 'invalid' : (isset($seen[$phone]) ? 'duplicate' : (isset($known[$phone]) ? 'update' : 'new'));
            $seen[$phone] = true;
            $preview[] = ['row' => $index + 2, 'name' => $row[$nameIndex === false ? -1 : $nameIndex] ?? null, 'email' => $row[$emailIndex === false ? -1 : $emailIndex] ?? null, 'phone' => $phone, 'status' => $status];
        }
        $request->session()->put('contact_import_preview', $preview);

        return Inertia::render('contacts/import-preview', ['rows' => $preview, 'groups' => $request->user()->contactGroups()->orderBy('name')->get(['id', 'name'])]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $data = $request->validate(['group_id' => ['nullable', 'integer']]);
        $rows = $request->session()->pull('contact_import_preview', []);
        $group = ContactGroup::where('user_id', $request->user()->id)
            ->whereKey($data['group_id'] ?? 0)
            ->first();
        foreach ($rows as $row) {
            if (! in_array($row['status'], ['new', 'update'], true)) {
                continue;
            } $contact = $request->user()->contacts()->updateOrCreate(['phone' => $row['phone']], ['name' => $row['name'], 'email' => $row['email']]);
            if ($group) {
                $contact->groups()->syncWithoutDetaching([$group->id]);
            }
        }

        return to_route('contacts.index')->with('success', 'Import completed.');
    }
}
