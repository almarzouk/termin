<?php

namespace App\Modules\Appointment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
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
            'branch_id' => 'nullable|exists:clinic_branches,id',
            'patient_id' => 'required|exists:patients,id',
            'service_id' => 'required|exists:services,id',
            'staff_id' => 'nullable|exists:clinic_staff,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i:s',
            'notes' => 'nullable|string|max:1000',
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
            'branch_id.exists' => 'Die ausgewählte Filiale existiert nicht.',
            'patient_id.required' => 'Bitte wählen Sie einen Patienten aus.',
            'patient_id.exists' => 'Der ausgewählte Patient existiert nicht.',
            'service_id.required' => 'Bitte wählen Sie eine Dienstleistung aus.',
            'service_id.exists' => 'Die ausgewählte Dienstleistung existiert nicht.',
            'staff_id.exists' => 'Der ausgewählte Mitarbeiter existiert nicht.',
            'appointment_date.required' => 'Bitte geben Sie ein Datum ein.',
            'appointment_date.date' => 'Bitte geben Sie ein gültiges Datum ein.',
            'appointment_date.after_or_equal' => 'Das Datum muss heute oder in der Zukunft liegen.',
            'start_time.required' => 'Bitte geben Sie eine Uhrzeit ein.',
            'start_time.date_format' => 'Bitte geben Sie eine gültige Uhrzeit ein (HH:MM:SS).',
        ];
    }
}
