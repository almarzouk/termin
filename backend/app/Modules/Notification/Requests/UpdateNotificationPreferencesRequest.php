<?php

namespace App\Modules\Notification\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
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
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'appointment_reminders' => 'sometimes|boolean',
            'appointment_confirmations' => 'sometimes|boolean',
            'prescription_reminders' => 'sometimes|boolean',
            'follow_up_reminders' => 'sometimes|boolean',
            'marketing_emails' => 'sometimes|boolean',
            'reminder_hours_before' => 'sometimes|integer|min:1|max:72',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reminder_hours_before.min' => 'Die Erinnerungszeit muss mindestens 1 Stunde betragen.',
            'reminder_hours_before.max' => 'Die Erinnerungszeit darf maximal 72 Stunden betragen.',
        ];
    }
}
