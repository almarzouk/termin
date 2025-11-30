# 📋 Mein-Termin Booking System - Master Plan

**Project Type:** SaaS Medical Booking Platform  
**Methodology:** Agile/Scrum  
**Sprint Duration:** 2 weeks  
**Total Timeline:** 14 weeks (7 Sprints)  
**Last Updated:** 25 November 2025

---

## 🎯 Project Vision

منصة SaaS متخصصة لإدارة وحجز المواعيد للعيادات الطبية (عيادات بشرية وعيادات بيطرية).

**Key Features:**

- Multi-tenant clinic management
- Real-time appointment booking
- 7-role permission system
- Medical records management
- Subscription-based (Stripe)
- Multi-language support (DE/AR/EN)

**Scalability:** النظام مصمم بطريقة قابلة للتوسع لإضافة أنواع أخرى من الأعمال في المستقبل.

**Primary Language:** 🇩🇪 Deutsch (German) - All UI text in German

---

## 📚 Project Documentation

### 📁 **Backend Documentation**

- 📄 **[BACKEND_TODO.md](./backend/BACKEND_TODO.md)** - Backend development plan & tasks
- 📄 **[BACKEND_ARCHITECTURE.md](./backend/BACKEND_ARCHITECTURE.md)** - Database schema, roles, permissions
- 📄 **[DEVELOPMENT_ROADMAP.md](./backend/DEVELOPMENT_ROADMAP.md)** - Phase-by-phase roadmap

### 📁 **Frontend Documentation**

- 📄 **[FRONTEND_TODO.md](./frontend/FRONTEND_TODO.md)** - Frontend development plan & tasks

### 📁 **Additional Documentation**

- 📄 **[USER_SCENARIOS.md](./backend/USER_SCENARIOS.md)** - User journeys & workflows
- 📄 **API Documentation** - Generated via Scribe (after Backend Phase 1)

---

## 🏗️ Development Approach

### ✅ **Strategy: Backend-First**

**Phase 1-6: Backend Development (12 weeks)**

1. Setup & Database (Week 1-2)
2. Authentication & Authorization (Week 3-4)
3. Clinic Management (Week 5-6)
4. Booking System (Week 7-8)
5. Patients & Medical Records (Week 9-10)
6. Subscriptions & Analytics (Week 11-12)

**Phase 7-9: Frontend Development (6 weeks)** 7. Authentication Pages (Week 13-14) 8. Dashboard & Management (Week 15-16) 9. Booking Flow & Analytics (Week 17-18)

**Phase 10: Testing & Deployment (2 weeks)** 10. Comprehensive Testing & Production Launch (Week 19-20)

**Benefits:**

- ✅ APIs tested before Frontend development
- ✅ Clear contracts between Frontend/Backend
- ✅ Mobile app possible later (same APIs)
- ✅ Parallel Frontend development possible

---

## 🏗️ Tech Stack Overview

---

## 📊 Progress Overview

| Sprint   | Duration   | Status         | Progress |
| -------- | ---------- | -------------- | -------- |
| Sprint 0 | Week 1-2   | 🔄 In Progress | 0%       |
| Sprint 1 | Week 3-4   | ⏳ Not Started | 0%       |
| Sprint 2 | Week 5-6   | ⏳ Not Started | 0%       |
| Sprint 3 | Week 7-8   | ⏳ Not Started | 0%       |
| Sprint 4 | Week 9-10  | ⏳ Not Started | 0%       |
| Sprint 5 | Week 11-12 | ⏳ Not Started | 0%       |
| Sprint 6 | Week 13-14 | ⏳ Not Started | 0%       |

**Overall Progress:** 0/7 Sprints (0%)

---

## 🏗️ Tech Stack

### Frontend

- [x] Next.js 15 (App Router)
- [x] TypeScript
- [x] TailwindCSS + Shadcn UI
- [x] Zustand (State Management)
- [x] next-intl (i18n)
- [x] React Query (Data Fetching)

### Backend

- [x] Laravel 12
- [x] MySQL 8
- [x] Redis
- [x] Laravel Sanctum (Auth)
- [x] Spatie Laravel Permission
- [x] Laravel Horizon (Queue Management)
- [x] Laravel Telescope (Development)

### Infrastructure

- [ ] Local Development (MySQL + Redis)
- [ ] VPS Server (Production)
- [ ] Vercel (Frontend)
- [ ] Stripe (Payments)
- [ ] Postmark (Email)
- [ ] Twilio (SMS - Optional)

---

## 📅 Sprint 0: Setup & Planning (Week 1-2)

**Goal:** إعداد بيئة التطوير وتصميم قاعدة البيانات

### 🎫 User Stories

#### US-001: إعداد بيئة Backend ⏳

**Priority:** Must Have  
**Story Points:** 5  
**Status:** 🔄 In Progress

**Tasks:**

- [ ] تثبيت Laravel 12
- [ ] إعداد MySQL database
- [ ] إعداد Redis
- [ ] تكوين environment variables
- [ ] تثبيت Sanctum
- [ ] تثبيت Spatie Permissions
- [ ] تثبيت Spatie Media Library
- [ ] تثبيت Spatie Activity Log
- [ ] تثبيت Telescope للـ debugging
- [ ] إعداد Git hooks و code standards
- [ ] إنشاء folder structure (Modular)

**Acceptance Criteria:**

- Laravel يعمل على `http://localhost:8000`
- Database connection ناجحة
- Redis يعمل بشكل صحيح
- Sanctum مُعَد للـ API authentication

---

#### US-002: إعداد بيئة Frontend ✅

**Priority:** Must Have  
**Story Points:** 5  
**Status:** ✅ Completed

**Tasks:**

- [x] إنشاء Next.js project بـ App Router
- [x] تثبيت TypeScript
- [x] تثبيت TailwindCSS
- [x] تثبيت Shadcn UI components
- [ ] إعداد next-intl (العربية والإنجليزية)
- [ ] إعداد Zustand store
- [ ] إعداد React Query
- [x] إنشاء folder structure
- [x] إعداد ESLint & Prettier

**Acceptance Criteria:**

- ✅ Next.js يعمل على `http://localhost:3001`
- ✅ TailwindCSS يعمل
- ✅ Shadcn components جاهزة
- ⏳ i18n يعمل (AR/EN)
- ✅ TypeScript بدون أخطاء

**Components Created:**

- ✅ Navbar with mobile menu
- ✅ Hero Section with stats
- ✅ Features Section (8 features)
- ✅ Team Section (doctors & nurses)
- ✅ Custom animations & gradients

---

#### US-003: تصميم Database Schema ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تصميم ERD diagram
- [ ] إنشاء migration: users
- [ ] إنشاء migration: clinics (مع دعم: human/veterinary)
- [ ] إنشاء migration: clinic_branches
- [ ] إنشاء migration: clinic_staff
- [ ] إنشاء migration: services (polymorphic - قابل للتوسع)
- [ ] إنشاء migration: service_staff (pivot)
- [ ] إنشاء migration: patients (مع دعم pets)
- [ ] إنشاء migration: appointments (polymorphic)
- [ ] إنشاء migration: appointment_history
- [ ] إنشاء migration: medical_records
- [ ] إنشاء migration: working_hours
- [ ] إنشاء migration: staff_working_hours
- [ ] إنشاء migration: holidays
- [ ] إنشاء migration: reviews
- [ ] إنشاء migration: subscription_plans
- [ ] إنشاء migration: clinic_subscriptions
- [ ] إنشاء migration: payments
- [ ] إنشاء migration: settings
- [ ] إضافة indexes للأداء
- [ ] إضافة foreign keys
- [ ] إنشاء seeders للبيانات التجريبية (عيادات طبية وبيطرية)

**Acceptance Criteria:**

- جميع الـ migrations تعمل بدون أخطاء
- العلاقات بين الجداول صحيحة
- Seeders ينشئ بيانات تجريبية
- Database مُوثّق بـ ERD

---

#### US-004: إعداد Docker Environment (Optional) ⏳

**Priority:** Won't Have  
**Story Points:** 0  
**Status:** ❌ Cancelled

**Reason:** Development will be done locally without Docker  
**Alternative:** Using local MySQL + Redis + Laravel Valet/Herd

---

#### US-005: إعداد Git Workflow ⏳

**Priority:** Must Have  
**Story Points:** 2  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `.gitignore` محدث
- [ ] إعداد branch strategy (main, develop, feature/\*)
- [ ] إنشاء PR template
- [ ] إعداد commit message conventions
- [ ] حماية main branch

**Acceptance Criteria:**

- Git workflow واضح ومُوثّق
- `.env` و sensitive files محمية
- Commit messages منظمة

---

### Sprint 0 Summary

**Total Story Points:** 20  
**Must Have:** 20 points  
**Won't Have:** 0 points (Docker cancelled)

---

## 📅 Sprint 1: Authentication & User Management (Week 3-4)

**Goal:** بناء نظام تسجيل الدخول وإدارة المستخدمين والصلاحيات

### 🎫 User Stories

#### US-006: Backend - نظام Authentication ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد Sanctum routes
- [ ] إنشاء RegisterController
- [ ] إنشاء LoginController
- [ ] إنشاء LogoutController
- [ ] إنشاء ForgotPasswordController
- [ ] إنشاء ResetPasswordController
- [ ] إنشاء middleware للحماية
- [ ] إضافة rate limiting
- [ ] كتابة validation rules
- [ ] كتابة unit tests

**API Endpoints:**

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `POST /api/forgot-password`
- `POST /api/reset-password`
- `GET /api/user`

**Acceptance Criteria:**

- المستخدم يمكنه التسجيل
- المستخدم يمكنه تسجيل الدخول
- Token يُرجع بنجاح
- Password reset يعمل عبر email
- جميع الـ tests تنجح

---

#### US-007: Backend - نظام الصلاحيات (Roles & Permissions) ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تثبيت Spatie Permissions
- [ ] إنشاء الأدوار الأساسية:
  - Super Admin (مدير المنصة)
  - Clinic Owner (مالك العيادة)
  - Clinic Manager (مدير العيادة)
  - Doctor (طبيب/طبيب بيطري)
  - Nurse (ممرض/مساعد طبي)
  - Receptionist (موظف استقبال)
  - Customer (مريض/عميل)
- [ ] إنشاء permissions متقدمة (60+ permission)
- [ ] إنشاء RoleSeeder مع الصلاحيات
- [ ] إنشاء middleware للتحقق من الصلاحيات
- [ ] إنشاء Policies للـ authorization
- [ ] إنشاء API لإدارة الأدوار (Super Admin فقط)
- [ ] تنفيذ Row-Level Security
- [ ] كتابة tests للصلاحيات

**Roles:**

- `super_admin` - إدارة كاملة للمنصة
- `clinic_owner` - إدارة عيادته فقط
- `clinic_manager` - إدارة العمليات اليومية
- `doctor` - إدارة مواعيده وملفات مرضاه
- `nurse` - مساعدة طبية وتسجيل القياسات
- `receptionist` - إدارة المواعيد والاستقبال
- `customer` - حجز المواعيد وإدارة ملفه

**Key Permissions:**

- `manage_all_clinics` (Super Admin)
- `manage_own_clinic` (Clinic Owner)
- `manage_clinic_staff` (Owner/Manager)
- `manage_services` (Owner/Manager)
- `manage_all_appointments` (Owner/Manager/Receptionist)
- `view_own_appointments` (Doctor/Customer)
- `view_patient_records` (Doctor/Nurse)
- `add_medical_notes` (Doctor)
- `add_prescriptions` (Doctor)
- `view_clinic_analytics` (Owner/Manager)
- `manage_subscription_plans` (Super Admin)

**Acceptance Criteria:**

- جميع الأدوار السبعة موجودة في DB
- 60+ permission مُعرّفة
- Middleware يحمي الـ routes بدقة
- Super Admin يمكنه إدارة كل شيء
- Clinic Owner يرى عيادته فقط
- Doctor يرى مرضاه فقط
- Tests تغطي كل السيناريوهات (RBAC)

---

#### US-008: Frontend - صفحات Authentication ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/register` page
- [ ] إنشاء `/login` page
- [ ] إنشاء `/forgot-password` page
- [ ] إنشاء `/reset-password` page
- [ ] إنشاء auth store في Zustand
- [ ] إنشاء API client للـ authentication
- [ ] إضافة form validation (Zod)
- [ ] إضافة error handling
- [ ] إضافة loading states
- [ ] جعل الصفحات responsive
- [ ] إضافة i18n للـ auth pages

**Acceptance Criteria:**

- جميع الصفحات تعمل
- Form validation يعمل
- Errors تُعرض بشكل صحيح
- Success messages تظهر
- Responsive على mobile
- Multi-language (AR/EN)

---

#### US-009: Frontend - Protected Routes ⏳

**Priority:** Must Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء middleware للـ authentication
- [ ] إنشاء middleware للـ roles
- [ ] حماية dashboard routes
- [ ] Redirect للـ login عند عدم المصادقة
- [ ] إنشاء loading state للـ auth check
- [ ] اختبار جميع السيناريوهات

**Acceptance Criteria:**

- المستخدم غير المسجل يُوجّه لـ `/login`
- المستخدم بدون صلاحيات يُمنع
- Token يُخزن بشكل آمن
- Auto-refresh للـ token

---

#### US-010: إنشاء صفحة Profile ⏳

**Priority:** Should Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] Backend: API لتحديث الملف الشخصي
- [ ] Backend: API لتغيير كلمة المرور
- [ ] Backend: API لرفع صورة profile
- [ ] Frontend: صفحة `/profile`
- [ ] Frontend: form لتحديث البيانات
- [ ] Frontend: form لتغيير كلمة المرور
- [ ] Frontend: رفع صورة profile

**Acceptance Criteria:**

- المستخدم يمكنه تحديث بياناته
- تغيير كلمة المرور يعمل
- رفع الصورة يعمل
- Validation صحيح

---

### Sprint 1 Summary

**Total Story Points:** 34  
**Must Have:** 29 points  
**Should Have:** 5 points

---

## 📅 Sprint 2: Company & Services Management (Week 5-6)

**Goal:** إدارة الشركات والخدمات

### 🎫 User Stories

#### US-011: Backend - إدارة العيادات (Clinics CRUD) ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء ClinicController
- [ ] إنشاء Clinic model مع relationships
- [ ] دعم clinic_type (human/veterinary)
- [ ] دعم specialties متعددة (JSON)
- [ ] API: List clinics (Super Admin)
- [ ] API: Create clinic (Owner/Admin)
- [ ] API: Update clinic (Owner)
- [ ] API: Delete clinic (Owner/Admin)
- [ ] API: Get clinic details
- [ ] API: Upload clinic logo (Media Library)
- [ ] إضافة validation متقدم
- [ ] إضافة authorization (Policy)
- [ ] إضافة slug generation
- [ ] كتابة tests

**API Endpoints:**

- `GET /api/admin/clinics` (Super Admin)
- `POST /api/clinics` (Create clinic)
- `GET /api/clinics/{slug}` (Public)
- `PUT /api/clinic` (Update own clinic)
- `DELETE /api/clinic` (Delete own clinic)
- `POST /api/clinic/logo` (Upload logo)

**Acceptance Criteria:**

- Super Admin يمكنه رؤية جميع العيادات
- Clinic Owner يمكنه إدارة عيادته فقط
- دعم العيادات البشرية والبيطرية
- Validation يعمل على كل الحقول
- Slug فريد لكل عيادة
- Tests تغطي CRUD كاملاً

---

#### US-012: Backend - إدارة الخدمات (Services CRUD) ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء ServiceController
- [ ] إنشاء Service model
- [ ] API: List services (بحسب الشركة)
- [ ] API: Create service
- [ ] API: Update service
- [ ] API: Delete service
- [ ] API: Get service details
- [ ] ربط Service بـ Staff (many-to-many)
- [ ] إضافة fields: duration, price, description
- [ ] كتابة tests

**API Endpoints:**

- `GET /api/clinic/services`
- `POST /api/clinic/services`
- `PUT /api/services/{id}`
- `DELETE /api/services/{id}`
- `GET /api/clinics/{slug}/services` (Public)

**Acceptance Criteria:**

- Clinic Owner يمكنه إدارة خدماته
- الخدمة مرتبطة بعيادة واحدة
- يمكن ربط خدمة بعدة أطباء
- دعم خدمات طبية وبيطرية
- Soft delete للخدمات

---

#### US-013: Backend - إدارة الموظفين (Staff CRUD) ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء StaffController
- [ ] إنشاء Staff model (clinic_staff table)
- [ ] دعم أدوار متعددة (doctor, nurse, receptionist, manager)
- [ ] API: List staff (بحسب العيادة)
- [ ] API: Create staff (invite system)
- [ ] API: Update staff
- [ ] API: Delete staff
- [ ] API: Assign services to staff
- [ ] API: Set staff working hours
- [ ] إرسال دعوة عبر email للموظف
- [ ] كتابة tests

**API Endpoints:**

- `GET /api/clinic/staff`
- `POST /api/clinic/staff` (Invite)
- `PUT /api/staff/{id}`
- `DELETE /api/staff/{id}`
- `POST /api/staff/{id}/services`
- `POST /api/staff/{id}/working-hours`
- `GET /api/clinics/{slug}/staff` (Public - doctors only)

**Acceptance Criteria:**

- Clinic Owner يمكنه إدارة موظفيه
- الموظف مرتبط بعيادة واحدة
- يمكن تحديد role للموظف (doctor/nurse/receptionist)
- يمكن تحديد services للأطباء
- يمكن تحديد working hours لكل موظف
- إرسال email دعوة للموظف الجديد

---

#### US-014: Frontend - صفحة إدارة العيادة ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard/clinic` page
- [ ] Form لتعديل بيانات العيادة
- [ ] اختيار clinic_type (Human/Veterinary)
- [ ] Multi-select للتخصصات
- [ ] عرض معلومات العيادة
- [ ] رفع logo العيادة
- [ ] إدارة الفروع (branches)
- [ ] إضافة validation
- [ ] ربط بالـ API

**Acceptance Criteria:**

- Clinic Owner يرى بيانات عيادته
- يمكن تعديل البيانات الأساسية
- يمكن اختيار نوع العيادة (بشرية/بيطرية)
- يمكن اختيار تخصصات متعددة
- Logo يُرفع بنجاح
- يمكن إدارة الفروع
- Responsive

---

#### US-015: Frontend - صفحة إدارة الخدمات ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard/services` page
- [ ] جدول لعرض الخدمات
- [ ] Modal لإضافة خدمة جديدة
- [ ] Modal لتعديل خدمة
- [ ] زر لحذف خدمة
- [ ] ربط بالـ API
- [ ] إضافة search & filter

**Acceptance Criteria:**

- عرض جميع الخدمات في جدول
- CRUD يعمل بشكل كامل
- Search يعمل
- Responsive

---

#### US-016: Frontend - صفحة إدارة الموظفين ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard/staff` page
- [ ] جدول لعرض الموظفين (بحسب الدور)
- [ ] Modal لدعوة موظف جديد
- [ ] Modal لتعديل بيانات موظف
- [ ] تحديد دور الموظف (Doctor/Nurse/Receptionist)
- [ ] تحديد الخدمات للأطباء
- [ ] تحديد أوقات العمل
- [ ] تفعيل/تعطيل موظف
- [ ] ربط بالـ API

**Acceptance Criteria:**

- عرض جميع الموظفين مع أدوارهم
- CRUD يعمل
- نظام دعوات للموظفين الجدد
- تحديد services للأطباء
- تحديد working hours لكل موظف
- Filter by role

---

### Sprint 2 Summary

**Total Story Points:** 48  
**Must Have:** 48 points

---

## 📅 Sprint 3: Booking System Core (Week 7-8)

**Goal:** بناء نظام الحجز الأساسي

### 🎫 User Stories

#### US-017: Backend - Availability Logic ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء AvailabilityService class
- [ ] منطق حساب الأوقات المتاحة
- [ ] التحقق من working_hours
- [ ] التحقق من staff_hours
- [ ] التحقق من holidays
- [ ] التحقق من existing appointments
- [ ] منع التعارضات
- [ ] API: Get available slots
- [ ] كتابة tests مكثفة

**API Endpoints:**

- `GET /api/availability?service_id={id}&staff_id={id}&date={date}`

**Acceptance Criteria:**

- يُرجع الأوقات المتاحة فقط
- لا يوجد تعارضات
- يحترم working hours
- يحترم holidays
- Performance عالي (< 200ms)

---

#### US-018: Backend - Appointments CRUD ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء AppointmentController
- [ ] إنشاء Appointment model
- [ ] API: Create appointment
- [ ] API: Update appointment
- [ ] API: Cancel appointment
- [ ] API: List appointments
- [ ] API: Get appointment details
- [ ] إضافة status: pending, confirmed, completed, cancelled
- [ ] إرسال email confirmation
- [ ] كتابة tests

**API Endpoints:**

- `POST /api/appointments`
- `GET /api/appointments`
- `GET /api/appointments/{id}`
- `PUT /api/appointments/{id}`
- `DELETE /api/appointments/{id}`

**Acceptance Criteria:**

- إنشاء موعد يعمل
- لا يمكن حجز وقت محجوز
- Email يُرسل عند الحجز
- يمكن إلغاء الموعد

---

#### US-019: Backend - Working Hours & Holidays ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء WorkingHoursController
- [ ] إنشاء HolidayController
- [ ] API: Set company working hours
- [ ] API: Set staff working hours
- [ ] API: Add holiday
- [ ] API: Remove holiday
- [ ] API: List holidays
- [ ] كتابة tests

**Acceptance Criteria:**

- يمكن تحديد working hours للشركة
- يمكن تحديد working hours لكل موظف
- يمكن إضافة holidays
- Availability يحترم الإعدادات

---

#### US-020: Frontend - Customer Booking Flow ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/book/{clinicSlug}` page
- [ ] Step 1: اختيار الخدمة
- [ ] Step 2: اختيار الطبيب (optional)
- [ ] Step 3: اختيار التاريخ والوقت
- [ ] Step 4: اختيار المريض (self/family member/pet)
- [ ] Step 5: إدخال معلومات إضافية
- [ ] Step 6: تأكيد الحجز
- [ ] Multi-step form component
- [ ] Calendar component
- [ ] Time slots component (real-time availability)
- [ ] دعم حجز للعائلة (للعيادات البشرية)
- [ ] دعم حجز للحيوانات الأليفة (للعيادات البيطرية)
- [ ] ربط بـ API
- [ ] Validation لكل step

**Acceptance Criteria:**

- Flow سلس من البداية للنهاية
- Real-time availability checking
- دعم حجز لأفراد العائلة
- دعم حجز للحيوانات الأليفة
- Validation صحيح
- Responsive
- Multi-language (DE/AR/EN)

---

#### US-021: Frontend - Dashboard Calendar ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تثبيت FullCalendar
- [ ] إنشاء `/dashboard/calendar` page
- [ ] عرض المواعيد على Calendar
- [ ] Click على موعد لرؤية التفاصيل
- [ ] Drag & Drop لتعديل الموعد (optional)
- [ ] Filter by staff
- [ ] Filter by service
- [ ] ربط بـ API

**Acceptance Criteria:**

- Calendar يعرض جميع المواعيد
- Click يفتح modal بالتفاصيل
- Filters تعمل
- Real-time updates

---

### Sprint 3 Summary

**Total Story Points:** 60  
**Must Have:** 60 points

---

## 📅 Sprint 4: Notifications & Payments (Week 9-10)

**Goal:** إضافة الإشعارات والدفع الإلكتروني

### 🎫 User Stories

#### US-022: Backend - Email Notifications ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد Mail configuration
- [ ] إنشاء Appointment Confirmation email
- [ ] إنشاء Appointment Reminder email (24h before)
- [ ] إنشاء Appointment Cancelled email
- [ ] إنشاء Welcome email (للمرضى الجدد)
- [ ] إنشاء Staff Invitation email
- [ ] إنشاء Medical Report Ready email
- [ ] إعداد Queue للـ emails
- [ ] إعداد Horizon
- [ ] دعم Multi-language emails (DE/AR/EN)
- [ ] اختبار الـ emails

**Acceptance Criteria:**

- Emails تُرسل بنجاح
- Queue يعمل بشكل صحيح
- Templates احترافية ومتعددة اللغات
- Horizon يراقب الـ queues
- Reminder يُرسل قبل 24 ساعة تلقائياً

---

#### US-023: Backend - SMS Notifications (Optional) ⏳

**Priority:** Could Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تثبيت Twilio
- [ ] إنشاء SMS service
- [ ] إرسال SMS عند الحجز
- [ ] إرسال SMS reminder
- [ ] اختبار SMS

**Acceptance Criteria:**

- SMS تُرسل للعملاء
- تكلفة مقبولة
- يعمل دوليًا

---

#### US-024: Backend - Stripe Integration ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تثبيت Stripe SDK
- [ ] إنشاء PaymentController
- [ ] API: Create payment intent
- [ ] API: Confirm payment
- [ ] إنشاء webhook handler
- [ ] ربط Payment بـ Appointment
- [ ] ربط Payment بـ Subscription
- [ ] اختبار بـ test mode

**API Endpoints:**

- `POST /api/payments/intent`
- `POST /api/payments/confirm`
- `POST /api/webhooks/stripe`

**Acceptance Criteria:**

- Stripe يعمل في test mode
- Webhook يستقبل الأحداث
- Payment يُسجل في DB
- Subscription يُنشط بعد الدفع

---

#### US-025: Backend - Subscription Plans ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء SubscriptionPlanController
- [ ] Seeder للخطط الأساسية:
  - Free (1 doctor, 50 appointments/month, 1 branch)
  - Starter (€29/month, 3 doctors, unlimited appointments, 1 branch)
  - Professional (€79/month, 10 doctors, unlimited, 3 branches, analytics)
  - Enterprise (€199/month, unlimited doctors, unlimited branches, advanced features)
- [ ] API: List plans
- [ ] API: Subscribe to plan
- [ ] API: Cancel subscription
- [ ] API: Upgrade/downgrade
- [ ] Middleware للتحقق من limits (doctors, appointments, branches)
- [ ] Grace period عند انتهاء الاشتراك

**Acceptance Criteria:**

- Plans موجودة في DB
- يمكن الاشتراك في خطة
- Limits تُطبق بشكل صحيح (doctors, branches, appointments)
- يمكن upgrade/downgrade
- Grace period يعمل (7 أيام)

---

#### US-026: Frontend - Payment Page ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] تثبيت Stripe Elements
- [ ] إنشاء `/checkout` page
- [ ] Stripe card input component
- [ ] معالجة الدفع
- [ ] عرض نتيجة الدفع
- [ ] Redirect بعد النجاح

**Acceptance Criteria:**

- Stripe form يعمل
- Payment ينجح
- Error handling صحيح
- Secure

---

#### US-027: Frontend - Pricing & Subscription Page ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/pricing` page
- [ ] عرض الخطط في cards
- [ ] زر "Subscribe" لكل خطة
- [ ] Modal للدفع
- [ ] إنشاء `/dashboard/subscription` page
- [ ] عرض الخطة الحالية
- [ ] زر upgrade/cancel

**Acceptance Criteria:**

- Pricing page احترافية
- يمكن الاشتراك بسهولة
- Dashboard يعرض الاشتراك الحالي

---

### Sprint 4 Summary

**Total Story Points:** 50  
**Must Have:** 45 points  
**Could Have:** 5 points

---

## 📅 Sprint 5: Dashboard & Analytics (Week 11-12)

**Goal:** بناء لوحات التحكم والتحليلات

### 🎫 User Stories

#### US-028: Backend - Dashboard Analytics API ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء AnalyticsController
- [ ] API: Get dashboard stats (للعيادة)
  - Total appointments (today/week/month)
  - Total revenue
  - Active patients
  - Today's appointments
  - Upcoming appointments
  - Cancellation rate
- [ ] API: Get appointments chart (last 30 days)
- [ ] API: Get revenue chart
- [ ] API: Get top services
- [ ] API: Get top doctors (most booked)
- [ ] API: Get patient demographics
- [ ] API: Get peak hours analysis
- [ ] Cache النتائج (Redis - TTL: 5 min)
- [ ] Export reports (PDF/CSV)

**API Endpoints:**

- `GET /api/clinic/analytics/dashboard`
- `GET /api/clinic/analytics/appointments-chart`
- `GET /api/clinic/analytics/revenue-chart`
- `GET /api/clinic/analytics/top-services`
- `GET /api/clinic/analytics/export` (PDF/CSV)

**Acceptance Criteria:**

- Stats دقيقة ومحدثة
- Performance عالي (< 200ms)
- Cache يعمل بكفاءة
- Export يعمل (PDF & CSV)

---

#### US-029: Frontend - Business Dashboard Overview ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard` page
- [ ] Stats cards (revenue, appointments, customers)
- [ ] Appointments chart (Recharts)
- [ ] Revenue chart
- [ ] Upcoming appointments list
- [ ] Quick actions buttons
- [ ] ربط بـ API

**Acceptance Criteria:**

- Dashboard جذاب واحترافي
- Charts تعمل
- Real-time data
- Responsive

---

#### US-030: Frontend - Appointments Management Page ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard/appointments` page
- [ ] جدول المواعيد مع filters
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Filter by staff
- [ ] Filter by service
- [ ] Export to CSV
- [ ] Pagination

**Acceptance Criteria:**

- جدول يعرض جميع المواعيد
- Filters تعمل
- Export يعمل
- Pagination سلس

---

#### US-031: Frontend - Patient Management (CRM) ⏳

**Priority:** Should Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/dashboard/patients` page
- [ ] جدول المرضى مع معلومات أساسية
- [ ] Customer profile page
- [ ] عرض appointment history
- [ ] عرض medical records
- [ ] عرض total spent
- [ ] إضافة notes خاصة بالعيادة
- [ ] Search & filter patients
- [ ] دعم عرض الحيوانات الأليفة (للعيادات البيطرية)
- [ ] Export patient list (CSV)

**Acceptance Criteria:**

- عرض جميع المرضى/الحيوانات
- Profile يعرض التاريخ الكامل
- يمكن إضافة notes
- Search يعمل بكفاءة
- دعم كامل للعيادات البيطرية
- Export يعمل

---

#### US-032: Admin Dashboard ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء `/admin` layout
- [ ] `/admin/clinics` - إدارة العيادات (جميع العيادات)
- [ ] `/admin/users` - إدارة المستخدمين
- [ ] `/admin/subscriptions` - إدارة الاشتراكات
- [ ] `/admin/plans` - إدارة الخطط
- [ ] `/admin/analytics` - تقارير شاملة للمنصة
- [ ] `/admin/support` - طلبات الدعم
- [ ] `/admin/specialties` - إدارة التخصصات
- [ ] حماية كل الصفحات (super_admin only)
- [ ] Dashboard إحصائيات المنصة الكاملة

**Acceptance Criteria:**

- Super Admin يمكنه رؤية كل شيء
- يمكن إدارة جميع العيادات
- يمكن تفعيل/تعطيل عيادة
- يمكن إدارة الاشتراكات
- يمكن إدارة التخصصات الطبية
- Protected من غير الـ super admins
- Analytics شاملة للمنصة

---

### Sprint 5 Summary

**Total Story Points:** 50  
**Must Have:** 42 points  
**Should Have:** 8 points

---

## 📅 Sprint 6: Testing & Optimization (Week 13-14)

**Goal:** الاختبار الشامل والتحسين

### 🎫 User Stories

#### US-033: Backend Testing ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] كتابة Unit Tests لكل Controller
- [ ] كتابة Feature Tests لكل API endpoint
- [ ] اختبار Authentication flow
- [ ] اختبار Permissions
- [ ] اختبار Booking logic
- [ ] اختبار Payment flow
- [ ] Code coverage > 80%

**Acceptance Criteria:**

- جميع الـ tests تنجح
- Coverage > 80%
- CI/CD يشغل الـ tests

---

#### US-034: Frontend Testing ⏳

**Priority:** Should Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد Jest + React Testing Library
- [ ] اختبار Components الرئيسية
- [ ] اختبار Booking flow
- [ ] اختبار Forms
- [ ] E2E tests (Playwright/Cypress)

**Acceptance Criteria:**

- Component tests تنجح
- E2E tests تغطي المسارات الرئيسية

---

#### US-035: Performance Optimization ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] Backend: Database query optimization
- [ ] Backend: إضافة indexes
- [ ] Backend: Redis caching
- [ ] Backend: API response time < 200ms
- [ ] Frontend: Code splitting
- [ ] Frontend: Image optimization
- [ ] Frontend: Lazy loading
- [ ] Frontend: Page load < 1.5s

**Acceptance Criteria:**

- API < 200ms
- Page load < 1.5s
- Lighthouse score > 90

---

#### US-036: Security Audit ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] XSS protection
- [ ] CSRF protection
- [ ] SQL injection prevention
- [ ] Rate limiting
- [ ] Input validation
- [ ] Sensitive data encryption
- [ ] HTTPS enforcement
- [ ] Security headers

**Acceptance Criteria:**

- لا توجد ثغرات أمنية
- OWASP Top 10 مُغطى
- Security scan ينجح

---

#### US-037: Documentation ⏳

**Priority:** Should Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] API documentation (Postman/Swagger)
- [ ] README.md شامل
- [ ] Installation guide
- [ ] Deployment guide
- [ ] User manual
- [ ] Code comments

**Acceptance Criteria:**

- API موثّق بالكامل
- README واضح
- Guides جاهزة

---

### Sprint 6 Summary

**Total Story Points:** 42  
**Must Have:** 29 points  
**Should Have:** 13 points

---

## 📅 Sprint 7: Deployment & Launch (Week 15-16)

**Goal:** النشر والإطلاق

### 🎫 User Stories

#### US-038: Production Environment Setup ⏳

**Priority:** Must Have  
**Story Points:** 13  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد Production server (AWS/DigitalOcean)
- [ ] إعداد MySQL managed database
- [ ] إعداد Redis
- [ ] إعداد SSL certificate
- [ ] إعداد domain
- [ ] إعداد email service (Postmark/SendGrid)
- [ ] إعداد backup strategy
- [ ] إعداد monitoring (Sentry)

**Acceptance Criteria:**

- Server جاهز
- Database آمن
- SSL يعمل
- Backups تلقائية

---

#### US-039: Backend Deployment ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد production `.env`
- [ ] Deploy Laravel إلى server
- [ ] إعداد Nginx
- [ ] إعداد PHP-FPM
- [ ] Run migrations
- [ ] إعداد Queue workers
- [ ] إعداد Horizon
- [ ] اختبار Production

**Acceptance Criteria:**

- Laravel يعمل على production
- Queues تعمل
- لا توجد أخطاء

---

#### US-040: Frontend Deployment ⏳

**Priority:** Must Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إعداد Vercel project
- [ ] تكوين environment variables
- [ ] Deploy Next.js
- [ ] ربط domain
- [ ] إعداد CDN
- [ ] اختبار Production

**Acceptance Criteria:**

- Next.js deployed
- Domain يعمل
- CDN يعمل
- Performance عالي

---

#### US-041: Final Testing & Bug Fixes ⏳

**Priority:** Must Have  
**Story Points:** 8  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] اختبار شامل على Production
- [ ] User acceptance testing
- [ ] إصلاح الـ bugs
- [ ] Load testing
- [ ] Security testing

**Acceptance Criteria:**

- لا توجد bugs حرجة
- System مستقر
- Load testing ناجح

---

#### US-042: Launch Preparation ⏳

**Priority:** Must Have  
**Story Points:** 5  
**Status:** ⏳ Not Started

**Tasks:**

- [ ] إنشاء landing page احترافية
- [ ] إعداد marketing materials
- [ ] إعداد onboarding للعملاء الأوائل
- [ ] إعداد support system
- [ ] Soft launch لمجموعة صغيرة

**Acceptance Criteria:**

- Landing page جاهزة
- Marketing ready
- Support جاهز

---

### Sprint 7 Summary

**Total Story Points:** 39  
**Must Have:** 39 points

---

## 📊 Overall Summary

| Category    | Total Story Points |
| ----------- | ------------------ |
| Must Have   | 289                |
| Should Have | 26                 |
| Could Have  | 5                  |
| **Total**   | **320**            |

---

## 📝 Notes

### Definition of Done (DoD)

- [ ] Code written and tested
- [ ] Unit tests pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Accepted by Product Owner

### Velocity Tracking

- **Target Velocity:** 40-50 story points per sprint
- **Actual Velocity:** TBD after Sprint 0

### Risk Management

- ⚠️ **Risk 1:** Stripe integration معقدة - **Mitigation:** تخصيص وقت إضافي
- ⚠️ **Risk 2:** Availability logic معقدة - **Mitigation:** اختبار مكثف
- ⚠️ **Risk 3:** Performance issues - **Mitigation:** Optimization مبكر

---

## 🔄 Update Log

| Date       | Sprint   | Update       |
| ---------- | -------- | ------------ |
| 2025-11-24 | Sprint 0 | Plan created |

---

**Next Sprint:** Sprint 0 (Setup & Planning)  
**Next Review:** End of Week 2  
**Team:** TBD  
**Product Owner:** TBD

---

_This document is a living document and will be updated after each sprint._
