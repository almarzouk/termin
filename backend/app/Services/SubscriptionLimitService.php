<?php

namespace App\Services;

use App\Models\User;
use App\Models\Clinic;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class SubscriptionLimitService
{
    /**
     * Check if user can create a new clinic
     */
    public function canCreateClinic(User $user): array
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return [
                'allowed' => false,
                'message' => 'Sie haben kein aktives Abonnement. Bitte wählen Sie einen Plan.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;
        $currentCount = $user->clinics()->count();

        // Unlimited
        if ($plan->max_clinics === null) {
            return [
                'allowed' => true,
                'message' => 'Unbegrenzte Kliniken erlaubt',
                'current' => $currentCount,
                'limit' => null,
            ];
        }

        // Check limit
        if ($currentCount >= $plan->max_clinics) {
            return [
                'allowed' => false,
                'message' => "Sie haben das Limit von {$plan->max_clinics} Klinik(en) erreicht. Bitte upgraden Sie Ihren Plan.",
                'current' => $currentCount,
                'limit' => $plan->max_clinics,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Sie können eine neue Klinik erstellen',
            'current' => $currentCount,
            'limit' => $plan->max_clinics,
        ];
    }

    /**
     * Check if user can create a new doctor
     */
    public function canCreateDoctor(User $user, ?Clinic $clinic = null): array
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return [
                'allowed' => false,
                'message' => 'Sie haben kein aktives Abonnement. Bitte wählen Sie einen Plan.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;

        // Get all clinic IDs owned by the user
        $clinicIds = $user->clinics()->pluck('id')->toArray();

        // Count doctors (users with 'doctor' role) in user's clinics
        $currentCount = User::whereIn('clinic_id', $clinicIds)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'doctor');
            })
            ->count();

        // Unlimited
        if ($plan->max_doctors === null) {
            return [
                'allowed' => true,
                'message' => 'Unbegrenzte Ärzte erlaubt',
                'current' => $currentCount,
                'limit' => null,
            ];
        }

        // Check limit
        if ($currentCount >= $plan->max_doctors) {
            return [
                'allowed' => false,
                'message' => "Sie haben das Limit von {$plan->max_doctors} Arzt/Ärzte erreicht. Bitte upgraden Sie Ihren Plan.",
                'current' => $currentCount,
                'limit' => $plan->max_doctors,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Sie können einen neuen Arzt hinzufügen',
            'current' => $currentCount,
            'limit' => $plan->max_doctors,
        ];
    }

    /**
     * Check if user can create a new staff member
     */
    public function canCreateStaff(User $user): array
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return [
                'allowed' => false,
                'message' => 'Sie haben kein aktives Abonnement. Bitte wählen Sie einen Plan.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;

        // Count all staff (nurses + receptionists) across user's clinics
        $currentCount = DB::table('users')
            ->whereHas('clinics', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['nurse', 'receptionist']);
            })
            ->count();

        // Unlimited
        if ($plan->max_staff === null) {
            return [
                'allowed' => true,
                'message' => 'Unbegrenzte Mitarbeiter erlaubt',
                'current' => $currentCount,
                'limit' => null,
            ];
        }

        // Check limit
        if ($currentCount >= $plan->max_staff) {
            return [
                'allowed' => false,
                'message' => "Sie haben das Limit von {$plan->max_staff} Mitarbeiter(n) erreicht. Bitte upgraden Sie Ihren Plan.",
                'current' => $currentCount,
                'limit' => $plan->max_staff,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Sie können einen neuen Mitarbeiter hinzufügen',
            'current' => $currentCount,
            'limit' => $plan->max_staff,
        ];
    }

    /**
     * Check if user can create a new appointment this month
     */
    public function canCreateAppointment(User $user): array
    {
        // Patients don't have subscription limits for booking appointments
        if (!$user->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager'])) {
            return [
                'allowed' => true,
                'message' => 'Sie können einen Termin buchen',
                'current' => 0,
                'limit' => null,
            ];
        }

        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return [
                'allowed' => false,
                'message' => 'Sie haben kein aktives Abonnement. Bitte wählen Sie einen Plan.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;

        // Count appointments for current month across user's clinics
        $currentCount = Appointment::whereHas('clinic', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereYear('start_time', now()->year)
        ->whereMonth('start_time', now()->month)
        ->count();

        // Unlimited
        if ($plan->max_appointments_per_month === null) {
            return [
                'allowed' => true,
                'message' => 'Unbegrenzte Termine pro Monat erlaubt',
                'current' => $currentCount,
                'limit' => null,
            ];
        }

        // Check limit
        if ($currentCount >= $plan->max_appointments_per_month) {
            return [
                'allowed' => false,
                'message' => "Sie haben das monatliche Limit von {$plan->max_appointments_per_month} Termin(en) erreicht. Bitte upgraden Sie Ihren Plan.",
                'current' => $currentCount,
                'limit' => $plan->max_appointments_per_month,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'Sie können einen neuen Termin erstellen',
            'current' => $currentCount,
            'limit' => $plan->max_appointments_per_month,
        ];
    }

    /**
     * Get all limits for a user
     */
    public function getAllLimits(User $user): array
    {
        return [
            'clinics' => $this->canCreateClinic($user),
            'doctors' => $this->canCreateDoctor($user),
            'staff' => $this->canCreateStaff($user),
            'appointments' => $this->canCreateAppointment($user),
            'features' => $this->getFeatures($user),
        ];
    }

    /**
     * Get available features for user's plan
     */
    public function getFeatures(User $user): array
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return [
                'sms' => false,
                'email' => false,
                'reports' => false,
                'analytics' => false,
                'api_access' => false,
                'priority_support' => 0,
            ];
        }

        $plan = $subscription->plan;

        return [
            'sms' => $plan->has_sms,
            'email' => $plan->has_email,
            'reports' => $plan->has_reports,
            'analytics' => $plan->has_analytics,
            'api_access' => $plan->has_api_access,
            'priority_support' => $plan->priority_support,
        ];
    }

    /**
     * Check if user has a specific feature
     */
    public function hasFeature(User $user, string $feature): bool
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return false;
        }

        $plan = $subscription->plan;

        return match ($feature) {
            'sms' => $plan->has_sms,
            'email' => $plan->has_email,
            'reports' => $plan->has_reports,
            'analytics' => $plan->has_analytics,
            'api_access' => $plan->has_api_access,
            default => false,
        };
    }
}
