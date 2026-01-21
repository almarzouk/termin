<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentDistributionService;
use Illuminate\Http\Request;

class AppointmentAvailabilityController extends Controller
{
    protected $distributionService;

    public function __construct(AppointmentDistributionService $distributionService)
    {
        $this->distributionService = $distributionService;
    }

    /**
     * Get available time slots for a clinic on a specific date
     * GET /api/appointments/available-slots
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'nullable|exists:services,id',
            'doctor_id' => 'nullable|exists:clinic_staff,id',
        ]);

        try {
            $slots = $this->distributionService->getAvailableSlots(
                $request->clinic_id,
                $request->date,
                $request->service_id,
                $request->doctor_id
            );

            return response()->json([
                'success' => true,
                'data' => $slots,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abrufen der verfügbaren Zeitfenster',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get clinic capacity for a specific date
     * GET /api/appointments/clinic-capacity
     */
    public function getClinicCapacity(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'date' => 'required|date',
        ]);

        try {
            $capacity = $this->distributionService->getClinicCapacity(
                $request->clinic_id,
                $request->date
            );

            return response()->json([
                'success' => true,
                'data' => $capacity,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abrufen der Klinikkapazität',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Find best available doctor for a specific time slot
     * POST /api/appointments/find-best-doctor
     */
    public function findBestDoctor(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'service_id' => 'nullable|exists:services,id',
        ]);

        try {
            $doctor = $this->distributionService->findBestDoctor(
                $request->clinic_id,
                $request->date,
                $request->time,
                $request->service_id
            );

            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kein verfügbarer Arzt für diesen Zeitslot',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'doctor_id' => $doctor->id,
                    'doctor_name' => $doctor->user->name ?? 'Unbekannt',
                    'specialty' => $doctor->specialty ?? $doctor->specialization ?? 'Allgemein',
                    'duration' => $doctor->appointment_duration_minutes,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Finden des besten Arztes',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get next available appointment slot
     * GET /api/appointments/next-available
     */
    public function getNextAvailable(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'start_date' => 'nullable|date|after_or_equal:today',
        ]);

        try {
            $nextSlot = $this->distributionService->getNextAvailableSlot(
                $request->clinic_id,
                $request->start_date
            );

            if (!$nextSlot) {
                return response()->json([
                    'success' => false,
                    'message' => 'Keine verfügbaren Termine in den nächsten 30 Tagen',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $nextSlot,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abrufen des nächsten verfügbaren Termins',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get capacity statistics for multiple dates
     * POST /api/appointments/capacity-range
     */
    public function getCapacityRange(Request $request)
    {
        $request->validate([
            'clinic_id' => 'required|exists:clinics,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $startDate = \Carbon\Carbon::parse($request->start_date);
            $endDate = \Carbon\Carbon::parse($request->end_date);

            // Limit to 31 days to prevent excessive load
            if ($startDate->diffInDays($endDate) > 31) {
                return response()->json([
                    'success' => false,
                    'message' => 'Der Datumsbereich darf maximal 31 Tage betragen',
                ], 400);
            }

            $capacityData = [];
            $current = $startDate->copy();

            while ($current->lte($endDate)) {
                $capacity = $this->distributionService->getClinicCapacity(
                    $request->clinic_id,
                    $current->toDateString()
                );
                $capacityData[] = $capacity;
                $current->addDay();
            }

            return response()->json([
                'success' => true,
                'data' => $capacityData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Abrufen der Kapazitätsdaten',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
