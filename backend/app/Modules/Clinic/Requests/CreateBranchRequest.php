<?php

namespace App\Modules\Clinic\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBranchRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Bitte geben Sie den Namen der Filiale ein.',
            'address.required' => 'Bitte geben Sie die Adresse ein.',
            'city.required' => 'Bitte geben Sie die Stadt ein.',
            'country.required' => 'Bitte geben Sie das Land ein.',
            'postal_code.required' => 'Bitte geben Sie die Postleitzahl ein.',
            'lat.between' => 'Der Breitengrad muss zwischen -90 und 90 liegen.',
            'lng.between' => 'Der Längengrad muss zwischen -180 und 180 liegen.',
            'email.email' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        ];
    }
}
