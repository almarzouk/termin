<?php

namespace App\Modules\Clinic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Clinic\Requests\CreateBranchRequest;
use App\Modules\Clinic\Requests\UpdateBranchRequest;
use App\Models\Clinic;
use App\Models\ClinicBranch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Display a listing of branches for a clinic
     */
    public function index(Request $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $query = $clinic->branches()->with(['staff', 'workingHours']);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search by name or city
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Filter by city
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }

        $branches = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }

    /**
     * Store a newly created branch
     */
    public function store(CreateBranchRequest $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Filialen für diese Klinik zu erstellen.',
            ], 403);
        }

        try {
            $branch = ClinicBranch::create([
                'clinic_id' => $clinic->id,
                'name' => $request->name,
                'address' => $request->address,
                'city' => $request->city,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
                'lat' => $request->lat,
                'lng' => $request->lng,
                'phone' => $request->phone ?? $clinic->phone,
                'email' => $request->email ?? $clinic->email,
                'is_main' => false,
                'is_active' => $request->is_active ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Filiale erfolgreich erstellt.',
                'data' => $branch,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Filiale.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified branch
     */
    public function show($clinicId, $id)
    {
        $branch = ClinicBranch::with(['clinic', 'staff.user', 'workingHours', 'appointments'])
            ->where('clinic_id', $clinicId)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $branch,
        ]);
    }

    /**
     * Update the specified branch
     */
    public function update(UpdateBranchRequest $request, $clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $branch = ClinicBranch::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Filiale zu aktualisieren.',
            ], 403);
        }

        // Prevent changing main branch status
        if ($branch->is_main && $request->has('is_main') && !$request->is_main) {
            return response()->json([
                'success' => false,
                'message' => 'Die Hauptfiliale kann nicht geändert werden.',
            ], 422);
        }

        try {
            $branch->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Filiale erfolgreich aktualisiert.',
                'data' => $branch,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren der Filiale.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified branch
     */
    public function destroy($clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $branch = ClinicBranch::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Filiale zu löschen.',
            ], 403);
        }

        // Prevent deleting main branch
        if ($branch->is_main) {
            return response()->json([
                'success' => false,
                'message' => 'Die Hauptfiliale kann nicht gelöscht werden.',
            ], 422);
        }

        // Check if branch has active appointments
        $hasActiveAppointments = $branch->appointments()
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($hasActiveAppointments) {
            return response()->json([
                'success' => false,
                'message' => 'Diese Filiale hat aktive Termine und kann nicht gelöscht werden.',
            ], 422);
        }

        try {
            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Filiale erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Filiale.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cities where clinic has branches
     */
    public function cities($clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $cities = $clinic->branches()
            ->distinct()
            ->pluck('city');

        return response()->json([
            'success' => true,
            'data' => $cities,
        ]);
    }
}
