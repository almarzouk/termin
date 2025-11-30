<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class MedicalRecord extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'diagnosis',
        'symptoms',
        'treatment',
        'prescriptions',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'symptoms' => 'array',
        'prescriptions' => 'array',
    ];

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('public');

        $this->addMediaCollection('images')
            ->useDisk('public');
    }

    /**
     * Relationships
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
