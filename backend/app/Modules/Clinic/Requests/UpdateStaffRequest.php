<?php

namespace App\Modules\Clinic\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStaffRequest extends FormRequest
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
            'role' => 'sometimes|required|in:clinic_manager,doctor,nurse,receptionist',
            'branch_id' => 'sometimes|required|exists:clinic_branches,id',
            'specialization' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'hire_date' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
            'annual_leave_balance' => 'nullable|integer|min:0|max:365',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'role.required' => 'Bitte wählen Sie eine Rolle aus.',
            'role.in' => 'Die Rolle ist ungültig.',
            'branch_id.required' => 'Bitte wählen Sie eine Filiale aus.',
            'branch_id.exists' => 'Die ausgewählte Filiale existiert nicht.',
            'hire_date.date' => 'Bitte geben Sie ein gültiges Datum ein.',
        ];
    }
}
