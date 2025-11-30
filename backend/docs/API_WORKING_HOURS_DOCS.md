# Working Hours Management API Documentation

## Overview

The Working Hours API manages clinic and staff working schedules, enabling dynamic availability checking for appointments. This system supports both clinic-wide hours and individual staff schedules.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Required (Bearer Token via Laravel Sanctum)  
**Total Endpoints:** 6

---

## Day of Week Reference

Working hours use integer values for days of the week:

-   **0** = Sonntag (Sunday)
-   **1** = Montag (Monday)
-   **2** = Dienstag (Tuesday)
-   **3** = Mittwoch (Wednesday)
-   **4** = Donnerstag (Thursday)
-   **5** = Freitag (Friday)
-   **6** = Samstag (Saturday)

---

## Endpoints

### 1. List Working Hours

Get working hours for a clinic or specific staff member, grouped by day of week.

**Endpoint:** `GET /api/working-hours`  
**Auth:** Required  
**Roles:** All authenticated users

**Query Parameters:**

-   `clinic_id` (required): Filter by clinic ID
-   `staff_id` (optional): Filter by specific staff member
-   `day_of_week` (optional): Filter by day (0-6)
-   `is_available` (optional): Filter by availability status (boolean)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/working-hours?clinic_id=1&staff_id=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "day": "Montag",
            "schedules": [
                {
                    "id": 1,
                    "clinic_id": 1,
                    "staff_id": 10,
                    "day_of_week": 1,
                    "start_time": "09:00:00",
                    "end_time": "13:00:00",
                    "is_available": true,
                    "created_at": "2024-02-10T10:00:00.000000Z",
                    "updated_at": "2024-02-10T10:00:00.000000Z",
                    "clinic": {
                        "id": 1,
                        "name": "Zahnarztpraxis Dr. Schmidt"
                    },
                    "staff": {
                        "id": 10,
                        "user": {
                            "name": "Dr. Anna Weber"
                        }
                    }
                },
                {
                    "id": 2,
                    "clinic_id": 1,
                    "staff_id": 10,
                    "day_of_week": 1,
                    "start_time": "14:00:00",
                    "end_time": "18:00:00",
                    "is_available": true,
                    "created_at": "2024-02-10T10:00:00.000000Z",
                    "updated_at": "2024-02-10T10:00:00.000000Z"
                }
            ]
        },
        {
            "day": "Dienstag",
            "schedules": [
                {
                    "id": 3,
                    "clinic_id": 1,
                    "staff_id": 10,
                    "day_of_week": 2,
                    "start_time": "09:00:00",
                    "end_time": "17:00:00",
                    "is_available": true
                }
            ]
        }
    ]
}
```

---

### 2. Create Working Hours

Create a new working hours entry for clinic or staff.

**Endpoint:** `POST /api/working-hours`  
**Auth:** Required  
**Roles:** Clinic Owner, Manager, Admin

**Request Body:**

```json
{
    "clinic_id": 1,
    "staff_id": 10, // Optional: null for clinic-wide hours
    "day_of_week": 1, // 0-6 (Monday)
    "start_time": "09:00", // Format: H:i
    "end_time": "17:00", // Format: H:i, must be after start_time
    "is_available": true // Optional, default: true
}
```

**Business Logic:**

-   Checks for overlapping time periods on the same day
-   Prevents creating conflicting schedules
-   Staff-specific hours override clinic-wide hours

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/working-hours" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "staff_id": 10,
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "17:00",
    "is_available": true
  }'
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Arbeitszeiten erfolgreich erstellt.",
    "data": {
        "id": 15,
        "clinic_id": 1,
        "staff_id": 10,
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "is_available": true,
        "created_at": "2024-02-10T15:00:00.000000Z",
        "updated_at": "2024-02-10T15:00:00.000000Z",
        "clinic": {
            "id": 1,
            "name": "Zahnarztpraxis Dr. Schmidt"
        },
        "staff": {
            "id": 10,
            "user": {
                "name": "Dr. Anna Weber"
            }
        }
    }
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
    "success": false,
    "message": "Die Arbeitszeiten überschneiden sich mit bestehenden Zeiten."
}
```

---

### 3. Bulk Create Working Hours

Create multiple working hours entries at once (useful for setting up weekly schedules).

**Endpoint:** `POST /api/working-hours/bulk`  
**Auth:** Required  
**Roles:** Clinic Owner, Manager, Admin

**Request Body:**

```json
{
    "clinic_id": 1,
    "staff_id": 10, // Optional
    "schedules": [
        {
            "day_of_week": 1,
            "start_time": "09:00",
            "end_time": "17:00",
            "is_available": true
        },
        {
            "day_of_week": 2,
            "start_time": "09:00",
            "end_time": "17:00",
            "is_available": true
        },
        {
            "day_of_week": 3,
            "start_time": "09:00",
            "end_time": "13:00",
            "is_available": true
        },
        {
            "day_of_week": 4,
            "start_time": "09:00",
            "end_time": "17:00",
            "is_available": true
        },
        {
            "day_of_week": 5,
            "start_time": "09:00",
            "end_time": "15:00",
            "is_available": true
        }
    ]
}
```

**Business Logic:**

-   Creates all schedules in a single transaction
-   Validates each schedule for overlaps
-   If any overlap detected, entire operation fails (rollback)
-   Perfect for setting up staff's weekly schedule

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/working-hours/bulk" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "staff_id": 10,
    "schedules": [
      {"day_of_week": 1, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 2, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 3, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 4, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 5, "start_time": "09:00", "end_time": "15:00"}
    ]
  }'
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Arbeitszeiten erfolgreich erstellt.",
    "data": [
        {
            "id": 20,
            "clinic_id": 1,
            "staff_id": 10,
            "day_of_week": 1,
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "is_available": true,
            "created_at": "2024-02-10T16:00:00.000000Z"
        },
        {
            "id": 21,
            "clinic_id": 1,
            "staff_id": 10,
            "day_of_week": 2,
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "is_available": true,
            "created_at": "2024-02-10T16:00:00.000000Z"
        }
        // ... more entries
    ]
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
    "success": false,
    "message": "Überschneidung bei Dienstag."
}
```

---

### 4. Show Working Hours Details

Get details of a specific working hours entry.

**Endpoint:** `GET /api/working-hours/{id}`  
**Auth:** Required  
**Roles:** All authenticated users

**Path Parameters:**

-   `id`: Working hours entry ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/working-hours/15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "id": 15,
        "clinic_id": 1,
        "staff_id": 10,
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "is_available": true,
        "created_at": "2024-02-10T15:00:00.000000Z",
        "updated_at": "2024-02-10T15:00:00.000000Z",
        "clinic": {
            "id": 1,
            "name": "Zahnarztpraxis Dr. Schmidt",
            "email": "info@schmidt-dental.de"
        },
        "staff": {
            "id": 10,
            "user": {
                "id": 25,
                "name": "Dr. Anna Weber",
                "email": "a.weber@schmidt-dental.de"
            }
        }
    }
}
```

---

### 5. Update Working Hours

Update an existing working hours entry.

**Endpoint:** `PUT /api/working-hours/{id}`  
**Auth:** Required  
**Roles:** Clinic Owner, Manager, Admin

**Path Parameters:**

-   `id`: Working hours entry ID

**Request Body:**

```json
{
    "day_of_week": 2, // Optional
    "start_time": "08:00", // Optional
    "end_time": "16:00", // Optional, must be after start_time
    "is_available": false // Optional
}
```

**Business Logic:**

-   Checks for overlaps when updating time or day
-   Excludes current entry from overlap check
-   Can mark hours as unavailable without deleting

**Request Example:**

```bash
curl -X PUT "http://localhost:8000/api/working-hours/15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "08:00",
    "end_time": "16:00"
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Arbeitszeiten erfolgreich aktualisiert.",
    "data": {
        "id": 15,
        "clinic_id": 1,
        "staff_id": 10,
        "day_of_week": 1,
        "start_time": "08:00:00",
        "end_time": "16:00:00",
        "is_available": true,
        "updated_at": "2024-02-10T17:00:00.000000Z"
    }
}
```

**Error Response (422 Unprocessable Entity):**

```json
{
    "success": false,
    "message": "Die Arbeitszeiten überschneiden sich mit bestehenden Zeiten."
}
```

---

### 6. Delete Working Hours

Delete a working hours entry.

**Endpoint:** `DELETE /api/working-hours/{id}`  
**Auth:** Required  
**Roles:** Clinic Owner, Manager, Admin

**Path Parameters:**

-   `id`: Working hours entry ID

**Request Example:**

```bash
curl -X DELETE "http://localhost:8000/api/working-hours/15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Arbeitszeiten erfolgreich gelöscht."
}
```

**Error Response (404 Not Found):**

```json
{
    "success": false,
    "message": "Arbeitszeiten nicht gefunden."
}
```

---

## Integration with Appointments

### Dynamic Availability Checking

The appointment system now uses working hours for availability checking:

1. **Clinic-Wide Hours**: If no `staff_id` provided when checking availability, uses clinic-wide working hours
2. **Staff-Specific Hours**: If `staff_id` provided, uses that staff member's working hours
3. **No Working Hours**: If no working hours configured, returns empty slots array

### Example Flow:

**Step 1: Set up working hours for staff**

```bash
curl -X POST "http://localhost:8000/api/working-hours/bulk" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "clinic_id": 1,
    "staff_id": 10,
    "schedules": [
      {"day_of_week": 1, "start_time": "09:00", "end_time": "17:00"}
    ]
  }'
```

**Step 2: Check appointment availability (uses working hours)**

```bash
curl -X POST "http://localhost:8000/api/appointments/check-availability" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -d '{
    "clinic_id": 1,
    "service_id": 3,
    "staff_id": 10,
    "date": "2024-02-12"
  }'
```

**Response: Available slots based on working hours**

```json
{
  "success": true,
  "data": {
    "date": "2024-02-12",
    "service": {...},
    "available_slots": [
      {"start_time": "09:00", "end_time": "09:30"},
      {"start_time": "09:30", "end_time": "10:00"},
      // ... slots until 17:00
    ]
  }
}
```

---

## Use Cases

### 1. Set Clinic-Wide Working Hours

```json
POST /api/working-hours/bulk
{
  "clinic_id": 1,
  "staff_id": null,
  "schedules": [
    {"day_of_week": 1, "start_time": "08:00", "end_time": "18:00"},
    {"day_of_week": 2, "start_time": "08:00", "end_time": "18:00"},
    {"day_of_week": 3, "start_time": "08:00", "end_time": "18:00"},
    {"day_of_week": 4, "start_time": "08:00", "end_time": "18:00"},
    {"day_of_week": 5, "start_time": "08:00", "end_time": "16:00"}
  ]
}
```

### 2. Set Staff-Specific Hours (Override Clinic Hours)

```json
POST /api/working-hours/bulk
{
  "clinic_id": 1,
  "staff_id": 10,
  "schedules": [
    {"day_of_week": 1, "start_time": "10:00", "end_time": "14:00"},
    {"day_of_week": 3, "start_time": "10:00", "end_time": "14:00"},
    {"day_of_week": 5, "start_time": "10:00", "end_time": "14:00"}
  ]
}
```

### 3. Split Shifts (Morning and Afternoon)

```json
POST /api/working-hours
{
  "clinic_id": 1,
  "staff_id": 10,
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "12:00"
}

POST /api/working-hours
{
  "clinic_id": 1,
  "staff_id": 10,
  "day_of_week": 1,
  "start_time": "14:00",
  "end_time": "18:00"
}
```

### 4. Mark Day as Unavailable

```json
PUT /api/working-hours/15
{
  "is_available": false
}
```

---

## Business Rules

1. **Overlap Prevention:**

    - Cannot create overlapping time periods for same clinic/staff/day
    - Update validates against existing schedules
    - Bulk create checks all entries before committing

2. **Time Validation:**

    - `end_time` must be after `start_time`
    - Time format: 24-hour (H:i)
    - Stored with seconds as H:i:s

3. **Staff vs Clinic Hours:**

    - `staff_id = null`: Clinic-wide working hours
    - `staff_id = X`: Staff-specific hours (overrides clinic hours)
    - Appointment availability uses staff hours if available, otherwise clinic hours

4. **Availability Flag:**

    - `is_available = true`: Hours are active (default)
    - `is_available = false`: Hours marked inactive (hidden from availability)
    - Soft way to disable hours without deleting

5. **Day of Week:**
    - 0-6 (Sunday to Saturday)
    - Uses Carbon's dayOfWeek (0 = Sunday)
    - Matches PHP/Laravel conventions

---

## Validation Rules

### Create Working Hours:

-   `clinic_id`: Required, must exist in clinics table
-   `staff_id`: Optional, must exist in clinic_staff table
-   `day_of_week`: Required, integer, 0-6
-   `start_time`: Required, format H:i
-   `end_time`: Required, format H:i, must be after start_time
-   `is_available`: Optional, boolean, default true

### Update Working Hours:

-   `day_of_week`: Optional, integer, 0-6
-   `start_time`: Optional, format H:i
-   `end_time`: Optional, format H:i, must be after start_time
-   `is_available`: Optional, boolean

### Bulk Create:

-   `clinic_id`: Required, must exist
-   `staff_id`: Optional, must exist
-   `schedules`: Required, array, min 1 entry
-   `schedules.*.day_of_week`: Required, integer, 0-6
-   `schedules.*.start_time`: Required, format H:i
-   `schedules.*.end_time`: Required, format H:i, after start_time
-   `schedules.*.is_available`: Optional, boolean

---

## Error Codes

| Status Code | Description                                      |
| ----------- | ------------------------------------------------ |
| 200         | Success                                          |
| 201         | Created                                          |
| 400         | Bad Request (business logic error)               |
| 401         | Unauthorized (missing/invalid token)             |
| 403         | Forbidden (insufficient permissions)             |
| 404         | Not Found (working hours doesn't exist)          |
| 422         | Unprocessable Entity (validation/overlap errors) |
| 500         | Internal Server Error                            |

---

## Testing Examples

### Set Up Weekly Schedule:

```bash
# Create Monday to Friday, 9-5 schedule
curl -X POST "http://localhost:8000/api/working-hours/bulk" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": 1,
    "staff_id": 10,
    "schedules": [
      {"day_of_week": 1, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 2, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 3, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 4, "start_time": "09:00", "end_time": "17:00"},
      {"day_of_week": 5, "start_time": "09:00", "end_time": "17:00"}
    ]
  }'
```

### Get All Working Hours for Staff:

```bash
curl -X GET "http://localhost:8000/api/working-hours?clinic_id=1&staff_id=10" \
  -H "Authorization: Bearer TOKEN"
```

### Update Wednesday Hours:

```bash
# First get the ID
curl -X GET "http://localhost:8000/api/working-hours?clinic_id=1&staff_id=10&day_of_week=3" \
  -H "Authorization: Bearer TOKEN"

# Then update (assuming ID is 23)
curl -X PUT "http://localhost:8000/api/working-hours/23" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"start_time": "10:00", "end_time": "14:00"}'
```

---

## Notes

-   All German error messages from validation requests
-   Working hours integrate seamlessly with appointment availability checking
-   Soft deletes not enabled (use `is_available` flag instead)
-   Activity logging can be added for audit trail
-   Supports split shifts (multiple entries per day)

---

**Total API Endpoints: 54**

-   Authentication: 7 endpoints
-   Clinics: 5 endpoints
-   Services: 7 endpoints
-   Branches: 6 endpoints
-   Staff: 7 endpoints
-   Patients: 8 endpoints
-   Appointments: 8 endpoints
-   Working Hours: 6 endpoints

**Last Updated:** Sprint 5 - February 2024
