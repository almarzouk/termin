<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentReassignment extends Model
{
    protected $fillable = [
        'bulk_operation_id',
        'appointment_id',
        'original_staff_id',
        'new_staff_id',
        'original_start_time',
        'new_start_time',
        'status',
        'patient_notification_sent',
        'patient_notified_at',
        'patient_response_at',
        'patient_rejection_reason',
        'failure_reason',
    ];

    protected $casts = [
        'original_start_time' => 'datetime',
        'new_start_time' => 'datetime',
        'patient_notified_at' => 'datetime',
        'patient_response_at' => 'datetime',
    ];

    /**
     * Get the bulk operation
     */
    public function bulkOperation(): BelongsTo
    {
        return $this->belongsTo(BulkCancellationOperation::class, 'bulk_operation_id');
    }

    /**
     * Get the appointment
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Get the original staff member
     */
    public function originalStaff(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'original_staff_id');
    }

    /**
     * Get the new staff member
     */
    public function newStaff(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'new_staff_id');
    }

    /**
     * Mark as patient notified
     */
    public function markAsPatientNotified(string $notificationDetails): void
    {
        $this->update([
            'status' => 'patient_notified',
            'patient_notification_sent' => $notificationDetails,
            'patient_notified_at' => now(),
        ]);
    }

    /**
     * Mark as patient approved
     */
    public function markAsPatientApproved(): void
    {
        $this->update([
            'status' => 'patient_approved',
            'patient_response_at' => now(),
        ]);
    }

    /**
     * Mark as patient rejected
     */
    public function markAsPatientRejected(string $reason): void
    {
        $this->update([
            'status' => 'patient_rejected',
            'patient_rejection_reason' => $reason,
            'patient_response_at' => now(),
        ]);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
        ]);
    }
}
