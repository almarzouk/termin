<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Appointment extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'clinic_id',
        'branch_id',
        'patient_id',
        'service_id',
        'staff_id',
        'user_id',
        'start_time',
        'end_time',
        'status',
        'customer_notes',
        'staff_notes',
        'cancellation_reason',
        'cancelled_at',
        'confirmed_at',
        'completed_at',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'cancelled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = ['appointment_date'];

    /**
     * Get appointment date from start_time
     */
    public function getAppointmentDateAttribute()
    {
        return $this->start_time ? $this->start_time->format('Y-m-d') : null;
    }

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'start_time', 'end_time'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($appointment) {
            if ($appointment->isDirty('status')) {
                AppointmentHistory::create([
                    'appointment_id' => $appointment->id,
                    'changed_by' => auth()->id(),
                    'action' => $appointment->status,
                    'old_data' => ['status' => $appointment->getOriginal('status')],
                    'new_data' => ['status' => $appointment->status],
                    'reason' => $appointment->cancellation_reason,
                ]);
            }
        });
    }

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

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function staff()
    {
        return $this->belongsTo(ClinicStaff::class, 'staff_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function history()
    {
        return $this->hasMany(AppointmentHistory::class);
    }

    /**
     * Scopes
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>=', now())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('start_time');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('start_time', now()->toDateString());
    }
}
