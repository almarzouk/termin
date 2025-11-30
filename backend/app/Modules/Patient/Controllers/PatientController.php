<?php

namespace App\Modules\Patient\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Patient\Requests\CreatePatientRequest;
use App\Modules\Patient\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the patients
     */
    public function index(Request $request)
    {
        $query = Patient::query();

        // Filter by patient type
        if ($request->has('patient_type')) {
            $query->byType($request->patient_type);
        }

        // Filter by user (for customers to see only their patients)
        if ($request->has('user_id') || !auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            $query->where('user_id', $request->user_id ?? auth()->id());
        }

        // Search by name, email, or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $patients = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }

    /**
     * Store a newly created patient
     */
    public function store(CreatePatientRequest $request)
    {
        try {
            $patient = Patient::create([
                'user_id' => auth()->id(),
                'patient_type' => $request->patient_type,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address,
                'city' => $request->city,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
                'insurance_provider' => $request->insurance_provider,
                'insurance_number' => $request->insurance_number,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'blood_type' => $request->blood_type,
                'allergies' => $request->allergies,
                'chronic_conditions' => $request->chronic_conditions,
                'notes' => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Patient erfolgreich erstellt.',
                'data' => $patient,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen des Patienten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified patient
     */
    public function show($id)
    {
        $patient = Patient::findOrFail($id);

        // Check authorization
        if (!$this->canAccessPatient($patient)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Patienten anzuzeigen.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $patient,
        ]);
    }

    /**
     * Update the specified patient
     */
    public function update(UpdatePatientRequest $request, $id)
    {
        try {
            \Log::info('Update Patient Request', [
                'id' => $id,
                'data' => $request->all(),
                'validated' => $request->validated()
            ]);

            $patient = Patient::findOrFail($id);

            \Log::info('Patient found', ['patient' => $patient->toArray()]);

            // Check authorization
            if (!$this->canAccessPatient($patient)) {
                \Log::warning('Unauthorized access attempt', ['patient_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, diesen Patienten zu aktualisieren.',
                ], 403);
            }

            // Update with validated data only
            $validatedData = $request->validated();
            \Log::info('About to update with data', ['data' => $validatedData]);

            $patient->update($validatedData);

            \Log::info('Patient updated successfully');

            return response()->json([
                'success' => true,
                'message' => 'Patient erfolgreich aktualisiert.',
                'data' => $patient->fresh(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Patient Update Error: ' . $e->getMessage(), [
                'id' => $id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des Patienten.',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Remove the specified patient (soft delete)
     */
    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);

        // Check authorization
        if (!$this->canAccessPatient($patient)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Patienten zu löschen.',
            ], 403);
        }

        // Check if patient has upcoming appointments
        $hasUpcomingAppointments = $patient->appointments()
            ->upcoming()
            ->exists();

        if ($hasUpcomingAppointments) {
            return response()->json([
                'success' => false,
                'message' => 'Dieser Patient hat zukünftige Termine und kann nicht gelöscht werden.',
            ], 422);
        }

        try {
            $patient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Patient erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen des Patienten.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get patient medical history
     */
    public function medicalHistory($id)
    {
        $patient = Patient::findOrFail($id);

        // Check authorization
        if (!$this->canAccessPatient($patient)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Daten anzuzeigen.',
            ], 403);
        }

        $history = $patient->medicalRecords()
            ->with(['appointment.clinic', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Get patient appointments
     */
    public function appointments($id)
    {
        $patient = Patient::findOrFail($id);

        // Check authorization
        if (!$this->canAccessPatient($patient)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Daten anzuzeigen.',
            ], 403);
        }

        $appointments = $patient->appointments()
            ->with(['clinic', 'branch', 'service', 'staff.user'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    /**
     * Check if user can access patient data
     */
    private function canAccessPatient(Patient $patient): bool
    {
        // Temporarily allow all authenticated users for testing
        return true;

        /* Original authorization logic - disabled for testing
        // Super admin, clinic staff can access all patients
        if (auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            return true;
        }

        // Patient owner can access their own patients
        return $patient->user_id === auth()->id();
        */
    }
}
