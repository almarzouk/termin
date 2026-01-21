<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RecurringAppointmentService
{
    /**
     * Create a recurring appointment series
     */
    public function createRecurringSeries(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Create the parent appointment
            $parentData = array_merge($data, [
                'is_recurring' => true,
                'recurring_parent_id' => null,
                'occurrence_number' => 1,
            ]);

            $parent = Appointment::create($parentData);

            // Generate all occurrences
            $occurrences = $this->calculateOccurrences(
                $data['recurring_pattern'],
                Carbon::parse($data['start_time']),
                Carbon::parse($data['end_time']),
                $data['recurring_interval'] ?? 1,
                $data['recurring_days'] ?? null,
                $data['recurring_day_of_month'] ?? null,
                $data['recurring_end_date'] ?? null,
                $data['recurring_count'] ?? null
            );

            // Create child appointments
            foreach ($occurrences as $index => $occurrence) {
                $childData = $data;
                $childData['is_recurring'] = true;
                $childData['recurring_parent_id'] = $parent->id;
                $childData['start_time'] = $occurrence['start'];
                $childData['end_time'] = $occurrence['end'];
                $childData['occurrence_number'] = $index + 2; // Parent is #1

                Appointment::create($childData);
            }

            return $parent->load('recurringChildren');
        });
    }

    /**
     * Calculate all occurrences for a recurring pattern
     */
    public function calculateOccurrences(
        string $pattern,
        Carbon $startTime,
        Carbon $endTime,
        int $interval = 1,
        ?array $recurringDays = null,
        ?int $dayOfMonth = null,
        ?string $endDate = null,
        ?int $count = null
    ) {
        $occurrences = [];
        $currentStart = $startTime->copy();
        $duration = $endTime->diffInMinutes($startTime);
        $endCondition = $endDate ? Carbon::parse($endDate) : null;
        $maxCount = $count ?? 100; // Default limit to prevent infinite loops
        $occurrenceCount = 0;

        while ($occurrenceCount < $maxCount) {
            // Move to next occurrence based on pattern
            switch ($pattern) {
                case 'daily':
                    $currentStart->addDays($interval);
                    break;

                case 'weekly':
                    if ($recurringDays && count($recurringDays) > 0) {
                        $currentStart = $this->getNextWeeklyOccurrence($currentStart, $recurringDays, $interval);
                    } else {
                        $currentStart->addWeeks($interval);
                    }
                    break;

                case 'monthly':
                    if ($dayOfMonth) {
                        $currentStart->addMonth($interval)->day($dayOfMonth);
                    } else {
                        $currentStart->addMonths($interval);
                    }
                    break;

                case 'yearly':
                    $currentStart->addYears($interval);
                    break;
            }

            // Check end conditions
            if ($endCondition && $currentStart->isAfter($endCondition)) {
                break;
            }

            $currentEnd = $currentStart->copy()->addMinutes($duration);

            $occurrences[] = [
                'start' => $currentStart->toDateTimeString(),
                'end' => $currentEnd->toDateTimeString(),
            ];

            $occurrenceCount++;

            // If we have a count limit and reached it, stop
            if ($count && $occurrenceCount >= $count - 1) { // -1 because parent is first
                break;
            }
        }

        return $occurrences;
    }

    /**
     * Get next weekly occurrence based on selected days
     */
    private function getNextWeeklyOccurrence(Carbon $currentDate, array $days, int $interval)
    {
        $currentDayOfWeek = $currentDate->dayOfWeek;
        $nextDay = null;

        // Sort days
        sort($days);

        // Find next day in current week
        foreach ($days as $day) {
            if ($day > $currentDayOfWeek) {
                $nextDay = $day;
                break;
            }
        }

        // If no next day in current week, go to first day of next interval
        if ($nextDay === null) {
            $currentDate->addWeeks($interval);
            $nextDay = $days[0];
        }

        return $currentDate->dayOfWeek($nextDay);
    }

    /**
     * Update all future occurrences in a series
     */
    public function updateSeries(int $parentId, array $data)
    {
        return DB::transaction(function () use ($parentId, $data) {
            $parent = Appointment::findOrFail($parentId);

            // Update parent
            $parent->update($data);

            // Update all future children
            Appointment::where('recurring_parent_id', $parentId)
                ->where('start_time', '>', now())
                ->update($data);

            return $parent->load('recurringChildren');
        });
    }

    /**
     * Update a single occurrence
     */
    public function updateSingle(int $appointmentId, array $data)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        // If updating a parent, detach it from the series
        if ($appointment->isRecurring() && !$appointment->isRecurringChild()) {
            $data['is_recurring'] = false;
            $data['recurring_parent_id'] = null;
        }

        $appointment->update($data);

        return $appointment;
    }

    /**
     * Delete entire series
     */
    public function deleteSeries(int $parentId)
    {
        return DB::transaction(function () use ($parentId) {
            // Delete all children
            Appointment::where('recurring_parent_id', $parentId)->delete();

            // Delete parent
            Appointment::findOrFail($parentId)->delete();

            return true;
        });
    }

    /**
     * Delete single occurrence
     */
    public function deleteSingle(int $appointmentId)
    {
        $appointment = Appointment::findOrFail($appointmentId);

        // If it's the parent, we need to handle this specially
        if ($appointment->isRecurring() && !$appointment->isRecurringChild()) {
            // Promote the first child to be the new parent
            $firstChild = Appointment::where('recurring_parent_id', $appointmentId)
                ->orderBy('start_time')
                ->first();

            if ($firstChild) {
                $firstChild->update([
                    'recurring_parent_id' => null,
                    'occurrence_number' => 1,
                ]);

                // Update all other children to point to new parent
                Appointment::where('recurring_parent_id', $appointmentId)
                    ->where('id', '!=', $firstChild->id)
                    ->update(['recurring_parent_id' => $firstChild->id]);
            }
        }

        $appointment->delete();

        return true;
    }
}