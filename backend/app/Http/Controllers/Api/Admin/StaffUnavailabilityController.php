<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaffUnavailabilityPeriod;
use App\Models\Clinic;
use App\Models\ClinicStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class StaffUnavailabilityController extends Controller
{
    /**
     * Get all active unavailability periods for clinic(s)
     * GET /api/admin/staff-unavailability
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Get user's clinic IDs
            $clinicIds = [];
            if ($user->hasRole('clinic_owner')) {
                $clinicIds = Clinic::where('owner_id', $user->id)->pluck('id')->toArray();
            } elseif ($user->hasRole('super_admin')) {
                $clinicIds = Clinic::pluck('id')->toArray();
            }

            if (empty($clinicIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No clinics found for this user',
                ], 403);
            }

            // Get active and upcoming unavailability periods
            $query = StaffUnavailabilityPeriod::with(['staff.user', 'staff.clinic', 'bulkOperation'])
                ->whereHas('staff', function ($q) use ($clinicIds) {
                    $q->whereIn('clinic_id', $clinicIds);
                })
                ->where('end_date', '>=', now()->format('Y-m-d')); // Only current and future periods

            // Filter by status (active, upcoming, past)
            if ($request->has('status')) {
                $today = now()->format('Y-m-d');

                switch ($request->status) {
                    case 'active':
                        $query->where('start_date', '<=', $today)
                              ->where('end_date', '>=', $today);
                        break;
                    case 'upcoming':
                        $query->where('start_date', '>', $today);
                        break;
                    case 'past':
                        $query->where('end_date', '<', $today);
                        break;
                }
            }

            // Filter by clinic
            if ($request->has('clinic_id')) {
                $query->whereHas('staff', function ($q) use ($request) {
                    $q->where('clinic_id', $request->clinic_id);
                });
            }

            $periods = $query->orderBy('start_date', 'asc')->get();

            // Transform the data
            $transformedPeriods = $periods->map(function ($period) {
                $today = now()->format('Y-m-d');
                $isActive = $period->start_date->format('Y-m-d') <= $today
                         && $period->end_date->format('Y-m-d') >= $today;
                $isUpcoming = $period->start_date->format('Y-m-d') > $today;

                return [
                    'id' => $period->id,
                    'staff_id' => $period->staff_id,
                    'staff_name' => $period->staff->user->name ?? 'Unbekannt',
                    'annual_leave_balance' => $period->staff->annual_leave_balance ?? 30,
                    'clinic_id' => $period->staff->clinic_id,
                    'clinic_name' => $period->staff->clinic->name ?? 'Unbekannt',
                    'start_date' => $period->start_date->format('Y-m-d'),
                    'end_date' => $period->end_date->format('Y-m-d'),
                    'reason' => $period->reason,
                    'reason_label' => $this->getReasonLabel($period->reason),
                    'notes' => $period->notes,
                    'is_active' => $isActive,
                    'is_upcoming' => $isUpcoming,
                    'days_count' => $period->start_date->diffInDays($period->end_date) + 1,
                    'bulk_operation_id' => $period->bulk_operation_id,
                    'created_at' => $period->created_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedPeriods,
                'count' => $transformedPeriods->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch unavailability periods', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abrufen der Abwesenheitsperioden',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unavailability period by ID
     * GET /api/admin/staff-unavailability/{id}
     */
    public function show(Request $request, $id)
    {
        try {
            $period = StaffUnavailabilityPeriod::with(['staff.user', 'staff.clinic', 'bulkOperation'])
                ->findOrFail($id);

            // Check authorization
            $user = $request->user();
            $clinicIds = [];
            if ($user->hasRole('clinic_owner')) {
                $clinicIds = Clinic::where('owner_id', $user->id)->pluck('id')->toArray();
            } elseif ($user->hasRole('super_admin')) {
                $clinicIds = Clinic::pluck('id')->toArray();
            }

            if (!in_array($period->staff->clinic_id, $clinicIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $period->id,
                    'staff_id' => $period->staff_id,
                    'staff_name' => $period->staff->user->name ?? 'Unbekannt',
                    'clinic_id' => $period->staff->clinic_id,
                    'clinic_name' => $period->staff->clinic->name ?? 'Unbekannt',
                    'start_date' => $period->start_date->format('Y-m-d'),
                    'end_date' => $period->end_date->format('Y-m-d'),
                    'reason' => $period->reason,
                    'reason_label' => $this->getReasonLabel($period->reason),
                    'notes' => $period->notes,
                    'bulk_operation_id' => $period->bulk_operation_id,
                    'created_at' => $period->created_at->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Abwesenheitsperiode nicht gefunden',
            ], 404);
        }
    }

    /**
     * Delete unavailability period
     * DELETE /api/admin/staff-unavailability/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $period = StaffUnavailabilityPeriod::findOrFail($id);

            // Check authorization
            $user = $request->user();
            $clinicIds = [];
            if ($user->hasRole('clinic_owner')) {
                $clinicIds = Clinic::where('owner_id', $user->id)->pluck('id')->toArray();
            } elseif ($user->hasRole('super_admin')) {
                $clinicIds = Clinic::pluck('id')->toArray();
            }

            if (!in_array($period->staff->clinic_id, $clinicIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $period->delete();

            Log::info('Unavailability period deleted', [
                'period_id' => $id,
                'staff_id' => $period->staff_id,
                'deleted_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abwesenheitsperiode erfolgreich gelöscht',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Abwesenheitsperiode',
            ], 500);
        }
    }

    /**
     * Get reason label in German
     */
    private function getReasonLabel(string $reason): string
    {
        $labels = [
            'sick_leave' => 'Krankmeldung',
            'vacation' => 'Urlaub',
            'emergency' => 'Notfall',
            'other' => 'Sonstiges',
        ];

        return $labels[$reason] ?? $reason;
    }

    /**
     * Create a new unavailability period
     * POST /api/admin/staff-unavailability
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'staff_id' => 'required|integer|exists:clinic_staff,id',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'reason' => 'required|in:sick_leave,vacation,emergency,other',
                'notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validierungsfehler',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = $request->user();
            $staff = ClinicStaff::findOrFail($request->staff_id);

            // Check authorization
            $clinicIds = [];
            if ($user->hasRole('clinic_owner')) {
                $clinicIds = Clinic::where('owner_id', $user->id)->pluck('id')->toArray();
            } elseif ($user->hasRole('super_admin')) {
                $clinicIds = Clinic::pluck('id')->toArray();
            }

            if (!in_array($staff->clinic_id, $clinicIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Keine Berechtigung für diesen Arzt',
                ], 403);
            }

            // Check for overlapping periods
            $overlapping = StaffUnavailabilityPeriod::where('staff_id', $request->staff_id)
                ->where(function ($query) use ($request) {
                    $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                        ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('start_date', '<=', $request->start_date)
                              ->where('end_date', '>=', $request->end_date);
                        });
                })
                ->first();

            if ($overlapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'Es existiert bereits eine überlappende Abwesenheitsperiode für diesen Zeitraum',
                    'error' => 'OVERLAPPING_PERIOD',
                    'overlapping_period' => [
                        'start_date' => $overlapping->start_date,
                        'end_date' => $overlapping->end_date,
                        'reason' => $this->getReasonLabel($overlapping->reason),
                    ],
                ], 422);
            }

            // Check annual leave balance for vacation requests
            if ($request->reason === 'vacation') {
                $startDate = new \DateTime($request->start_date);
                $endDate = new \DateTime($request->end_date);
                $endDate->modify('+1 day'); // Include end date

                // Calculate weekdays only (exclude weekends)
                $vacationDays = 0;
                $interval = new \DateInterval('P1D');
                $dateRange = new \DatePeriod($startDate, $interval, $endDate);

                foreach ($dateRange as $date) {
                    $dayOfWeek = $date->format('N'); // 1 (Monday) to 7 (Sunday)
                    if ($dayOfWeek < 6) { // Monday to Friday only
                        $vacationDays++;
                    }
                }

                // Check if staff has enough annual leave balance
                if ($staff->annual_leave_balance < $vacationDays) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unzureichender Jahresurlaubssaldo',
                        'error' => 'INSUFFICIENT_LEAVE_BALANCE',
                        'details' => [
                            'requested_days' => $vacationDays,
                            'available_balance' => $staff->annual_leave_balance,
                            'shortage' => $vacationDays - $staff->annual_leave_balance,
                        ],
                    ], 422);
                }
            }

            // Create the unavailability period
            $period = StaffUnavailabilityPeriod::create([
                'staff_id' => $request->staff_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'notes' => $request->notes,
            ]);

            // Deduct annual leave balance only for vacation
            if ($request->reason === 'vacation') {
                $startDate = new \DateTime($request->start_date);
                $endDate = new \DateTime($request->end_date);
                $endDate->modify('+1 day'); // Include end date

                // Calculate weekdays only (exclude weekends)
                $vacationDays = 0;
                $interval = new \DateInterval('P1D');
                $dateRange = new \DatePeriod($startDate, $interval, $endDate);

                foreach ($dateRange as $date) {
                    $dayOfWeek = $date->format('N'); // 1 (Monday) to 7 (Sunday)
                    if ($dayOfWeek < 6) { // Monday to Friday only
                        $vacationDays++;
                    }
                }

                // Update staff annual leave balance
                $staff->decrement('annual_leave_balance', $vacationDays);

                Log::info('Annual leave deducted', [
                    'staff_id' => $staff->id,
                    'days_deducted' => $vacationDays,
                    'remaining_balance' => $staff->fresh()->annual_leave_balance,
                ]);
            }

            Log::info('Unavailability period created', [
                'period_id' => $period->id,
                'staff_id' => $period->staff_id,
                'dates' => $request->start_date . ' to ' . $request->end_date,
                'created_by' => $user->id,
            ]);

            $period->load(['staff.user', 'staff.clinic']);

            return response()->json([
                'success' => true,
                'message' => 'Abwesenheitsperiode erfolgreich erstellt',
                'data' => [
                    'id' => $period->id,
                    'staff_id' => $period->staff_id,
                    'staff_name' => $period->staff->user->name ?? 'Unbekannt',
                    'clinic_id' => $period->staff->clinic_id,
                    'clinic_name' => $period->staff->clinic->name ?? 'Unbekannt',
                    'start_date' => $period->start_date,
                    'end_date' => $period->end_date,
                    'reason' => $period->reason,
                    'reason_label' => $this->getReasonLabel($period->reason),
                    'notes' => $period->notes,
                    'annual_leave_balance' => $staff->fresh()->annual_leave_balance,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create unavailability period', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Abwesenheitsperiode',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

