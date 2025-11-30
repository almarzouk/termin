# Appointment Management API Documentation

## Overview

The Appointment API provides comprehensive appointment booking and management functionality with availability checking, status workflow, and role-based access control.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Required (Bearer Token via Laravel Sanctum)  
**Total Endpoints:** 8

---

## Status Workflow

```
pending → confirmed → completed
              ↓
          cancelled / no_show
```

-   **pending**: Initial status when appointment is created
-   **confirmed**: Staff confirms the appointment
-   **completed**: Staff marks appointment as completed (requires confirmed status)
-   **cancelled**: Appointment cancelled by patient or staff
-   **no_show**: Patient didn't show up for confirmed appointment

---

## Endpoints

### 1. List Appointments

Get list of appointments with role-based filtering.

**Endpoint:** `GET /api/appointments`  
**Auth:** Required  
**Roles:** All authenticated users

**Query Parameters:**

-   `status` (optional): Filter by status (pending, confirmed, completed, cancelled, no_show)
-   `clinic_id` (optional): Filter by clinic
-   `date` (optional): Filter by specific date (Y-m-d format)
-   `staff_id` (optional): Filter by staff member
-   `patient_id` (optional): Filter by patient

**Role-Based Filtering:**

-   **Customers:** See only their own appointments
-   **Staff/Admins:** See all appointments for their clinic(s)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/appointments?status=confirmed&date=2024-02-15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termine erfolgreich abgerufen",
    "data": [
        {
            "id": 1,
            "appointment_number": "APT-20240215-001",
            "clinic_id": 1,
            "branch_id": 2,
            "patient_id": 5,
            "service_id": 3,
            "staff_id": 10,
            "appointment_date": "2024-02-15",
            "start_time": "10:00:00",
            "end_time": "10:30:00",
            "status": "confirmed",
            "notes": "Erste Konsultation",
            "cancellation_reason": null,
            "created_at": "2024-02-10T12:00:00.000000Z",
            "updated_at": "2024-02-12T14:30:00.000000Z",
            "clinic": {
                "id": 1,
                "name": "Zahnarztpraxis Dr. Schmidt"
            },
            "branch": {
                "id": 2,
                "name": "Filiale Mitte"
            },
            "patient": {
                "id": 5,
                "name": "Max Mustermann"
            },
            "service": {
                "id": 3,
                "name": "Zahnreinigung",
                "duration": 30,
                "price": 85.0
            },
            "staff": {
                "id": 10,
                "name": "Dr. Anna Weber"
            }
        }
    ]
}
```

---

### 2. Check Availability

Get available time slots for a specific service, date, and optionally staff member.

**Endpoint:** `POST /api/appointments/check-availability`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Body:**

```json
{
    "clinic_id": 1,
    "branch_id": 2,
    "service_id": 3,
    "staff_id": 10, // Optional: check specific staff availability
    "date": "2024-02-15" // Format: Y-m-d
}
```

**Business Logic:**

-   Generates time slots from 09:00 to 17:00
-   Slot intervals: 30 minutes
-   Checks for conflicting appointments
-   If `staff_id` provided: checks that specific staff's availability
-   If `staff_id` not provided: returns slots where ANY staff is available

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/appointments/check-availability" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "branch_id": 2,
    "service_id": 3,
    "staff_id": 10,
    "date": "2024-02-15"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Verfügbare Zeitslots erfolgreich abgerufen",
    "data": {
        "date": "2024-02-15",
        "available_slots": [
            {
                "start_time": "09:00",
                "end_time": "09:30",
                "available": true
            },
            {
                "start_time": "09:30",
                "end_time": "10:00",
                "available": true
            },
            {
                "start_time": "10:00",
                "end_time": "10:30",
                "available": false
            },
            {
                "start_time": "10:30",
                "end_time": "11:00",
                "available": true
            }
            // ... more slots until 17:00
        ]
    }
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
    "success": false,
    "message": "Validierungsfehler",
    "errors": {
        "clinic_id": ["Die Klinik ist erforderlich"],
        "date": ["Das Datum ist erforderlich"]
    }
}
```

---

### 3. Create Appointment

Book a new appointment with automatic time slot validation and end time calculation.

**Endpoint:** `POST /api/appointments`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Body:**

```json
{
    "clinic_id": 1,
    "branch_id": 2, // Optional
    "patient_id": 5,
    "service_id": 3,
    "staff_id": 10, // Optional: if not provided, any available staff
    "appointment_date": "2024-02-15", // Must be today or future
    "start_time": "10:00", // Format: H:i (24-hour)
    "notes": "Erste Konsultation für Zahnreinigung" // Optional, max 1000 chars
}
```

**Business Logic:**

1. Validates all required fields
2. Checks if `appointment_date` is today or in the future
3. Checks if time slot is available (no conflicts)
4. Automatically calculates `end_time` based on service duration
5. Generates unique `appointment_number` (format: APT-YYYYMMDD-XXX)
6. Creates appointment with status "pending"

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/appointments" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "branch_id": 2,
    "patient_id": 5,
    "service_id": 3,
    "staff_id": 10,
    "appointment_date": "2024-02-15",
    "start_time": "10:00",
    "notes": "Erste Konsultation"
  }'
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Termin erfolgreich erstellt",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "clinic_id": 1,
        "branch_id": 2,
        "patient_id": 5,
        "service_id": 3,
        "staff_id": 10,
        "appointment_date": "2024-02-15",
        "start_time": "10:00:00",
        "end_time": "10:30:00", // Auto-calculated from service duration
        "status": "pending",
        "notes": "Erste Konsultation",
        "created_at": "2024-02-10T15:30:00.000000Z",
        "updated_at": "2024-02-10T15:30:00.000000Z",
        "clinic": { "id": 1, "name": "Zahnarztpraxis Dr. Schmidt" },
        "service": { "id": 3, "name": "Zahnreinigung", "duration": 30 },
        "staff": { "id": 10, "name": "Dr. Anna Weber" },
        "patient": { "id": 5, "name": "Max Mustermann" }
    }
}
```

**Error Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Dieser Zeitslot ist bereits gebucht"
}
```

---

### 4. Show Appointment Details

Get detailed information about a specific appointment.

**Endpoint:** `GET /api/appointments/{appointment}`  
**Auth:** Required  
**Roles:** Staff can view all clinic appointments, Customers can only view their own

**Path Parameters:**

-   `appointment`: Appointment ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/appointments/25" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termindetails erfolgreich abgerufen",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "clinic_id": 1,
        "branch_id": 2,
        "patient_id": 5,
        "service_id": 3,
        "staff_id": 10,
        "appointment_date": "2024-02-15",
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "status": "confirmed",
        "notes": "Erste Konsultation",
        "cancellation_reason": null,
        "created_at": "2024-02-10T15:30:00.000000Z",
        "updated_at": "2024-02-12T09:00:00.000000Z",
        "clinic": {
            "id": 1,
            "name": "Zahnarztpraxis Dr. Schmidt",
            "email": "info@schmidt-dental.de",
            "phone": "+49 30 12345678"
        },
        "branch": {
            "id": 2,
            "name": "Filiale Mitte",
            "address": "Hauptstraße 10",
            "city": "Berlin",
            "postal_code": "10115"
        },
        "service": {
            "id": 3,
            "name": "Zahnreinigung",
            "duration": 30,
            "price": 85.0,
            "description": "Professionelle Zahnreinigung"
        },
        "staff": {
            "id": 10,
            "name": "Dr. Anna Weber",
            "email": "a.weber@schmidt-dental.de",
            "specialization": "Prophylaxe"
        },
        "patient": {
            "id": 5,
            "name": "Max Mustermann",
            "email": "max@example.com",
            "phone": "+49 175 1234567"
        }
    }
}
```

**Error Response (403 Forbidden):**

```json
{
    "success": false,
    "message": "Sie haben keine Berechtigung, diesen Termin zu sehen"
}
```

---

### 5. Update Appointment

Update appointment details (date, time, staff, status, notes).

**Endpoint:** `PUT /api/appointments/{appointment}`  
**Auth:** Required  
**Roles:** Staff/Admin can update any clinic appointment, Customers can update their own

**Path Parameters:**

-   `appointment`: Appointment ID

**Request Body:**

```json
{
    "appointment_date": "2024-02-16", // Optional
    "start_time": "11:00", // Optional, Format: H:i
    "staff_id": 12, // Optional
    "status": "confirmed", // Optional: pending, confirmed, completed, cancelled, no_show
    "notes": "Updated notes", // Optional, max 1000 chars
    "cancellation_reason": "Patient request" // Required if status is "cancelled"
}
```

**Business Logic:**

-   Cannot modify appointments with status "completed" or "cancelled"
-   If changing time/date, validates new time slot availability
-   Re-calculates `end_time` if time changes
-   If updating to "cancelled", `cancellation_reason` is required

**Request Example:**

```bash
curl -X PUT "http://localhost:8000/api/appointments/25" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_date": "2024-02-16",
    "start_time": "11:00",
    "notes": "Termin verschoben auf Wunsch des Patienten"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termin erfolgreich aktualisiert",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "appointment_date": "2024-02-16",
        "start_time": "11:00:00",
        "end_time": "11:30:00",
        "status": "pending",
        "notes": "Termin verschoben auf Wunsch des Patienten",
        "updated_at": "2024-02-10T16:45:00.000000Z"
    }
}
```

**Error Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Abgeschlossene oder stornierte Termine können nicht geändert werden"
}
```

---

### 6. Cancel Appointment

Cancel an appointment with a required cancellation reason.

**Endpoint:** `POST /api/appointments/{appointment}/cancel`  
**Auth:** Required  
**Roles:** Staff/Admin or appointment owner

**Path Parameters:**

-   `appointment`: Appointment ID

**Request Body:**

```json
{
    "cancellation_reason": "Patient has conflicting schedule" // Required, max 500 chars
}
```

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/cancel" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellation_reason": "Patient has conflicting schedule"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termin erfolgreich storniert",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "status": "cancelled",
        "cancellation_reason": "Patient has conflicting schedule",
        "updated_at": "2024-02-10T17:00:00.000000Z"
    }
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
    "success": false,
    "message": "Validierungsfehler",
    "errors": {
        "cancellation_reason": ["Der Stornierungsgrund ist erforderlich"]
    }
}
```

---

### 7. Confirm Appointment

Confirm a pending appointment (Staff only).

**Endpoint:** `POST /api/appointments/{appointment}/confirm`  
**Auth:** Required  
**Roles:** Staff, Admin, Super Admin only

**Path Parameters:**

-   `appointment`: Appointment ID

**Business Logic:**

-   Only pending appointments can be confirmed
-   Changes status from "pending" → "confirmed"

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/confirm" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termin erfolgreich bestätigt",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "status": "confirmed",
        "updated_at": "2024-02-10T17:30:00.000000Z"
    }
}
```

**Error Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Nur ausstehende Termine können bestätigt werden"
}
```

---

### 8. Complete Appointment

Mark a confirmed appointment as completed (Staff only).

**Endpoint:** `POST /api/appointments/{appointment}/complete`  
**Auth:** Required  
**Roles:** Staff, Admin, Super Admin only

**Path Parameters:**

-   `appointment`: Appointment ID

**Business Logic:**

-   Only confirmed appointments can be completed
-   Changes status from "confirmed" → "completed"

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/complete" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Termin erfolgreich abgeschlossen",
    "data": {
        "id": 25,
        "appointment_number": "APT-20240215-025",
        "status": "completed",
        "updated_at": "2024-02-15T10:35:00.000000Z"
    }
}
```

**Error Response (400 Bad Request):**

```json
{
    "success": false,
    "message": "Nur bestätigte Termine können abgeschlossen werden"
}
```

---

## Authorization Rules

### Role-Based Access:

-   **Super Admin:** Full access to all appointments across all clinics
-   **Admin:** Full access to appointments in their clinic
-   **Staff:** Full access to appointments in their clinic
-   **Customer:** Can only view/manage their own appointments

### Endpoint Permissions:

-   **List Appointments:** All authenticated users (filtered by role)
-   **Check Availability:** All authenticated users
-   **Create Appointment:** All authenticated users
-   **Show Appointment:** Owner or staff of the clinic
-   **Update Appointment:** Owner or staff of the clinic
-   **Cancel Appointment:** Owner or staff of the clinic
-   **Confirm Appointment:** Staff, Admin, Super Admin only
-   **Complete Appointment:** Staff, Admin, Super Admin only

---

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | Success                                  |
| 201         | Created                                  |
| 400         | Bad Request (business logic error)       |
| 401         | Unauthorized (missing/invalid token)     |
| 403         | Forbidden (insufficient permissions)     |
| 404         | Not Found (appointment doesn't exist)    |
| 422         | Unprocessable Entity (validation errors) |
| 500         | Internal Server Error                    |

---

## Validation Rules

### Create Appointment:

-   `clinic_id`: Required, must exist in clinics table
-   `branch_id`: Optional, must exist in branches table and belong to clinic
-   `patient_id`: Required, must exist in users table with patient role
-   `service_id`: Required, must exist in services table and belong to clinic
-   `staff_id`: Optional, must exist in users table with staff role and belong to clinic
-   `appointment_date`: Required, date format (Y-m-d), must be today or future
-   `start_time`: Required, time format (H:i), 24-hour format
-   `notes`: Optional, string, max 1000 characters

### Update Appointment:

-   `appointment_date`: Optional, date format (Y-m-d)
-   `start_time`: Optional, time format (H:i)
-   `staff_id`: Optional, must exist in staff table
-   `status`: Optional, enum (pending, confirmed, completed, cancelled, no_show)
-   `notes`: Optional, string, max 1000 characters
-   `cancellation_reason`: Required if status is "cancelled", max 500 characters

### Check Availability:

-   `clinic_id`: Required, must exist
-   `branch_id`: Optional, must exist and belong to clinic
-   `service_id`: Required, must exist and belong to clinic
-   `staff_id`: Optional, must exist and belong to clinic
-   `date`: Required, date format (Y-m-d)

---

## Business Rules

1. **Time Slot Management:**

    - Default working hours: 09:00 - 17:00
    - Slot duration: 30 minutes
    - End time automatically calculated from service duration
    - Overlapping appointments not allowed

2. **Status Workflow:**

    - New appointments start as "pending"
    - Staff must confirm appointments
    - Only confirmed appointments can be completed
    - Completed/cancelled appointments cannot be modified

3. **Availability Checking:**

    - Checks for time slot conflicts
    - If staff specified: checks that staff's availability
    - If no staff specified: returns slots where any staff available

4. **Access Control:**
    - Customers can only see/manage their own appointments
    - Staff can manage all clinic appointments
    - Confirm/Complete actions restricted to staff only

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

## Testing Examples

### Full Appointment Booking Flow:

1. **Check Availability:**

```bash
curl -X POST "http://localhost:8000/api/appointments/check-availability" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"clinic_id": 1, "service_id": 3, "date": "2024-02-15"}'
```

2. **Create Appointment:**

```bash
curl -X POST "http://localhost:8000/api/appointments" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "patient_id": 5,
    "service_id": 3,
    "staff_id": 10,
    "appointment_date": "2024-02-15",
    "start_time": "10:00"
  }'
```

3. **Staff Confirms Appointment:**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/confirm" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

4. **Staff Completes Appointment (after service):**

```bash
curl -X POST "http://localhost:8000/api/appointments/25/complete" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

---

## Notes

-   All German error messages from validation requests
-   Automatic appointment number generation (APT-YYYYMMDD-XXX)
-   Soft deletes enabled on appointments table
-   Activity logging for all appointment actions
-   Relationships loaded: clinic, branch, patient, service, staff

---

**Total API Endpoints: 48**

-   Authentication: 7 endpoints
-   Clinics: 5 endpoints
-   Services: 7 endpoints
-   Branches: 6 endpoints
-   Staff: 7 endpoints
-   Patients: 8 endpoints
-   Appointments: 8 endpoints

**Last Updated:** Sprint 4 - February 2024
