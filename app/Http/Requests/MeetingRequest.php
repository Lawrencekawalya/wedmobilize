<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['title' => ['required', 'string', 'max:150'], 'meeting_date' => ['required', 'date'], 'start_time' => ['required', 'date_format:H:i'], 'venue' => ['nullable', 'string', 'max:150'], 'agenda' => ['nullable', 'string', 'max:4000'], 'notes' => ['nullable', 'string', 'max:4000'], 'status' => ['required', 'in:upcoming,completed,cancelled']];
    }
}
