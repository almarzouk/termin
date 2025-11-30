<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'clinic_id',
        'coupon_id',
        'original_price',
        'discount_amount',
        'final_price',
        'status',
        'starts_at',
        'ends_at',
        'cancelled_at',
        'cancellation_reason',
        'auto_renew',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_price' => 'decimal:2',
        'auto_renew' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function isActive()
    {
        return $this->status === 'active' &&
               $this->starts_at &&
               $this->starts_at->isPast() &&
               (!$this->ends_at || $this->ends_at->isFuture());
    }

    public function isExpired()
    {
        return $this->status === 'expired' ||
               ($this->ends_at && $this->ends_at->isPast());
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'auto_renew' => false,
        ]);
    }
}
