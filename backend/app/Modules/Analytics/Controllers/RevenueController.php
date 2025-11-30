<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ClinicStaff;
use App\Modules\Analytics\Requests\GetAnalyticsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RevenueController extends Controller
{
    /**
     * Get revenue analytics.
     */
    public function index(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $analytics = [
            'total_revenue' => $this->getTotalRevenue($data, $clinicId),
            'revenue_by_payment_method' => $this->getRevenueByPaymentMethod($data, $clinicId),
            'revenue_by_service' => $this->getRevenueByService($data, $clinicId),
            'revenue_by_branch' => $this->getRevenueByBranch($data, $clinicId),
            'revenue_trend' => $this->getRevenueTrend($data, $clinicId),
            'top_earning_services' => $this->getTopEarningServices($data, $clinicId, 10),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get revenue trend over time.
     */
    public function trend(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);
        $groupBy = $data['group_by'] ?? 'day';

        $trend = $this->getRevenueTrend($data, $clinicId, $groupBy);

        return response()->json([
            'success' => true,
            'data' => [
                'trend' => $trend,
                'group_by' => $groupBy,
            ],
        ]);
    }

    /**
     * Get revenue comparison by period.
     */
    public function comparison(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $currentRevenue = $this->getTotalRevenue($data, $clinicId);

        // Calculate periods for comparison
        $comparisons = [
            'current_period' => [
                'revenue' => $currentRevenue,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
            ],
        ];

        // Add previous period
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $start = \Carbon\Carbon::parse($data['start_date']);
            $end = \Carbon\Carbon::parse($data['end_date']);
            $diff = $start->diffInDays($end);

            $previousData = array_merge($data, [
                'start_date' => $start->copy()->subDays($diff + 1)->toDateString(),
                'end_date' => $end->copy()->subDays($diff + 1)->toDateString(),
            ]);

            $previousRevenue = $this->getTotalRevenue($previousData, $clinicId);
            $change = $previousRevenue > 0
                ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100
                : 0;

            $comparisons['previous_period'] = [
                'revenue' => $previousRevenue,
                'start_date' => $previousData['start_date'],
                'end_date' => $previousData['end_date'],
            ];

            $comparisons['comparison'] = [
                'change_amount' => round($currentRevenue - $previousRevenue, 2),
                'change_percentage' => round($change, 2),
                'trend' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $comparisons,
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
            ->when(isset($data['branch_id']), function ($q) use ($data) {
                $q->whereHas('appointment', fn($query) => $query->where('branch_id', $data['branch_id']));
            })
            ->sum('amount');
    }

    /**
     * Get revenue by payment method.
     */
    private function getRevenueByPaymentMethod(array $data, ?int $clinicId): array
    {
        return Payment::select('payment_method', DB::raw('SUM(amount) as total'))
            ->where('status', 'completed')
            ->when($clinicId, function ($q) use ($clinicId) {
                $q->whereHas('appointment', fn($query) => $query->where('clinic_id', $clinicId));
            })
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('paid_at', '<=', $data['end_date']))
            ->groupBy('payment_method')
            ->get()
            ->map(fn($item) => [
                'method' => $item->payment_method,
                'total' => round($item->total, 2),
            ])
            ->toArray();
    }

    /**
     * Get revenue by service.
     */
    private function getRevenueByService(array $data, ?int $clinicId): array
    {
        return Payment::select('services.name', DB::raw('SUM(payments.amount) as total'))
            ->join('appointments', 'payments.appointment_id', '=', 'appointments.id')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('payments.status', 'completed')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('payments.paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('payments.paid_at', '<=', $data['end_date']))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'service' => $item->name,
                'total' => round($item->total, 2),
            ])
            ->toArray();
    }

    /**
     * Get revenue by branch.
     */
    private function getRevenueByBranch(array $data, ?int $clinicId): array
    {
        return Payment::select('clinic_branches.name', DB::raw('SUM(payments.amount) as total'))
            ->join('appointments', 'payments.appointment_id', '=', 'appointments.id')
            ->join('clinic_branches', 'appointments.branch_id', '=', 'clinic_branches.id')
            ->where('payments.status', 'completed')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('payments.paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('payments.paid_at', '<=', $data['end_date']))
            ->groupBy('clinic_branches.id', 'clinic_branches.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'branch' => $item->name,
                'total' => round($item->total, 2),
            ])
            ->toArray();
    }

    /**
     * Get revenue trend over time.
     */
    private function getRevenueTrend(array $data, ?int $clinicId, string $groupBy = 'day'): array
    {
        $dateFormat = match ($groupBy) {
            'year' => '%Y',
            'month' => '%Y-%m',
            'week' => '%Y-%W',
            default => '%Y-%m-%d',
        };

        return Payment::select(
            DB::raw("strftime('{$dateFormat}', paid_at) as period"),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'completed')
            ->when($clinicId, function ($q) use ($clinicId) {
                $q->whereHas('appointment', fn($query) => $query->where('clinic_id', $clinicId));
            })
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('paid_at', '<=', $data['end_date']))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($item) => [
                'period' => $item->period,
                'total' => round($item->total, 2),
            ])
            ->toArray();
    }

    /**
     * Get top earning services.
     */
    private function getTopEarningServices(array $data, ?int $clinicId, int $limit = 10): array
    {
        return Payment::select(
            'services.name',
            DB::raw('SUM(payments.amount) as total_revenue'),
            DB::raw('COUNT(payments.id) as payment_count')
        )
            ->join('appointments', 'payments.appointment_id', '=', 'appointments.id')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('payments.status', 'completed')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('payments.paid_at', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('payments.paid_at', '<=', $data['end_date']))
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->map(fn($item) => [
                'service' => $item->name,
                'total_revenue' => round($item->total_revenue, 2),
                'payment_count' => $item->payment_count,
                'average_per_payment' => round($item->total_revenue / $item->payment_count, 2),
            ])
            ->toArray();
    }
}
