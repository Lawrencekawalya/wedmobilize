<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:150'], 'phone_number' => ['nullable', 'string', 'max:30'], 'email' => ['nullable', 'email', 'max:150'], 'gender' => ['nullable', 'string', 'max:20'], 'category' => ['required', 'in:family,friend,committee,workmate,vip,other'], 'invitation_status' => ['required', 'in:not_invited,invited'], 'attendance_status' => ['required', 'in:unknown,confirmed,declined,attended'], 'notes' => ['nullable', 'string', 'max:2000']];
    }
}
