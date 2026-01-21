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
        // Recurring appointment fields
        'is_recurring',
        'recurring_parent_id',
        'recurring_pattern',
        'recurring_interval',
        'recurring_days',
        'recurring_day_of_month',
        'recurring_end_date',
        'recurring_count',
        'occurrence_number',
        // Cancellation fee fields
        'cancellation_fee',
        'is_late_cancellation',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'cancelled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        // Recurring fields
        'is_recurring' => 'boolean',
        'recurring_days' => 'array',
        'recurring_end_date' => 'date',
        // Cancellation fee fields
        'cancellation_fee' => 'decimal:2',
        'is_late_cancellation' => 'boolean',
    ];

    protected $appends = ['appointment_date', 'appointment_time', 'appointment_number', 'patient_name', 'patient_phone', 'doctor_name', 'clinic_name', 'service_name'];

    /**
     * Get appointment date from start_time
     */
    public function getAppointmentDateAttribute()
    {
        return $this->start_time ? $this->start_time->format('Y-m-d') : null;
    }

    /**
     * Get appointment time from start_time
     */
    public function getAppointmentTimeAttribute()
    {
        return $this->start_time ? $this->start_time->format('H:i') : null;
    }

    /**
     * Get appointment number (generate if not exists)
     */
    public function getAppointmentNumberAttribute()
    {
        return 'APT-' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get patient name
     */
    public function getPatientNameAttribute()
    {
        return $this->patient && $this->patient->user ? $this->patient->user->name : 'N/A';
    }

    /**
     * Get patient phone
     */
    public function getPatientPhoneAttribute()
    {
        return $this->patient ? $this->patient->phone : 'N/A';
    }

    /**
     * Get doctor name
     */
    public function getDoctorNameAttribute()
    {
        return $this->doctor && $this->doctor->user ? $this->doctor->user->name : 'N/A';
    }

    /**
     * Get clinic name
     */
    public function getClinicNameAttribute()
    {
        return $this->clinic ? $this->clinic->name : 'N/A';
    }

    /**
     * Get service name
     */
    public function getServiceNameAttribute()
    {
        return $this->service ? $this->service->name : null;
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

    /**
     * Alias for staff (doctor)
     */
    public function doctor()
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

    public function reminders()
    {
        return $this->hasMany(AppointmentReminder::class);
    }

    public function recurringParent()
    {
        return $this->belongsTo(Appointment::class, 'recurring_parent_id');
    }

    public function recurringChildren()
    {
        return $this->hasMany(Appointment::class, 'recurring_parent_id')
            ->orderBy('start_time');
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

    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    public function scopeParentOnly($query)
    {
        return $query->whereNull('recurring_parent_id');
    }

    /**
     * Helper methods
     */
    public function isRecurring()
    {
        return $this->is_recurring === true;
    }

    public function isRecurringChild()
    {
        return $this->recurring_parent_id !== null;
    }

    public function canBeCancelled()
    {
        // Get clinic's cancellation policy
        $policy = CancellationPolicy::where('clinic_id', $this->clinic_id)
            ->where('is_active', true)
            ->first();

        if (!$policy) {
            return [
                'allowed' => true,
                'is_late' => false,
            ];
        }

        return $policy->canCancelAt($this->start_time);
    }

    public function calculateCancellationFee()
    {
        $cancellationCheck = $this->canBeCancelled();

        if (!$cancellationCheck['allowed'] && isset($cancellationCheck['is_late']) && $cancellationCheck['is_late']) {
            return $cancellationCheck['fee'] ?? 0;
        }

        return 0;
    }

}
