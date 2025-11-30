<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $query = Coupon::query()->with('usages');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('discount_type')) {
            $query->where('discount_type', $request->discount_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)
                      ->where(function ($q) {
                          $q->whereNull('valid_until')
                            ->orWhere('valid_until', '>', now());
                      });
            } elseif ($request->status === 'expired') {
                $query->where('valid_until', '<', now());
            }
        }

        $coupons = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $coupons->items(),
            'pagination' => [
                'total' => $coupons->total(),
                'per_page' => $coupons->perPage(),
                'current_page' => $coupons->currentPage(),
                'last_page' => $coupons->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:coupons,code',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'required|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'applicable_plans' => 'nullable|array',
            'applicable_plans.*' => 'exists:subscription_plans,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['code'] = strtoupper($data['code']);

        $coupon = Coupon::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Coupon created successfully',
            'data' => $coupon
        ], 201);
    }

    public function show($id)
    {
        $coupon = Coupon::with(['usages.user', 'usages.subscription'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:coupons,code,' . $id,
            'description' => 'nullable|string',
            'discount_type' => 'sometimes|required|in:percentage,fixed',
            'discount_value' => 'sometimes|required|numeric|min:0',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'sometimes|required|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
            'applicable_plans' => 'nullable|array',
            'applicable_plans.*' => 'exists:subscription_plans,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Coupon updated successfully',
            'data' => $coupon
        ]);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully'
        ]);
    }

    public function toggleStatus($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update(['is_active' => !$coupon->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Coupon status updated successfully',
            'data' => $coupon
        ]);
    }

    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'plan_id' => 'required|exists:subscription_plans,id',
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 404);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon is not valid or has expired'
            ], 422);
        }

        if (!$coupon->canBeUsedBy($request->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'You have already used this coupon'
            ], 422);
        }

        if ($coupon->applicable_plans && !in_array($request->plan_id, $coupon->applicable_plans)) {
            return response()->json([
                'success' => false,
                'message' => 'This coupon is not applicable to the selected plan'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Coupon is valid',
            'data' => $coupon
        ]);
    }

    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'count' => 'required|integer|min:1|max:100',
            'prefix' => 'nullable|string|max:10',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses_per_user' => 'required|integer|min:1',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after:valid_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupons = [];
        $prefix = strtoupper($request->prefix ?? '');

        for ($i = 0; $i < $request->count; $i++) {
            $code = $prefix . Str::random(8);

            $coupons[] = Coupon::create([
                'code' => strtoupper($code),
                'description' => 'Auto-generated coupon',
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'max_uses_per_user' => $request->max_uses_per_user,
                'valid_from' => $request->valid_from,
                'valid_until' => $request->valid_until,
                'is_active' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "{$request->count} coupons generated successfully",
            'data' => $coupons
        ], 201);
    }

    public function stats()
    {
        $totalCoupons = Coupon::count();
        $activeCoupons = Coupon::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>', now());
            })->count();
        $expiredCoupons = Coupon::where('valid_until', '<', now())->count();
        $totalUsages = CouponUsage::count();
        $totalDiscountGiven = CouponUsage::sum('discount_amount');

        return response()->json([
            'success' => true,
            'data' => [
                'total_coupons' => $totalCoupons,
                'active_coupons' => $activeCoupons,
                'expired_coupons' => $expiredCoupons,
                'total_usages' => $totalUsages,
                'total_discount_given' => $totalDiscountGiven,
            ]
        ]);
    }
}
