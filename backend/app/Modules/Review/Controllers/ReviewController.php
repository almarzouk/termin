<?php

namespace App\Modules\Review\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Get all reviews with filters
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Review::with(['clinic', 'patient', 'appointment.staff'])
            ->orderBy('created_at', 'desc');

        // Filter by clinic for clinic_owner
        if ($user->hasRole('clinic_owner') && $user->clinic_id) {
            $query->where('clinic_id', $user->clinic_id);
        }

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'approved') {
                $query->approved();
            } elseif ($request->status === 'pending') {
                $query->pending();
            }
        }

        // Filter by clinic_id (for super_admin)
        if ($request->has('clinic_id') && $user->hasRole('super_admin')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $reviews = $query->paginate($request->get('per_page', 15));

        return response()->json($reviews);
    }

    /**
     * Get single review
     */
    public function show($id)
    {
        $user = Auth::user();
        $review = Review::with(['clinic', 'patient', 'appointment.staff'])->findOrFail($id);

        // Check permission
        if ($user->hasRole('clinic_owner') && $review->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($review);
    }

    /**
     * Approve review
     */
    public function approve($id)
    {
        $user = Auth::user();
        $review = Review::findOrFail($id);

        // Check permission
        if ($user->hasRole('clinic_owner') && $review->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->update([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Review approved successfully',
            'review' => $review->load(['clinic', 'patient', 'appointment.staff']),
        ]);
    }

    /**
     * Reject/Unapprove review
     */
    public function reject($id)
    {
        $user = Auth::user();
        $review = Review::findOrFail($id);

        // Check permission
        if ($user->hasRole('clinic_owner') && $review->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->update([
            'is_approved' => false,
            'approved_at' => null,
        ]);

        return response()->json([
            'message' => 'Review rejected successfully',
            'review' => $review->load(['clinic', 'patient', 'appointment.staff']),
        ]);
    }

    /**
     * Delete review
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $review = Review::findOrFail($id);

        // Check permission
        if ($user->hasRole('clinic_owner') && $review->clinic_id !== $user->clinic_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();
        $query = Review::query();

        // Filter by clinic for clinic_owner
        if ($user->hasRole('clinic_owner') && $user->clinic_id) {
            $query->where('clinic_id', $user->clinic_id);
        }

        // Filter by clinic_id (for super_admin)
        if ($request->has('clinic_id') && $user->hasRole('super_admin')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        $stats = [
            'total' => $query->count(),
            'approved' => (clone $query)->approved()->count(),
            'pending' => (clone $query)->pending()->count(),
            'average_rating' => round((clone $query)->approved()->avg('rating') ?? 0, 1),
            'ratings_breakdown' => [
                5 => (clone $query)->approved()->where('rating', 5)->count(),
                4 => (clone $query)->approved()->where('rating', 4)->count(),
                3 => (clone $query)->approved()->where('rating', 3)->count(),
                2 => (clone $query)->approved()->where('rating', 2)->count(),
                1 => (clone $query)->approved()->where('rating', 1)->count(),
            ],
        ];

        return response()->json($stats);
    }
}
