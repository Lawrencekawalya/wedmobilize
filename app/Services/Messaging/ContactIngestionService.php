<?php

namespace App\Services\Messaging;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ContactIngestionService
{
    public function __construct(private readonly PhoneNumberService $phoneNumbers) {}

    /** @return Collection<int, Contact> */
    public function fromPasted(User $user, string $input): Collection
    {
        return $this->save($user, preg_split('/[\s,;]+/', $input) ?: []);
    }

    /** @return Collection<int, Contact> */
    public function fromFile(User $user, UploadedFile $file): Collection
    {
        $rows = IOFactory::load($file->getRealPath())->getActiveSheet()->toArray(null, true, true, false);
        $headers = array_map(fn ($value) => strtolower(trim((string) $value)), array_shift($rows) ?? []);
        $phoneIndex = array_search('phone', $headers, true);
        $phoneIndex = $phoneIndex === false ? array_search('number', $headers, true) : $phoneIndex;
        $nameIndex = array_search('name', $headers, true);
        $values = [];

        foreach ($rows as $row) {
            $values[] = [
                'phone' => (string) ($row[$phoneIndex === false ? 0 : $phoneIndex] ?? ''),
                'name' => $nameIndex === false ? null : trim((string) ($row[$nameIndex] ?? '')),
            ];
        }

        return $this->save($user, $values);
    }

    /** @param array<int, string|array{phone: string, name: string|null}> $values
     * @return Collection<int, Contact>
     */
    private function save(User $user, array $values): Collection
    {
        $valid = collect($values)->map(function (string|array $value) {
            $raw = is_array($value) ? $value['phone'] : $value;
            $phone = $this->phoneNumbers->normalize($raw);

            return $phone === null ? null : ['phone' => $phone, 'name' => is_array($value) ? ($value['name'] ?: null) : null];
        })->filter()->unique('phone')->values();

        if ($valid->isEmpty()) {
            throw ValidationException::withMessages(['recipient_mode' => 'No valid Ugandan phone numbers were found.']);
        }

        return $valid->map(function (array $row) use ($user) {
            $contact = $user->contacts()->firstOrCreate(['phone' => $row['phone']], ['name' => $row['name']]);
            if ($contact->name === null && $row['name'] !== null) {
                $contact->update(['name' => $row['name']]);
            }

            return $contact;
        });
    }
}
