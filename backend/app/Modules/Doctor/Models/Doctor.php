<?php

namespace App\Modules\Doctor\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'specialty',
        'qualification',
        'experience_years',
        'consultation_fee',
        'bio',
        'photo',
        'status',
        'clinic_id',
        'branch_id',
    ];

    protected $casts = [
        'experience_years' => 'integer',
        'consultation_fee' => 'decimal:2',
    ];

    // Relationships
    public function appointments()
    {
        return $this->hasMany(\App\Modules\Appointment\Models\Appointment::class);
    }

    public function workingHours()
    {
        return $this->hasMany(\App\Modules\WorkingHours\Models\WorkingHours::class);
    }
}
