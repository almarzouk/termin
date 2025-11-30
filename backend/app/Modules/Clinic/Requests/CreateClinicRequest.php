<?php

namespace App\Modules\Clinic\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateClinicRequest extends FormRequest
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
            'clinic_type' => 'required|in:human,veterinary',
            'description' => 'nullable|string|max:1000',
            'email' => 'required|email|unique:clinics,email',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048',
            'specialties' => 'nullable|array',
            'specialties.*' => 'string',
            'languages' => 'nullable|array',
            'languages.*' => 'string|in:de,en,ar,tr',

            // Main branch data
            'branch_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'branch_phone' => 'nullable|string|max:20',
            'branch_email' => 'nullable|email|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Bitte geben Sie den Namen der Klinik ein.',
            'clinic_type.required' => 'Bitte wählen Sie den Kliniktyp aus.',
            'clinic_type.in' => 'Der Kliniktyp muss entweder human oder veterinary sein.',
            'email.required' => 'Bitte geben Sie eine E-Mail-Adresse ein.',
            'email.email' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            'email.unique' => 'Diese E-Mail-Adresse wird bereits verwendet.',
            'phone.required' => 'Bitte geben Sie eine Telefonnummer ein.',
            'logo.image' => 'Das Logo muss ein Bild sein.',
            'logo.max' => 'Das Logo darf nicht größer als 2 MB sein.',

            'branch_name.required' => 'Bitte geben Sie den Namen der Filiale ein.',
            'address.required' => 'Bitte geben Sie die Adresse ein.',
            'city.required' => 'Bitte geben Sie die Stadt ein.',
            'country.required' => 'Bitte geben Sie das Land ein.',
            'postal_code.required' => 'Bitte geben Sie die Postleitzahl ein.',
        ];
    }
}
