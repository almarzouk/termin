<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\CancellationPolicy;
use Carbon\Carbon;

class CancellationService
{
    /**
     * Check if an appointment can be cancelled
     */
    public function canCancel(Appointment $appointment, $user = null)
    {
        // Admin can always cancel
        if ($user && $user->hasRole(['super_admin', 'clinic_admin'])) {
            return [
                'allowed' => true,
                'is_late' => false,
                'fee' => 0,
            ];
        }

        // Check if appointment is already cancelled or completed
        if (in_array($appointment->status, ['cancelled', 'completed'])) {
            return [
                'allowed' => false,
                'reason' => 'This appointment has already been ' . $appointment->status,
            ];
        }

        // Get clinic policy
        $policy = CancellationPolicy::where('clinic_id', $appointment->clinic_id)
            ->where('is_active', true)
            ->first();

        if (!$policy) {
            // No policy means cancellation is allowed
            return [
                'allowed' => true,
                'is_late' => false,
                'fee' => 0,
            ];
        }

        // Check policy rules
        return $policy->canCancelAt($appointment->start_time);
    }

    /**
     * Calculate cancellation fee
     */
    public function calculateFee(Appointment $appointment)
    {
        $cancellationCheck = $this->canCancel($appointment);

        if (isset($cancellationCheck['is_late']) && $cancellationCheck['is_late']) {
            return $cancellationCheck['fee'] ?? 0;
        }

        return 0;
    }

    /**
     * Process appointment cancellation
     */
    public function processCancel(Appointment $appointment, ?string $reason = null, $user = null)
    {
        // Check if cancellation is allowed
        $cancellationCheck = $this->canCancel($appointment, $user);

        if (!$cancellationCheck['allowed']) {
            throw new \Exception($cancellationCheck['reason'] ?? 'Cancellation not allowed');
        }

        // Calculate fee
        $fee = 0;
        $isLate = false;

        if (isset($cancellationCheck['is_late']) && $cancellationCheck['is_late']) {
            $isLate = true;
            $fee = $cancellationCheck['fee'] ?? 0;
        }

        // Update appointment
        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
            'cancellation_fee' => $fee,
            'is_late_cancellation' => $isLate,
        ]);

        // Cancel any pending reminders
        app(AppointmentReminderService::class)->cancelReminders($appointment->id);

        return [
            'success' => true,
            'appointment' => $appointment,
            'fee' => $fee,
            'is_late' => $isLate,
        ];
    }

    /**
     * Get cancellation statistics for a clinic
     */
    public function getStatistics(int $clinicId, ?Carbon $startDate = null, ?Carbon $endDate = null)
    {
        $query = Appointment::where('clinic_id', $clinicId)
            ->where('status', 'cancelled');

        if ($startDate) {
            $query->where('cancelled_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('cancelled_at', '<=', $endDate);
        }

        $totalCancellations = $query->count();
        $lateCancellations = $query->where('is_late_cancellation', true)->count();
        $totalFees = $query->sum('cancellation_fee');

        // Group by patient
        $patientStats = $query->get()
            ->groupBy('patient_id')
            ->map(function ($cancellations, $patientId) {
                return [
                    'patient_id' => $patientId,
                    'patient_name' => $cancellations->first()->patient->name ?? 'Unknown',
                    'total_cancellations' => $cancellations->count(),
                    'late_cancellations' => $cancellations->where('is_late_cancellation', true)->count(),
                    'total_fees' => $cancellations->sum('cancellation_fee'),
                ];
            })
            ->values()
            ->sortByDesc('total_cancellations')
            ->take(10);

        // Group by reason
        $reasonStats = $query->get()
            ->groupBy('cancellation_reason')
            ->map(function ($cancellations, $reason) {
                return [
                    'reason' => $reason ?? 'No reason provided',
                    'count' => $cancellations->count(),
                    'percentage' => 0, // Will calculate below
                ];
            })
            ->values()
            ->sortByDesc('count');

        // Calculate percentages
        if ($totalCancellations > 0) {
            $reasonStats = $reasonStats->map(function ($stat) use ($totalCancellations) {
                $stat['percentage'] = round(($stat['count'] / $totalCancellations) * 100, 2);
                return $stat;
            });
        }

        return [
            'total_cancellations' => $totalCancellations,
            'late_cancellations' => $lateCancellations,
            'late_cancellation_rate' => $totalCancellations > 0
                ? round(($lateCancellations / $totalCancellations) * 100, 2)
                : 0,
            'total_fees_collected' => $totalFees,
            'average_fee' => $lateCancellations > 0
                ? round($totalFees / $lateCancellations, 2)
                : 0,
            'top_patients' => $patientStats,
            'reasons_breakdown' => $reasonStats,
        ];
    }
}
