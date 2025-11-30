<?php

namespace App\Modules\MedicalRecord\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePrescriptionRequest extends FormRequest
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
            'medication_name' => 'sometimes|string|max:255',
            'dosage' => 'sometimes|string|max:255',
            'frequency' => 'sometimes|string|max:255',
            'duration' => 'sometimes|string|max:255',
            'instructions' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'status' => 'sometimes|in:active,completed,discontinued',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'end_date.after' => 'Das Enddatum muss nach dem Startdatum liegen.',
            'status.in' => 'Ungültiger Status. Erlaubte Werte: active, completed, discontinued.',
        ];
    }
}
