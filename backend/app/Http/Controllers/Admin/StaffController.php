<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    /**
     * Get all staff members
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Use ClinicStaff model instead of User
        $query = \App\Models\ClinicStaff::with(['user', 'clinic']);

        // Filter by clinic for clinic_owner
        if (!$user->hasRole('super_admin')) {
            $clinicIds = $user->clinicsOwned()->pluck('id');

            \Log::info('StaffController - Filtering for clinic_owner:', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'clinic_ids' => $clinicIds->toArray(),
            ]);

            if ($clinicIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'data' => [],
                        'current_page' => 1,
                        'total' => 0,
                    ],
                ]);
            }
            $query->whereIn('clinic_id', $clinicIds);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by clinic_id (if provided)
        if ($request->has('clinic_id')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        $staff = $query->paginate($request->per_page ?? 15);

        \Log::info('StaffController - Staff returned:', [
            'total' => $staff->total(),
            'count' => $staff->count(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Get single staff member
     */
    public function show($id)
    {
        $staff = User::with(['roles', 'clinic'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $staff,
        ]);
    }

    /**
     * Create new staff member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'clinic_id' => 'required|exists:clinics,id',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'clinic_id' => $validated['clinic_id'],
            'gender' => $validated['gender'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'is_active' => true,
        ]);

        // Assign role
        $user->assignRole($validated['role']);

        return response()->json([
            'success' => true,
            'message' => 'Mitarbeiter erfolgreich erstellt.',
            'data' => $user->load('roles'),
        ], 201);
    }

    /**
     * Update staff member
     */
    public function update(Request $request, $id)
    {
        \Log::info('StaffController@update called', [
            'id' => $id,
            'request_data' => $request->all(),
        ]);

        // Try to find in ClinicStaff table first
        $staff = \App\Models\ClinicStaff::find($id);

        if ($staff) {
            \Log::info('Found ClinicStaff record', ['staff_id' => $staff->id]);

            // Update ClinicStaff record
            $validated = $request->validate([
                'role' => 'sometimes|string|in:doctor,nurse,receptionist,clinic_manager',
                'specialty' => 'nullable|string|max:255',
                'license_number' => 'nullable|string|max:100',
                'bio' => 'nullable|string',
                'annual_leave_balance' => 'nullable|integer|min:0|max:365',
                'is_active' => 'sometimes|boolean',
            ]);

            \Log::info('Validated data', ['validated' => $validated]);

            $staff->update($validated);

            \Log::info('Updated ClinicStaff', [
                'new_balance' => $staff->fresh()->annual_leave_balance
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mitarbeiter erfolgreich aktualisiert.',
                'data' => $staff->fresh()->load(['user', 'clinic']),
            ]);
        }

        \Log::info('ClinicStaff not found, trying User table');

        // Fallback to User table
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|string|exists:roles,name',
            'clinic_id' => 'sometimes|exists:clinics,id',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Update password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Update role if provided
        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
            unset($validated['role']);
        }

        // Convert status to is_active
        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
            unset($validated['status']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Mitarbeiter erfolgreich aktualisiert.',
            'data' => $user->fresh()->load('roles'),
        ]);
    }

    /**
     * Delete staff member
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting super admin
        if ($user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin kann nicht gelöscht werden.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mitarbeiter erfolgreich gelöscht.',
        ]);
    }

    /**
     * Get working hours for a staff member
     */
    public function getWorkingHours($id)
    {
        $workingHours = \App\Models\StaffWorkingHours::where('staff_id', $id)->get();

        return response()->json([
            'success' => true,
            'data' => $workingHours,
        ]);
    }

    /**
     * Toggle staff status
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        // Prevent disabling super admin
        if ($user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin Status kann nicht geändert werden.',
            ], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Status erfolgreich aktualisiert.',
            'data' => $user,
        ]);
    }
}
