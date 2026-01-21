<?php

namespace App\Modules\WorkingHours\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WorkingHours\Requests\CreateWorkingHoursRequest;
use App\Modules\WorkingHours\Requests\UpdateWorkingHoursRequest;
use App\Models\WorkingHours;
use App\Models\StaffWorkingHours;
use App\Models\Clinic;
use App\Models\ClinicStaff;
use Illuminate\Http\Request;

class WorkingHoursController extends Controller
{
    /**
     * Display working hours for clinic or staff
     */
    public function index(Request $request)
    {
        // If staff_id is provided, use StaffWorkingHours table
        if ($request->has('staff_id')) {
            $request->validate([
                'staff_id' => 'required|exists:clinic_staff,id',
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $workingHours = StaffWorkingHours::with(['staff.user'])
                ->where('staff_id', $request->staff_id)
                ->orderBy('day_of_week')
                ->orderBy('start_time')
                ->get();

            // Convert day numbers to names
            $dayMap = [
                0 => 'sunday',
                1 => 'monday',
                2 => 'tuesday',
                3 => 'wednesday',
                4 => 'thursday',
                5 => 'friday',
                6 => 'saturday',
            ];

            $workingHours = $workingHours->map(function ($hour) use ($dayMap) {
                return [
                    'id' => $hour->id,
                    'staff_id' => $hour->staff_id,
                    'day_of_week' => $dayMap[$hour->day_of_week] ?? 'monday',
                    'start_time' => $hour->start_time,
                    'end_time' => $hour->end_time,
                    'is_available' => $hour->is_available,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $workingHours->values(),
            ]);
        }

        // Otherwise use clinic working hours
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
        ]);

        $query = WorkingHours::with(['clinic', 'branch'])
            ->where('clinic_id', $request->clinic_id);

        // Filter by day
        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        $workingHours = $query->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Group by day of week
        $groupedHours = $workingHours->groupBy('day_of_week')->map(function ($hours) {
            return [
                'day' => $this->getDayName($hours->first()->day_of_week),
                'schedules' => $hours,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $groupedHours->values(),
        ]);
    }

    /**
     * Store new working hours
     */
    public function store(CreateWorkingHoursRequest $request)
    {
        try {
            // Check for overlapping working hours
            $overlap = WorkingHours::where('clinic_id', $request->clinic_id)
                ->where('day_of_week', $request->day_of_week)
                ->when($request->staff_id, function ($q) use ($request) {
                    $q->where('staff_id', $request->staff_id);
                })
                ->where(function ($q) use ($request) {
                    $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                        ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                        ->orWhere(function ($q2) use ($request) {
                            $q2->where('start_time', '<=', $request->start_time)
                                ->where('end_time', '>=', $request->end_time);
                        });
                })
                ->exists();

            if ($overlap) {
                return response()->json([
                    'success' => false,
                    'message' => 'Die Arbeitszeiten überschneiden sich mit bestehenden Zeiten.',
                ], 422);
            }

            $workingHours = WorkingHours::create([
                'clinic_id' => $request->clinic_id,
                'staff_id' => $request->staff_id,
                'day_of_week' => $request->day_of_week,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'is_available' => $request->is_available ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Arbeitszeiten erfolgreich erstellt.',
                'data' => $workingHours->load(['clinic', 'staff.user']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Arbeitszeiten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display specific working hours entry
     */
    public function show($id)
    {
        $workingHours = WorkingHours::with(['clinic', 'staff.user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $workingHours,
        ]);
    }

    /**
     * Update working hours
     */
    public function update(UpdateWorkingHoursRequest $request, $id)
    {
        try {
            $workingHours = WorkingHours::findOrFail($id);

            // Check for overlapping working hours (excluding current record)
            if ($request->has('start_time') || $request->has('end_time') || $request->has('day_of_week')) {
                $startTime = $request->start_time ?? $workingHours->start_time;
                $endTime = $request->end_time ?? $workingHours->end_time;
                $dayOfWeek = $request->day_of_week ?? $workingHours->day_of_week;

                $overlap = WorkingHours::where('clinic_id', $workingHours->clinic_id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('id', '!=', $id)
                    ->when($workingHours->staff_id, function ($q) use ($workingHours) {
                        $q->where('staff_id', $workingHours->staff_id);
                    })
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->whereBetween('start_time', [$startTime, $endTime])
                            ->orWhereBetween('end_time', [$startTime, $endTime])
                            ->orWhere(function ($q2) use ($startTime, $endTime) {
                                $q2->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>=', $endTime);
                            });
                    })
                    ->exists();

                if ($overlap) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Die Arbeitszeiten überschneiden sich mit bestehenden Zeiten.',
                    ], 422);
                }
            }

            $workingHours->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Arbeitszeiten erfolgreich aktualisiert.',
                'data' => $workingHours->load(['clinic', 'staff.user']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren der Arbeitszeiten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete working hours
     */
    public function destroy($id)
    {
        try {
            $workingHours = WorkingHours::findOrFail($id);
            $workingHours->delete();

            return response()->json([
                'success' => true,
                'message' => 'Arbeitszeiten erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Arbeitszeiten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk create working hours for all days
     */
    public function bulkCreate(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'staff_id' => 'required|exists:clinic_staff,id',
            'working_hours' => 'required|array|min:1',
            'working_hours.*.day_of_week' => 'required|string|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'working_hours.*.start_time' => 'required|date_format:H:i',
            'working_hours.*.end_time' => 'required|date_format:H:i',
            'working_hours.*.is_available' => 'required|boolean',
        ]);

        try {
            $createdHours = [];

            // Delete existing working hours for this staff
            StaffWorkingHours::where('staff_id', $request->staff_id)->delete();

            foreach ($request->working_hours as $schedule) {
                // Skip if not available
                if (!$schedule['is_available']) {
                    continue;
                }

                // Convert day name to number (0 = Sunday, 1 = Monday, etc.)
                $dayMap = [
                    'sunday' => 0,
                    'monday' => 1,
                    'tuesday' => 2,
                    'wednesday' => 3,
                    'thursday' => 4,
                    'friday' => 5,
                    'saturday' => 6,
                ];

                $dayNumber = $dayMap[$schedule['day_of_week']] ?? 1;

                $workingHours = StaffWorkingHours::create([
                    'staff_id' => $request->staff_id,
                    'day_of_week' => $dayNumber,
                    'start_time' => $schedule['start_time'],
                    'end_time' => $schedule['end_time'],
                    'is_available' => $schedule['is_available'],
                ]);

                $createdHours[] = $workingHours;
            }

            return response()->json([
                'success' => true,
                'message' => 'Arbeitszeiten erfolgreich erstellt.',
                'data' => $createdHours,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Arbeitszeiten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get day name in German
     */
    private function getDayName($dayOfWeek)
    {
        $days = [
            0 => 'Sonntag',
            1 => 'Montag',
            2 => 'Dienstag',
            3 => 'Mittwoch',
            4 => 'Donnerstag',
            5 => 'Freitag',
            6 => 'Samstag',
        ];

        return $days[$dayOfWeek] ?? 'Unbekannt';
    }
}
