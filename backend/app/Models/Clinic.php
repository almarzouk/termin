<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Str;

class Clinic extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'clinic_type',
        'description',
        'email',
        'phone',
        'address',
        'website',
        'logo',
        'specialties',
        'languages',
        'is_active',
        'subscription_id',
        'settings',
    ];

    protected $casts = [
        'specialties' => 'array',
        'languages' => 'array',
        'settings' => 'array',
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
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($clinic) {
            if (!$clinic->slug) {
                $clinic->slug = Str::slug($clinic->name);

                // Ensure unique slug
                $count = static::whereRaw("slug RLIKE '^{$clinic->slug}(-[0-9]+)?$'")->count();
                if ($count > 0) {
                    $clinic->slug = "{$clinic->slug}-{$count}";}
            }
        });
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'clinic_type', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Relationships
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function subscription()
    {
        return $this->belongsTo(ClinicSubscription::class, 'subscription_id');
    }

    public function branches()
    {
        return $this->hasMany(ClinicBranch::class);
    }

    public function staff()
    {
        return $this->hasMany(ClinicStaff::class);
    }

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function workingHours()
    {
        return $this->hasMany(WorkingHour::class);
    }

    public function holidays()
    {
        return $this->hasMany(Holiday::class);
    }
}
