<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicStaff extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clinic_staff';

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'user_id',
        'role',
        'specialization',
        'license_number',
        'bio',
        'hire_date',
        'is_active',
        'invitation_token',
        'invitation_sent_at',
        'invitation_accepted_at',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'is_active' => 'boolean',
        'invitation_sent_at' => 'datetime',
        'invitation_accepted_at' => 'datetime',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'service_staff', 'staff_id', 'service_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'staff_id');
    }

    public function workingHours()
    {
        return $this->hasMany(StaffWorkingHour::class, 'staff_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }
}
