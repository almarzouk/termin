<?php

namespace App\Modules\WorkingHours\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkingHoursRequest extends FormRequest
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
            'day_of_week' => 'sometimes|integer|min:0|max:6',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'is_available' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'day_of_week.integer' => 'Der Wochentag muss eine Zahl sein.',
            'day_of_week.min' => 'Ungültiger Wochentag (0-6).',
            'day_of_week.max' => 'Ungültiger Wochentag (0-6).',
            'start_time.date_format' => 'Bitte geben Sie eine gültige Start-Uhrzeit ein (HH:MM).',
            'end_time.date_format' => 'Bitte geben Sie eine gültige End-Uhrzeit ein (HH:MM).',
            'end_time.after' => 'Die End-Uhrzeit muss nach der Start-Uhrzeit liegen.',
        ];
    }
}
