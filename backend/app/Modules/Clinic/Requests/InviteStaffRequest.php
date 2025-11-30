<?php

namespace App\Modules\Clinic\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'role' => 'required|in:clinic_manager,doctor,nurse,receptionist',
            'branch_id' => 'required|exists:clinic_branches,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'hire_date' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Bitte geben Sie eine E-Mail-Adresse ein.',
            'email.email' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            'email.unique' => 'Diese E-Mail-Adresse wird bereits verwendet.',
            'name.required' => 'Bitte geben Sie den Namen ein.',
            'role.required' => 'Bitte wählen Sie eine Rolle aus.',
            'role.in' => 'Die Rolle ist ungültig.',
            'branch_id.required' => 'Bitte wählen Sie eine Filiale aus.',
            'branch_id.exists' => 'Die ausgewählte Filiale existiert nicht.',
            'hire_date.date' => 'Bitte geben Sie ein gültiges Datum ein.',
        ];
    }
}
