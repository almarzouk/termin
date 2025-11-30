<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\ClinicStaff;
use App\Modules\Analytics\Requests\GetAnalyticsRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PatientAnalyticsController extends Controller
{
    /**
     * Get patient analytics.
     */
    public function index(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $analytics = [
            'total_patients' => $this->getTotalPatients($data, $clinicId),
            'new_patients' => $this->getNewPatients($data, $clinicId),
            'returning_patients' => $this->getReturningPatients($data, $clinicId),
            'patient_retention_rate' => $this->getRetentionRate($clinicId),
            'patients_by_gender' => $this->getPatientsByGender($data, $clinicId),
            'patients_by_age_group' => $this->getPatientsByAgeGroup($data, $clinicId),
            'average_appointments_per_patient' => $this->getAverageAppointmentsPerPatient($data, $clinicId),
            'most_frequent_patients' => $this->getMostFrequentPatients($data, $clinicId, 10),
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get patient growth trends.
     */
    public function growth(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);
        $groupBy = $data['group_by'] ?? 'month';

        $growth = $this->getPatientGrowth($data, $clinicId, $groupBy);

        return response()->json([
            'success' => true,
            'data' => [
                'growth' => $growth,
                'group_by' => $groupBy,
            ],
        ]);
    }

    /**
     * Get patient demographics.
     */
    public function demographics(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $demographics = [
            'by_gender' => $this->getPatientsByGender($data, $clinicId),
            'by_age_group' => $this->getPatientsByAgeGroup($data, $clinicId),
            'average_age' => $this->getAverageAge($clinicId),
            'by_blood_type' => $this->getPatientsByBloodType($clinicId),
        ];

        return response()->json([
            'success' => true,
            'data' => $demographics,
        ]);
    }

    /**
     * Get patient engagement metrics.
     */
    public function engagement(GetAnalyticsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();
        $clinicId = $this->getClinicIdForUser($user, $data['clinic_id'] ?? null);

        $metrics = [
            'active_patients' => $this->getActivePatients($data, $clinicId),
            'inactive_patients' => $this->getInactivePatients($clinicId),
            'average_visit_frequency' => $this->getAverageVisitFrequency($data, $clinicId),
            'patients_with_medical_records' => $this->getPatientsWithMedicalRecords($clinicId),
            'patients_with_prescriptions' => $this->getPatientsWithPrescriptions($clinicId),
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
     * Get total patients.
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
     * Get new patients in period.
     */
    private function getNewPatients(array $data, ?int $clinicId): int
    {
        return $this->getTotalPatients($data, $clinicId);
    }

    /**
     * Get returning patients.
     */
    private function getReturningPatients(array $data, ?int $clinicId): int
    {
        $query = Patient::query();

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        $query->has('appointments', '>=', 2);

        if (isset($data['start_date'])) {
            $query->whereHas('appointments', function ($q) use ($data) {
                $q->whereDate('start_time', '>=', $data['start_date']);
            });
        }

        if (isset($data['end_date'])) {
            $query->whereHas('appointments', function ($q) use ($data) {
                $q->whereDate('start_time', '<=', $data['end_date']);
            });
        }

        return $query->count();
    }

    /**
     * Get patient retention rate.
     */
    private function getRetentionRate(?int $clinicId): float
    {
        $query = Patient::query();

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        $total = $query->count();
        if ($total === 0) return 0;

        $returning = (clone $query)->has('appointments', '>=', 2)->count();

        return round(($returning / $total) * 100, 2);
    }

    /**
     * Get patients by gender.
     */
    private function getPatientsByGender(array $data, ?int $clinicId): array
    {
        $query = Patient::select('gender', DB::raw('count(*) as count'));

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

        $breakdown = $query->groupBy('gender')
            ->get()
            ->pluck('count', 'gender')
            ->toArray();

        $total = array_sum($breakdown);

        return [
            'male' => [
                'count' => $breakdown['male'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['male'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'female' => [
                'count' => $breakdown['female'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['female'] ?? 0) / $total) * 100, 2) : 0,
            ],
            'other' => [
                'count' => $breakdown['other'] ?? 0,
                'percentage' => $total > 0 ? round((($breakdown['other'] ?? 0) / $total) * 100, 2) : 0,
            ],
        ];
    }

    /**
     * Get patients by age group.
     */
    private function getPatientsByAgeGroup(array $data, ?int $clinicId): array
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

        $patients = $query->whereNotNull('date_of_birth')->get();

        $ageGroups = [
            '0-18' => 0,
            '19-30' => 0,
            '31-45' => 0,
            '46-60' => 0,
            '61+' => 0,
        ];

        foreach ($patients as $patient) {
            $age = \Carbon\Carbon::parse($patient->date_of_birth)->age;

            if ($age <= 18) {
                $ageGroups['0-18']++;
            } elseif ($age <= 30) {
                $ageGroups['19-30']++;
            } elseif ($age <= 45) {
                $ageGroups['31-45']++;
            } elseif ($age <= 60) {
                $ageGroups['46-60']++;
            } else {
                $ageGroups['61+']++;
            }
        }

        $total = array_sum($ageGroups);

        return array_map(function ($count) use ($total) {
            return [
                'count' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
            ];
        }, $ageGroups);
    }

    /**
     * Get average age.
     */
    private function getAverageAge(?int $clinicId): float
    {
        $query = Patient::whereNotNull('date_of_birth');

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        $patients = $query->get();

        if ($patients->isEmpty()) return 0;

        $ages = $patients->map(function ($patient) {
            return \Carbon\Carbon::parse($patient->date_of_birth)->age;
        });

        return round($ages->average(), 2);
    }

    /**
     * Get patients by blood type.
     */
    private function getPatientsByBloodType(?int $clinicId): array
    {
        $query = Patient::select('blood_type', DB::raw('count(*) as count'))
            ->whereNotNull('blood_type');

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        return $query->groupBy('blood_type')
            ->get()
            ->map(fn($item) => [
                'blood_type' => $item->blood_type,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get average appointments per patient.
     */
    private function getAverageAppointmentsPerPatient(array $data, ?int $clinicId): float
    {
        $totalPatients = $this->getTotalPatients($data, $clinicId);
        if ($totalPatients === 0) return 0;

        $totalAppointments = Appointment::when($clinicId, fn($q) => $q->where('clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('start_time', '<=', $data['end_date']))
            ->count();

        return round($totalAppointments / $totalPatients, 2);
    }

    /**
     * Get most frequent patients.
     */
    private function getMostFrequentPatients(array $data, ?int $clinicId, int $limit = 10): array
    {
        $query = Patient::select('patients.*', DB::raw('count(appointments.id) as appointment_count'))
            ->join('appointments', 'patients.id', '=', 'appointments.patient_id')
            ->when($clinicId, fn($q) => $q->where('appointments.clinic_id', $clinicId))
            ->when(isset($data['start_date']), fn($q) => $q->whereDate('appointments.start_time', '>=', $data['start_date']))
            ->when(isset($data['end_date']), fn($q) => $q->whereDate('appointments.start_time', '<=', $data['end_date']))
            ->with('user')
            ->groupBy('patients.id')
            ->orderByDesc('appointment_count')
            ->limit($limit);

        return $query->get()->map(fn($patient) => [
            'id' => $patient->id,
            'name' => $patient->user->name,
            'email' => $patient->user->email,
            'appointment_count' => $patient->appointment_count,
        ])->toArray();
    }

    /**
     * Get patient growth trend.
     */
    private function getPatientGrowth(array $data, ?int $clinicId, string $groupBy = 'month'): array
    {
        $dateFormat = match ($groupBy) {
            'year' => '%Y',
            'month' => '%Y-%m',
            'week' => '%Y-%u',
            default => '%Y-%m-%d',
        };

        $query = Patient::select(
            DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
            DB::raw('count(*) as total')
        );

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

        return $query->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(fn($item) => [
                'period' => $item->period,
                'total' => $item->total,
            ])
            ->toArray();
    }

    /**
     * Get active patients (had appointment in last 90 days).
     */
    private function getActivePatients(array $data, ?int $clinicId): int
    {
        $query = Patient::whereHas('appointments', function ($q) use ($clinicId) {
            $q->when($clinicId, fn($query) => $query->where('clinic_id', $clinicId))
                ->where('start_time', '>=', now()->subDays(90));
        });

        return $query->count();
    }

    /**
     * Get inactive patients (no appointment in last 90 days).
     */
    private function getInactivePatients(?int $clinicId): int
    {
        $query = Patient::whereDoesntHave('appointments', function ($q) use ($clinicId) {
            $q->when($clinicId, fn($query) => $query->where('clinic_id', $clinicId))
                ->where('start_time', '>=', now()->subDays(90));
        });

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        return $query->count();
    }

    /**
     * Get average visit frequency (days between visits).
     */
    private function getAverageVisitFrequency(array $data, ?int $clinicId): float
    {
        $query = Patient::has('appointments', '>=', 2);

        if ($clinicId) {
            $query->whereHas('appointments', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        $patients = $query->with(['appointments' => function ($q) use ($clinicId, $data) {
            $q->when($clinicId, fn($query) => $query->where('clinic_id', $clinicId))
                ->when(isset($data['start_date']), fn($query) => $query->whereDate('start_time', '>=', $data['start_date']))
                ->when(isset($data['end_date']), fn($query) => $query->whereDate('start_time', '<=', $data['end_date']))
                ->orderBy('start_time');
        }])->get();

        $frequencies = [];

        foreach ($patients as $patient) {
            $appointments = $patient->appointments;
            if ($appointments->count() < 2) continue;

            for ($i = 1; $i < $appointments->count(); $i++) {
                $previous = \Carbon\Carbon::parse($appointments[$i - 1]->start_time);
                $current = \Carbon\Carbon::parse($appointments[$i]->start_time);
                $frequencies[] = $previous->diffInDays($current);
            }
        }

        return !empty($frequencies) ? round(array_sum($frequencies) / count($frequencies), 2) : 0;
    }

    /**
     * Get patients with medical records.
     */
    private function getPatientsWithMedicalRecords(?int $clinicId): int
    {
        $query = Patient::has('medicalRecords');

        if ($clinicId) {
            $query->whereHas('medicalRecords.appointment', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        return $query->count();
    }

    /**
     * Get patients with prescriptions.
     */
    private function getPatientsWithPrescriptions(?int $clinicId): int
    {
        $query = Patient::whereHas('medicalRecords.prescriptions');

        if ($clinicId) {
            $query->whereHas('medicalRecords.appointment', function ($q) use ($clinicId) {
                $q->where('clinic_id', $clinicId);
            });
        }

        return $query->count();
    }
}
