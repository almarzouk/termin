<?php

namespace App\Modules\Clinic\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration' => 'sometimes|required|integer|min:5|max:480',
            'price' => 'sometimes|required|numeric|min:0|max:99999.99',
            'category' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:7|regex:/^#[a-fA-F0-9]{6}$/',
            'is_active' => 'sometimes|boolean',
            'staff_ids' => 'nullable|array',
            'staff_ids.*' => 'exists:clinic_staff,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Bitte geben Sie den Namen der Dienstleistung ein.',
            'duration.required' => 'Bitte geben Sie die Dauer ein.',
            'duration.min' => 'Die Dauer muss mindestens 5 Minuten betragen.',
            'duration.max' => 'Die Dauer darf maximal 480 Minuten (8 Stunden) betragen.',
            'price.required' => 'Bitte geben Sie den Preis ein.',
            'price.min' => 'Der Preis muss mindestens 0 sein.',
            'price.max' => 'Der Preis darf maximal 99999.99 betragen.',
            'color.regex' => 'Die Farbe muss im Hex-Format sein (z.B. #FF5733).',
            'staff_ids.*.exists' => 'Ein oder mehrere Mitarbeiter existieren nicht.',
        ];
    }
}
