<?php

namespace App\Modules\Patient\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'patient_type',
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'blood_type',
        'blood_group',
        'address',
        'city',
        'country',
        'postal_code',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_history',
        'allergies',
        'chronic_diseases',
        'current_medications',
        'insurance_provider',
        'insurance_number',
        'notes',
        'photo',
        'status',
        // Pet-specific fields
        'species',
        'breed',
        'weight',
        'microchip_number',
        'pet_data',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'medical_history' => 'array',
        'allergies' => 'array',
        'chronic_diseases' => 'array',
        'current_medications' => 'array',
        'pet_data' => 'array',
        'weight' => 'decimal:2',
    ];

    protected $dates = ['deleted_at'];

    // Relationships
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function appointments()
    {
        return $this->hasMany(\App\Modules\Appointment\Models\Appointment::class);
    }

    public function payments()
    {
        return $this->hasMany(\App\Modules\Payment\Models\Payment::class);
    }
}
