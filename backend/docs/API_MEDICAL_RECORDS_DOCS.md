# Medical Records & Prescriptions API Documentation

## Overview

The Medical Records API provides comprehensive management of patient medical records, diagnoses, treatment plans, and prescriptions. This system integrates with completed appointments and supports full medical history tracking.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Required (Bearer Token via Laravel Sanctum)  
**Total Endpoints:** 13

---

## Medical Records Module

### Overview

Medical records are created after appointments are completed and contain diagnosis, treatment plans, and associated prescriptions.

**Total Endpoints:** 6

---

### 1. List Medical Records

Get medical records for a specific patient.

**Endpoint:** `GET /api/medical-records`  
**Auth:** Required  
**Roles:** Staff can view all records, Patients can only view their own

**Query Parameters:**

-   `patient_id` (required): Patient ID to filter records
-   `date_from` (optional): Start date filter (Y-m-d)
-   `date_to` (optional): End date filter (Y-m-d)
-   `diagnosis` (optional): Search by diagnosis keyword
-   `sort_order` (optional): Sort order (asc/desc), default: desc
-   `per_page` (optional): Results per page, default: 15

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/medical-records?patient_id=5&date_from=2024-01-01" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "appointment_id": 25,
                "patient_id": 5,
                "clinic_id": 1,
                "diagnosis": "Karies im oberen rechten Backenzahn",
                "symptoms": "Zahnschmerzen, Empfindlichkeit bei kalten Getränken",
                "treatment_plan": "Kariesentfernung und Füllung",
                "notes": "Patient zeigt gute Mundhygiene",
                "follow_up_date": "2024-03-15",
                "created_by": 10,
                "updated_by": null,
                "created_at": "2024-02-15T14:30:00.000000Z",
                "updated_at": "2024-02-15T14:30:00.000000Z",
                "patient": {
                    "id": 5,
                    "name": "Max Mustermann",
                    "date_of_birth": "1985-05-15"
                },
                "appointment": {
                    "id": 25,
                    "appointment_date": "2024-02-15",
                    "service": {
                        "id": 3,
                        "name": "Zahnfüllung"
                    },
                    "staff": {
                        "id": 10,
                        "user": {
                            "name": "Dr. Anna Weber"
                        }
                    }
                },
                "prescriptions": [
                    {
                        "id": 1,
                        "medication_name": "Ibuprofen 400mg",
                        "dosage": "400mg",
                        "frequency": "3x täglich",
                        "duration": "5 Tage",
                        "status": "active"
                    }
                ],
                "createdBy": {
                    "id": 10,
                    "name": "Dr. Anna Weber"
                }
            }
        ],
        "total": 15,
        "per_page": 15,
        "last_page": 1
    }
}
```

---

### 2. Create Medical Record

Create a new medical record for a completed appointment.

**Endpoint:** `POST /api/medical-records`  
**Auth:** Required  
**Roles:** Doctor, Nurse, Clinic Manager, Admin only

**Request Body:**

```json
{
    "appointment_id": 25,
    "patient_id": 5,
    "diagnosis": "Karies im oberen rechten Backenzahn",
    "symptoms": "Zahnschmerzen, Empfindlichkeit",
    "treatment_plan": "Kariesentfernung und Füllung",
    "notes": "Patient zeigt gute Mundhygiene",
    "follow_up_date": "2024-03-15",
    "prescriptions": [
        {
            "medication_name": "Ibuprofen 400mg",
            "dosage": "400mg",
            "frequency": "3x täglich",
            "duration": "5 Tage",
            "instructions": "Nach dem Essen einnehmen"
        }
    ]
}
```

**Business Logic:**

-   Appointment must have status "completed"
-   Only one medical record allowed per appointment
-   Prescriptions are created automatically if provided
-   `created_by` is set to authenticated user

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/medical-records" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 25,
    "patient_id": 5,
    "diagnosis": "Karies im oberen rechten Backenzahn",
    "symptoms": "Zahnschmerzen",
    "treatment_plan": "Kariesentfernung und Füllung",
    "prescriptions": [
      {
        "medication_name": "Ibuprofen 400mg",
        "dosage": "400mg",
        "frequency": "3x täglich",
        "duration": "5 Tage"
      }
    ]
  }'
```

**Response Example (201 Created):**

```json
{
  "success": true,
  "message": "Medizinischer Datensatz erfolgreich erstellt.",
  "data": {
    "id": 1,
    "appointment_id": 25,
    "patient_id": 5,
    "clinic_id": 1,
    "diagnosis": "Karies im oberen rechten Backenzahn",
    "symptoms": "Zahnschmerzen",
    "treatment_plan": "Kariesentfernung und Füllung",
    "notes": null,
    "follow_up_date": null,
    "created_by": 10,
    "created_at": "2024-02-15T14:30:00.000000Z",
    "patient": {...},
    "appointment": {...},
    "prescriptions": [...]
  }
}
```

**Error Responses:**

**422 - Appointment not completed:**

```json
{
    "success": false,
    "message": "Medizinische Datensätze können nur für abgeschlossene Termine erstellt werden."
}
```

**422 - Record already exists:**

```json
{
    "success": false,
    "message": "Für diesen Termin existiert bereits ein medizinischer Datensatz."
}
```

---

### 3. Show Medical Record Details

Get detailed information about a specific medical record.

**Endpoint:** `GET /api/medical-records/{id}`  
**Auth:** Required  
**Roles:** Staff can view all, Patients can only view their own

**Path Parameters:**

-   `id`: Medical record ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/medical-records/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "appointment_id": 25,
        "patient_id": 5,
        "clinic_id": 1,
        "diagnosis": "Karies im oberen rechten Backenzahn",
        "symptoms": "Zahnschmerzen, Empfindlichkeit",
        "treatment_plan": "Kariesentfernung und Füllung",
        "notes": "Patient zeigt gute Mundhygiene",
        "follow_up_date": "2024-03-15",
        "created_by": 10,
        "updated_by": null,
        "created_at": "2024-02-15T14:30:00.000000Z",
        "updated_at": "2024-02-15T14:30:00.000000Z",
        "patient": {
            "id": 5,
            "name": "Max Mustermann",
            "date_of_birth": "1985-05-15",
            "blood_type": "A+",
            "allergies": "Penicillin"
        },
        "appointment": {
            "id": 25,
            "appointment_date": "2024-02-15",
            "start_time": "10:00:00",
            "service": {
                "id": 3,
                "name": "Zahnfüllung",
                "duration": 30
            },
            "staff": {
                "id": 10,
                "user": {
                    "name": "Dr. Anna Weber",
                    "email": "a.weber@example.com"
                }
            },
            "clinic": {
                "id": 1,
                "name": "Zahnarztpraxis Dr. Schmidt"
            }
        },
        "prescriptions": [
            {
                "id": 1,
                "medication_name": "Ibuprofen 400mg",
                "dosage": "400mg",
                "frequency": "3x täglich",
                "duration": "5 Tage",
                "instructions": "Nach dem Essen einnehmen",
                "status": "active",
                "start_date": "2024-02-15",
                "end_date": "2024-02-20"
            }
        ],
        "createdBy": {
            "id": 10,
            "name": "Dr. Anna Weber"
        }
    }
}
```

---

### 4. Update Medical Record

Update an existing medical record.

**Endpoint:** `PUT /api/medical-records/{id}`  
**Auth:** Required  
**Roles:** Doctor, Nurse, Clinic Manager, Admin only

**Path Parameters:**

-   `id`: Medical record ID

**Request Body:**

```json
{
    "diagnosis": "Updated diagnosis",
    "symptoms": "Updated symptoms",
    "treatment_plan": "Updated treatment plan",
    "notes": "Additional notes",
    "follow_up_date": "2024-04-15"
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Request Example:**

```bash
curl -X PUT "http://localhost:8000/api/medical-records/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Patient responded well to treatment",
    "follow_up_date": "2024-04-15"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Medizinischer Datensatz erfolgreich aktualisiert.",
    "data": {
        "id": 1,
        "diagnosis": "Karies im oberen rechten Backenzahn",
        "notes": "Patient responded well to treatment",
        "follow_up_date": "2024-04-15",
        "updated_by": 10,
        "updated_at": "2024-02-20T10:15:00.000000Z"
    }
}
```

---

### 5. Delete Medical Record

Delete a medical record (Super Admin only).

**Endpoint:** `DELETE /api/medical-records/{id}`  
**Auth:** Required  
**Roles:** Super Admin only

**Path Parameters:**

-   `id`: Medical record ID

**Request Example:**

```bash
curl -X DELETE "http://localhost:8000/api/medical-records/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Medizinischer Datensatz erfolgreich gelöscht."
}
```

**Error Response (403 Forbidden):**

```json
{
    "success": false,
    "message": "Nur Super-Administratoren können medizinische Datensätze löschen."
}
```

---

### 6. Get Patient Medical History

Get comprehensive medical history for a patient.

**Endpoint:** `GET /api/medical-records/patient/{patient}/history`  
**Auth:** Required  
**Roles:** Staff can view all, Patients can only view their own

**Path Parameters:**

-   `patient`: Patient ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/medical-records/patient/5/history" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
  "success": true,
  "data": {
    "patient": {
      "id": 5,
      "name": "Max Mustermann",
      "date_of_birth": "1985-05-15",
      "blood_type": "A+",
      "allergies": "Penicillin",
      "chronic_conditions": "Diabetes Typ 2"
    },
    "total_records": 15,
    "recent_diagnoses": [
      "Karies im oberen rechten Backenzahn",
      "Zahnfleischentzündung",
      "Parodontitis"
    ],
    "active_prescriptions": [
      {
        "id": 1,
        "medication_name": "Ibuprofen 400mg",
        "dosage": "400mg",
        "frequency": "3x täglich",
        "duration": "5 Tage",
        "status": "active"
      }
    ],
    "upcoming_follow_ups": [
      {
        "id": 2,
        "diagnosis": "Zahnfleischentzündung",
        "follow_up_date": "2024-03-20",
        "appointment": {
          "service": {
            "name": "Kontrolle"
          }
        }
      }
    ],
    "records": [
      {
        "id": 1,
        "diagnosis": "Karies im oberen rechten Backenzahn",
        "created_at": "2024-02-15T14:30:00.000000Z",
        "appointment": {...},
        "prescriptions": [...]
      }
    ]
  }
}
```

---

## Prescriptions Module

### Overview

Prescriptions are medications prescribed to patients as part of their medical records.

**Total Endpoints:** 7

---

### 1. List Prescriptions

Get prescriptions for a specific medical record.

**Endpoint:** `GET /api/prescriptions`  
**Auth:** Required  
**Roles:** Staff can view all, Patients can only view their own

**Query Parameters:**

-   `medical_record_id` (required): Medical record ID
-   `status` (optional): Filter by status (active, completed, discontinued)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/prescriptions?medical_record_id=1&status=active" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "medical_record_id": 1,
            "medication_name": "Ibuprofen 400mg",
            "dosage": "400mg",
            "frequency": "3x täglich",
            "duration": "5 Tage",
            "instructions": "Nach dem Essen einnehmen",
            "start_date": "2024-02-15",
            "end_date": "2024-02-20",
            "status": "active",
            "created_at": "2024-02-15T14:30:00.000000Z"
        }
    ]
}
```

---

### 2. Create Prescription

Add a new prescription to a medical record.

**Endpoint:** `POST /api/prescriptions`  
**Auth:** Required  
**Roles:** Doctor, Clinic Manager, Admin only

**Request Body:**

```json
{
    "medical_record_id": 1,
    "medication_name": "Amoxicillin 500mg",
    "dosage": "500mg",
    "frequency": "3x täglich",
    "duration": "7 Tage",
    "instructions": "Mit Wasser einnehmen",
    "start_date": "2024-02-15",
    "end_date": "2024-02-22"
}
```

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/prescriptions" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medical_record_id": 1,
    "medication_name": "Amoxicillin 500mg",
    "dosage": "500mg",
    "frequency": "3x täglich",
    "duration": "7 Tage"
  }'
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Rezept erfolgreich erstellt.",
    "data": {
        "id": 2,
        "medical_record_id": 1,
        "medication_name": "Amoxicillin 500mg",
        "dosage": "500mg",
        "frequency": "3x täglich",
        "duration": "7 Tage",
        "status": "active",
        "start_date": "2024-02-15",
        "created_at": "2024-02-15T15:00:00.000000Z"
    }
}
```

---

### 3. Show Prescription Details

Get detailed information about a specific prescription.

**Endpoint:** `GET /api/prescriptions/{id}`  
**Auth:** Required  
**Roles:** Staff can view all, Patients can only view their own

**Path Parameters:**

-   `id`: Prescription ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/prescriptions/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "medical_record_id": 1,
        "medication_name": "Ibuprofen 400mg",
        "dosage": "400mg",
        "frequency": "3x täglich",
        "duration": "5 Tage",
        "instructions": "Nach dem Essen einnehmen",
        "start_date": "2024-02-15",
        "end_date": "2024-02-20",
        "status": "active",
        "created_at": "2024-02-15T14:30:00.000000Z",
        "medicalRecord": {
            "id": 1,
            "diagnosis": "Karies",
            "patient": {
                "id": 5,
                "name": "Max Mustermann"
            },
            "appointment": {
                "service": {
                    "name": "Zahnfüllung"
                },
                "staff": {
                    "user": {
                        "name": "Dr. Anna Weber"
                    }
                }
            }
        }
    }
}
```

---

### 4. Update Prescription

Update prescription details.

**Endpoint:** `PUT /api/prescriptions/{id}`  
**Auth:** Required  
**Roles:** Doctor, Clinic Manager, Admin only

**Path Parameters:**

-   `id`: Prescription ID

**Request Body:**

```json
{
    "medication_name": "Ibuprofen 600mg",
    "dosage": "600mg",
    "frequency": "2x täglich",
    "duration": "7 Tage",
    "instructions": "Mit Nahrung einnehmen",
    "status": "active"
}
```

**Request Example:**

```bash
curl -X PUT "http://localhost:8000/api/prescriptions/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "2x täglich",
    "duration": "7 Tage"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Rezept erfolgreich aktualisiert.",
    "data": {
        "id": 1,
        "frequency": "2x täglich",
        "duration": "7 Tage",
        "updated_at": "2024-02-16T10:00:00.000000Z"
    }
}
```

---

### 5. Update Prescription Status

Change prescription status (active, completed, discontinued).

**Endpoint:** `PATCH /api/prescriptions/{id}/status`  
**Auth:** Required  
**Roles:** Doctor, Clinic Manager, Admin only

**Path Parameters:**

-   `id`: Prescription ID

**Request Body:**

```json
{
    "status": "completed"
}
```

**Allowed Status Values:**

-   `active` - Currently active
-   `completed` - Treatment completed
-   `discontinued` - Stopped before completion

**Request Example:**

```bash
curl -X PATCH "http://localhost:8000/api/prescriptions/1/status" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Rezeptstatus erfolgreich aktualisiert.",
    "data": {
        "id": 1,
        "status": "completed",
        "updated_at": "2024-02-20T14:00:00.000000Z"
    }
}
```

---

### 6. Delete Prescription

Delete a prescription (Doctors and Super Admin only).

**Endpoint:** `DELETE /api/prescriptions/{id}`  
**Auth:** Required  
**Roles:** Doctor, Super Admin only

**Path Parameters:**

-   `id`: Prescription ID

**Request Example:**

```bash
curl -X DELETE "http://localhost:8000/api/prescriptions/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Rezept erfolgreich gelöscht."
}
```

**Error Response (403 Forbidden):**

```json
{
    "success": false,
    "message": "Nur Ärzte und Super-Administratoren können Rezepte löschen."
}
```

---

### 7. Get Active Prescriptions by Patient

Get all active prescriptions for a specific patient.

**Endpoint:** `GET /api/prescriptions/patient/{patient}/active`  
**Auth:** Required  
**Roles:** Staff can view all, Patients can only view their own

**Path Parameters:**

-   `patient`: Patient ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/prescriptions/patient/5/active" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "medical_record_id": 1,
            "medication_name": "Ibuprofen 400mg",
            "dosage": "400mg",
            "frequency": "3x täglich",
            "duration": "5 Tage",
            "instructions": "Nach dem Essen einnehmen",
            "status": "active",
            "start_date": "2024-02-15",
            "end_date": "2024-02-20",
            "medicalRecord": {
                "diagnosis": "Karies",
                "appointment": {
                    "service": {
                        "name": "Zahnfüllung"
                    }
                }
            }
        },
        {
            "id": 3,
            "medication_name": "Paracetamol 500mg",
            "dosage": "500mg",
            "frequency": "Bei Bedarf",
            "status": "active"
        }
    ]
}
```

---

## Authorization Rules

### Medical Records:

-   **Create:** Doctor, Nurse, Clinic Manager, Admin, Super Admin
-   **Read:** Staff (all records), Patients (own records only)
-   **Update:** Doctor, Nurse, Clinic Manager, Admin, Super Admin
-   **Delete:** Super Admin only

### Prescriptions:

-   **Create:** Doctor, Clinic Manager, Admin, Super Admin
-   **Read:** Staff (all prescriptions), Patients (own prescriptions only)
-   **Update:** Doctor, Clinic Manager, Admin, Super Admin
-   **Delete:** Doctor, Super Admin only

---

## Validation Rules

### Create Medical Record:

-   `appointment_id`: Required, must exist, must be completed
-   `patient_id`: Required, must exist
-   `diagnosis`: Required, string
-   `symptoms`: Optional, string
-   `treatment_plan`: Optional, string
-   `notes`: Optional, string
-   `follow_up_date`: Optional, date, must be after today
-   `prescriptions`: Optional, array
-   `prescriptions.*.medication_name`: Required, string, max 255
-   `prescriptions.*.dosage`: Required, string, max 255
-   `prescriptions.*.frequency`: Required, string, max 255
-   `prescriptions.*.duration`: Required, string, max 255
-   `prescriptions.*.instructions`: Optional, string

### Update Medical Record:

-   All fields optional
-   `follow_up_date`: If provided, must be after today

### Create Prescription:

-   `medical_record_id`: Required, must exist
-   `medication_name`: Required, string, max 255
-   `dosage`: Required, string, max 255
-   `frequency`: Required, string, max 255
-   `duration`: Required, string, max 255
-   `instructions`: Optional, string
-   `start_date`: Optional, date
-   `end_date`: Optional, date, must be after start_date

### Update Prescription:

-   All fields optional
-   `status`: If provided, must be: active, completed, or discontinued
-   `end_date`: If provided, must be after start_date

---

## Business Rules

1. **Medical Record Creation:**

    - Only for completed appointments
    - One record per appointment
    - Prescriptions created automatically if provided
    - `created_by` tracks who created the record

2. **Prescription Status:**

    - `active`: Current medication
    - `completed`: Finished treatment
    - `discontinued`: Stopped early

3. **Access Control:**

    - Staff: Full access to clinic patients
    - Patients: Only own records
    - Super Admin: Full access

4. **Data Integrity:**
    - Medical records cannot be deleted (except by super admin)
    - All changes tracked with `updated_by`
    - Soft deletes available for audit trail

---

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | Success                                  |
| 201         | Created                                  |
| 403         | Forbidden (insufficient permissions)     |
| 404         | Not Found                                |
| 422         | Unprocessable Entity (validation errors) |
| 500         | Internal Server Error                    |

---

## Complete Workflow Example

### Full Medical Record Workflow:

**Step 1: Complete Appointment**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/complete" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Step 2: Create Medical Record with Prescriptions**

```bash
curl -X POST "http://localhost:8000/api/medical-records" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": 25,
    "patient_id": 5,
    "diagnosis": "Karies im oberen rechten Backenzahn",
    "symptoms": "Zahnschmerzen, Empfindlichkeit",
    "treatment_plan": "Kariesentfernung und Füllung durchgeführt",
    "notes": "Patient gut kooperiert",
    "follow_up_date": "2024-03-15",
    "prescriptions": [
      {
        "medication_name": "Ibuprofen 400mg",
        "dosage": "400mg",
        "frequency": "3x täglich",
        "duration": "5 Tage",
        "instructions": "Nach dem Essen mit Wasser einnehmen"
      }
    ]
  }'
```

**Step 3: View Patient History**

```bash
curl -X GET "http://localhost:8000/api/medical-records/patient/5/history" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

**Step 4: Update Prescription Status**

```bash
curl -X PATCH "http://localhost:8000/api/prescriptions/1/status" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## Response Format

All responses follow this structure:

**Success Response:**

```json
{
    "success": true,
    "message": "German success message",
    "data": {
        /* response data */
    }
}
```

**Error Response:**

```json
{
    "success": false,
    "message": "German error message",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

---

## Notes

-   All validation messages in German
-   Medical records use soft deletes
-   Activity logging enabled for audit trail
-   Relationships: medical records ↔ appointments ↔ patients
-   Prescriptions linked to medical records
-   Follow-up dates tracked automatically

---

**Total API Endpoints: 67**

-   Authentication: 7 endpoints
-   Clinics: 5 endpoints
-   Services: 7 endpoints
-   Branches: 6 endpoints
-   Staff: 7 endpoints
-   Patients: 8 endpoints
-   Appointments: 8 endpoints
-   Working Hours: 6 endpoints
-   Medical Records: 6 endpoints
-   Prescriptions: 7 endpoints

**Last Updated:** Sprint 6 - November 2025
