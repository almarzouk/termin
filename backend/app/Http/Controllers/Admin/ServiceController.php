<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    /**
     * Get all services
     */
    public function index(Request $request)
    {
        $query = Service::with(['clinic']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by clinic
        if ($request->has('clinic_id')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $services = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Get single service
     */
    public function show($id)
    {
        $service = Service::with(['clinic'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }

    /**
     * Create new service
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:service_categories,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        // Convert status to is_active
        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
            unset($validated['status']);
        } else {
            $validated['is_active'] = true;
        }

        $service = Service::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service erfolgreich erstellt.',
            'data' => $service->load('clinic'),
        ], 201);
    }

    /**
     * Update service
     */
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'clinic_id' => 'sometimes|exists:clinics,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration' => 'sometimes|integer|min:1',
            'category_id' => 'nullable|exists:service_categories,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Convert status to is_active
        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
            unset($validated['status']);
        }

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service erfolgreich aktualisiert.',
            'data' => $service->fresh()->load('clinic'),
        ]);
    }

    /**
     * Delete service
     */
    public function destroy($id)
    {
        $service = Service::findOrFail($id);

        // Check if service has appointments
        if ($service->appointments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Dieser Service hat Termine und kann nicht gelöscht werden.',
            ], 422);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service erfolgreich gelöscht.',
        ]);
    }

    /**
     * Toggle service status
     */
    public function toggleStatus($id)
    {
        $service = Service::findOrFail($id);

        $service->is_active = !$service->is_active;
        $service->save();

        return response()->json([
            'success' => true,
            'message' => 'Status erfolgreich aktualisiert.',
            'data' => $service,
        ]);
    }
}
