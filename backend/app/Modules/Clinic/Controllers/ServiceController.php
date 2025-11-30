<?php

namespace App\Modules\Clinic\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Clinic\Requests\CreateServiceRequest;
use App\Modules\Clinic\Requests\UpdateServiceRequest;
use App\Models\Service;
use App\Models\Clinic;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of services
     */
    public function index(Request $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $query = $clinic->services()->with(['staff.user']);

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Sort by price or duration
        if ($request->has('sort_by')) {
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($request->sort_by, $sortOrder);
        } else {
            $query->orderBy('name');
        }

        $services = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Store a newly created service
     */
    public function store(CreateServiceRequest $request, $clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, Dienstleistungen für diese Klinik zu erstellen.',
            ], 403);
        }

        try {
            $service = Service::create([
                'clinic_id' => $clinic->id,
                'name' => $request->name,
                'description' => $request->description,
                'duration' => $request->duration,
                'price' => $request->price,
                'category' => $request->category,
                'color' => $request->color ?? '#3b82f6',
                'is_active' => true,
            ]);

            // Attach staff members if provided
            if ($request->has('staff_ids')) {
                $service->staff()->attach($request->staff_ids);
            }

            return response()->json([
                'success' => true,
                'message' => 'Dienstleistung erfolgreich erstellt.',
                'data' => $service->load('staff.user'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Dienstleistung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified service
     */
    public function show($clinicId, $id)
    {
        $service = Service::with(['clinic', 'staff.user', 'appointments'])
            ->where('clinic_id', $clinicId)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }

    /**
     * Update the specified service
     */
    public function update(UpdateServiceRequest $request, $clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $service = Service::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Dienstleistung zu aktualisieren.',
            ], 403);
        }

        try {
            $service->update($request->except(['staff_ids']));

            // Sync staff members if provided
            if ($request->has('staff_ids')) {
                $service->staff()->sync($request->staff_ids);
            }

            return response()->json([
                'success' => true,
                'message' => 'Dienstleistung erfolgreich aktualisiert.',
                'data' => $service->load('staff.user'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren der Dienstleistung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified service (soft delete)
     */
    public function destroy($clinicId, $id)
    {
        $clinic = Clinic::findOrFail($clinicId);
        $service = Service::where('clinic_id', $clinicId)->findOrFail($id);

        // Check authorization
        if ($clinic->owner_id !== auth()->id() && !auth()->user()->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Dienstleistung zu löschen.',
            ], 403);
        }

        try {
            $service->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dienstleistung erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Dienstleistung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get service categories for a clinic
     */
    public function categories($clinicId)
    {
        $clinic = Clinic::findOrFail($clinicId);

        $categories = $clinic->services()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
