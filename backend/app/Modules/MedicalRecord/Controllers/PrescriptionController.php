<?php

namespace App\Modules\MedicalRecord\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\MedicalRecord\Requests\CreatePrescriptionRequest;
use App\Modules\MedicalRecord\Requests\UpdatePrescriptionRequest;
use App\Models\Prescription;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Display prescriptions for a medical record
     */
    public function index(Request $request)
    {
        $request->validate([
            'medical_record_id' => 'required|exists:medical_records,id',
        ]);

        $medicalRecord = MedicalRecord::findOrFail($request->medical_record_id);

        // Check authorization
        if (!$this->canAccessPrescription($medicalRecord)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Rezepte anzuzeigen.',
            ], 403);
        }

        $prescriptions = Prescription::where('medical_record_id', $request->medical_record_id)
            ->when($request->has('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prescriptions,
        ]);
    }

    /**
     * Store a newly created prescription
     */
    public function store(CreatePrescriptionRequest $request)
    {
        try {
            $medicalRecord = MedicalRecord::findOrFail($request->medical_record_id);

            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, Rezepte zu erstellen.',
                ], 403);
            }

            $prescription = Prescription::create([
                'medical_record_id' => $request->medical_record_id,
                'medication_name' => $request->medication_name,
                'dosage' => $request->dosage,
                'frequency' => $request->frequency,
                'duration' => $request->duration,
                'instructions' => $request->instructions,
                'start_date' => $request->start_date ?? now(),
                'end_date' => $request->end_date,
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezept erfolgreich erstellt.',
                'data' => $prescription,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen des Rezepts.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified prescription
     */
    public function show($id)
    {
        $prescription = Prescription::with([
            'medicalRecord.patient',
            'medicalRecord.appointment.service',
            'medicalRecord.appointment.staff.user'
        ])->findOrFail($id);

        // Check authorization
        if (!$this->canAccessPrescription($prescription->medicalRecord)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, dieses Rezept anzuzeigen.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $prescription,
        ]);
    }

    /**
     * Update the specified prescription
     */
    public function update(UpdatePrescriptionRequest $request, $id)
    {
        try {
            $prescription = Prescription::findOrFail($id);

            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, Rezepte zu bearbeiten.',
                ], 403);
            }

            $prescription->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Rezept erfolgreich aktualisiert.',
                'data' => $prescription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des Rezepts.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update prescription status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,completed,discontinued',
        ], [
            'status.required' => 'Der Status ist erforderlich.',
            'status.in' => 'Ungültiger Status.',
        ]);

        try {
            $prescription = Prescription::findOrFail($id);

            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, den Rezeptstatus zu ändern.',
                ], 403);
            }

            $prescription->update([
                'status' => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Rezeptstatus erfolgreich aktualisiert.',
                'data' => $prescription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des Rezeptstatus.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified prescription
     */
    public function destroy($id)
    {
        try {
            $prescription = Prescription::findOrFail($id);

            // Only doctors and super_admin can delete prescriptions
            if (!auth()->user()->hasAnyRole(['super_admin', 'doctor'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nur Ärzte und Super-Administratoren können Rezepte löschen.',
                ], 403);
            }

            $prescription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rezept erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen des Rezepts.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active prescriptions for a patient
     */
    public function activeByPatient($patientId)
    {
        // Check authorization
        if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            // Check if patient is requesting their own records
            $patient = \App\Models\Patient::where('id', $patientId)
                ->where('user_id', auth()->id())
                ->exists();

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, diese Rezepte anzuzeigen.',
                ], 403);
            }
        }

        $prescriptions = Prescription::whereHas('medicalRecord', function ($query) use ($patientId) {
            $query->where('patient_id', $patientId);
        })
            ->where('status', 'active')
            ->with(['medicalRecord.appointment.service'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prescriptions,
        ]);
    }

    /**
     * Check if user can access prescription
     */
    private function canAccessPrescription(MedicalRecord $medicalRecord): bool
    {
        // Staff can access all prescriptions
        if (auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            return true;
        }

        // Patients can only access their own prescriptions
        $patient = \App\Models\Patient::where('id', $medicalRecord->patient_id)
            ->where('user_id', auth()->id())
            ->exists();

        return $patient;
    }
}
