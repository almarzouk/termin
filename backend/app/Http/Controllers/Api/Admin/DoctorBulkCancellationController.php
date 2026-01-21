<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppointmentReassignment;
use App\Models\BulkCancellationOperation;
use App\Models\ClinicStaff;
use App\Services\AppointmentReassignmentService;
use App\Services\BulkCancellationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DoctorBulkCancellationController extends Controller
{
    protected BulkCancellationService $bulkCancellationService;
    protected AppointmentReassignmentService $reassignmentService;

    public function __construct(
        BulkCancellationService $bulkCancellationService,
        AppointmentReassignmentService $reassignmentService
    ) {
        $this->bulkCancellationService = $bulkCancellationService;
        $this->reassignmentService = $reassignmentService;
    }

    /**
     * Preview bulk cancellation operation
     */
    public function preview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|exists:clinic_staff,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Verify staff belongs to user's clinic
            $staff = ClinicStaff::find($request->staff_id);
            $this->authorizeClinicAccess($staff->clinic_id);

            $preview = $this->bulkCancellationService->previewOperation(
                $request->staff_id,
                $request->start_date,
                $request->end_date
            );

            return response()->json([
                'success' => true,
                'data' => $preview,
            ]);
        } catch (\Exception $e) {
            Log::error('Preview operation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to preview operation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create bulk cancellation operation
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'clinic_id' => 'required|exists:clinics,id',
            'staff_id' => 'required|exists:clinic_staff,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|in:sick_leave,emergency,vacation,other',
            'reason_details' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->authorizeClinicAccess($request->clinic_id);

            $operation = $this->bulkCancellationService->createOperation([
                'clinic_id' => $request->clinic_id,
                'staff_id' => $request->staff_id,
                'initiated_by' => auth()->id(),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'reason_details' => $request->reason_details,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Bulk cancellation operation created successfully',
                'data' => $operation->load(['staff.user', 'clinic', 'initiatedBy']),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Create operation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create operation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Execute bulk cancellation operation
     */
    public function execute($id)
    {
        try {
            $operation = BulkCancellationOperation::findOrFail($id);
            $this->authorizeClinicAccess($operation->clinic_id);

            if ($operation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Operation cannot be executed in current status: ' . $operation->status,
                ], 400);
            }

            // Execute in background (you can use jobs for this)
            $this->bulkCancellationService->executeOperation($operation);

            return response()->json([
                'success' => true,
                'message' => 'Bulk cancellation operation executed successfully',
                'data' => $operation->fresh()->load(['reassignments']),
            ]);
        } catch (\Exception $e) {
            Log::error('Execute operation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to execute operation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get operation details
     */
    public function show($id)
    {
        try {
            $operation = BulkCancellationOperation::with([
                'staff.user',
                'clinic',
                'initiatedBy',
                'reassignments.appointment.patient.user',
                'reassignments.originalStaff.user',
                'reassignments.newStaff.user',
            ])->findOrFail($id);

            $this->authorizeClinicAccess($operation->clinic_id);

            $stats = $this->bulkCancellationService->getOperationStats($operation);

            return response()->json([
                'success' => true,
                'data' => [
                    'operation' => $operation,
                    'stats' => $stats,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Operation not found',
            ], 404);
        }
    }

    /**
     * List all operations
     */
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $query = BulkCancellationOperation::with([
                'staff.user',
                'clinic',
                'initiatedBy',
            ]);

            // Filter by clinic for clinic owners
            if ($user->hasRole('clinic_owner')) {
                $clinicIds = $user->clinicsOwned()->pluck('id');
                $query->whereIn('clinic_id', $clinicIds);
            }

            // Apply filters
            if ($request->has('clinic_id')) {
                $this->authorizeClinicAccess($request->clinic_id);
                $query->where('clinic_id', $request->clinic_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('staff_id')) {
                $query->where('staff_id', $request->staff_id);
            }

            $operations = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $operations,
            ]);
        } catch (\Exception $e) {
            Log::error('List operations failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch operations',
            ], 500);
        }
    }

    /**
     * Cancel an operation
     */
    public function cancel($id)
    {
        try {
            $operation = BulkCancellationOperation::findOrFail($id);
            $this->authorizeClinicAccess($operation->clinic_id);

            $this->bulkCancellationService->cancelOperation($operation);

            return response()->json([
                'success' => true,
                'message' => 'Operation cancelled successfully',
                'data' => $operation->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Cancel operation failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel operation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Patient approves reassignment
     */
    public function approveReassignment($reassignmentId)
    {
        try {
            $reassignment = AppointmentReassignment::with(['appointment.patient.user'])
                ->findOrFail($reassignmentId);

            // Verify patient authorization
            $appointment = $reassignment->appointment;
            if ($appointment->patient->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $this->reassignmentService->processPatientApproval($reassignment);

            return response()->json([
                'success' => true,
                'message' => 'Appointment reassignment approved successfully',
                'data' => $reassignment->fresh()->load(['appointment', 'newStaff.user']),
            ]);
        } catch (\Exception $e) {
            Log::error('Approve reassignment failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve reassignment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Patient rejects reassignment
     */
    public function rejectReassignment(Request $request, $reassignmentId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $reassignment = AppointmentReassignment::with(['appointment.patient.user'])
                ->findOrFail($reassignmentId);

            // Verify patient authorization
            $appointment = $reassignment->appointment;
            if ($appointment->patient->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $this->reassignmentService->processPatientRejection(
                $reassignment,
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment reassignment rejected',
                'data' => $reassignment->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Reject reassignment failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject reassignment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper to check clinic access
     */
    protected function authorizeClinicAccess($clinicId)
    {
        $user = auth()->user();

        if ($user->hasRole('super_admin')) {
            return true;
        }

        if ($user->hasRole('clinic_owner')) {
            $clinicIds = $user->clinicsOwned()->pluck('id')->toArray();

            if (!in_array($clinicId, $clinicIds)) {
                abort(403, 'Unauthorized access to this clinic');
            }

            return true;
        }

        abort(403, 'Unauthorized');
    }
}
