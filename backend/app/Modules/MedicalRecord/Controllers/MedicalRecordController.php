<?php

namespace App\Modules\MedicalRecord\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\MedicalRecord\Requests\CreateMedicalRecordRequest;
use App\Modules\MedicalRecord\Requests\UpdateMedicalRecordRequest;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MedicalRecordController extends Controller
{
    /**
     * Display a listing of medical records
     */
    public function index(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        $query = MedicalRecord::with([
            'patient',
            'appointment.service',
            'appointment.staff.user',
            'prescriptions',
            'createdBy'
        ])->where('patient_id', $request->patient_id);

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by diagnosis
        if ($request->has('diagnosis')) {
            $query->where('diagnosis', 'like', '%' . $request->diagnosis . '%');
        }

        // Sort by date
        $query->orderBy('created_at', $request->get('sort_order', 'desc'));

        // Check authorization
        if (!$this->canAccessPatientRecords($request->patient_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Datensätze anzuzeigen.',
            ], 403);
        }

        $records = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * Store a newly created medical record
     */
    public function store(CreateMedicalRecordRequest $request)
    {
        try {
            // Check if appointment is completed
            $appointment = Appointment::findOrFail($request->appointment_id);

            if ($appointment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Medizinische Datensätze können nur für abgeschlossene Termine erstellt werden.',
                ], 422);
            }

            // Check if medical record already exists for this appointment
            if (MedicalRecord::where('appointment_id', $request->appointment_id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Für diesen Termin existiert bereits ein medizinischer Datensatz.',
                ], 422);
            }

            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, medizinische Datensätze zu erstellen.',
                ], 403);
            }

            DB::beginTransaction();

            $medicalRecord = MedicalRecord::create([
                'appointment_id' => $request->appointment_id,
                'patient_id' => $request->patient_id,
                'clinic_id' => $appointment->clinic_id,
                'created_by' => auth()->id(),
                'diagnosis' => $request->diagnosis,
                'symptoms' => $request->symptoms,
                'treatment_plan' => $request->treatment_plan,
                'notes' => $request->notes,
                'follow_up_date' => $request->follow_up_date,
            ]);

            // Create prescriptions if provided
            if ($request->has('prescriptions') && is_array($request->prescriptions)) {
                foreach ($request->prescriptions as $prescription) {
                    Prescription::create([
                        'medical_record_id' => $medicalRecord->id,
                        'medication_name' => $prescription['medication_name'],
                        'dosage' => $prescription['dosage'],
                        'frequency' => $prescription['frequency'],
                        'duration' => $prescription['duration'],
                        'instructions' => $prescription['instructions'] ?? null,
                        'status' => 'active',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Medizinischer Datensatz erfolgreich erstellt.',
                'data' => $medicalRecord->load(['patient', 'appointment', 'prescriptions', 'createdBy']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen des medizinischen Datensatzes.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified medical record
     */
    public function show($id)
    {
        $medicalRecord = MedicalRecord::with([
            'patient',
            'appointment.service',
            'appointment.staff.user',
            'appointment.clinic',
            'prescriptions',
            'createdBy',
            'updatedBy'
        ])->findOrFail($id);

        // Check authorization
        if (!$this->canAccessPatientRecords($medicalRecord->patient_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diesen Datensatz anzuzeigen.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $medicalRecord,
        ]);
    }

    /**
     * Update the specified medical record
     */
    public function update(UpdateMedicalRecordRequest $request, $id)
    {
        try {
            $medicalRecord = MedicalRecord::findOrFail($id);

            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, medizinische Datensätze zu bearbeiten.',
                ], 403);
            }

            $medicalRecord->update([
                'diagnosis' => $request->diagnosis ?? $medicalRecord->diagnosis,
                'symptoms' => $request->symptoms ?? $medicalRecord->symptoms,
                'treatment_plan' => $request->treatment_plan ?? $medicalRecord->treatment_plan,
                'notes' => $request->notes ?? $medicalRecord->notes,
                'follow_up_date' => $request->follow_up_date ?? $medicalRecord->follow_up_date,
                'updated_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Medizinischer Datensatz erfolgreich aktualisiert.',
                'data' => $medicalRecord->load(['patient', 'appointment', 'prescriptions', 'createdBy', 'updatedBy']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Aktualisieren des medizinischen Datensatzes.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified medical record
     */
    public function destroy($id)
    {
        try {
            $medicalRecord = MedicalRecord::findOrFail($id);

            // Only super_admin can delete medical records
            if (!auth()->user()->hasRole('super_admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nur Super-Administratoren können medizinische Datensätze löschen.',
                ], 403);
            }

            $medicalRecord->delete();

            return response()->json([
                'success' => true,
                'message' => 'Medizinischer Datensatz erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen des medizinischen Datensatzes.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get patient medical history summary
     */
    public function patientHistory($patientId)
    {
        // Check authorization
        if (!$this->canAccessPatientRecords($patientId)) {
            return response()->json([
                'success' => false,
                'message' => 'Sie sind nicht berechtigt, diese Daten anzuzeigen.',
            ], 403);
        }

        $patient = Patient::with(['user'])->findOrFail($patientId);

        $records = MedicalRecord::with([
            'appointment.service',
            'appointment.staff.user',
            'prescriptions'
        ])->where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'patient' => $patient,
            'total_records' => $records->count(),
            'recent_diagnoses' => $records->pluck('diagnosis')->unique()->take(10)->values(),
            'active_prescriptions' => Prescription::whereHas('medicalRecord', function ($query) use ($patientId) {
                $query->where('patient_id', $patientId);
            })->where('status', 'active')->get(),
            'upcoming_follow_ups' => $records->whereNotNull('follow_up_date')
                ->where('follow_up_date', '>=', now())
                ->sortBy('follow_up_date')
                ->values(),
            'records' => $records,
        ];

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Check if user can access patient records
     */
    private function canAccessPatientRecords($patientId): bool
    {
        // Staff and admins can access all records
        if (auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'doctor', 'nurse', 'receptionist'])) {
            return true;
        }

        // Patients can only access their own records
        $patient = Patient::where('id', $patientId)
            ->where('user_id', auth()->id())
            ->exists();

        return $patient;
    }
}
