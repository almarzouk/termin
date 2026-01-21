<?php

namespace App\Modules\CancellationPolicy\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CancellationPolicy;
use App\Models\CancellationReason;
use Illuminate\Http\Request;

class CancellationPolicyController extends Controller
{
    /**
     * Get cancellation policy for a clinic
     */
    public function show($clinicId)
    {
        $policy = CancellationPolicy::with('clinic')
            ->where('clinic_id', $clinicId)
            ->first();

        if (!$policy) {
            return response()->json([
                'success' => false,
                'message' => 'Keine Stornierungsrichtlinie gefunden.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $policy,
        ]);
    }

    /**
     * Update or create cancellation policy
     */
    public function update(Request $request, $clinicId)
    {
        $request->validate([
            'minimum_notice_hours' => 'required|integer|min:0',
            'late_cancellation_fee' => 'required|numeric|min:0',
            'max_cancellations_per_month' => 'required|integer|min:0',
            'auto_block_after_cancellations' => 'nullable|integer|min:1',
            'allow_patient_cancellation' => 'required|boolean',
            'require_reason' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $policy = CancellationPolicy::updateOrCreate(
            ['clinic_id' => $clinicId],
            $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Stornierungsrichtlinie aktualisiert.',
            'data' => $policy,
        ]);
    }

    /**
     * Get cancellation reasons for a clinic
     */
    public function getReasons($clinicId)
    {
        $reasons = CancellationReason::forClinic($clinicId)
            ->active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reasons,
        ]);
    }

    /**
     * Create a cancellation reason
     */
    public function createReason(Request $request, $clinicId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $reason = CancellationReason::create([
            'clinic_id' => $clinicId,
            'reason' => $request->reason,
            'is_active' => $request->is_active ?? true,
            'display_order' => $request->display_order ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Grund erstellt.',
            'data' => $reason,
        ], 201);
    }

    /**
     * Update a cancellation reason
     */
    public function updateReason(Request $request, $clinicId, $reasonId)
    {
        $request->validate([
            'reason' => 'string|max:255',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ]);

        $reason = CancellationReason::where('clinic_id', $clinicId)
            ->findOrFail($reasonId);

        $reason->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Grund aktualisiert.',
            'data' => $reason,
        ]);
    }

    /**
     * Delete a cancellation reason
     */
    public function deleteReason($clinicId, $reasonId)
    {
        $reason = CancellationReason::where('clinic_id', $clinicId)
            ->findOrFail($reasonId);

        $reason->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grund gelöscht.',
        ]);
    }
}
