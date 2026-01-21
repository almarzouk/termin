<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BulkCancellationOperation extends Model
{
    protected $fillable = [
        'clinic_id',
        'staff_id',
        'initiated_by',
        'start_date',
        'end_date',
        'reason',
        'reason_details',
        'status',
        'total_appointments',
        'cancelled_appointments',
        'reassigned_appointments',
        'failed_reassignments',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the clinic that owns the operation
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the staff member affected by this operation
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'staff_id');
    }

    /**
     * Get the user who initiated this operation
     */
    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    /**
     * Get all reassignments for this operation
     */
    public function reassignments(): HasMany
    {
        return $this->hasMany(AppointmentReassignment::class, 'bulk_operation_id');
    }

    /**
     * Get success rate percentage
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_appointments === 0) {
            return 0;
        }
        return round(($this->reassigned_appointments / $this->total_appointments) * 100, 2);
    }

    /**
     * Check if operation is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Mark operation as in progress
     */
    public function markAsInProgress(): void
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark operation as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
