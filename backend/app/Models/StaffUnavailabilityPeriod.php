<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffUnavailabilityPeriod extends Model
{
    protected $fillable = [
        'staff_id',
        'start_date',
        'end_date',
        'reason',
        'notes',
        'bulk_operation_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the staff member
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'staff_id');
    }

    /**
     * Get the bulk operation (if created from bulk cancellation)
     */
    public function bulkOperation(): BelongsTo
    {
        return $this->belongsTo(BulkCancellationOperation::class, 'bulk_operation_id');
    }

    /**
     * Check if a given date falls within this unavailability period
     */
    public function includesDate(string $date): bool
    {
        $checkDate = \Carbon\Carbon::parse($date);
        return $checkDate->between($this->start_date, $this->end_date);
    }
}
