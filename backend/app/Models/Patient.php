<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Patient extends Model
{
    use HasFactory, SoftDeletes;
    // use LogsActivity; // Disabled temporarily

    protected $fillable = [
        'user_id',
        'patient_type',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        // 'address', // Not in current schema
        // 'city', // Not in current schema
        // 'country', // Not in current schema
        // 'postal_code', // Not in current schema
        // 'insurance_provider', // Not in current schema
        // 'insurance_number', // Not in current schema
        // 'emergency_contact_name', // Not in current schema
        // 'emergency_contact_phone', // Not in current schema
        'blood_type',
        'allergies',
        'chronic_diseases',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'allergies' => 'array',
        'chronic_conditions' => 'array',
    ];

    /**
     * Activity log options - Disabled temporarily
     */
    /*
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'phone', 'email'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    */

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /* Disabled - table may not exist yet
    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }
    */

    /**
     * Accessors
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Scopes
     */
    public function scopeByType($query, $type)
    {
        return $query->where('patient_type', $type);
    }
}
