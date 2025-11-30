<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'min_purchase_amount',
        'max_uses',
        'max_uses_per_user',
        'times_used',
        'valid_from',
        'valid_until',
        'applicable_plans',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'min_purchase_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'applicable_plans' => 'array',
    ];

    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->valid_from && Carbon::now()->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && Carbon::now()->gt($this->valid_until)) {
            return false;
        }

        if ($this->max_uses && $this->times_used >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function canBeUsedBy($userId)
    {
        if (!$this->isValid()) {
            return false;
        }

        $userUsageCount = $this->usages()->where('user_id', $userId)->count();

        if ($userUsageCount >= $this->max_uses_per_user) {
            return false;
        }

        return true;
    }

    public function calculateDiscount($price)
    {
        if ($this->discount_type === 'percentage') {
            $discount = ($price * $this->discount_value) / 100;

            if ($this->max_discount_amount) {
                $discount = min($discount, $this->max_discount_amount);
            }

            return $discount;
        }

        // Fixed discount
        return min($this->discount_value, $price);
    }
}
