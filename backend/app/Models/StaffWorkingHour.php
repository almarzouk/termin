<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffWorkingHour extends Model
{
    protected $fillable = [
        'staff_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function staff()
    {
        return $this->belongsTo(ClinicStaff::class, 'staff_id');
    }

    /**
     * Scopes
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeForDay($query, $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek);
    }
}
