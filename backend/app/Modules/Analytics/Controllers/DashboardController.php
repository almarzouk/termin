<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\ClinicStaff;
use App\Modules\Analytics\Requests\GetAnalyticsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics overview.
     */
    public function overview(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        // Apply clinic filter based on user role
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $stats = [
            'total_appointments' => $this->getTotalAppointments($data, $clinicId),
            'total_patients' => $this->getTotalPatients($data, $clinicId),
            'total_revenue' => $this->getTotalRevenue($data, $clinicId),
            'total_staff' => $this->getTotalStaff($clinicId),
            'appointment_status_breakdown' => $this->getAppointmentStatusBreakdown($data, $clinicId),
            'revenue_comparison' => $this->getRevenueComparison($data, $clinicId),
            'recent_appointments' => $this->getRecentAppointments($clinicId, 5),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get key performance indicators.
     */
    public function kpis(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $kpis = [
            'appointment_completion_rate' => $this->getCompletionRate($data, $clinicId),
            'average_appointment_duration' => $this->getAverageDuration($data, $clinicId),
            'patient_retention_rate' => $this->getRetentionRate($data, $clinicId),
            'revenue_per_appointment' => $this->getRevenuePerAppointment($data, $clinicId),
            'no_show_rate' => $this->getNoShowRate($data, $clinicId),
            'cancellation_rate' => $this->getCancellationRate($data, $clinicId),
            'staff_utilization_rate' => $this->getStaffUtilization($data, $clinicId),
        ];

        return response()->json([
            'success' => true,
            'data' => $kpis,
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

        // For clinic owners and managers, get their clinic
        $staff = ClinicStaff::where('user_id', $user->id)->first();
        return $staff?->clinic_id;
    }

    /**
     * Get total appointments count.
     */
    private function getTotalAppointments(array $data, ?int $clinicId): int
    {
        return Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->when(isset($data['branch_id']), fn($q) => $q->where('branch_id', $data['branch_id']))
            ->count();
    }

    /**
     * Get total patients count.
     */
    private function getTotalPatients(array $data, ?int $clinicId): int
    {
        $query = Patient::query();

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        if (isset($data['start_date'])) {
            $query->whereDate('created_at', '>=', $data['start_date']);
        }

        if (isset($data['end_date'])) {
            $query->whereDate('created_at', '<=', $data['end_date']);
        }

        return $query->count();
    }

    /**
     * Get total revenue.
     */
    private function getTotalRevenue(array $data, ?int $clinicId): float
    {
        return Payment::where('status', 'completed')
            ->when($clinicId, function ($q) use ($clinicId) {
                $q->whereHas('appointment', fn($query) => $query->where('clinic_id', $clinicId));
            })
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('paid_at', '<=', $data['end_date']))
            ->sum('amount');
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
     * Get appointment status breakdown.
     */
    private function getAppointmentStatusBreakdown(array $data, ?int $clinicId): array
    {
        $breakdown = Appointment::select('status', DB::raw('count(*) as count'))
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        return [
            'pending' => $breakdown['pending'] ?? 0,
            'confirmed' => $breakdown['confirmed'] ?? 0,
            'completed' => $breakdown['completed'] ?? 0,
            'cancelled' => $breakdown['cancelled'] ?? 0,
            'no_show' => $breakdown['no_show'] ?? 0,
        ];
    }

    /**
     * Get revenue comparison with previous period.
     */
    private function getRevenueComparison(array $data, ?int $clinicId): array
    {
        $currentRevenue = $this->getTotalRevenue($data, $clinicId);

        // Calculate previous period
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $start = \Carbon\Carbon::parse($data['start_date']);
            $end = \Carbon\Carbon::parse($data['end_date']);
            $diff = $start->diffInDays($end);

            $previousData = [
                'start_date' => $start->copy()->subDays($diff + 1)->toDateString(),
                'end_date' => $end->copy()->subDays($diff + 1)->toDateString(),
            ];

            $previousRevenue = $this->getTotalRevenue($previousData, $clinicId);

            $change = $previousRevenue > 0
                ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
                : 0;

            return [
                'current_period' => round($currentRevenue, 2),
                'previous_period' => round($previousRevenue, 2),
                'change_percentage' => round($change, 2),
                'trend' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
            ];
        }

        return [
            'current_period' => round($currentRevenue, 2),
            'previous_period' => 0,
            'change_percentage' => 0,
            'trend' => 'stable',
        ];
    }

    /**
     * Get recent appointments.
     */
    private function getRecentAppointments(?int $clinicId, int $limit = 5): array
    {
        return Appointment::with(['patient.user', 'service', 'staff.user'])
            ->when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($apt) => [
                'id' => $apt->id,
                'patient_name' => $apt->patient->user->name,
                'service' => $apt->service->name,
                'staff' => $apt->staff->user->name,
                'date' => $apt->start_time,
                'time' => $apt->start_time,
                'status' => $apt->status,
            ])
            ->toArray();
    }

    /**
     * Get appointment completion rate.
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
     * Get average appointment duration.
     */
    private function getAverageDuration(array $data, ?int $clinicId): float
    {
        $avg = Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->get()
            ->map(function ($apt) {
                $start = \Carbon\Carbon::parse($apt->start_time);
                $end = \Carbon\Carbon::parse($apt->end_time);
                return $start->diffInMinutes($end);
            })
            ->average();

        return round($avg ?? 0, 2);
    }

    /**
     * Get patient retention rate.
     */
    private function getRetentionRate(array $data, ?int $clinicId): float
    {
        $totalPatients = Patient::when($clinicId, function ($q) use ($clinicId) {
            $q->whereHas('appointments', fn($query) => $query->where('clinic_id', $clinicId));
        })->count();

        if ($totalPatients === 0) return 0;

        $returningPatients = Patient::when($clinicId, function ($q) use ($clinicId) {
            $q->whereHas('appointments', fn($query) => $query->where('clinic_id', $clinicId));
        })
            ->has('appointments', '>=', 2)
            ->count();

        return round(($returningPatients / $totalPatients) * 100, 2);
    }

    /**
     * Get revenue per appointment.
     */
    private function getRevenuePerAppointment(array $data, ?int $clinicId): float
    {
        $revenue = $this->getTotalRevenue($data, $clinicId);
        $appointments = $this->getTotalAppointments($data, $clinicId);

        return $appointments > 0 ? round($revenue / $appointments, 2) : 0;
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
     * Get staff utilization rate.
     */
    private function getStaffUtilization(array $data, ?int $clinicId): float
    {
        // This is a simplified calculation
        // Real implementation would need working hours data
        $totalStaff = $this->getTotalStaff($clinicId);
        if ($totalStaff === 0) return 0;

        $appointments = $this->getTotalAppointments($data, $clinicId);
        $avgDuration = $this->getAverageDuration($data, $clinicId);

        // Assuming 8-hour workdays
        $days = isset($data['start_date']) && isset($data['end_date'])
            ? \Carbon\Carbon::parse($data['start_date'])->diffInDays($data['end_date']) + 1
            : 30;

        $availableMinutes = $totalStaff * $days * 8 * 60;
        $usedMinutes = $appointments * $avgDuration;

        return $availableMinutes > 0 ? round(($usedMinutes / $availableMinutes) * 100, 2) : 0;
    }
}
