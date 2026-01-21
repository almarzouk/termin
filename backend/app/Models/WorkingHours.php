<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkingHours extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'staff_id',
        'day_of_week',
        'start_time',
        'end_time',
        'break_start',
        'break_end',
        'is_closed',
        'is_available',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'is_available' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function branch()
    {
        return $this->belongsTo(ClinicBranch::class, 'branch_id');
    }

    public function staff()
    {
        return $this->belongsTo(ClinicStaff::class, 'staff_id');
    }
}
