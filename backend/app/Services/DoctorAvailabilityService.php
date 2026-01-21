<?php

namespace App\Services;

use App\Models\ClinicStaff;
use App\Models\Appointment;
use App\Models\StaffWorkingHours;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DoctorAvailabilityService
{
    /**
     * Find available doctors for a specific date/time and specialty
     */
    public function findAvailableDoctors(
        int $clinicId,
        ?string $specialty,
        Carbon $dateTime,
        ?int $excludeStaffId = null
    ): Collection {
        // Get all doctors with matching specialty in the clinic
        $doctors = ClinicStaff::where('clinic_id', $clinicId)
            ->when($specialty, function ($query, $specialty) {
                // Match specialty OR NULL (general doctors can cover any specialty)
                return $query->where(function ($q) use ($specialty) {
                    $q->where('specialty', $specialty)
                      ->orWhereNull('specialty');
                });
            })
            ->where('is_active', 1)
            ->when($excludeStaffId, function ($query, $excludeStaffId) {
                return $query->where('id', '!=', $excludeStaffId);
            });

        // Log the SQL query for debugging
        \Log::info('FindAvailableDoctors: SQL Query', [
            'sql' => $doctors->toSql(),
            'bindings' => $doctors->getBindings(),
        ]);

        $doctors = $doctors->get();

        \Log::info('FindAvailableDoctors: Initial query', [
            'clinic_id' => $clinicId,
            'specialty' => $specialty,
            'datetime' => $dateTime->format('Y-m-d H:i:s'),
            'exclude_staff_id' => $excludeStaffId,
            'found_doctors' => $doctors->count(),
            'doctor_ids' => $doctors->pluck('id')->toArray(),
        ]);

        $availableDoctors = [];

        foreach ($doctors as $doctor) {
            $isAvailable = $this->isDoctorAvailable($doctor, $dateTime);

            \Log::info('Checking doctor availability', [
                'doctor_id' => $doctor->id,
                'doctor_name' => $doctor->user->name ?? 'N/A',
                'is_available' => $isAvailable,
            ]);

            if ($isAvailable) {
                $workload = $this->getDoctorWorkload($doctor->id, $dateTime->format('Y-m-d'));

                $availableDoctors[] = [
                    'doctor' => $doctor,
                    'workload' => $workload,
                    'available_slots' => $this->getAvailableSlots($doctor, $dateTime->format('Y-m-d')),
                ];
            }
        }

        // Sort by workload (prefer doctors with fewer appointments)
        usort($availableDoctors, function ($a, $b) {
            return $a['workload'] <=> $b['workload'];
        });

        return collect($availableDoctors);
    }

    /**
     * Check if a doctor is available at a specific date/time
     */
    public function isDoctorAvailable(ClinicStaff $doctor, Carbon $dateTime): bool
    {
        $dayOfWeek = $dateTime->dayOfWeek;
        $time = $dateTime->format('H:i:s');
        $date = $dateTime->format('Y-m-d');

        // Check if doctor has unavailability period on this date
        $hasUnavailabilityPeriod = \App\Models\StaffUnavailabilityPeriod::where('staff_id', $doctor->id)
            ->whereRaw('DATE(start_date) <= ?', [$date])
            ->whereRaw('DATE(end_date) >= ?', [$date])
            ->exists();

        if ($hasUnavailabilityPeriod) {
            return false;
        }

        // Check working hours
        $workingHours = StaffWorkingHours::where('staff_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_time', '<=', $time)
            ->where('end_time', '>=', $time)
            ->exists();

        if (!$workingHours) {
            return false;
        }

        // Check if doctor has appointment at this time
        $hasAppointment = Appointment::where('staff_id', $doctor->id)
            ->where('start_time', $dateTime->format('Y-m-d H:i:s'))
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->exists();

        return !$hasAppointment;
    }

    /**
     * Get doctor's workload for a specific date
     */
    public function getDoctorWorkload(int $staffId, string $date): int
    {
        return Appointment::where('staff_id', $staffId)
            ->whereDate('start_time', $date)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->count();
    }

    /**
     * Get available time slots for a doctor on a specific date
     */
    public function getAvailableSlots(ClinicStaff $doctor, string $date): array
    {
        $dateObj = Carbon::parse($date);
        $dayOfWeek = $dateObj->dayOfWeek;

        // Check if doctor is unavailable on this date
        $isUnavailable = \App\Models\StaffUnavailabilityPeriod::where('staff_id', $doctor->id)
            ->whereRaw('DATE(start_date) <= ?', [$date])
            ->whereRaw('DATE(end_date) >= ?', [$date])
            ->exists();

        if ($isUnavailable) {
            return []; // No slots available if doctor is unavailable
        }

        // Get working hours
        $workingHours = StaffWorkingHours::where('staff_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->get();

        if ($workingHours->isEmpty()) {
            return [];
        }

        $availableSlots = [];

        foreach ($workingHours as $hours) {
            $startTime = Carbon::parse($date . ' ' . $hours->start_time);
            $endTime = Carbon::parse($date . ' ' . $hours->end_time);

            while ($startTime < $endTime) {
                // Check if slot is available
                $hasAppointment = Appointment::where('staff_id', $doctor->id)
                    ->where('start_time', $startTime->format('Y-m-d H:i:s'))
                    ->whereNotIn('status', ['cancelled', 'rejected'])
                    ->exists();

                if (!$hasAppointment) {
                    $availableSlots[] = [
                        'time' => $startTime->format('H:i'),
                        'datetime' => $startTime->format('Y-m-d H:i:s'),
                    ];
                }

                $startTime->addMinutes(30); // 30-minute slots
            }
        }

        return $availableSlots;
    }

    /**
     * Find the best doctor for reassignment based on workload and availability
     */
    public function findBestDoctorForReassignment(
        int $clinicId,
        ?string $specialty,
        Carbon $originalDateTime,
        int $excludeStaffId
    ): ?array {
        $availableDoctors = $this->findAvailableDoctors(
            $clinicId,
            $specialty,
            $originalDateTime,
            $excludeStaffId
        );

        // Return doctor with least workload
        return $availableDoctors->first();
    }

    /**
     * Get alternative time slots if original time is not available
     */
    public function getAlternativeSlots(
        ClinicStaff $doctor,
        Carbon $originalDateTime,
        int $daysToSearch = 7
    ): array {
        $alternatives = [];
        $currentDate = $originalDateTime->copy();

        for ($i = 0; $i < $daysToSearch; $i++) {
            $slots = $this->getAvailableSlots($doctor, $currentDate->format('Y-m-d'));

            if (!empty($slots)) {
                $alternatives[$currentDate->format('Y-m-d')] = $slots;
            }

            $currentDate->addDay();
        }

        return $alternatives;
    }
}
