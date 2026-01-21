<?php

namespace App\Modules\Clinic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Clinic\Requests\CreateClinicRequest;
use App\Modules\Clinic\Requests\UpdateClinicRequest;
use App\Models\Clinic;
use App\Models\ClinicBranch;
use App\Models\ClinicStaff;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ClinicController extends Controller
{
    /**
     * Display a listing of clinics
     */
    public function index(Request $request)
    {
        $query = Clinic::with(['owner', 'subscription.plan', 'branches']);

        // Filter by clinic type
        if ($request->has('clinic_type')) {
            $query->where('clinic_type', $request->clinic_type);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by owner (for clinic owners to see only their clinics)
        if ($request->has('owner_id')) {
            $query->where('owner_id', $request->owner_id);
        }

        $clinics = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $clinics,
        ]);
    }

    /**
     * Store a newly created clinic
     */
    public function store(CreateClinicRequest $request)
    {
        // Check subscription limits
        $limitService = new SubscriptionLimitService();
        $limitCheck = $limitService->canCreateClinic(auth()->user());

        if (!$limitCheck['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $limitCheck['message'],
                'current' => $limitCheck['current'],
                'limit' => $limitCheck['limit'],
            ], 403);
        }

        DB::beginTransaction();

        try {
            // Generate slug from name
            $slug = \Illuminate\Support\Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;
            while (Clinic::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }

            // Create the clinic
            $clinic = Clinic::create([
                'owner_id' => auth()->id(),
                'name' => $request->name,
                'slug' => $slug,
                'clinic_type' => $request->clinic_type,
                'description' => $request->description,
                'email' => $request->email,
                'phone' => $request->phone,
                'website' => $request->website,
                'specialties' => $request->specialties,
                'languages' => $request->languages ?? ['de'],
                'is_active' => true,
            ]);

            // Handle logo upload
            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('clinics/logos', 'public');
                $clinic->update(['logo' => $logoPath]);
            }

            // Create main branch
            $branch = ClinicBranch::create([
                'clinic_id' => $clinic->id,
                'name' => $request->branch_name,
                'address' => $request->address,
                'city' => $request->city,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
                'lat' => $request->lat,
                'lng' => $request->lng,
                'phone' => $request->branch_phone ?? $request->phone,
                'email' => $request->branch_email ?? $request->email,
                'is_main' => true,
                'is_active' => true,
            ]);

            // Assign clinic_owner role to the user
            if (!auth()->user()->hasRole('clinic_owner')) {
                auth()->user()->assignRole('clinic_owner');
            }

            // Create clinic staff record for the owner as clinic manager
            ClinicStaff::create([
                'clinic_id' => $clinic->id,
                'branch_id' => $branch->id,
                'user_id' => auth()->id(),
                'role' => 'manager',
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Klinik erfolgreich erstellt.',
                'data' => $clinic->load(['branches', 'owner']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Klinik.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified clinic
     */
    public function show($id)
    {
        // Try to find by slug first, then by ID
        $clinic = Clinic::where('slug', $id)
            ->orWhere('id', $id)
            ->with([
                'owner',
                'subscription.plan',
                'branches',
                'staff.user',
                'services',
                'reviews' => function ($query) {
                    $query->where('is_approved', true)
                        ->with('patient')
                        ->orderBy('created_at', 'desc')
                        ->limit(10);
                },
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $clinic,
        ]);
    }

    /**
     * Get public clinic profile by slug
     */
    public function publicProfile($slug)
    {
        $clinic = Clinic::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'branches' => function ($query) {
                    $query->where('is_active', true);
                },
                'services' => function ($query) {
                    $query->where('is_active', true);
                },
                'staff' => function ($query) {
                    $query->where('is_active', true)->with('user');
                },
            ])
            ->firstOrFail();

        // Get approved reviews
        $reviews = $clinic->reviews()
            ->where('is_approved', true)
            ->with('patient')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Calculate statistics
        $stats = [
            'total_doctors' => $clinic->staff()->where('role', 'doctor')->where('is_active', true)->count(),
            'total_patients' => DB::table('appointments')
                ->where('clinic_id', $clinic->id)
                ->distinct('patient_id')
                ->count(),
            'total_appointments' => $clinic->appointments()->count(),
            'average_rating' => round($clinic->reviews()->where('is_approved', true)->avg('rating') ?? 0, 1),
            'total_reviews' => $clinic->reviews()->where('is_approved', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'clinic' => $clinic,
                'reviews' => $reviews,
                'statistics' => $stats,
            ],
        ]);
    }

    /**
     * Update the specified clinic
     */
    public function update(UpdateClinicRequest $request, $id)
    {
        $clinic = Clinic::findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Klinik zu aktualisieren.',
            ], 403);
        }

        try {
            $clinic->update($request->except(['logo']));

            // Handle logo upload
            if ($request->hasFile('logo')) {
                // Delete old logo
                if ($clinic->logo) {
                    Storage::disk('public')->delete($clinic->logo);
                }

                $logoPath = $request->file('logo')->store('clinics/logos', 'public');
                $clinic->update(['logo' => $logoPath]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Klinik erfolgreich aktualisiert.',
                'data' => $clinic->load(['branches', 'owner']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren der Klinik.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified clinic
     */
    public function destroy($id)
    {
        $clinic = Clinic::findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Klinik zu löschen.',
            ], 403);
        }

        try {
            // Delete logo
            if ($clinic->logo) {
                Storage::disk('public')->delete($clinic->logo);
            }

            $clinic->delete();

            return response()->json([
                'success' => true,
                'message' => 'Klinik erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Klinik.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get clinic statistics
     */
    public function statistics($id)
    {
        $clinic = Clinic::findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Statistiken anzuzeigen.',
            ], 403);
        }

        $stats = [
            'total_branches' => $clinic->branches()->count(),
            'total_staff' => $clinic->staff()->count(),
            'active_staff' => $clinic->staff()->where('is_active', true)->count(),
            'total_services' => $clinic->services()->count(),
            'active_services' => $clinic->services()->where('is_active', true)->count(),
            'total_appointments' => $clinic->appointments()->count(),
            'upcoming_appointments' => $clinic->appointments()->upcoming()->count(),
            'today_appointments' => $clinic->appointments()->today()->count(),
            'average_rating' => $clinic->reviews()->approved()->avg('rating'),
            'total_reviews' => $clinic->reviews()->approved()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
