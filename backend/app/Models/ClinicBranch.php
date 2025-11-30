<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicBranch extends Model
{
    use HasFactory;
    protected $fillable = [
        'clinic_id',
        'name',
        'address',
        'city',
        'country',
        'postal_code',
        'lat',
        'lng',
        'phone',
        'email',
        'is_main',
        'is_active',
    ];

    protected $casts = [
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'is_main' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function staff()
    {
        return $this->hasMany(ClinicStaff::class, 'branch_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'branch_id');
    }

    public function workingHours()
    {
        return $this->hasMany(WorkingHour::class, 'branch_id');
    }
}
