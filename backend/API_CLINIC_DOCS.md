# Clinic Management API Documentation

## Overview

This document describes the Clinic Management endpoints for creating and managing clinics, services, and related entities.

**Base URL**: `http://localhost:8000/api`

**Authentication**: All endpoints require Bearer token authentication via Laravel Sanctum.

---

## Clinics

### 1. List Clinics

Get a paginated list of clinics with filters.

**Endpoint**: `GET /clinics`

**Headers**:

```
Authorization: Bearer {token}
Accept: application/json
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| clinic_type | string | No | Filter by type: `human` or `veterinary` |
| is_active | boolean | No | Filter by active status |
| search | string | No | Search by name or email |
| owner_id | integer | No | Filter by owner ID |
| per_page | integer | No | Items per page (default: 15) |

**Example Request**:

```bash
curl -X GET "http://localhost:8000/api/clinics?clinic_type=human&is_active=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Example Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "owner_id": 1,
        "name": "Praxis Dr. Müller",
        "slug": "praxis-dr-mueller",
        "clinic_type": "human",
        "description": "Allgemeinmedizin und Innere Medizin",
        "email": "kontakt@praxis-mueller.de",
        "phone": "+49 30 12345678",
        "website": "https://praxis-mueller.de",
        "logo": "clinics/logos/abc123.jpg",
        "specialties": ["Allgemeinmedizin", "Innere Medizin"],
        "languages": ["de", "en"],
        "is_active": true,
        "owner": {
          "id": 1,
          "name": "Dr. Müller",
          "email": "mueller@example.com"
        },
        "branches": [...],
        "subscription": {...}
      }
    ],
    "per_page": 15,
    "total": 1
  }
}
```

---

### 2. Create Clinic

Create a new clinic with main branch.

**Endpoint**: `POST /clinics`

**Headers**:

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: multipart/form-data
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Clinic name (max 255) |
| clinic_type | string | Yes | `human` or `veterinary` |
| description | string | No | Clinic description (max 1000) |
| email | string | Yes | Unique email address |
| phone | string | Yes | Phone number |
| website | string | No | Website URL |
| logo | file | No | Logo image (max 2MB) |
| specialties | array | No | Array of specialties |
| languages | array | No | Array of languages (de, en, ar, tr) |
| branch_name | string | Yes | Main branch name |
| address | string | Yes | Branch address |
| city | string | Yes | Branch city |
| country | string | Yes | Branch country |
| postal_code | string | Yes | Postal code |
| lat | decimal | No | Latitude |
| lng | decimal | No | Longitude |
| branch_phone | string | No | Branch phone (defaults to clinic phone) |
| branch_email | string | No | Branch email (defaults to clinic email) |

**Example Request**:

```bash
curl -X POST "http://localhost:8000/api/clinics" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json" \
  -F "name=Praxis Dr. Müller" \
  -F "clinic_type=human" \
  -F "description=Allgemeinmedizin und Innere Medizin" \
  -F "email=kontakt@praxis-mueller.de" \
  -F "phone=+49 30 12345678" \
  -F "website=https://praxis-mueller.de" \
  -F "specialties[]=Allgemeinmedizin" \
  -F "specialties[]=Innere Medizin" \
  -F "languages[]=de" \
  -F "languages[]=en" \
  -F "branch_name=Hauptstandort" \
  -F "address=Hauptstraße 123" \
  -F "city=Berlin" \
  -F "country=Deutschland" \
  -F "postal_code=10115"
```

**Example Response** (201 Created):

```json
{
    "success": true,
    "message": "Klinik erfolgreich erstellt.",
    "data": {
        "id": 1,
        "owner_id": 1,
        "name": "Praxis Dr. Müller",
        "slug": "praxis-dr-mueller",
        "clinic_type": "human",
        "email": "kontakt@praxis-mueller.de",
        "branches": [
            {
                "id": 1,
                "name": "Hauptstandort",
                "address": "Hauptstraße 123",
                "city": "Berlin",
                "is_main": true
            }
        ]
    }
}
```

---

### 3. Get Clinic Details

Get detailed information about a specific clinic.

**Endpoint**: `GET /clinics/{clinic}`

**Example Request**:

```bash
curl -X GET "http://localhost:8000/api/clinics/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Example Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Praxis Dr. Müller",
    "owner": {...},
    "subscription": {...},
    "branches": [...],
    "staff": [...],
    "services": [...],
    "reviews": [...]
  }
}
```

---

### 4. Update Clinic

Update clinic information.

**Endpoint**: `PUT /clinics/{clinic}`

**Headers**:

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

**Request Body**: (All fields optional)

```json
{
    "name": "Updated Clinic Name",
    "description": "Updated description",
    "phone": "+49 30 87654321",
    "is_active": true
}
```

**Example Response** (200 OK):

```json
{
  "success": true,
  "message": "Klinik erfolgreich aktualisiert.",
  "data": {...}
}
```

---

### 5. Delete Clinic

Soft delete a clinic.

**Endpoint**: `DELETE /clinics/{clinic}`

**Example Request**:

```bash
curl -X DELETE "http://localhost:8000/api/clinics/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Example Response** (200 OK):

```json
{
    "success": true,
    "message": "Klinik erfolgreich gelöscht."
}
```

---

### 6. Get Clinic Statistics

Get statistics for a specific clinic.

**Endpoint**: `GET /clinics/{clinic}/statistics`

**Example Response** (200 OK):

```json
{
    "success": true,
    "data": {
        "total_branches": 3,
        "total_staff": 12,
        "active_staff": 10,
        "total_services": 25,
        "active_services": 23,
        "total_appointments": 450,
        "upcoming_appointments": 78,
        "today_appointments": 15,
        "average_rating": 4.7,
        "total_reviews": 89
    }
}
```

---

## Services

### 1. List Services

Get all services for a clinic.

**Endpoint**: `GET /clinics/{clinic}/services`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| is_active | boolean | No | Filter by active status |
| category | string | No | Filter by category |
| search | string | No | Search by name |
| sort_by | string | No | Sort field: `price`, `duration`, `name` |
| sort_order | string | No | `asc` or `desc` (default: asc) |
| per_page | integer | No | Items per page (default: 15) |

**Example Request**:

```bash
curl -X GET "http://localhost:8000/api/clinics/1/services?category=Diagnostik&sort_by=price" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

---

### 2. Create Service

Create a new service for a clinic.

**Endpoint**: `POST /clinics/{clinic}/services`

**Request Body**:

```json
{
    "name": "Allgemeine Untersuchung",
    "description": "Komplette körperliche Untersuchung",
    "duration": 30,
    "price": 75.0,
    "category": "Diagnostik",
    "color": "#3b82f6",
    "staff_ids": [1, 2, 3]
}
```

**Validation Rules**:

-   `duration`: 5-480 minutes
-   `price`: 0-99999.99
-   `color`: Hex format (#RRGGBB)

**Example Response** (201 Created):

```json
{
  "success": true,
  "message": "Dienstleistung erfolgreich erstellt.",
  "data": {
    "id": 1,
    "clinic_id": 1,
    "name": "Allgemeine Untersuchung",
    "duration": 30,
    "price": "75.00",
    "staff": [...]
  }
}
```

---

### 3. Get Service Details

Get detailed information about a service.

**Endpoint**: `GET /clinics/{clinic}/services/{service}`

---

### 4. Update Service

Update service information.

**Endpoint**: `PUT /clinics/{clinic}/services/{service}`

**Request Body** (all optional):

```json
{
    "name": "Updated Service Name",
    "duration": 45,
    "price": 85.0,
    "is_active": true,
    "staff_ids": [1, 2, 4]
}
```

---

### 5. Delete Service

Soft delete a service.

**Endpoint**: `DELETE /clinics/{clinic}/services/{service}`

---

### 6. Get Service Categories

Get all unique service categories for a clinic.

**Endpoint**: `GET /clinics/{clinic}/services/categories`

**Example Response**:

```json
{
    "success": true,
    "data": ["Diagnostik", "Behandlung", "Vorsorge", "Impfung"]
}
```

---

## Error Responses

### 403 Forbidden

```json
{
    "success": false,
    "message": "Sie sind nicht berechtigt, diese Aktion auszuführen."
}
```

### 404 Not Found

```json
{
    "message": "No query results for model [App\\Models\\Clinic] 999"
}
```

### 422 Validation Error

```json
{
    "message": "The name field is required.",
    "errors": {
        "name": ["Bitte geben Sie den Namen der Klinik ein."]
    }
}
```

### 500 Server Error

```json
{
    "success": false,
    "message": "Fehler beim Erstellen der Klinik.",
    "error": "Error details..."
}
```

---

## Authorization

-   **Clinic Owners**: Can manage only their own clinics
-   **Super Admins**: Can manage all clinics
-   **Other Roles**: Read-only access to clinic information

---

## Notes

1. All datetime fields are returned in ISO 8601 format
2. Prices are stored with 2 decimal places
3. Logo uploads are limited to 2MB
4. Clinic slugs are auto-generated from names and made unique
5. Creating a clinic automatically creates a main branch
6. Clinic owners are automatically assigned the `clinic_owner` role
7. Service colors default to `#3b82f6` (blue) if not provided
