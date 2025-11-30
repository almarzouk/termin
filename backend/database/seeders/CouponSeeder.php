<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'description' => '10% off for new customers',
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'max_discount_amount' => 50,
                'min_purchase_amount' => null,
                'max_uses' => 100,
                'max_uses_per_user' => 1,
                'times_used' => 0,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addMonths(3),
                'applicable_plans' => null,
                'is_active' => true,
            ],
            [
                'code' => 'SAVE20',
                'description' => '20% off on all plans',
                'discount_type' => 'percentage',
                'discount_value' => 20,
                'max_discount_amount' => 100,
                'min_purchase_amount' => 50,
                'max_uses' => 50,
                'max_uses_per_user' => 1,
                'times_used' => 0,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addMonth(),
                'applicable_plans' => null,
                'is_active' => true,
            ],
            [
                'code' => 'FIRST25',
                'description' => '$25 off first subscription',
                'discount_type' => 'fixed',
                'discount_value' => 25,
                'max_discount_amount' => null,
                'min_purchase_amount' => 50,
                'max_uses' => null,
                'max_uses_per_user' => 1,
                'times_used' => 0,
                'valid_from' => Carbon::now(),
                'valid_until' => null,
                'applicable_plans' => null,
                'is_active' => true,
            ],
            [
                'code' => 'PREMIUM50',
                'description' => '$50 off Enterprise plan only',
                'discount_type' => 'fixed',
                'discount_value' => 50,
                'max_discount_amount' => null,
                'min_purchase_amount' => 100,
                'max_uses' => 20,
                'max_uses_per_user' => 1,
                'times_used' => 0,
                'valid_from' => Carbon::now(),
                'valid_until' => Carbon::now()->addMonths(2),
                'applicable_plans' => [3], // Enterprise plan only
                'is_active' => true,
            ],
            [
                'code' => 'EXPIRED',
                'description' => 'Expired coupon for testing',
                'discount_type' => 'percentage',
                'discount_value' => 50,
                'max_discount_amount' => null,
                'min_purchase_amount' => null,
                'max_uses' => 10,
                'max_uses_per_user' => 1,
                'times_used' => 0,
                'valid_from' => Carbon::now()->subMonths(2),
                'valid_until' => Carbon::now()->subMonth(),
                'applicable_plans' => null,
                'is_active' => false,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }
    }
}
