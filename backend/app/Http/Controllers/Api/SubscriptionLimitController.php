<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;

class SubscriptionLimitController extends Controller
{
    protected $limitService;

    public function __construct(SubscriptionLimitService $limitService)
    {
        $this->limitService = $limitService;
    }

    /**
     * Get all subscription limits for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $limits = $this->limitService->getAllLimits($user);

        return response()->json([
            'success' => true,
            'data' => $limits,
        ]);
    }

    /**
     * Check if user can create a clinic
     */
    public function checkClinicLimit(Request $request)
    {
        $user = $request->user();
        $result = $this->limitService->canCreateClinic($user);

        return response()->json([
            'success' => $result['allowed'],
            'data' => $result,
        ], $result['allowed'] ? 200 : 403);
    }

    /**
     * Check if user can create a doctor
     */
    public function checkDoctorLimit(Request $request)
    {
        $user = $request->user();
        $result = $this->limitService->canCreateDoctor($user);

        return response()->json([
            'success' => $result['allowed'],
            'data' => $result,
        ], $result['allowed'] ? 200 : 403);
    }

    /**
     * Check if user can create staff
     */
    public function checkStaffLimit(Request $request)
    {
        $user = $request->user();
        $result = $this->limitService->canCreateStaff($user);

        return response()->json([
            'success' => $result['allowed'],
            'data' => $result,
        ], $result['allowed'] ? 200 : 403);
    }

    /**
     * Check if user can create appointment
     */
    public function checkAppointmentLimit(Request $request)
    {
        $user = $request->user();
        $result = $this->limitService->canCreateAppointment($user);

        return response()->json([
            'success' => $result['allowed'],
            'data' => $result,
        ], $result['allowed'] ? 200 : 403);
    }
}
