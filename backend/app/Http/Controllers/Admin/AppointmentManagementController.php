<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentManagementController extends Controller
{
    /**
     * Display a listing of appointments (Admin)
     */
    public function index(Request $request)
    {
        // Check if user is authorized (super_admin, clinic_owner, clinic_manager)
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Appointment::with([
            'patient.user',
            'doctor.user',
            'clinic',
            'service'
        ]);

        // Filter by clinic if user is clinic_owner or clinic_manager
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                // Use clinicsOwned relationship
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                // Get clinic from staff relationship
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            // If no clinics found, return empty result
            if ($clinicIds->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Keine Kliniken für diesen Benutzer gefunden',
                    'data' => [],
                    'current_page' => 1,
                    'total' => 0,
                    'per_page' => 15,
                ], 200);
            }

            $query->whereIn('clinic_id', $clinicIds);
        }

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('patient.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('doctor.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhere('appointment_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('start_time', $request->date);
        }

        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        if ($request->filled('doctor_id')) {
            $query->where('staff_id', $request->doctor_id);
        }

        if ($request->filled('clinic_id')) {
            $query->where('clinic_id', $request->clinic_id);
        }

        // Sort by start_time (newest first)
        $query->orderBy('start_time', 'desc');

        $perPage = $request->get('per_page', 15);
        $appointments = $query->paginate($perPage);

        \Log::info('AppointmentManagementController - Appointments Response:', [
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'clinic_ids' => isset($clinicIds) ? $clinicIds->toArray() : 'N/A',
            'total_appointments' => $appointments->total(),
            'current_page' => $appointments->currentPage(),
            'per_page' => $appointments->perPage(),
        ]);

        return response()->json($appointments);
    }

    /**
     * Get appointment statistics
     */
    public function stats(Request $request)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Appointment::query();

        // Filter by clinic if needed
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            if ($clinicIds->isEmpty()) {
                return response()->json([
                    'data' => [
                        'total' => 0,
                        'pending' => 0,
                        'confirmed' => 0,
                        'completed' => 0,
                        'cancelled' => 0,
                        'no_show' => 0,
                        'today' => 0,
                        'this_week' => 0,
                        'completion_rate' => 0,
                        'cancellation_rate' => 0,
                        'no_show_rate' => 0,
                    ]
                ]);
            }
            $query->whereIn('clinic_id', $clinicIds);
        }

        // Optional date filter
        if ($request->filled('start_date')) {
            $query->whereDate('appointment_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('appointment_date', '<=', $request->end_date);
        }

        $total = $query->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $confirmed = (clone $query)->where('status', 'confirmed')->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $noShow = (clone $query)->where('status', 'no_show')->count();

        // Today's appointments
        $today = (clone $query)->whereDate('appointment_date', today())->count();

        // This week's appointments
        $thisWeek = (clone $query)
            ->whereBetween('appointment_date', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'confirmed' => $confirmed,
                'completed' => $completed,
                'cancelled' => $cancelled,
                'no_show' => $noShow,
                'today' => $today,
                'this_week' => $thisWeek,
                'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
                'cancellation_rate' => $total > 0 ? round(($cancelled / $total) * 100, 2) : 0,
                'no_show_rate' => $total > 0 ? round(($noShow / $total) * 100, 2) : 0,
            ]
        ]);
    }

    /**
     * Display the specified appointment
     */
    public function show(Request $request, $id)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointment = Appointment::with([
            'patient.user',
            'doctor.user',
            'clinic',
            'service'
        ])->findOrFail($id);

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($appointment->clinic_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return response()->json(['data' => $appointment]);
    }

    /**
     * Create a new appointment
     */
    public function store(Request $request)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:clinic_staff,id',
            'clinic_id' => 'required|exists:clinics,id',
            'service_id' => 'nullable|exists:services,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($request->clinic_id)) {
                return response()->json(['message' => 'Unauthorized for this clinic'], 403);
            }
        }

        // Combine date and time
        $startTime = $request->appointment_date . ' ' . $request->appointment_time;

        $appointment = Appointment::create([
            'patient_id' => $request->patient_id,
            'staff_id' => $request->doctor_id, // staff_id in database
            'clinic_id' => $request->clinic_id,
            'service_id' => $request->service_id,
            'start_time' => $startTime,
            'end_time' => date('Y-m-d H:i:s', strtotime($startTime . ' +30 minutes')), // Default 30 min
            'status' => 'confirmed', // Admin-created appointments are auto-confirmed
            'customer_notes' => $request->notes,
            'user_id' => $request->patient_id, // Same as patient_id for now
        ]);

        $appointment->load(['patient.user', 'doctor.user', 'clinic', 'service']);

        return response()->json([
            'message' => 'Appointment created successfully',
            'data' => $appointment
        ], 201);
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, $id)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointment = Appointment::findOrFail($id);

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($appointment->clinic_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'appointment_date' => 'sometimes|date|after_or_equal:today',
            'appointment_time' => 'sometimes|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update start_time if date or time changed
        if ($request->filled('appointment_date') || $request->filled('appointment_time')) {
            $date = $request->filled('appointment_date') ? $request->appointment_date : $appointment->start_time->format('Y-m-d');
            $time = $request->filled('appointment_time') ? $request->appointment_time : $appointment->start_time->format('H:i');
            $appointment->start_time = $date . ' ' . $time;
            $appointment->end_time = date('Y-m-d H:i:s', strtotime($appointment->start_time . ' +30 minutes'));
        }

        if ($request->filled('notes')) {
            $appointment->customer_notes = $request->notes;
        }

        $appointment->save();

        $appointment->load(['patient.user', 'doctor.user', 'clinic', 'service']);

        return response()->json([
            'message' => 'Appointment updated successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Delete the specified appointment
     */
    public function destroy(Request $request, $id)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointment = Appointment::findOrFail($id);

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($appointment->clinic_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully'
        ]);
    }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, $id)
    {
        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed,no_show'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = Appointment::findOrFail($id);

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($appointment->clinic_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $appointment->status = $request->status;
        $appointment->save();

        $appointment->load(['patient.user', 'doctor.user', 'clinic', 'service']);

        return response()->json([
            'message' => 'Appointment status updated successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Confirm appointment
     */
    public function confirm(Request $request, $id)
    {
        return $this->updateStatus(
            $request->merge(['status' => 'confirmed']),
            $id
        );
    }

    /**
     * Cancel appointment
     */
    public function cancel(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = Appointment::findOrFail($id);

        // Check authorization
        if (!$request->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check clinic access
        if (!$request->user()->hasRole('super_admin')) {
            $clinicIds = collect();

            if ($request->user()->hasRole('clinic_owner')) {
                $clinicIds = $request->user()->clinicsOwned()->pluck('id');
            } elseif ($request->user()->hasRole('clinic_manager')) {
                $staffRecord = $request->user()->clinicStaff()->first();
                if ($staffRecord) {
                    $clinicIds = collect([$staffRecord->clinic_id]);
                }
            }

            if (!$clinicIds->contains($appointment->clinic_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $appointment->status = 'cancelled';
        if ($request->filled('reason')) {
            $appointment->cancellation_reason = $request->reason;
        }
        $appointment->save();

        $appointment->load(['patient.user', 'doctor.user', 'clinic', 'service']);

        return response()->json([
            'message' => 'Appointment cancelled successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Complete appointment
     */
    public function complete(Request $request, $id)
    {
        return $this->updateStatus(
            $request->merge(['status' => 'completed']),
            $id
        );
    }
}
