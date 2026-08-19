<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWeddingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:150'], 'bride_name' => ['required', 'string', 'max:100'], 'groom_name' => ['required', 'string', 'max:100'], 'wedding_date' => ['required', 'date'], 'venue' => ['nullable', 'string', 'max:150'], 'contribution_target' => ['nullable', 'integer', 'min:0'], 'primary_contact_phone' => ['nullable', 'string', 'max:30'], 'description' => ['nullable', 'string', 'max:2000']];
    }
}
