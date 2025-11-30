<?php

namespace App\Modules\Analytics\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAnalyticsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager']);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date', 'before_or_equal:end_date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'clinic_id' => ['nullable', 'integer', 'exists:clinics,id'],
            'branch_id' => ['nullable', 'integer', 'exists:clinic_branches,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'staff_id' => ['nullable', 'integer', 'exists:staff,id'],
            'period' => ['nullable', 'string', 'in:today,week,month,quarter,year,custom'],
            'group_by' => ['nullable', 'string', 'in:day,week,month,year'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'start_date.date' => 'Das Startdatum muss ein gültiges Datum sein.',
            'start_date.before_or_equal' => 'Das Startdatum muss vor oder gleich dem Enddatum sein.',
            'end_date.date' => 'Das Enddatum muss ein gültiges Datum sein.',
            'end_date.after_or_equal' => 'Das Enddatum muss nach oder gleich dem Startdatum sein.',
            'clinic_id.exists' => 'Die ausgewählte Klinik existiert nicht.',
            'branch_id.exists' => 'Die ausgewählte Filiale existiert nicht.',
            'service_id.exists' => 'Die ausgewählte Dienstleistung existiert nicht.',
            'staff_id.exists' => 'Der ausgewählte Mitarbeiter existiert nicht.',
            'period.in' => 'Ungültiger Zeitraum ausgewählt.',
            'group_by.in' => 'Ungültige Gruppierung ausgewählt.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default period to current month if not provided
        if (!$this->has('period') && !$this->has('start_date')) {
            $this->merge(['period' => 'month']);
        }

        // Calculate dates based on period
        if ($this->has('period') && $this->period !== 'custom') {
            $dates = $this->calculatePeriodDates($this->period);
            $this->merge($dates);
        }
    }

    /**
     * Calculate start and end dates based on period.
     */
    private function calculatePeriodDates(string $period): array
    {
        $now = now();

        return match ($period) {
            'today' => [
                'start_date' => $now->startOfDay()->toDateString(),
                'end_date' => $now->endOfDay()->toDateString(),
            ],
            'week' => [
                'start_date' => $now->startOfWeek()->toDateString(),
                'end_date' => $now->endOfWeek()->toDateString(),
            ],
            'month' => [
                'start_date' => $now->startOfMonth()->toDateString(),
                'end_date' => $now->endOfMonth()->toDateString(),
            ],
            'quarter' => [
                'start_date' => $now->startOfQuarter()->toDateString(),
                'end_date' => $now->endOfQuarter()->toDateString(),
            ],
            'year' => [
                'start_date' => $now->startOfYear()->toDateString(),
                'end_date' => $now->endOfYear()->toDateString(),
            ],
            default => [
                'start_date' => $now->startOfMonth()->toDateString(),
                'end_date' => $now->endOfMonth()->toDateString(),
            ],
        };
    }
}
