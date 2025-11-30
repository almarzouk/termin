<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members
     */
    public function index(Request $request)
    {
        $query = Staff::with('clinic');

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Clinic filter
        if ($request->has('clinic_id') && $request->clinic_id) {
            $query->where('clinic_id', $request->clinic_id);
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $staff = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Staff members retrieved successfully',
            'data' => $staff
        ]);
    }

    /**
     * Store a newly created staff member
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:receptionist,nurse,clinic_manager,lab_technician,pharmacist,administrator',
            'clinic_id' => 'nullable|exists:clinics,id',
            'employee_id' => 'nullable|string|max:50|unique:staff,employee_id',
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $staff = Staff::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Staff member created successfully',
            'data' => $staff->load('clinic')
        ], 201);
    }

    /**
     * Display the specified staff member
     */
    public function show($id)
    {
        $staff = Staff::with('clinic')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Staff member retrieved successfully',
            'data' => $staff
        ]);
    }

    /**
     * Update the specified staff member
     */
    public function update(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:receptionist,nurse,clinic_manager,lab_technician,pharmacist,administrator',
            'clinic_id' => 'nullable|exists:clinics,id',
            'employee_id' => 'nullable|string|max:50|unique:staff,employee_id,' . $id,
            'department' => 'nullable|string|max:100',
            'hire_date' => 'nullable|date',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $staff->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Staff member updated successfully',
            'data' => $staff->load('clinic')
        ]);
    }

    /**
     * Remove the specified staff member
     */
    public function destroy($id)
    {
        $staff = Staff::findOrFail($id);
        $staff->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff member deleted successfully'
        ]);
    }

    /**
     * Toggle staff member status
     */
    public function toggleStatus($id)
    {
        $staff = Staff::findOrFail($id);
        $staff->status = $staff->status === 'active' ? 'inactive' : 'active';
        $staff->save();

        return response()->json([
            'success' => true,
            'message' => 'Staff status updated successfully',
            'data' => $staff
        ]);
    }

    /**
     * Get staff members by role
     */
    public function getByRole($role)
    {
        $staff = Staff::with('clinic')
            ->where('role', $role)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Staff members retrieved successfully',
            'data' => $staff
        ]);
    }

    /**
     * Get staff members by clinic
     */
    public function getByClinic($clinicId)
    {
        $staff = Staff::with('clinic')
            ->where('clinic_id', $clinicId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Staff members retrieved successfully',
            'data' => $staff
        ]);
    }
}
