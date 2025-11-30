# Notifications & Reminders API Documentation

## Overview

The Notifications & Reminders API provides comprehensive notification management, user preferences, and automated reminder systems for appointments, prescriptions, and follow-ups.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Required (Bearer Token via Laravel Sanctum)  
**Total Endpoints:** 17

---

## Notification Types

The system supports the following notification types:

-   `appointment_reminder` - Reminder for upcoming appointments
-   `appointment_confirmed` - Appointment confirmation notification
-   `appointment_cancelled` - Appointment cancellation notification
-   `appointment_rescheduled` - Appointment rescheduling notification
-   `prescription_reminder` - Medication reminder
-   `follow_up_reminder` - Follow-up appointment reminder
-   `general` - General notifications

---

## Notifications Module

### Overview

Manage user notifications with support for read/unread status, filtering, and bulk operations.

**Total Endpoints:** 8

---

### 1. List Notifications

Get notifications for authenticated user with filtering options.

**Endpoint:** `GET /api/notifications`  
**Auth:** Required  
**Roles:** All authenticated users

**Query Parameters:**

-   `read` (optional): Filter by read status (true/false)
-   `type` (optional): Filter by notification type
-   `date_from` (optional): Start date filter (Y-m-d)
-   `date_to` (optional): End date filter (Y-m-d)
-   `per_page` (optional): Results per page, default: 20

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/notifications?read=false&type=appointment_reminder" \
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
                "user_id": 5,
                "type": "appointment_reminder",
                "title": "Terminerinnerung",
                "message": "Ihr Termin bei Zahnarztpraxis Dr. Schmidt ist morgen am 15.02.2024 um 10:00 Uhr.",
                "data": {
                    "appointment_id": 25,
                    "clinic_name": "Zahnarztpraxis Dr. Schmidt",
                    "service_name": "Zahnreinigung",
                    "appointment_date": "15.02.2024",
                    "start_time": "10:00"
                },
                "read_at": null,
                "scheduled_for": null,
                "sent_at": "2024-02-14T10:00:00.000000Z",
                "created_at": "2024-02-14T10:00:00.000000Z"
            },
            {
                "id": 2,
                "type": "appointment_confirmed",
                "title": "Termin bestätigt",
                "message": "Ihr Termin am 20.02.2024 um 14:00 Uhr wurde bestätigt.",
                "read_at": "2024-02-15T08:30:00.000000Z",
                "created_at": "2024-02-15T08:00:00.000000Z"
            }
        ],
        "total": 15,
        "per_page": 20,
        "last_page": 1
    }
}
```

---

### 2. Get Unread Count

Get count of unread notifications for authenticated user.

**Endpoint:** `GET /api/notifications/unread-count`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/notifications/unread-count" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "unread_count": 5
    }
}
```

---

### 3. Create Notification

Create a new notification (Admin/Staff only).

**Endpoint:** `POST /api/notifications`  
**Auth:** Required  
**Roles:** Super Admin, Clinic Owner, Clinic Manager, Receptionist

**Request Body:**

```json
{
    "user_id": 5,
    "type": "general",
    "title": "Neue Nachricht",
    "message": "Ihre Terminanfrage wurde bearbeitet.",
    "scheduled_for": "2024-02-16 09:00:00",
    "data": {
        "custom_field": "value"
    }
}
```

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/notifications" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "type": "general",
    "title": "Neue Nachricht",
    "message": "Ihre Terminanfrage wurde bearbeitet."
  }'
```

**Response Example (201 Created):**

```json
{
    "success": true,
    "message": "Benachrichtigung erfolgreich erstellt.",
    "data": {
        "id": 10,
        "user_id": 5,
        "type": "general",
        "title": "Neue Nachricht",
        "message": "Ihre Terminanfrage wurde bearbeitet.",
        "scheduled_for": null,
        "sent_at": "2024-02-15T10:00:00.000000Z",
        "created_at": "2024-02-15T10:00:00.000000Z"
    }
}
```

---

### 4. Show Notification

Get details of a specific notification and mark it as read.

**Endpoint:** `GET /api/notifications/{id}`  
**Auth:** Required  
**Roles:** Notification owner only

**Path Parameters:**

-   `id`: Notification ID

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/notifications/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 5,
        "type": "appointment_reminder",
        "title": "Terminerinnerung",
        "message": "Ihr Termin bei Zahnarztpraxis Dr. Schmidt ist morgen am 15.02.2024 um 10:00 Uhr.",
        "data": {
            "appointment_id": 25,
            "clinic_name": "Zahnarztpraxis Dr. Schmidt",
            "service_name": "Zahnreinigung",
            "appointment_date": "15.02.2024",
            "start_time": "10:00"
        },
        "read_at": "2024-02-15T10:30:00.000000Z",
        "sent_at": "2024-02-14T10:00:00.000000Z",
        "created_at": "2024-02-14T10:00:00.000000Z"
    }
}
```

---

### 5. Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PATCH /api/notifications/{id}/read`  
**Auth:** Required  
**Roles:** Notification owner only

**Path Parameters:**

-   `id`: Notification ID

**Request Example:**

```bash
curl -X PATCH "http://localhost:8000/api/notifications/1/read" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Benachrichtigung als gelesen markiert.",
    "data": {
        "id": 1,
        "read_at": "2024-02-15T10:30:00.000000Z"
    }
}
```

---

### 6. Mark All as Read

Mark all unread notifications as read for authenticated user.

**Endpoint:** `POST /api/notifications/mark-all-read`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/notifications/mark-all-read" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Alle Benachrichtigungen als gelesen markiert."
}
```

---

### 7. Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/{id}`  
**Auth:** Required  
**Roles:** Notification owner only

**Path Parameters:**

-   `id`: Notification ID

**Request Example:**

```bash
curl -X DELETE "http://localhost:8000/api/notifications/1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Benachrichtigung erfolgreich gelöscht."
}
```

---

### 8. Clear Read Notifications

Delete all read notifications for authenticated user.

**Endpoint:** `DELETE /api/notifications/clear-read`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Example:**

```bash
curl -X DELETE "http://localhost:8000/api/notifications/clear-read" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Gelesene Benachrichtigungen erfolgreich gelöscht."
}
```

---

## Notification Preferences Module

### Overview

Manage user notification preferences for different channels and types.

**Total Endpoints:** 3

---

### 1. Get Notification Preferences

Get user's notification preferences (creates defaults if not exist).

**Endpoint:** `GET /api/notification-preferences`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/notification-preferences" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "user_id": 5,
        "email_notifications": true,
        "sms_notifications": false,
        "push_notifications": true,
        "appointment_reminders": true,
        "appointment_confirmations": true,
        "prescription_reminders": true,
        "follow_up_reminders": true,
        "marketing_emails": false,
        "reminder_hours_before": 24,
        "created_at": "2024-02-10T12:00:00.000000Z",
        "updated_at": "2024-02-10T12:00:00.000000Z"
    }
}
```

**Default Preferences:**

-   `email_notifications`: true
-   `sms_notifications`: false
-   `push_notifications`: true
-   `appointment_reminders`: true
-   `appointment_confirmations`: true
-   `prescription_reminders`: true
-   `follow_up_reminders`: true
-   `marketing_emails`: false
-   `reminder_hours_before`: 24

---

### 2. Update Notification Preferences

Update user's notification preferences.

**Endpoint:** `PUT /api/notification-preferences`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Body:**

```json
{
    "email_notifications": true,
    "sms_notifications": true,
    "push_notifications": true,
    "appointment_reminders": true,
    "appointment_confirmations": true,
    "prescription_reminders": false,
    "follow_up_reminders": true,
    "marketing_emails": false,
    "reminder_hours_before": 48
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Request Example:**

```bash
curl -X PUT "http://localhost:8000/api/notification-preferences" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sms_notifications": true,
    "reminder_hours_before": 48
  }'
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Benachrichtigungseinstellungen erfolgreich aktualisiert.",
    "data": {
        "id": 1,
        "user_id": 5,
        "email_notifications": true,
        "sms_notifications": true,
        "push_notifications": true,
        "appointment_reminders": true,
        "reminder_hours_before": 48,
        "updated_at": "2024-02-15T10:00:00.000000Z"
    }
}
```

---

### 3. Reset Preferences to Default

Reset all notification preferences to default values.

**Endpoint:** `POST /api/notification-preferences/reset`  
**Auth:** Required  
**Roles:** All authenticated users

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/notification-preferences/reset" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Einstellungen auf Standard zurückgesetzt.",
    "data": {
        "id": 1,
        "user_id": 5,
        "email_notifications": true,
        "sms_notifications": false,
        "push_notifications": true,
        "appointment_reminders": true,
        "appointment_confirmations": true,
        "prescription_reminders": true,
        "follow_up_reminders": true,
        "marketing_emails": false,
        "reminder_hours_before": 24,
        "updated_at": "2024-02-15T11:00:00.000000Z"
    }
}
```

---

## Reminders Module

### Overview

Automated reminder system for appointments, prescriptions, and follow-ups.

**Total Endpoints:** 4

---

### 1. Get Upcoming Appointments

Get upcoming appointments that need reminders.

**Endpoint:** `GET /api/reminders/upcoming-appointments`  
**Auth:** Required  
**Roles:** All authenticated users

**Query Parameters:**

-   `hours_ahead` (optional): Hours to look ahead, default: 72 (3 days)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/reminders/upcoming-appointments?hours_ahead=48" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "appointments": [
            {
                "id": 25,
                "appointment_date": "2024-02-17",
                "start_time": "10:00:00",
                "end_time": "10:30:00",
                "status": "confirmed",
                "clinic": {
                    "id": 1,
                    "name": "Zahnarztpraxis Dr. Schmidt"
                },
                "service": {
                    "id": 3,
                    "name": "Zahnreinigung",
                    "duration": 30
                },
                "staff": {
                    "id": 10,
                    "user": {
                        "name": "Dr. Anna Weber"
                    }
                }
            }
        ],
        "count": 1
    }
}
```

---

### 2. Send Appointment Reminders

Manually trigger sending appointment reminders for next 24 hours (Admin/Manager only).

**Endpoint:** `POST /api/reminders/send-appointment-reminders`  
**Auth:** Required  
**Roles:** Super Admin, Clinic Owner, Clinic Manager

**Business Logic:**

-   Finds appointments in next 24 hours (23-25 hours ahead)
-   Sends reminders to users with pending/confirmed appointments
-   Checks if reminder already sent in last 24 hours
-   Creates notification for each appointment

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/reminders/send-appointment-reminders" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "message": "Erinnerungen gesendet: 15, Fehlgeschlagen: 0",
    "data": {
        "sent": 15,
        "failed": 0
    }
}
```

---

### 3. Get Prescription Reminders

Get prescriptions ending soon that need reminders.

**Endpoint:** `GET /api/reminders/prescriptions`  
**Auth:** Required  
**Roles:** All authenticated users

**Business Logic:**

-   Returns active prescriptions ending within 3 days
-   Only for authenticated user's patient record

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/reminders/prescriptions" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "prescriptions": [
            {
                "id": 1,
                "medication_name": "Ibuprofen 400mg",
                "dosage": "400mg",
                "frequency": "3x täglich",
                "duration": "7 Tage",
                "status": "active",
                "start_date": "2024-02-10",
                "end_date": "2024-02-17",
                "medicalRecord": {
                    "diagnosis": "Zahnschmerzen",
                    "appointment": {
                        "service": {
                            "name": "Zahnfüllung"
                        }
                    }
                }
            }
        ],
        "count": 1
    }
}
```

---

### 4. Get Follow-up Reminders

Get upcoming follow-up appointments from medical records.

**Endpoint:** `GET /api/reminders/follow-ups`  
**Auth:** Required  
**Roles:** All authenticated users

**Business Logic:**

-   Returns medical records with follow-up dates within 7 days
-   Only for authenticated user's patient record

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/reminders/follow-ups" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "follow_ups": [
            {
                "id": 1,
                "patient_id": 5,
                "diagnosis": "Karies behandelt",
                "follow_up_date": "2024-02-20",
                "notes": "Kontrolle nach Füllung",
                "appointment": {
                    "service": {
                        "name": "Zahnfüllung"
                    },
                    "staff": {
                        "user": {
                            "name": "Dr. Anna Weber"
                        }
                    }
                },
                "clinic": {
                    "id": 1,
                    "name": "Zahnarztpraxis Dr. Schmidt"
                }
            }
        ],
        "count": 1
    }
}
```

---

## Automated Notification Triggers

### Appointment Lifecycle Notifications

#### 1. Appointment Confirmed

Automatically sent when staff confirms an appointment.

**Trigger:** `POST /api/appointments/{id}/confirm`  
**Notification Type:** `appointment_confirmed`  
**Message:** "Ihr Termin am {date} um {time} Uhr wurde bestätigt."

#### 2. Appointment Cancelled

Automatically sent when appointment is cancelled.

**Trigger:** `POST /api/appointments/{id}/cancel`  
**Notification Type:** `appointment_cancelled`  
**Message:** "Ihr Termin am {date} um {time} Uhr wurde storniert. Grund: {reason}"

#### 3. Appointment Reminder

Sent 24 hours before appointment (or based on user preference).

**Trigger:** Scheduled job or manual trigger  
**Notification Type:** `appointment_reminder`  
**Message:** "Ihr Termin bei {clinic} ist morgen am {date} um {time} Uhr."

---

## Authorization Rules

### Notifications:

-   **List/View:** Users see only their own notifications
-   **Create:** Admin, Clinic Owner, Manager, Receptionist
-   **Mark Read/Delete:** Notification owner only

### Preferences:

-   **View/Update/Reset:** Authenticated user (own preferences only)

### Reminders:

-   **View Upcoming:** All authenticated users (own data)
-   **Send Reminders:** Admin, Clinic Owner, Manager only

---

## Validation Rules

### Create Notification:

-   `user_id`: Required, must exist
-   `type`: Required, must be valid type
-   `title`: Required, string, max 255
-   `message`: Required, string
-   `scheduled_for`: Optional, date
-   `data`: Optional, array

### Update Preferences:

-   All fields optional
-   `reminder_hours_before`: If provided, 1-72 hours
-   Boolean fields: true/false

---

## Business Rules

1. **Notification Delivery:**

    - Respects user preferences
    - Email sent if `email_notifications` enabled
    - SMS sent if `sms_notifications` enabled
    - Push sent if `push_notifications` enabled

2. **Reminder Timing:**

    - Based on `reminder_hours_before` preference
    - Default: 24 hours before appointment
    - Range: 1-72 hours

3. **Duplicate Prevention:**

    - Checks if reminder already sent in last 24 hours
    - Prevents spam notifications

4. **Automatic Read Status:**
    - Notification marked read when viewed (GET /notifications/{id})
    - Can also manually mark as read

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

## Complete Workflow Examples

### User Preference Setup:

```bash
# 1. Get current preferences
GET /api/notification-preferences

# 2. Update preferences
PUT /api/notification-preferences
{
  "sms_notifications": true,
  "reminder_hours_before": 48
}

# 3. Check unread notifications
GET /api/notifications/unread-count
```

### Appointment Reminder Flow:

```bash
# 1. Check upcoming appointments
GET /api/reminders/upcoming-appointments

# 2. Admin sends reminders (scheduled job)
POST /api/reminders/send-appointment-reminders

# 3. User views notifications
GET /api/notifications?read=false

# 4. User marks all as read
POST /api/notifications/mark-all-read
```

### Prescription Reminder Flow:

```bash
# 1. Check prescriptions ending soon
GET /api/reminders/prescriptions

# 2. View specific notification
GET /api/notifications/{id}

# 3. Delete notification
DELETE /api/notifications/{id}
```

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

## Notes

-   All validation messages in German
-   Notifications soft deleted (can be recovered)
-   Preferences created with defaults on first access
-   Scheduled notifications not implemented (ready for queue system)
-   Email/SMS/Push delivery jobs ready for implementation
-   Activity logging enabled for audit trail

---

**Total API Endpoints: 82**

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
-   Notifications: 8 endpoints
-   Notification Preferences: 3 endpoints
-   Reminders: 4 endpoints

**Last Updated:** Sprint 7 - November 2025
