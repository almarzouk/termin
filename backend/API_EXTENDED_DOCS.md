# Branch & Staff Management API Documentation

## Branch Management

### 1. List Branches

Get all branches for a clinic.

**Endpoint**: `GET /clinics/{clinic}/branches`

**Query Parameters**:

-   `is_active` (boolean): Filter by active status
-   `city` (string): Filter by city
-   `search` (string): Search by name, city, or address
-   `per_page` (integer): Items per page (default: 15)

**Example**:

```bash
curl -X GET "http://localhost:8000/api/clinics/1/branches?city=Berlin" \
  -H "Authorization: Bearer TOKEN"
```

---

### 2. Create Branch

Create a new branch for a clinic.

**Endpoint**: `POST /clinics/{clinic}/branches`

**Request Body**:

```json
{
    "name": "Zweite Filiale",
    "address": "Musterstraße 45",
    "city": "Berlin",
    "country": "Deutschland",
    "postal_code": "10117",
    "lat": 52.520008,
    "lng": 13.404954,
    "phone": "+49 30 98765432",
    "email": "filiale2@praxis.de",
    "is_active": true
}
```

---

### 3. Get Branch Details

**Endpoint**: `GET /clinics/{clinic}/branches/{branch}`

---

### 4. Update Branch

**Endpoint**: `PUT /clinics/{clinic}/branches/{branch}`

---

### 5. Delete Branch

**Endpoint**: `DELETE /clinics/{clinic}/branches/{branch}`

**Note**: Cannot delete main branch or branches with active appointments.

---

### 6. Get Cities

Get all cities where clinic has branches.

**Endpoint**: `GET /clinics/{clinic}/branches/cities`

---

## Staff Management

### 1. List Staff

Get all staff members for a clinic.

**Endpoint**: `GET /clinics/{clinic}/staff`

**Query Parameters**:

-   `role` (string): Filter by role (clinic_manager, doctor, nurse, receptionist)
-   `branch_id` (integer): Filter by branch
-   `is_active` (boolean): Filter by active status
-   `search` (string): Search by name, email, or specialization
-   `per_page` (integer): Items per page

**Example**:

```bash
curl -X GET "http://localhost:8000/api/clinics/1/staff?role=doctor&is_active=1" \
  -H "Authorization: Bearer TOKEN"
```

---

### 2. Invite Staff Member

Send invitation to a new staff member.

**Endpoint**: `POST /clinics/{clinic}/staff/invite`

**Request Body**:

```json
{
    "email": "dr.mueller@example.com",
    "name": "Dr. Hans Mueller",
    "role": "doctor",
    "branch_id": 1,
    "specialization": "Allgemeinmedizin",
    "license_number": "LIC123456",
    "bio": "Erfahrener Allgemeinmediziner mit 15 Jahren Praxis",
    "hire_date": "2024-01-15"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Einladung erfolgreich gesendet.",
  "data": {...},
  "invitation_token": "abc123..."
}
```

---

### 3. Accept Staff Invitation

Accept an invitation (public endpoint).

**Endpoint**: `POST /staff/accept-invitation`

**Request Body**:

```json
{
    "token": "invitation_token_here",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Einladung erfolgreich akzeptiert. Willkommen im Team!",
  "data": {
    "user": {...},
    "staff": {...},
    "token": "auth_token_here"
  }
}
```

---

### 4. Get Staff Details

**Endpoint**: `GET /clinics/{clinic}/staff/{staff}`

---

### 5. Update Staff

**Endpoint**: `PUT /clinics/{clinic}/staff/{staff}`

**Request Body**:

```json
{
    "role": "clinic_manager",
    "branch_id": 2,
    "specialization": "Innere Medizin",
    "is_active": true
}
```

---

### 6. Remove Staff

**Endpoint**: `DELETE /clinics/{clinic}/staff/{staff}`

**Note**: Cannot remove staff with upcoming appointments.

---

### 7. Resend Invitation

Resend invitation email to a staff member.

**Endpoint**: `POST /clinics/{clinic}/staff/{staff}/resend-invitation`

---

### 8. Get Staff by Role

Get all staff members with a specific role.

**Endpoint**: `GET /clinics/{clinic}/staff/role/{role}`

**Example**:

```bash
curl -X GET "http://localhost:8000/api/clinics/1/staff/role/doctor" \
  -H "Authorization: Bearer TOKEN"
```

---

## Patient Management

### 1. List Patients

Get all patients (filtered by user role).

**Endpoint**: `GET /patients`

**Query Parameters**:

-   `patient_type` (string): Filter by type (self, family, pet)
-   `user_id` (integer): Filter by user (admin/staff only)
-   `search` (string): Search by name, email, or phone
-   `per_page` (integer): Items per page

**Example**:

```bash
curl -X GET "http://localhost:8000/api/patients?patient_type=self&search=Schmidt" \
  -H "Authorization: Bearer TOKEN"
```

**Authorization**:

-   Regular users: See only their own patients
-   Clinic staff: See all patients

---

### 2. Create Patient

Create a new patient record.

**Endpoint**: `POST /patients`

**Request Body**:

```json
{
    "patient_type": "self",
    "first_name": "Anna",
    "last_name": "Schmidt",
    "date_of_birth": "1990-05-15",
    "gender": "female",
    "phone": "+49 171 1234567",
    "email": "anna.schmidt@example.com",
    "address": "Hauptstraße 10",
    "city": "Berlin",
    "country": "Deutschland",
    "postal_code": "10115",
    "insurance_provider": "TK",
    "insurance_number": "INS123456789",
    "emergency_contact_name": "Max Schmidt",
    "emergency_contact_phone": "+49 171 9876543",
    "blood_type": "A+",
    "allergies": ["Penicillin", "Pollen"],
    "chronic_conditions": ["Asthma"],
    "notes": "Patient prefers morning appointments"
}
```

---

### 3. Get Patient Details

**Endpoint**: `GET /patients/{patient}`

**Response includes**: User, appointments, medical records

---

### 4. Update Patient

**Endpoint**: `PUT /patients/{patient}`

---

### 5. Delete Patient

**Endpoint**: `DELETE /patients/{patient}`

**Note**: Cannot delete patients with upcoming appointments.

---

### 6. Get Patient Medical History

Get all medical records for a patient.

**Endpoint**: `GET /patients/{patient}/medical-history`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "diagnosis": "Grippale Infekt",
      "symptoms": ["Fieber", "Husten"],
      "treatment": "Bettruhe, viel trinken",
      "prescriptions": [
        {
          "medication": "Paracetamol",
          "dosage": "500mg",
          "frequency": "3x täglich"
        }
      ],
      "appointment": {...},
      "creator": {...},
      "created_at": "2024-11-20T10:30:00"
    }
  ]
}
```

---

### 7. Get Patient Appointments

Get all appointments for a patient.

**Endpoint**: `GET /patients/{patient}/appointments`

---

## Validation Rules

### Branch Validation

-   `name`: Required, max 255 characters
-   `address`: Required, max 255 characters
-   `city`: Required, max 100 characters
-   `country`: Required, max 100 characters
-   `postal_code`: Required, max 20 characters
-   `lat`: Between -90 and 90
-   `lng`: Between -180 and 180

### Staff Invitation Validation

-   `email`: Required, unique, valid email
-   `name`: Required, max 255 characters
-   `role`: Required, one of: clinic_manager, doctor, nurse, receptionist
-   `branch_id`: Required, must exist
-   `specialization`: Optional, max 255 characters
-   `license_number`: Optional, max 100 characters
-   `bio`: Optional, max 1000 characters

### Patient Validation

-   `patient_type`: Required, one of: self, family, pet
-   `first_name`: Required, max 255 characters
-   `last_name`: Required, max 255 characters
-   `date_of_birth`: Required, must be before today
-   `gender`: Required, one of: male, female, other
-   `blood_type`: Optional, one of: A+, A-, B+, B-, AB+, AB-, O+, O-
-   `allergies`: Optional array of strings
-   `chronic_conditions`: Optional array of strings

---

## Authorization

**Branch Management**:

-   Create/Update/Delete: Clinic owner or super admin only
-   View: Any authenticated user

**Staff Management**:

-   Invite/Update/Remove: Clinic owner or super admin only
-   View: Clinic staff or super admin
-   Accept Invitation: Public (with valid token)

**Patient Management**:

-   Create/Update/Delete: Patient owner or clinic staff
-   View: Patient owner or clinic staff
-   Medical History: Patient owner or clinic staff only

---

## Error Responses

### 403 Forbidden

```json
{
    "success": false,
    "message": "Sie sind nicht berechtigt, diese Aktion auszuführen."
}
```

### 422 Validation Error

```json
{
    "success": false,
    "message": "Die Hauptfiliale kann nicht gelöscht werden."
}
```

### 422 Business Logic Error

```json
{
    "success": false,
    "message": "Dieser Mitarbeiter hat zukünftige Termine und kann nicht entfernt werden."
}
```
