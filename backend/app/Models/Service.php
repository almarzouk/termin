<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clinic_id',
        'name',
        'description',
        'duration',
        'price',
        'category',
        'color',
        'is_active',
    ];

    protected $casts = [
        'duration' => 'integer',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

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
     * Relationships
     */
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function staff()
    {
        return $this->belongsToMany(ClinicStaff::class, 'service_staff', 'service_id', 'staff_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
