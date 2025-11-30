<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClinicController extends Controller
{
    /**
     * Get all clinics
     */
    public function index(Request $request)
    {
        $query = Clinic::with(['branches', 'doctors']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $clinics = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $clinics,
        ]);
    }

    /**
     * Get single clinic
     */
    public function show($id)
    {
        $clinic = Clinic::with([
            'branches',
            'doctors',
            'services'
        ])->findOrFail($id);

        // Get staff members
        $staff = \App\Models\User::with('roles')
            ->where('clinic_id', $id)
            ->whereHas('roles', function($q) {
                $q->whereIn('name', ['receptionist', 'nurse', 'pharmacist', 'lab_technician', 'clinic_manager', 'administrator']);
            })
            ->get();

        // Get recent appointments
        $recentAppointments = \App\Models\Appointment::with(['patient', 'staff', 'service'])
            ->where('clinic_id', $id)
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();

        // Get statistics
        $stats = [
            'total_staff' => $staff->count(),
            'total_doctors' => $clinic->doctors()->count(),
            'active_doctors' => $clinic->doctors()->where('is_active', true)->count(),
            'total_services' => $clinic->services()->count(),
            'total_appointments' => \App\Models\Appointment::where('clinic_id', $id)->count(),
            'pending_appointments' => \App\Models\Appointment::where('clinic_id', $id)->where('status', 'pending')->count(),
            'confirmed_appointments' => \App\Models\Appointment::where('clinic_id', $id)->where('status', 'confirmed')->count(),
            'total_patients' => \App\Models\Appointment::where('clinic_id', $id)->distinct('patient_id')->count('patient_id'),
            'branches_count' => $clinic->branches()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'clinic' => $clinic,
                'staff' => $staff,
                'recent_appointments' => $recentAppointments,
                'statistics' => $stats,
            ],
        ]);
    }

    /**
     * Create new clinic
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clinics,email',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
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

        $clinic = Clinic::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Klinik erfolgreich erstellt.',
            'data' => $clinic,
        ], 201);
    }

    /**
     * Update clinic
     */
    public function update(Request $request, $id)
    {
        $clinic = Clinic::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:clinics,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
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

        $clinic->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Klinik erfolgreich aktualisiert.',
            'data' => $clinic->fresh(),
        ]);
    }

    /**
     * Delete clinic
     */
    public function destroy($id)
    {
        $clinic = Clinic::findOrFail($id);

        // Check if clinic has appointments
        if ($clinic->appointments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Diese Klinik hat Termine und kann nicht gelöscht werden.',
            ], 422);
        }

        $clinic->delete();

        return response()->json([
            'success' => true,
            'message' => 'Klinik erfolgreich gelöscht.',
        ]);
    }

    /**
     * Toggle clinic status
     */
    public function toggleStatus($id)
    {
        $clinic = Clinic::findOrFail($id);

        $clinic->is_active = !$clinic->is_active;
        $clinic->save();

        return response()->json([
            'success' => true,
            'message' => 'Status erfolgreich aktualisiert.',
            'data' => $clinic,
        ]);
    }

    /**
     * Get clinic statistics
     */
    public function stats($id)
    {
        $clinic = Clinic::findOrFail($id);

        $stats = [
            'total_doctors' => $clinic->doctors()->count(),
            'active_doctors' => $clinic->doctors()->where('is_active', true)->count(),
            'total_appointments' => $clinic->appointments()->count(),
            'pending_appointments' => $clinic->appointments()->where('status', 'pending')->count(),
            'total_patients' => $clinic->appointments()->distinct('patient_id')->count('patient_id'),
            'branches_count' => $clinic->branches()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
