# 🔐 Authentication API Documentation

## Base URL

```
http://localhost:8000/api
```

---

## 📋 Endpoints

### 1. Register

**POST** `/auth/register`

Create a new user account and receive an authentication token.

**Request Body:**

```json
{
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!",
    "phone": "+49 30 12345678",
    "gender": "male",
    "date_of_birth": "1990-01-15",
    "address": "Unter den Linden 1",
    "city": "Berlin",
    "country": "Germany",
    "postal_code": "10117",
    "language": "de"
}
```

**Response (201):**

```json
{
    "message": "Registrierung erfolgreich.",
    "user": {
        "id": 1,
        "name": "Ahmed Ali",
        "email": "ahmed@example.com",
        "phone": "+49 30 12345678",
        "roles": ["customer"]
    },
    "token": "1|AbCdEfGhIjKlMnOpQrStUvWxYz..."
}
```

**Validation Rules:**

-   `name`: required, string, max:255
-   `email`: required, email, unique
-   `password`: required, min:8, mixed case, numbers, symbols, confirmed
-   `phone`: optional, string, max:20
-   `gender`: optional, in:male,female,other
-   `date_of_birth`: optional, date, before:today

---

### 2. Login

**POST** `/auth/login`

Authenticate user and receive access token.

**Request Body:**

```json
{
    "email": "ahmed@example.com",
    "password": "Password123!"
}
```

**Response (200):**

```json
{
    "message": "Erfolgreich angemeldet.",
    "user": {
        "id": 1,
        "name": "Ahmed Ali",
        "email": "ahmed@example.com",
        "phone": "+49 30 12345678",
        "avatar": null,
        "roles": ["customer"],
        "permissions": [
            "view_own_appointments",
            "create_appointment",
            "cancel_appointment"
        ]
    },
    "token": "2|AbCdEfGhIjKlMnOpQrStUvWxYz..."
}
```

**Error Responses:**

-   `422` - Invalid credentials
-   `422` - Account is deactivated

---

### 3. Get Authenticated User

**GET** `/auth/user`

Get the currently authenticated user's information.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "user": {
        "id": 1,
        "name": "Ahmed Ali",
        "email": "ahmed@example.com",
        "phone": "+49 30 12345678",
        "avatar": null,
        "gender": "male",
        "date_of_birth": "1990-01-15",
        "address": "Unter den Linden 1",
        "city": "Berlin",
        "country": "Germany",
        "postal_code": "10117",
        "language": "de",
        "is_active": true,
        "email_verified_at": null,
        "roles": ["customer"],
        "permissions": [
            "view_own_appointments",
            "create_appointment",
            "cancel_appointment"
        ],
        "created_at": "2025-11-26T14:30:00.000000Z"
    }
}
```

---

### 4. Update Profile

**PUT** `/auth/profile`

Update authenticated user's profile information.

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
    "name": "Ahmed Ali Updated",
    "phone": "+49 30 98765432",
    "gender": "male",
    "city": "Munich",
    "address": "Marienplatz 1"
}
```

**Response (200):**

```json
{
    "message": "Profil erfolgreich aktualisiert.",
    "user": {
        "id": 1,
        "name": "Ahmed Ali Updated",
        "email": "ahmed@example.com",
        "phone": "+49 30 98765432",
        "gender": "male",
        "date_of_birth": "1990-01-15",
        "address": "Marienplatz 1",
        "city": "Munich",
        "country": "Germany",
        "postal_code": "10117",
        "language": "de"
    }
}
```

---

### 5. Upload Avatar

**POST** `/auth/avatar`

Upload profile picture for authenticated user.

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**

```
avatar: [image file] (max 2MB)
```

**Response (200):**

```json
{
    "message": "Profilbild erfolgreich hochgeladen.",
    "avatar": "avatars/xyz123.jpg"
}
```

**Validation:**

-   File must be an image (jpg, jpeg, png, gif, webp)
-   Maximum size: 2MB

---

### 6. Change Password

**PUT** `/auth/password`

Change authenticated user's password.

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
    "current_password": "Password123!",
    "password": "NewPassword123!",
    "password_confirmation": "NewPassword123!"
}
```

**Response (200):**

```json
{
    "message": "Passwort erfolgreich geändert."
}
```

**Error Responses:**

-   `422` - Current password is incorrect
-   `422` - New password doesn't meet requirements

---

### 7. Logout

**POST** `/auth/logout`

Revoke current access token and logout user.

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "message": "Erfolgreich abgemeldet."
}
```

---

## 🔑 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {your_token_here}
```

Get the token from `/auth/register` or `/auth/login` response.

---

## 🚨 Error Responses

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### Unauthorized (401)

```json
{
    "message": "Unauthenticated."
}
```

### Server Error (500)

```json
{
    "message": "Server Error"
}
```

---

## 📦 Postman Collection

Import `postman_collection.json` into Postman to test all endpoints.

**Variables:**

-   `base_url`: http://localhost:8000/api
-   `auth_token`: (auto-populated after login)

---

## 🧪 Testing with cURL

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Password123!"
  }'
```

### Get User (with token)

```bash
curl -X GET http://localhost:8000/api/auth/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 User Roles

After registration, users are automatically assigned the **customer** role with these permissions:

-   `view_own_appointments`
-   `create_appointment`
-   `cancel_appointment`

Additional roles can be assigned by administrators:

-   **super_admin** - Full system access
-   **clinic_owner** - Manage clinic
-   **clinic_manager** - Manage operations
-   **doctor** - Medical records
-   **nurse** - Patient assistance
-   **receptionist** - Appointment scheduling
-   **customer** - Book appointments

---

## ⚙️ Rate Limiting

API endpoints are rate-limited to prevent abuse:

-   **60 requests per minute** per user
-   Exceeding limits returns `429 Too Many Requests`

---

## 🌐 CORS

Allowed origins:

-   http://localhost:3000
-   http://localhost:3001

---

## 📝 Notes

1. All passwords must be at least 8 characters with:

    - Mixed case letters
    - Numbers
    - Special symbols

2. Email verification is optional (can be enabled in config)

3. Tokens never expire by default (can be configured)

4. All timestamps are in UTC timezone

---

**Server:** http://localhost:8000  
**Status:** ✅ Running
