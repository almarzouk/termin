<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Payment;
use App\Models\ClinicStaff;
use App\Modules\Analytics\Requests\GetAnalyticsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StaffPerformanceController extends Controller
{
    /**
     * Get staff performance analytics.
     */
    public function index(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $analytics = [
            'total_staff' => $this->getTotalStaff($clinicId),
            'staff_by_specialization' => $this->getStaffBySpecialization($clinicId),
            'top_performing_staff' => $this->getTopPerformingStaff($data, $clinicId, 10),
            'staff_utilization' => $this->getStaffUtilization($data, $clinicId),
            'staff_ratings' => $this->getStaffRatings($data, $clinicId),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get individual staff performance.
     */
    public function show(GetAnalyticsRequest $request, int $staffId): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        // Verify staff belongs to clinic
        $staff = ClinicStaff::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->findOrFail($staffId);

        $performance = [
            'staff_info' => [
                'id' => $staff->id,
                'name' => $staff->user->name,
                'specialization' => $staff->specialty,
                'is_active' => $staff->is_active,
            ],
            'appointments' => [
                'total' => $this->getStaffAppointments($data, $staffId),
                'completed' => $this->getStaffCompletedAppointments($data, $staffId),
                'cancelled' => $this->getStaffCancelledAppointments($data, $staffId),
                'no_show' => $this->getStaffNoShowAppointments($data, $staffId),
                'completion_rate' => $this->getStaffCompletionRate($data, $staffId),
            ],
            'revenue' => [
                'total' => $this->getStaffRevenue($data, $staffId),
                'average_per_appointment' => $this->getStaffAverageRevenue($data, $staffId),
            ],
            'medical_records' => $this->getStaffMedicalRecords($data, $staffId),
            'working_hours' => $this->getStaffWorkingHours($staffId),
            'peak_hours' => $this->getStaffPeakHours($data, $staffId),
        ];

        return response()->json([
            'success' => true,
            'data' => $performance,
        ]);
    }

    /**
     * Get staff comparison.
     */
    public function comparison(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $staffList = ClinicStaff::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->where('status', 'active')
            ->with('user')
            ->get();

        $comparison = $staffList->map(function ($staff) use ($data) {
            return [
                'id' => $staff->id,
                'name' => $staff->user->name,
                'specialization' => $staff->specialty,
                'total_appointments' => $this->getStaffAppointments($data, $staff->id),
                'completed_appointments' => $this->getStaffCompletedAppointments($data, $staff->id),
                'completion_rate' => $this->getStaffCompletionRate($data, $staff->id),
                'total_revenue' => $this->getStaffRevenue($data, $staff->id),
                'average_revenue' => $this->getStaffAverageRevenue($data, $staff->id),
            ];
        })->sortByDesc('total_revenue')->values();

        return response()->json([
            'success' => true,
            'data' => $comparison,
        ]);
    }

    /**
     * Get clinic ID based on user role.
     */
    private function getClinicIdForUser($user, ?int $requestedClinicId): ?int
    {
        if ($user->hasRole('super_admin')) {
            return $requestedClinicId;
        }

        $staff = ClinicStaff::where('user_id', $user->id)->first();
        return $staff?->clinic_id;
    }

    /**
     * Get total staff count.
     */
    private function getTotalStaff(?int $clinicId): int
    {
        return ClinicStaff::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->where('is_active', true)
            ->count();
    }

    /**
     * Get staff by specialization.
     */
    private function getStaffBySpecialization(?int $clinicId): array
    {
        return ClinicStaff::select('specialty', DB::raw('count(*) as count'))
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->where('is_active', true)
            ->whereNotNull('specialty')
            ->groupBy('specialty')
            ->get()
            ->map(fn($item) => [
                'specialization' => $item->specialty,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get top performing staff by revenue.
     */
    private function getTopPerformingStaff(array $data, ?int $clinicId, int $limit = 10): array
    {
        $staffRevenues = Payment::select(
            'clinic_staff.id',
            'users.name',
            DB::raw('SUM(payments.amount) as total_revenue'),
            DB::raw('COUNT(appointments.id) as appointment_count')
        )
            ->join('appointments', 'payments.appointment_id', '=', 'appointments.id')
            ->join('clinic_staff', 'appointments.staff_id', '=', 'clinic_staff.id')
            ->join('users', 'clinic_staff.user_id', '=', 'users.id')
            ->where('payments.status', 'succeeded')
            ->when($clinicId, fn($q) => $q->where('clinic_staff.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('payments.paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('payments.paid_at', '<=', $data['end_date']))
            ->groupBy('clinic_staff.id', 'users.name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return $staffRevenues->map(fn($item) => [
            'staff_id' => $item->id,
            'name' => $item->name,
            'total_revenue' => round($item->total_revenue, 2),
            'appointment_count' => $item->appointment_count,
            'average_per_appointment' => round($item->total_revenue / $item->appointment_count, 2),
        ])->toArray();
    }

    /**
     * Get staff utilization rate.
     */
    private function getStaffUtilization(array $data, ?int $clinicId): array
    {
        $staffList = ClinicStaff::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->where('is_active', true)
            ->with('user')
            ->get();

        return $staffList->map(function ($staff) use ($data) {
            $totalAppointments = $this->getStaffAppointments($data, $staff->id);

            // Calculate available hours (assuming 8-hour days)
            $days = isset($data['start_date']) && isset($data['end_date'])
                ? \Carbon\Carbon::parse($data['start_date'])->diffInDays($data['end_date']) + 1
                : 30;

            $availableHours = $days * 8;

            // Get actual worked hours (rough estimate based on appointments)
            $workedHours = Appointment::where('staff_id', $staff->id)
                ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
                ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
                ->whereNotNull('start_time')
                ->whereNotNull('end_time')
                ->get()
                ->sum(function ($apt) {
                    $start = \Carbon\Carbon::parse($apt->start_time);
                    $end = \Carbon\Carbon::parse($apt->end_time);
                    return $start->diffInHours($end);
                });

            $utilization = $availableHours > 0 ? ($workedHours / $availableHours) * 100 : 0;

            return [
                'staff_id' => $staff->id,
                'name' => $staff->user->name,
                'utilization_rate' => round($utilization, 2),
                'worked_hours' => $workedHours,
                'available_hours' => $availableHours,
            ];
        })->sortByDesc('utilization_rate')->values()->toArray();
    }

    /**
     * Get staff ratings (placeholder).
     */
    private function getStaffRatings(array $data, ?int $clinicId): array
    {
        // This would need a ratings table
        // For now, returning empty array as placeholder
        return [];
    }

    /**
     * Get staff appointments count.
     */
    private function getStaffAppointments(array $data, int $staffId): int
    {
        return Appointment::where('staff_id', $staffId)
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();
    }

    /**
     * Get staff completed appointments.
     */
    private function getStaffCompletedAppointments(array $data, int $staffId): int
    {
        return Appointment::where('staff_id', $staffId)
            ->where('status', 'completed')
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();
    }

    /**
     * Get staff cancelled appointments.
     */
    private function getStaffCancelledAppointments(array $data, int $staffId): int
    {
        return Appointment::where('staff_id', $staffId)
            ->where('status', 'cancelled')
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();
    }

    /**
     * Get staff no-show appointments.
     */
    private function getStaffNoShowAppointments(array $data, int $staffId): int
    {
        return Appointment::where('staff_id', $staffId)
            ->where('status', 'no_show')
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();
    }

    /**
     * Get staff completion rate.
     */
    private function getStaffCompletionRate(array $data, int $staffId): float
    {
        $total = $this->getStaffAppointments($data, $staffId);
        if ($total === 0) return 0;

        $completed = $this->getStaffCompletedAppointments($data, $staffId);
        return round(($completed / $total) * 100, 2);
    }

    /**
     * Get staff revenue.
     */
    private function getStaffRevenue(array $data, int $staffId): float
    {
        return Payment::whereHas('appointment', fn($q) => $q->where('staff_id', $staffId))
            ->where('status', 'succeeded')
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('paid_at', '<=', $data['end_date']))
            ->sum('amount');
    }

    /**
     * Get staff average revenue per appointment.
     */
    private function getStaffAverageRevenue(array $data, int $staffId): float
    {
        $revenue = $this->getStaffRevenue($data, $staffId);
        $appointments = $this->getStaffAppointments($data, $staffId);

        return $appointments > 0 ? round($revenue / $appointments, 2) : 0;
    }

    /**
     * Get staff medical records count.
     */
    private function getStaffMedicalRecords(array $data, int $staffId): int
    {
        return MedicalRecord::whereHas('appointment', function ($q) use ($staffId, $data) {
            $q->where('staff_id', $staffId)
                ->when(isset($data['start_date']), fn($query) => $query->whereDate('start_time', '>=', $data['start_date']))
                ->when(isset($data['end_date']), fn($query) => $query->whereDate('start_time', '<=', $data['end_date']));
        })->count();
    }

    /**
     * Get staff working hours.
     */
    private function getStaffWorkingHours(int $staffId): array
    {
        $staff = ClinicStaff::with('workingHours')->findOrFail($staffId);

        return $staff->workingHours->map(fn($wh) => [
            'day' => $wh->day_of_week,
            'start_time' => $wh->start_time,
            'end_time' => $wh->end_time,
            'is_available' => $wh->is_available,
        ])->toArray();
    }

    /**
     * Get staff peak hours.
     */
    private function getStaffPeakHours(array $data, int $staffId): array
    {
        return Appointment::select(DB::raw("CAST(strftime('%H', start_time) AS INTEGER) as hour"), DB::raw('count(*) as count'))
            ->where('staff_id', $staffId)
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->whereNotNull('start_time')
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'hour' => sprintf('%02d:00', $item->hour),
                'count' => $item->count,
            ])
            ->toArray();
    }
}
