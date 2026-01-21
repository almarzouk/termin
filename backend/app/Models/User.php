<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'gender',
        'date_of_birth',
        'address',
        'city',
        'country',
        'postal_code',
        'language',
        'is_active',
        'last_login_at',
        'clinic_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    protected $appends = ['status'];

    /**
     * Get status attribute from is_active
     */
    public function getStatusAttribute(): string
    {
        return $this->is_active ? 'active' : 'inactive';
    }

    /**
     * Set status attribute to is_active
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['is_active'] = ($value === 'active' || $value === true || $value === 1);
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Relationships
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function clinicsOwned()
    {
        return $this->hasMany(Clinic::class, 'owner_id');
    }

    /**
     * Get all clinics the user has access to (owned or managed)
     */
    public function clinics()
    {
        if ($this->hasRole('super_admin')) {
            return Clinic::query();
        }

        // For clinic_owner and clinic_manager, return their owned clinics
        return $this->hasMany(Clinic::class, 'owner_id');
    }

    public function clinicStaff()
    {
        return $this->hasMany(ClinicStaff::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}

