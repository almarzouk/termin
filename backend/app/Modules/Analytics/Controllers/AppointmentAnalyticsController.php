<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ClinicStaff;
use App\Modules\Analytics\Requests\GetAnalyticsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AppointmentAnalyticsController extends Controller
{
    /**
     * Get appointment analytics.
     */
    public function index(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $analytics = [
            'total_appointments' => $this->getTotalAppointments($data, $clinicId),
            'status_breakdown' => $this->getStatusBreakdown($data, $clinicId),
            'appointments_by_service' => $this->getAppointmentsByService($data, $clinicId),
            'appointments_by_staff' => $this->getAppointmentsByStaff($data, $clinicId),
            'appointments_by_branch' => $this->getAppointmentsByBranch($data, $clinicId),
            'peak_hours' => $this->getPeakHours($data, $clinicId),
            'busiest_days' => $this->getBusiestDays($data, $clinicId),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get appointment trends.
     */
    public function trends(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);
        $groupBy = $data['group_by'] ?? 'day';

        $trends = $this->getAppointmentTrends($data, $clinicId, $groupBy);

        return response()->json([
            'success' => true,
            'data' => [
                'trends' => $trends,
                'group_by' => $groupBy,
            ],
        ]);
    }

    /**
     * Get appointment performance metrics.
     */
    public function performance(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $metrics = [
            'completion_rate' => $this->getCompletionRate($data, $clinicId),
            'no_show_rate' => $this->getNoShowRate($data, $clinicId),
            'cancellation_rate' => $this->getCancellationRate($data, $clinicId),
            'average_lead_time' => $this->getAverageLeadTime($data, $clinicId),
            'same_day_appointments' => $this->getSameDayAppointments($data, $clinicId),
            'rescheduling_rate' => $this->getReschedulingRate($data, $clinicId),
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics,
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
     * Get total appointments.
     */
    private function getTotalAppointments(array $data, ?int $clinicId): int
    {
        return Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->when(isset($data['branch_id']), fn($q) => $q->where('branch_id', $data['branch_id']))
            ->when(isset($data['service_id']), fn($q) => $q->where('service_id', $data['service_id']))
            ->when(isset($data['staff_id']), fn($q) => $q->where('staff_id', $data['staff_id']))
            ->count();
    }

    /**
     * Get appointment status breakdown.
     */
    private function getStatusBreakdown(array $data, ?int $clinicId): array
    {
        $breakdown = Appointment::select('status', DB::raw('count(*) as count'))
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->when(isset($data['branch_id']), fn($q) => $q->where('branch_id', $data['branch_id']))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($breakdown);

        return [
            'pending' => [
                'count' => $breakdown['pending'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['pending'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'confirmed' => [
                'count' => $breakdown['confirmed'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['confirmed'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'completed' => [
                'count' => $breakdown['completed'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['completed'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'cancelled' => [
                'count' => $breakdown['cancelled'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['cancelled'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'no_show' => [
                'count' => $breakdown['no_show'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['no_show'] ?? 0) / $total) * 100, 2) : 0,
            ],
        ];
    }

    /**
     * Get appointments by service.
     */
    private function getAppointmentsByService(array $data, ?int $clinicId): array
    {
        return Appointment::select('services.name', DB::raw('count(*) as count'))
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($item) => [
                'service' => $item->name,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get appointments by staff.
     */
    private function getAppointmentsByStaff(array $data, ?int $clinicId): array
    {
        return Appointment::select('users.name', DB::raw('count(*) as count'))
            ->join('clinic_staff', 'appointments.staff_id', '=', 'clinic_staff.id')
            ->join('users', 'clinic_staff.user_id', '=', 'users.id')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('clinic_staff.id', 'users.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($item) => [
                'staff' => $item->name,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get appointments by branch.
     */
    private function getAppointmentsByBranch(array $data, ?int $clinicId): array
    {
        return Appointment::select('clinic_branches.name', DB::raw('count(*) as count'))
            ->join('clinic_branches', 'appointments.branch_id', '=', 'clinic_branches.id')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('clinic_branches.id', 'clinic_branches.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn($item) => [
                'branch' => $item->name,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get peak hours.
     */
    private function getPeakHours(array $data, ?int $clinicId): array
    {
        return Appointment::select(DB::raw("CAST(strftime('%H', start_time) AS INTEGER) as hour"), DB::raw('count(*) as count'))
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
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

    /**
     * Get busiest days.
     */
    private function getBusiestDays(array $data, ?int $clinicId): array
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return Appointment::select(DB::raw("CAST(strftime('%w', start_time) AS INTEGER) as day_num"), DB::raw('count(*) as count'))
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('day_num')
            ->orderByDesc('count')
            ->get()
            ->map(fn($item) => [
                'day' => $days[$item->day_num],
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get appointment trends.
     */
    private function getAppointmentTrends(array $data, ?int $clinicId, string $groupBy = 'day'): array
    {
        $dateFormat = match ($groupBy) {
            'year' => '%Y',
            'month' => '%Y-%m',
            'week' => '%Y-%u',
            default => '%Y-%m-%d',
        };

        return Appointment::select(
            DB::raw("DATE_FORMAT(start_time, '{$dateFormat}') as period"),
            DB::raw('count(*) as total')
        )
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($item) => [
                'period' => $item->period,
                'total' => $item->total,
            ])
            ->toArray();
    }

    /**
     * Get completion rate.
     */
    private function getCompletionRate(array $data, ?int $clinicId): float
    {
        $total = $this->getTotalAppointments($data, $clinicId);
        if ($total === 0) return 0;

        $completed = Appointment::where('status', 'completed')
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();

        return round(($completed / $total) * 100, 2);
    }

    /**
     * Get no-show rate.
     */
    private function getNoShowRate(array $data, ?int $clinicId): float
    {
        $total = $this->getTotalAppointments($data, $clinicId);
        if ($total === 0) return 0;

        $noShows = Appointment::where('status', 'no_show')
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();

        return round(($noShows / $total) * 100, 2);
    }

    /**
     * Get cancellation rate.
     */
    private function getCancellationRate(array $data, ?int $clinicId): float
    {
        $total = $this->getTotalAppointments($data, $clinicId);
        if ($total === 0) return 0;

        $cancelled = Appointment::where('status', 'cancelled')
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();

        return round(($cancelled / $total) * 100, 2);
    }

    /**
     * Get average lead time (days between booking and appointment).
     */
    private function getAverageLeadTime(array $data, ?int $clinicId): float
    {
        $avg = Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->get()
            ->map(function ($apt) {
                return \Carbon\Carbon::parse($apt->created_at)
                    ->diffInDays(\Carbon\Carbon::parse($apt->start_time));
            })
            ->average();

        return round($avg ?? 0, 2);
    }

    /**
     * Get same-day appointments count.
     */
    private function getSameDayAppointments(array $data, ?int $clinicId): int
    {
        return Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->whereRaw('DATE(created_at) = DATE(start_time)')
            ->count();
    }

    /**
     * Get rescheduling rate.
     */
    private function getReschedulingRate(array $data, ?int $clinicId): float
    {
        // This would need a rescheduling tracking mechanism
        // For now, returning 0 as placeholder
        return 0;
    }
}
