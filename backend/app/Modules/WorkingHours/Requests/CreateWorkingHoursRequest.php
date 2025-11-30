<?php

namespace App\Modules\WorkingHours\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateWorkingHoursRequest extends FormRequest
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
            'clinic_id' => 'required|exists:clinics,id',
            'staff_id' => 'nullable|exists:clinic_staff,id',
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'clinic_id.required' => 'Bitte wählen Sie eine Klinik aus.',
            'clinic_id.exists' => 'Die ausgewählte Klinik existiert nicht.',
            'staff_id.exists' => 'Der ausgewählte Mitarbeiter existiert nicht.',
            'day_of_week.required' => 'Bitte wählen Sie einen Wochentag aus.',
            'day_of_week.integer' => 'Der Wochentag muss eine Zahl sein.',
            'day_of_week.min' => 'Ungültiger Wochentag (0-6).',
            'day_of_week.max' => 'Ungültiger Wochentag (0-6).',
            'start_time.required' => 'Bitte geben Sie eine Start-Uhrzeit ein.',
            'start_time.date_format' => 'Bitte geben Sie eine gültige Start-Uhrzeit ein (HH:MM).',
            'end_time.required' => 'Bitte geben Sie eine End-Uhrzeit ein.',
            'end_time.date_format' => 'Bitte geben Sie eine gültige End-Uhrzeit ein (HH:MM).',
            'end_time.after' => 'Die End-Uhrzeit muss nach der Start-Uhrzeit liegen.',
        ];
    }
}
