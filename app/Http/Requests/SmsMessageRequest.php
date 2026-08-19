<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SmsMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['recipients' => ['required', 'array', 'min:1', 'max:100'], 'recipients.*.phone_number' => ['required', 'string', 'max:30'], 'recipients.*.name' => ['nullable', 'string', 'max:150'], 'message' => ['required', 'string', 'max:918'], 'message_type' => ['required', 'in:meeting_invitation,meeting_reminder,wedding_invitation,contribution_acknowledgement,announcement']];
    }
}
