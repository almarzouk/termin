<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CancellationPolicy extends Model
{
    protected $fillable = [
        'clinic_id',
        'minimum_notice_hours',
        'late_cancellation_fee',
        'max_cancellations_per_month',
        'auto_block_after_cancellations',
        'allow_patient_cancellation',
        'require_reason',
        'cancellation_reasons',
        'is_active',
    ];

    protected $casts = [
        'late_cancellation_fee' => 'decimal:2',
        'allow_patient_cancellation' => 'boolean',
        'require_reason' => 'boolean',
        'is_active' => 'boolean',
        'cancellation_reasons' => 'array',
    ];

    /**
     * Relationships
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Check if cancellation is allowed at the given time
     */
    public function canCancelAt($appointmentDateTime)
    {
        if (!$this->allow_patient_cancellation) {
            return [
                'allowed' => false,
                'reason' => 'Patient cancellation is not allowed.',
            ];
        }

        $hoursUntilAppointment = now()->diffInHours($appointmentDateTime, false);

        if ($hoursUntilAppointment < $this->minimum_notice_hours) {
            return [
                'allowed' => false,
                'reason' => "Cancellation must be made at least {$this->minimum_notice_hours} hours before the appointment.",
                'is_late' => true,
                'fee' => $this->late_cancellation_fee,
            ];
        }

        return [
            'allowed' => true,
            'is_late' => false,
        ];
    }
}
