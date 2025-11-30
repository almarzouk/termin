<?php

namespace App\Modules\Patient\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePatientRequest extends FormRequest
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
            'patient_type' => 'required|in:self,family,pet',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'insurance_provider' => 'nullable|string|max:255',
            'insurance_number' => 'nullable|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|array',
            'allergies.*' => 'string',
            'chronic_conditions' => 'nullable|array',
            'chronic_conditions.*' => 'string',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'patient_type.required' => 'Bitte wählen Sie den Patiententyp aus.',
            'patient_type.in' => 'Der Patiententyp ist ungültig.',
            'first_name.required' => 'Bitte geben Sie den Vornamen ein.',
            'last_name.required' => 'Bitte geben Sie den Nachnamen ein.',
            'date_of_birth.required' => 'Bitte geben Sie das Geburtsdatum ein.',
            'date_of_birth.date' => 'Bitte geben Sie ein gültiges Datum ein.',
            'date_of_birth.before' => 'Das Geburtsdatum muss in der Vergangenheit liegen.',
            'gender.required' => 'Bitte wählen Sie das Geschlecht aus.',
            'gender.in' => 'Das Geschlecht ist ungültig.',
            'email.email' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            'blood_type.in' => 'Die Blutgruppe ist ungültig.',
        ];
    }
}
