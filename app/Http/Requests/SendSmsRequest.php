<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendSmsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'recipient_mode' => ['required', Rule::in(['all', 'groups', 'contacts'])],
            'group_ids' => ['exclude_unless:recipient_mode,groups', 'required_if:recipient_mode,groups', 'array', 'min:1'],
            'group_ids.*' => ['integer', 'distinct'],
            'contact_ids' => ['exclude_unless:recipient_mode,contacts', 'required_if:recipient_mode,contacts', 'array', 'min:1'],
            'contact_ids.*' => ['integer', 'distinct'],
            'message' => ['required', 'string', 'max:480'],
        ];
    }
}
