# 🔐 Test Users Credentials

## System Users - Mien Termin App

### 🔴 Super Admin

- **Email:** `admin@system.de`
- **Password:** `Admin@123`
- **Role:** Super Admin
- **Permissions:** Full system access

---

### 🟣 Clinic Owner

- **Email:** `owner@klinik.de`
- **Password:** `Owner@123`
- **Role:** Clinic Owner
- **Permissions:** Full clinic management, staff, appointments, analytics

---

### 🔵 Clinic Manager

- **Email:** `manager@klinik.de`
- **Password:** `Manager@123`
- **Role:** Clinic Manager
- **Permissions:** Clinic operations, staff scheduling, appointments

---

### 🟢 Doctors

#### Doctor 1

- **Email:** `doctor1@klinik.de`
- **Password:** `Doctor@123`
- **Name:** Dr. Andreas Müller
- **Role:** Doctor
- **Permissions:** View appointments, patient records, add prescriptions

#### Doctor 2

- **Email:** `doctor2@klinik.de`
- **Password:** `Doctor@123`
- **Name:** Dr. Sarah Schmidt
- **Role:** Doctor
- **Permissions:** View appointments, patient records, add prescriptions

---

### 🟡 Nurses

#### Nurse 1

- **Email:** `nurse1@klinik.de`
- **Password:** `Nurse@123`
- **Name:** Anna Weber
- **Role:** Nurse
- **Permissions:** View appointments, patient records, add medical notes

#### Nurse 2

- **Email:** `nurse2@klinik.de`
- **Password:** `Nurse@123`
- **Name:** Lisa Hoffmann
- **Role:** Nurse
- **Permissions:** View appointments, patient records, add medical notes

---

### 🟠 Receptionist

- **Email:** `reception@klinik.de`
- **Password:** `Reception@123`
- **Name:** Sophie Becker
- **Role:** Receptionist
- **Permissions:** Manage appointments, view patients

---

### ⚪ Customers/Patients

#### Patient 1

- **Email:** `patient1@test.de`
- **Password:** `Patient@123`
- **Name:** Max Mustermann
- **Role:** Customer
- **Permissions:** View own appointments, book appointments

#### Patient 2

- **Email:** `patient2@test.de`
- **Password:** `Patient@123`
- **Name:** Emma Meyer
- **Role:** Customer
- **Permissions:** View own appointments, book appointments

---

### 🎯 Demo Account

- **Email:** `demo@test.de`
- **Password:** `Demo@123`
- **Role:** Clinic Owner
- **Permissions:** Full demo access

---

## 📝 Notes

### Default Password Pattern:

- Super Admin: `Admin@123`
- Clinic Owner: `Owner@123`
- Manager: `Manager@123`
- Doctors: `Doctor@123`
- Nurses: `Nurse@123`
- Receptionist: `Reception@123`
- Patients: `Patient@123`
- Demo: `Demo@123`

### Quick Test Accounts:

For quick testing, use these commonly used accounts:

- **Admin:** `admin@system.de` / `Admin@123`
- **Demo:** `demo@test.de` / `Demo@123`
- **Doctor:** `doctor1@klinik.de` / `Doctor@123`

### Security Notice:

⚠️ **IMPORTANT:** These are test credentials for development only.
Never use these in production!

---

## 🚀 How to Use

1. **Login to Frontend:**

   ```
   URL: http://localhost:3000/login
   ```

2. **API Login:**

   ```bash
   POST http://localhost:8000/api/auth/login
   Body: {
     "email": "demo@test.de",
     "password": "Demo@123"
   }
   ```

3. **Response:**
   ```json
   {
     "message": "Erfolgreich angemeldet.",
     "user": { ... },
     "token": "your-api-token"
   }
   ```

---

## 📊 Roles Overview

| Role           | Count | Description           |
| -------------- | ----- | --------------------- |
| Super Admin    | 1     | Full system control   |
| Clinic Owner   | 2     | Manage entire clinic  |
| Clinic Manager | 1     | Operations management |
| Doctor         | 2     | Medical services      |
| Nurse          | 2     | Patient care          |
| Receptionist   | 1     | Front desk            |
| Customer       | 2     | Patients              |

**Total Users:** 11

---

Last Updated: 26 November 2025
