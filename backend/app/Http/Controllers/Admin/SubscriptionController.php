<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::with(['user', 'plan', 'clinic', 'coupon']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('plan_id')) {
            $query->where('subscription_plan_id', $request->plan_id);
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $subscriptions->items(),
            'pagination' => [
                'total' => $subscriptions->total(),
                'per_page' => $subscriptions->perPage(),
                'current_page' => $subscriptions->currentPage(),
                'last_page' => $subscriptions->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'clinic_id' => 'nullable|exists:clinics,id',
            'coupon_code' => 'nullable|string',
            'auto_renew' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $plan = SubscriptionPlan::findOrFail($request->subscription_plan_id);
            $originalPrice = $plan->price;
            $discountAmount = 0;
            $couponId = null;

            // Apply coupon if provided
            if ($request->coupon_code) {
                $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();

                if (!$coupon || !$coupon->isValid()) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid or expired coupon code'
                    ], 422);
                }

                if (!$coupon->canBeUsedBy($request->user_id)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'You have already used this coupon'
                    ], 422);
                }

                if ($coupon->applicable_plans && !in_array($plan->id, $coupon->applicable_plans)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'This coupon is not applicable to the selected plan'
                    ], 422);
                }

                if ($coupon->min_purchase_amount && $originalPrice < $coupon->min_purchase_amount) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Minimum purchase amount not met'
                    ], 422);
                }

                $discountAmount = $coupon->calculateDiscount($originalPrice);
                $couponId = $coupon->id;
            }

            $finalPrice = $originalPrice - $discountAmount;

            // Calculate subscription period
            $startsAt = now();
            $endsAt = match($plan->billing_period) {
                'monthly' => $startsAt->copy()->addMonth(),
                'yearly' => $startsAt->copy()->addYear(),
                'lifetime' => null,
            };

            $subscription = Subscription::create([
                'user_id' => $request->user_id,
                'subscription_plan_id' => $plan->id,
                'clinic_id' => $request->clinic_id,
                'coupon_id' => $couponId,
                'original_price' => $originalPrice,
                'discount_amount' => $discountAmount,
                'final_price' => $finalPrice,
                'status' => 'active',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'auto_renew' => $request->auto_renew ?? true,
            ]);

            // Record coupon usage
            if ($couponId) {
                CouponUsage::create([
                    'coupon_id' => $couponId,
                    'user_id' => $request->user_id,
                    'subscription_id' => $subscription->id,
                    'discount_amount' => $discountAmount,
                ]);

                // Increment coupon usage count
                $coupon->increment('times_used');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription created successfully',
                'data' => $subscription->load(['user', 'plan', 'coupon'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error creating subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $subscription = Subscription::with(['user', 'plan', 'clinic', 'coupon'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $subscription
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $subscription->cancel($request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully',
            'data' => $subscription
        ]);
    }

    public function renew($id)
    {
        $subscription = Subscription::with('plan')->findOrFail($id);

        if ($subscription->status !== 'active' && $subscription->status !== 'expired') {
            return response()->json([
                'success' => false,
                'message' => 'Only active or expired subscriptions can be renewed'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $plan = $subscription->plan;

            // Calculate new period
            $startsAt = $subscription->ends_at && $subscription->ends_at->isFuture()
                ? $subscription->ends_at
                : now();

            $endsAt = match($plan->billing_period) {
                'monthly' => $startsAt->copy()->addMonth(),
                'yearly' => $startsAt->copy()->addYear(),
                'lifetime' => null,
            };

            // Create new subscription
            $newSubscription = Subscription::create([
                'user_id' => $subscription->user_id,
                'subscription_plan_id' => $subscription->subscription_plan_id,
                'clinic_id' => $subscription->clinic_id,
                'coupon_id' => null,
                'original_price' => $plan->price,
                'discount_amount' => 0,
                'final_price' => $plan->price,
                'status' => 'active',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'auto_renew' => $subscription->auto_renew,
            ]);

            // Update old subscription
            $subscription->update(['auto_renew' => false]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Subscription renewed successfully',
                'data' => $newSubscription->load(['user', 'plan'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error renewing subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    public function stats()
    {
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $expiredSubscriptions = Subscription::where('status', 'expired')->count();
        $cancelledSubscriptions = Subscription::where('status', 'cancelled')->count();
        $totalRevenue = Subscription::where('status', 'active')->sum('final_price');
        $totalDiscounts = Subscription::sum('discount_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'expired_subscriptions' => $expiredSubscriptions,
                'cancelled_subscriptions' => $cancelledSubscriptions,
                'total_revenue' => $totalRevenue,
                'total_discounts' => $totalDiscounts,
            ]
        ]);
    }
}
