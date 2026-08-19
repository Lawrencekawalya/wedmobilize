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
            'recipient_mode' => ['required', Rule::in(['all', 'groups', 'contacts', 'paste', 'file', 'campaign'])],
            'group_ids' => ['exclude_unless:recipient_mode,groups', 'required_if:recipient_mode,groups', 'array', 'min:1'],
            'group_ids.*' => ['integer', 'distinct'],
            'contact_ids' => ['exclude_unless:recipient_mode,contacts', 'required_if:recipient_mode,contacts', 'array', 'min:1'],
            'contact_ids.*' => ['integer', 'distinct'],
            'raw_numbers' => ['required_if:recipient_mode,paste', 'nullable', 'string', 'max:50000'],
            'recipient_file' => ['required_if:recipient_mode,file', 'nullable', 'file', 'mimes:csv,xlsx', 'max:5120'],
            'campaign_id' => ['required_if:recipient_mode,campaign', 'nullable', Rule::exists('message_campaigns', 'id')->where('user_id', $this->user()?->id)],
            'campaign_name' => ['nullable', 'string', 'max:255'],
            'template_id' => ['nullable', Rule::exists('message_templates', 'id')->where('user_id', $this->user()?->id)],
            'message' => ['required', 'string', 'max:640'],
            'send_timing' => ['sometimes', Rule::in(['now', 'later'])],
            'scheduled_at' => ['required_if:send_timing,later', 'nullable', 'date', 'after:now'],
        ];
    }
}
