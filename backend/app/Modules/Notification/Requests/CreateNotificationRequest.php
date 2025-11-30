<?php

namespace App\Modules\Notification\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateNotificationRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:appointment_reminder,appointment_confirmed,appointment_cancelled,appointment_rescheduled,prescription_reminder,follow_up_reminder,general',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'scheduled_for' => 'nullable|date',
            'data' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Bitte wählen Sie einen Benutzer aus.',
            'user_id.exists' => 'Der ausgewählte Benutzer existiert nicht.',
            'type.required' => 'Der Benachrichtigungstyp ist erforderlich.',
            'type.in' => 'Ungültiger Benachrichtigungstyp.',
            'title.required' => 'Der Titel ist erforderlich.',
            'message.required' => 'Die Nachricht ist erforderlich.',
            'scheduled_for.date' => 'Bitte geben Sie ein gültiges Datum ein.',
        ];
    }
}
