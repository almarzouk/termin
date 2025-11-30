<?php

namespace App\Modules\Appointment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
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
            'appointment_date' => 'sometimes|required|date|after_or_equal:today',
            'start_time' => 'sometimes|required|date_format:H:i',
            'staff_id' => 'nullable|exists:clinic_staff,id',
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled,no_show',
            'notes' => 'nullable|string|max:1000',
            'cancellation_reason' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'appointment_date.required' => 'Bitte geben Sie ein Datum ein.',
            'appointment_date.date' => 'Bitte geben Sie ein gültiges Datum ein.',
            'appointment_date.after_or_equal' => 'Das Datum muss heute oder in der Zukunft liegen.',
            'start_time.required' => 'Bitte geben Sie eine Uhrzeit ein.',
            'start_time.date_format' => 'Bitte geben Sie eine gültige Uhrzeit ein (HH:MM).',
            'staff_id.exists' => 'Der ausgewählte Mitarbeiter existiert nicht.',
            'status.in' => 'Der Status ist ungültig.',
        ];
    }
}
