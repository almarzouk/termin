<?php

namespace App\Modules\MedicalRecord\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMedicalRecordRequest extends FormRequest
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
            'appointment_id' => 'required|exists:appointments,id',
            'patient_id' => 'required|exists:patients,id',
            'diagnosis' => 'required|string',
            'symptoms' => 'nullable|string',
            'treatment_plan' => 'nullable|string',
            'notes' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after:today',
            'prescriptions' => 'nullable|array',
            'prescriptions.*.medication_name' => 'required|string|max:255',
            'prescriptions.*.dosage' => 'required|string|max:255',
            'prescriptions.*.frequency' => 'required|string|max:255',
            'prescriptions.*.duration' => 'required|string|max:255',
            'prescriptions.*.instructions' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'appointment_id.required' => 'Bitte wählen Sie einen Termin aus.',
            'appointment_id.exists' => 'Der ausgewählte Termin existiert nicht.',
            'patient_id.required' => 'Bitte wählen Sie einen Patienten aus.',
            'patient_id.exists' => 'Der ausgewählte Patient existiert nicht.',
            'diagnosis.required' => 'Bitte geben Sie eine Diagnose ein.',
            'follow_up_date.after' => 'Das Folge-Datum muss in der Zukunft liegen.',
            'prescriptions.*.medication_name.required' => 'Der Medikamentenname ist erforderlich.',
            'prescriptions.*.dosage.required' => 'Die Dosierung ist erforderlich.',
            'prescriptions.*.frequency.required' => 'Die Häufigkeit ist erforderlich.',
            'prescriptions.*.duration.required' => 'Die Dauer ist erforderlich.',
        ];
    }
}
