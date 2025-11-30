<?php

namespace App\Modules\MedicalRecord\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePrescriptionRequest extends FormRequest
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
            'medical_record_id' => 'required|exists:medical_records,id',
            'medication_name' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'frequency' => 'required|string|max:255',
            'duration' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'medical_record_id.required' => 'Bitte wählen Sie einen medizinischen Datensatz aus.',
            'medical_record_id.exists' => 'Der ausgewählte medizinische Datensatz existiert nicht.',
            'medication_name.required' => 'Der Medikamentenname ist erforderlich.',
            'dosage.required' => 'Die Dosierung ist erforderlich.',
            'frequency.required' => 'Die Häufigkeit ist erforderlich.',
            'duration.required' => 'Die Dauer ist erforderlich.',
            'end_date.after' => 'Das Enddatum muss nach dem Startdatum liegen.',
        ];
    }
}
