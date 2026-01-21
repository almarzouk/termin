<?php

namespace App\Services;

use App\Models\ClinicStaff;
use App\Models\StaffWorkingHours;
use App\Models\Appointment;
use Carbon\Carbon;

class AppointmentDistributionService
{
    /**
     * Get available time slots for a clinic on a specific date
     */
    public function getAvailableSlots($clinicId, $date, $serviceId = null, $doctorId = null)
    {
        $dateObj = Carbon::parse($date);
        $dayOfWeek = $dateObj->dayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday

        // Only allow Monday (1) to Friday (5) - no weekends
        if ($dayOfWeek === 0 || $dayOfWeek === 6) {
            return []; // No appointments on Saturday or Sunday
        }

        // Get all active doctors in the clinic
        $query = ClinicStaff::where('clinic_id', $clinicId)
            ->where('allow_online_booking', true)
            ->with(['user', 'workingHours']);

        // If doctor_id is specified, filter by that doctor only
        if ($doctorId) {
            $query->where('id', $doctorId);
        }

        $doctors = $query->get();

        $availableSlots = [];

        foreach ($doctors as $doctor) {
            // Check if doctor has unavailability period on this date
            $hasUnavailabilityPeriod = \App\Models\StaffUnavailabilityPeriod::where('staff_id', $doctor->id)
                ->whereRaw('DATE(start_date) <= ?', [$dateObj->format('Y-m-d')])
                ->whereRaw('DATE(end_date) >= ?', [$dateObj->format('Y-m-d')])
                ->exists();

            if ($hasUnavailabilityPeriod) {
                continue; // Skip this doctor - not available on this date
            }

            // Get working hours for this day
            $workingHours = StaffWorkingHours::where('staff_id', $doctor->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->get();

            foreach ($workingHours as $hours) {
                // Generate time slots based on appointment duration
                $slots = $this->generateTimeSlots(
                    $hours->start_time,
                    $hours->end_time,
                    $doctor->appointment_duration_minutes
                );

                // Check which slots are already booked
                $bookedSlots = Appointment::where('clinic_id', $clinicId)
                    ->where('staff_id', $doctor->id)
                    ->whereDate('start_time', $date)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->get()
                    ->map(function($appointment) {
                        return $appointment->start_time->format('H:i');
                    })
                    ->toArray();

                // Check daily limit
                $todayAppointments = Appointment::where('clinic_id', $clinicId)
                    ->where('staff_id', $doctor->id)
                    ->whereDate('start_time', $date)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->count();

                $remainingSlots = $doctor->max_daily_appointments - $todayAppointments;

                if ($remainingSlots <= 0) {
                    continue; // Doctor reached daily limit
                }

                // Filter available slots
                $availableForDoctor = array_filter($slots, function($slot) use ($bookedSlots) {
                    return !in_array($slot, $bookedSlots);
                });

                // Limit to remaining slots
                $availableForDoctor = array_slice($availableForDoctor, 0, $remainingSlots);

                foreach ($availableForDoctor as $slot) {
                    $availableSlots[] = [
                        'time' => $slot,
                        'doctor_id' => $doctor->id,
                        'doctor_name' => $doctor->user->name ?? 'Unbekannt',
                        'specialty' => $doctor->specialty ?? $doctor->specialization ?? 'Allgemein',
                        'duration' => $doctor->appointment_duration_minutes,
                    ];
                }
            }
        }

        // Sort by time
        usort($availableSlots, function($a, $b) {
            return strcmp($a['time'], $b['time']);
        });

        return [
            'date' => $date,
            'total_slots' => count($availableSlots),
            'slots' => $availableSlots,
        ];
    }

    /**
     * Find best available doctor for a time slot
     * Uses smart distribution algorithm
     */
    public function findBestDoctor($clinicId, $date, $time, $serviceId = null)
    {
        $dateObj = Carbon::parse($date);
        $dayOfWeek = $dateObj->dayOfWeek;

        // Only allow Monday (1) to Friday (5) - no weekends
        if ($dayOfWeek === 0 || $dayOfWeek === 6) {
            return null; // No appointments on Saturday or Sunday
        }

        // Get all doctors working at this time
        $doctors = ClinicStaff::where('clinic_id', $clinicId)
            ->where('allow_online_booking', true)
            ->get();

        $candidates = [];

        foreach ($doctors as $doctor) {
            // Check if doctor has unavailability period on this date
            $hasUnavailabilityPeriod = \App\Models\StaffUnavailabilityPeriod::where('staff_id', $doctor->id)
                ->where('start_date', '<=', $dateObj->format('Y-m-d'))
                ->where('end_date', '>=', $dateObj->format('Y-m-d'))
                ->exists();

            if ($hasUnavailabilityPeriod) {
                continue; // Skip this doctor - not available on this date
            }

            // Check if doctor works at this time
            $workingHour = StaffWorkingHours::where('staff_id', $doctor->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->where('start_time', '<=', $time)
                ->where('end_time', '>', $time)
                ->first();

            if (!$workingHour) {
                continue; // Doctor not available at this time
            }

            // Check daily limit
            $todayAppointments = Appointment::where('clinic_id', $clinicId)
                ->where('staff_id', $doctor->id)
                ->whereDate('start_time', $date)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count();

            if ($todayAppointments >= $doctor->max_daily_appointments) {
                continue; // Doctor reached daily limit
            }

            // Check if time slot is available
            $existingAppointment = Appointment::where('clinic_id', $clinicId)
                ->where('staff_id', $doctor->id)
                ->whereDate('start_time', $date)
                ->whereTime('start_time', $time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingAppointment) {
                continue; // Slot already booked
            }

            // Calculate load factor (for fair distribution)
            $loadFactor = $todayAppointments / $doctor->max_daily_appointments;

            $candidates[] = [
                'doctor' => $doctor,
                'current_load' => $todayAppointments,
                'load_factor' => $loadFactor,
            ];
        }

        if (empty($candidates)) {
            return null; // No available doctors
        }

        // Sort by load factor (prefer doctors with lower load for fair distribution)
        usort($candidates, function($a, $b) {
            return $a['load_factor'] <=> $b['load_factor'];
        });

        return $candidates[0]['doctor'];
    }

    /**
     * Generate time slots between start and end time
     */
    private function generateTimeSlots($startTime, $endTime, $durationMinutes)
    {
        $slots = [];
        $current = Carbon::parse($startTime);
        $end = Carbon::parse($endTime);

        while ($current->lt($end)) {
            $slots[] = $current->format('H:i');
            $current->addMinutes($durationMinutes);
        }

        return $slots;
    }

    /**
     * Get clinic capacity statistics
     */
    public function getClinicCapacity($clinicId, $date)
    {
        $dateObj = Carbon::parse($date);
        $dayOfWeek = $dateObj->dayOfWeek;

        // Only allow Monday (1) to Friday (5) - no weekends
        if ($dayOfWeek === 0 || $dayOfWeek === 6) {
            return [
                'date' => $date,
                'day_of_week' => $dayOfWeek,
                'total_capacity' => 0,
                'booked_appointments' => 0,
                'available_slots' => 0,
                'utilization_rate' => 0,
                'is_weekend' => true,
            ];
        }

        // Get all doctors
        $doctors = ClinicStaff::where('clinic_id', $clinicId)
            ->where('allow_online_booking', true)
            ->get();

        $totalCapacity = 0;
        $bookedAppointments = 0;
        $availableSlots = 0;

        foreach ($doctors as $doctor) {
            // Check if doctor has unavailability period on this date
            $hasUnavailabilityPeriod = \App\Models\StaffUnavailabilityPeriod::where('staff_id', $doctor->id)
                ->where('start_date', '<=', $dateObj->format('Y-m-d'))
                ->where('end_date', '>=', $dateObj->format('Y-m-d'))
                ->exists();

            if ($hasUnavailabilityPeriod) {
                continue; // Skip this doctor - not available on this date
            }

            // Check if doctor works on this day
            $workingHour = StaffWorkingHours::where('staff_id', $doctor->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (!$workingHour) {
                continue; // Doctor doesn't work on this day
            }

            $totalCapacity += $doctor->max_daily_appointments;

            // Count booked appointments using start_time
            $booked = Appointment::where('clinic_id', $clinicId)
                ->where('staff_id', $doctor->id)
                ->whereDate('start_time', $date)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count();

            $bookedAppointments += $booked;
        }

        $availableSlots = $totalCapacity - $bookedAppointments;

        return [
            'date' => $date,
            'total_capacity' => $totalCapacity,
            'booked' => $bookedAppointments,
            'available' => $availableSlots,
            'utilization_percentage' => $totalCapacity > 0
                ? round(($bookedAppointments / $totalCapacity) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get next available slot (auto-assign doctor)
     */
    public function getNextAvailableSlot($clinicId, $startDate = null)
    {
        $date = $startDate ? Carbon::parse($startDate) : Carbon::today();
        $maxDaysToCheck = 30; // Check up to 30 days ahead
        $daysChecked = 0;

        while ($daysChecked < $maxDaysToCheck) {
            $slots = $this->getAvailableSlots($clinicId, $date->toDateString());

            if ($slots['total_slots'] > 0) {
                return [
                    'date' => $date->toDateString(),
                    'slot' => $slots['slots'][0], // Return first available slot
                    'available_count' => $slots['total_slots'],
                ];
            }

            $date->addDay();
            $daysChecked++;
        }

        return null; // No available slots in the next 30 days
    }
}
