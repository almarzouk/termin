# Analytics & Reporting API Documentation

## Overview

The Analytics & Reporting API provides comprehensive analytics, statistics, and performance metrics for clinics, appointments, patients, staff, and revenue.

**Base URL:** `http://localhost:8000/api`  
**Authentication:** Required (Bearer Token via Laravel Sanctum)  
**Total Endpoints:** 15

---

## Common Features

### Authorization

All analytics endpoints require authentication and are restricted to:

-   **Super Admin**: Access to all clinics
-   **Clinic Owner**: Access to their clinic only
-   **Clinic Manager**: Access to their clinic only

Regular staff and patients cannot access analytics endpoints.

### Common Query Parameters

Most analytics endpoints support the following filters:

-   `period` (optional): Predefined time period
    -   Values: `today`, `week`, `month`, `quarter`, `year`, `custom`
    -   Default: `month`
-   `start_date` (optional): Start date for custom period (Y-m-d)
-   `end_date` (optional): End date for custom period (Y-m-d)
-   `clinic_id` (optional): Filter by clinic (Super Admin only)
-   `branch_id` (optional): Filter by branch
-   `service_id` (optional): Filter by service
-   `staff_id` (optional): Filter by staff
-   `group_by` (optional): Group results by time period
    -   Values: `day`, `week`, `month`, `year`

---

## Dashboard Module

### Overview

Get high-level overview statistics and KPIs for quick insights.

**Total Endpoints:** 2

---

### 1. Dashboard Overview

Get comprehensive dashboard statistics.

**Endpoint:** `GET /api/analytics/dashboard/overview`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/dashboard/overview?period=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "total_appointments": 245,
        "total_patients": 156,
        "total_revenue": 48750.5,
        "total_staff": 12,
        "appointment_status_breakdown": {
            "pending": 35,
            "confirmed": 87,
            "completed": 98,
            "cancelled": 18,
            "no_show": 7
        },
        "revenue_comparison": {
            "current_period": 48750.5,
            "previous_period": 42300.0,
            "change_percentage": 15.25,
            "trend": "up"
        },
        "recent_appointments": [
            {
                "id": 245,
                "patient_name": "Max Mustermann",
                "service": "Zahnreinigung",
                "staff": "Dr. Anna Weber",
                "date": "2024-11-26",
                "time": "10:00:00",
                "status": "confirmed"
            }
        ]
    }
}
```

---

### 2. Key Performance Indicators

Get detailed KPIs for performance monitoring.

**Endpoint:** `GET /api/analytics/dashboard/kpis`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/dashboard/kpis?period=quarter" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "appointment_completion_rate": 85.32,
        "average_appointment_duration": 45.5,
        "patient_retention_rate": 68.75,
        "revenue_per_appointment": 198.98,
        "no_show_rate": 2.86,
        "cancellation_rate": 7.35,
        "staff_utilization_rate": 72.45
    }
}
```

---

## Revenue Analytics Module

### Overview

Comprehensive revenue analytics, trends, and comparisons.

**Total Endpoints:** 3

---

### 1. Revenue Analytics

Get detailed revenue breakdown and analysis.

**Endpoint:** `GET /api/analytics/revenue`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/revenue?period=month&branch_id=1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "total_revenue": 48750.5,
        "revenue_by_payment_method": [
            {
                "method": "credit_card",
                "total": 32500.0
            },
            {
                "method": "cash",
                "total": 12250.5
            },
            {
                "method": "insurance",
                "total": 4000.0
            }
        ],
        "revenue_by_service": [
            {
                "service": "Zahnreinigung",
                "total": 18900.0
            },
            {
                "service": "Zahnfüllung",
                "total": 15400.5
            },
            {
                "service": "Wurzelbehandlung",
                "total": 14450.0
            }
        ],
        "revenue_by_branch": [
            {
                "branch": "Hauptfiliale München",
                "total": 35250.5
            },
            {
                "branch": "Filiale Berlin",
                "total": 13500.0
            }
        ],
        "revenue_trend": [
            {
                "period": "2024-11-01",
                "total": 1250.0
            },
            {
                "period": "2024-11-02",
                "total": 2100.5
            }
        ],
        "top_earning_services": [
            {
                "service": "Zahnreinigung",
                "total_revenue": 18900.0,
                "payment_count": 95,
                "average_per_payment": 198.95
            }
        ]
    }
}
```

---

### 2. Revenue Trend

Get revenue trends over time with custom grouping.

**Endpoint:** `GET /api/analytics/revenue/trend`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters
-   `group_by`: `day`, `week`, `month`, `year` (default: `day`)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/revenue/trend?period=year&group_by=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "trend": [
            {
                "period": "2024-01",
                "total": 42350.0
            },
            {
                "period": "2024-02",
                "total": 45200.5
            },
            {
                "period": "2024-03",
                "total": 48750.0
            }
        ],
        "group_by": "month"
    }
}
```

---

### 3. Revenue Comparison

Compare revenue between periods.

**Endpoint:** `GET /api/analytics/revenue/comparison`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/revenue/comparison?start_date=2024-11-01&end_date=2024-11-30" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "current_period": {
            "revenue": 48750.5,
            "start_date": "2024-11-01",
            "end_date": "2024-11-30"
        },
        "previous_period": {
            "revenue": 42300.0,
            "start_date": "2024-10-01",
            "end_date": "2024-10-31"
        },
        "comparison": {
            "change_amount": 6450.5,
            "change_percentage": 15.25,
            "trend": "up"
        }
    }
}
```

---

## Appointment Analytics Module

### Overview

Detailed appointment statistics, trends, and performance metrics.

**Total Endpoints:** 3

---

### 1. Appointment Analytics

Get comprehensive appointment analytics.

**Endpoint:** `GET /api/analytics/appointments`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/appointments?period=week" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "total_appointments": 245,
        "status_breakdown": {
            "pending": {
                "count": 35,
                "percentage": 14.29
            },
            "confirmed": {
                "count": 87,
                "percentage": 35.51
            },
            "completed": {
                "count": 98,
                "percentage": 40.0
            },
            "cancelled": {
                "count": 18,
                "percentage": 7.35
            },
            "no_show": {
                "count": 7,
                "percentage": 2.86
            }
        },
        "appointments_by_service": [
            {
                "service": "Zahnreinigung",
                "count": 95
            },
            {
                "service": "Zahnfüllung",
                "count": 78
            }
        ],
        "appointments_by_staff": [
            {
                "staff": "Dr. Anna Weber",
                "count": 87
            },
            {
                "staff": "Dr. Thomas Müller",
                "count": 65
            }
        ],
        "appointments_by_branch": [
            {
                "branch": "Hauptfiliale München",
                "count": 167
            },
            {
                "branch": "Filiale Berlin",
                "count": 78
            }
        ],
        "peak_hours": [
            {
                "hour": "10:00",
                "count": 45
            },
            {
                "hour": "14:00",
                "count": 38
            }
        ],
        "busiest_days": [
            {
                "day": "Monday",
                "count": 52
            },
            {
                "day": "Wednesday",
                "count": 48
            }
        ]
    }
}
```

---

### 2. Appointment Trends

Get appointment trends over time.

**Endpoint:** `GET /api/analytics/appointments/trends`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters
-   `group_by`: `day`, `week`, `month`, `year` (default: `day`)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/appointments/trends?period=month&group_by=week" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "trends": [
            {
                "period": "2024-45",
                "total": 58
            },
            {
                "period": "2024-46",
                "total": 62
            },
            {
                "period": "2024-47",
                "total": 54
            }
        ],
        "group_by": "week"
    }
}
```

---

### 3. Appointment Performance

Get appointment performance metrics.

**Endpoint:** `GET /api/analytics/appointments/performance`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/appointments/performance?period=quarter" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "completion_rate": 85.32,
        "no_show_rate": 2.86,
        "cancellation_rate": 7.35,
        "average_lead_time": 5.8,
        "same_day_appointments": 28,
        "rescheduling_rate": 0
    }
}
```

---

## Patient Analytics Module

### Overview

Patient statistics, demographics, growth trends, and engagement metrics.

**Total Endpoints:** 4

---

### 1. Patient Analytics

Get comprehensive patient analytics.

**Endpoint:** `GET /api/analytics/patients`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/patients?period=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "total_patients": 156,
        "new_patients": 23,
        "returning_patients": 98,
        "patient_retention_rate": 68.75,
        "patients_by_gender": {
            "male": {
                "count": 72,
                "percentage": 46.15
            },
            "female": {
                "count": 82,
                "percentage": 52.56
            },
            "other": {
                "count": 2,
                "percentage": 1.28
            }
        },
        "patients_by_age_group": {
            "0-18": {
                "count": 24,
                "percentage": 15.38
            },
            "19-30": {
                "count": 45,
                "percentage": 28.85
            },
            "31-45": {
                "count": 52,
                "percentage": 33.33
            },
            "46-60": {
                "count": 28,
                "percentage": 17.95
            },
            "61+": {
                "count": 7,
                "percentage": 4.49
            }
        },
        "average_appointments_per_patient": 2.45,
        "most_frequent_patients": [
            {
                "id": 5,
                "name": "Max Mustermann",
                "email": "max@example.com",
                "appointment_count": 12
            }
        ]
    }
}
```

---

### 2. Patient Growth

Get patient growth trends over time.

**Endpoint:** `GET /api/analytics/patients/growth`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters
-   `group_by`: `day`, `week`, `month`, `year` (default: `month`)

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/patients/growth?period=year&group_by=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "growth": [
            {
                "period": "2024-01",
                "total": 18
            },
            {
                "period": "2024-02",
                "total": 22
            },
            {
                "period": "2024-03",
                "total": 25
            }
        ],
        "group_by": "month"
    }
}
```

---

### 3. Patient Demographics

Get detailed patient demographic information.

**Endpoint:** `GET /api/analytics/patients/demographics`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/patients/demographics" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "by_gender": {
            "male": {
                "count": 72,
                "percentage": 46.15
            },
            "female": {
                "count": 82,
                "percentage": 52.56
            },
            "other": {
                "count": 2,
                "percentage": 1.28
            }
        },
        "by_age_group": {
            "0-18": {
                "count": 24,
                "percentage": 15.38
            },
            "19-30": {
                "count": 45,
                "percentage": 28.85
            }
        },
        "average_age": 38.5,
        "by_blood_type": [
            {
                "blood_type": "A+",
                "count": 45
            },
            {
                "blood_type": "O+",
                "count": 38
            },
            {
                "blood_type": "B+",
                "count": 25
            }
        ]
    }
}
```

---

### 4. Patient Engagement

Get patient engagement metrics.

**Endpoint:** `GET /api/analytics/patients/engagement`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/patients/engagement?period=quarter" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "active_patients": 124,
        "inactive_patients": 32,
        "average_visit_frequency": 45.8,
        "patients_with_medical_records": 98,
        "patients_with_prescriptions": 76
    }
}
```

---

## Staff Performance Module

### Overview

Staff performance metrics, utilization rates, and individual performance tracking.

**Total Endpoints:** 3

---

### 1. Staff Performance Overview

Get overview of all staff performance.

**Endpoint:** `GET /api/analytics/staff`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/staff?period=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "total_staff": 12,
        "staff_by_specialization": [
            {
                "specialization": "Zahnarzt",
                "count": 5
            },
            {
                "specialization": "Dentalhygieniker",
                "count": 4
            },
            {
                "specialization": "Kieferorthopäde",
                "count": 3
            }
        ],
        "top_performing_staff": [
            {
                "staff_id": 10,
                "name": "Dr. Anna Weber",
                "total_revenue": 15400.0,
                "appointment_count": 87,
                "average_per_appointment": 177.01
            },
            {
                "staff_id": 12,
                "name": "Dr. Thomas Müller",
                "total_revenue": 12800.5,
                "appointment_count": 65,
                "average_per_appointment": 196.93
            }
        ],
        "staff_utilization": [
            {
                "staff_id": 10,
                "name": "Dr. Anna Weber",
                "utilization_rate": 85.5,
                "worked_hours": 205,
                "available_hours": 240
            }
        ],
        "staff_ratings": []
    }
}
```

---

### 2. Individual Staff Performance

Get detailed performance for specific staff member.

**Endpoint:** `GET /api/analytics/staff/{staffId}`  
**Auth:** Required (Admin/Manager only)

**Path Parameters:**

-   `staffId`: Staff ID

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/staff/10?period=month" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": {
        "staff_info": {
            "id": 10,
            "name": "Dr. Anna Weber",
            "specialization": "Zahnarzt",
            "status": "active"
        },
        "appointments": {
            "total": 87,
            "completed": 78,
            "cancelled": 6,
            "no_show": 3,
            "completion_rate": 89.66
        },
        "revenue": {
            "total": 15400.0,
            "average_per_appointment": 177.01
        },
        "medical_records": 65,
        "working_hours": [
            {
                "day": "monday",
                "start_time": "08:00:00",
                "end_time": "17:00:00",
                "is_available": true
            }
        ],
        "peak_hours": [
            {
                "hour": "10:00",
                "count": 15
            },
            {
                "hour": "14:00",
                "count": 12
            }
        ]
    }
}
```

---

### 3. Staff Comparison

Compare performance metrics across all staff.

**Endpoint:** `GET /api/analytics/staff/comparison`  
**Auth:** Required (Admin/Manager only)

**Query Parameters:**

-   All common parameters

**Request Example:**

```bash
curl -X GET "http://localhost:8000/api/analytics/staff/comparison?period=quarter" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "id": 10,
            "name": "Dr. Anna Weber",
            "specialization": "Zahnarzt",
            "total_appointments": 87,
            "completed_appointments": 78,
            "completion_rate": 89.66,
            "total_revenue": 15400.0,
            "average_revenue": 177.01
        },
        {
            "id": 12,
            "name": "Dr. Thomas Müller",
            "specialization": "Zahnarzt",
            "total_appointments": 65,
            "completed_appointments": 58,
            "completion_rate": 89.23,
            "total_revenue": 12800.5,
            "average_revenue": 196.93
        }
    ]
}
```

---

## Response Format

All analytics endpoints follow this standard format:

**Success Response:**

```json
{
    "success": true,
    "data": {
        /* analytics data */
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

## Use Cases & Examples

### Monthly Dashboard Report

```bash
# Get complete monthly overview
GET /api/analytics/dashboard/overview?period=month

# Get detailed KPIs
GET /api/analytics/dashboard/kpis?period=month

# Get revenue breakdown
GET /api/analytics/revenue?period=month

# Get appointment analytics
GET /api/analytics/appointments?period=month

# Get patient statistics
GET /api/analytics/patients?period=month

# Get staff performance
GET /api/analytics/staff?period=month
```

### Custom Date Range Analysis

```bash
# Analyze Q4 2024
GET /api/analytics/revenue?start_date=2024-10-01&end_date=2024-12-31

# Compare with previous quarter
GET /api/analytics/revenue/comparison?start_date=2024-10-01&end_date=2024-12-31
```

### Branch-Specific Analytics

```bash
# Get branch performance
GET /api/analytics/dashboard/overview?period=month&branch_id=1

# Branch revenue
GET /api/analytics/revenue?period=month&branch_id=1

# Branch appointments
GET /api/analytics/appointments?period=month&branch_id=1
```

### Staff Performance Review

```bash
# Overall staff performance
GET /api/analytics/staff?period=quarter

# Individual staff details
GET /api/analytics/staff/10?period=quarter

# Staff comparison
GET /api/analytics/staff/comparison?period=quarter
```

### Trend Analysis

```bash
# Revenue trend by month
GET /api/analytics/revenue/trend?period=year&group_by=month

# Appointment trends by week
GET /api/analytics/appointments/trends?period=quarter&group_by=week

# Patient growth by month
GET /api/analytics/patients/growth?period=year&group_by=month
```

---

## Business Metrics Explained

### KPIs

1. **Appointment Completion Rate**

    - Formula: (Completed / Total) × 100
    - Target: > 80%

2. **Patient Retention Rate**

    - Formula: (Returning Patients / Total Patients) × 100
    - Target: > 60%

3. **No-Show Rate**

    - Formula: (No Shows / Total) × 100
    - Target: < 5%

4. **Staff Utilization Rate**

    - Formula: (Worked Hours / Available Hours) × 100
    - Target: 70-85%

5. **Revenue Per Appointment**
    - Formula: Total Revenue / Total Appointments
    - Higher is better

### Time Periods

-   **Today**: Current day (00:00 to 23:59)
-   **Week**: Current week (Monday to Sunday)
-   **Month**: Current calendar month
-   **Quarter**: Current 3-month quarter (Q1-Q4)
-   **Year**: Current calendar year
-   **Custom**: User-defined date range

---

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | Success                                  |
| 403         | Forbidden (insufficient permissions)     |
| 404         | Not Found (invalid staff/clinic ID)      |
| 422         | Unprocessable Entity (validation errors) |
| 500         | Internal Server Error                    |

---

## Notes

-   All monetary values in EUR (€)
-   All percentages rounded to 2 decimal places
-   All dates in ISO 8601 format (Y-m-d)
-   Time periods calculated in server timezone
-   Super Admin can access cross-clinic analytics
-   Clinic managers limited to their clinic data
-   Results cached for 5 minutes for performance
-   Large date ranges may take longer to process

---

**Total System API Endpoints: 97**

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
-   **Analytics: 15 endpoints** ⭐

**Last Updated:** Sprint 8 - November 2024
