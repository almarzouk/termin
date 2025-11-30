# 🏗️ Backend Architecture - Mein-Termin Medical Booking System

**Project Type:** SaaS Medical Booking Platform  
**Focus:** Medical Clinics & Veterinary Clinics  
**Framework:** Laravel 11  
**Last Updated:** 25 November 2025
**Primary Language:** 🇩🇪 Deutsch (German) - All UI text in German

---

## 🎯 Project Vision

منصة SaaS متخصصة لإدارة وحجز المواعيد للعيادات الطبية (عيادات بشرية وعيادات بيطرية).
النظام مصمم بطريقة قابلة للتوسع (Scalable) لإضافة أنواع أخرى من الأعمال في المستقبل.

---

## 👥 User Roles & Permissions System

### 1️⃣ **Visitor (الزائر - غير مسجل)**

**الصلاحيات:**

- ✅ تصفح الموقع الرئيسي
- ✅ عرض صفحة التسعير
- ✅ البحث عن العيادات (Public Search)
- ✅ عرض ملف العيادة العام (اسم، تخصص، موقع، ساعات العمل)
- ✅ عرض الخدمات المتوفرة في العيادة
- ✅ عرض الأطباء/الفريق الطبي
- ❌ لا يمكنه حجز موعد (يجب التسجيل أولاً)
- ❌ لا يمكنه رؤية الأسعار (optional - حسب إعدادات العيادة)

**Use Cases:**

```
- زيارة الموقع الرئيسي لمعرفة النظام
- البحث عن عيادة معينة
- الاطلاع على خدمات العيادة
- التسجيل كمستخدم جديد
```

---

### 2️⃣ **Customer (العميل/المريض - مسجل)**

**الصلاحيات:**

- ✅ جميع صلاحيات الزائر +
- ✅ **حجز المواعيد:**
  - اختيار العيادة
  - اختيار نوع الخدمة
  - اختيار الطبيب (optional)
  - اختيار التاريخ والوقت
  - إدخال ملاحظات
- ✅ **إدارة المواعيد:**
  - عرض مواعيدي (القادمة والسابقة)
  - إلغاء موعد (حسب سياسة العيادة)
  - إعادة جدولة موعد
- ✅ **الملف الشخصي:**
  - تحديث البيانات الشخصية
  - إضافة أفراد العائلة (للعيادات البشرية)
  - إضافة حيوانات أليفة (للعيادات البيطرية)
  - تغيير كلمة المرور
  - رفع صورة profile
- ✅ **الإشعارات:**
  - استلام تأكيد الحجز (Email/SMS)
  - استلام تذكير بالموعد (قبل 24 ساعة)
  - استلام إشعار بالإلغاء
- ✅ **التقييمات:**
  - تقييم العيادة بعد الزيارة
  - كتابة مراجعة
- ✅ **السجل الطبي:**
  - عرض تاريخ الزيارات
  - عرض الوصفات الطبية (إذا أضافها الطبيب)
  - عرض التقارير الطبية

**Permissions:**

```php
'book_appointment',
'view_own_appointments',
'cancel_own_appointment',
'reschedule_appointment',
'update_own_profile',
'add_family_members',
'add_pets',
'rate_clinic',
'view_own_medical_history'
```

**Use Cases:**

```
- البحث عن عيادة أسنان قريبة
- حجز موعد لفحص دوري
- إلغاء موعد بسبب ظرف طارئ
- إضافة طفل جديد للعائلة
- عرض تاريخ الزيارات السابقة
```

---

### 3️⃣ **Clinic Owner (مالك العيادة)**

**الصلاحيات:**

- ✅ **إدارة العيادة الكاملة:**
  - إنشاء/تعديل بيانات العيادة
  - رفع logo
  - تحديد نوع العيادة (Human/Veterinary)
  - تحديد التخصصات المتوفرة
  - إعدادات عامة (اللغة، المنطقة الزمنية)
- ✅ **إدارة الفروع (Multi-branch):**

  - إضافة فروع جديدة
  - تحديد عنوان كل فرع
  - إعدادات خاصة لكل فرع

- ✅ **إدارة الفريق الطبي (Staff):**

  - إضافة أطباء/ممرضين/موظفين
  - تحديد دور كل موظف
  - تحديد التخصص
  - تحديد ساعات العمل لكل موظف
  - تفعيل/تعطيل حساب موظف

- ✅ **إدارة الخدمات:**

  - إضافة/تعديل/حذف خدمات
  - تحديد مدة كل خدمة
  - تحديد سعر كل خدمة
  - ربط الخدمة بالأطباء المتاحين

- ✅ **إدارة أوقات العمل:**

  - تحديد أيام وساعات عمل العيادة
  - تحديد أيام الإجازات/العطل
  - إضافة استثناءات (إغلاق مؤقت)

- ✅ **إدارة المواعيد:**

  - عرض جميع المواعيد (Calendar View)
  - إضافة موعد يدوياً
  - تأكيد/رفض/إلغاء موعد
  - إعادة جدولة موعد
  - تصدير المواعيد (CSV/PDF)

- ✅ **إدارة المرضى (CRM):**

  - عرض قائمة المرضى
  - عرض ملف المريض الكامل
  - عرض تاريخ الزيارات
  - إضافة ملاحظات
  - إرسال رسائل للمرضى

- ✅ **التقارير والإحصائيات:**

  - Dashboard شامل
  - عدد المواعيد (يومي/أسبوعي/شهري)
  - الإيرادات
  - أكثر الخدمات طلباً
  - أكثر الأطباء حجزاً
  - معدل الإلغاءات
  - تقييمات العيادة

- ✅ **الاشتراكات والفواتير:**

  - عرض الاشتراك الحالي
  - ترقية/تخفيض الاشتراك
  - عرض الفواتير السابقة
  - إدارة طرق الدفع

- ✅ **الإعدادات المتقدمة:**
  - سياسة الإلغاء
  - وقت الحجز المسبق (مثلاً: يجب الحجز قبل 24 ساعة)
  - تفعيل/تعطيل التقييمات
  - تخصيص رسائل البريد
  - ربط Google Calendar

**Permissions:**

```php
'manage_own_clinic',
'manage_clinic_branches',
'manage_clinic_staff',
'manage_clinic_services',
'manage_working_hours',
'manage_all_appointments',
'view_clinic_patients',
'add_manual_appointment',
'view_clinic_analytics',
'manage_clinic_subscription',
'manage_clinic_settings',
'export_data'
```

**Use Cases:**

```
- إنشاء عيادة أسنان جديدة
- إضافة طبيب أسنان جديد للفريق
- تحديد إجازة رسمية (عيد الفطر)
- عرض تقرير الإيرادات الشهرية
- ترقية الاشتراك من Starter إلى Professional
```

---

### 4️⃣ **Clinic Manager (مدير العيادة)**

**الوصف:** موظف موثوق يدير العمليات اليومية نيابة عن المالك

**الصلاحيات:**

- ✅ **معظم صلاحيات Clinic Owner ماعدا:**

  - ❌ لا يمكنه حذف العيادة
  - ❌ لا يمكنه تغيير الاشتراك/الدفع
  - ❌ لا يمكنه حذف المالك
  - ⚠️ يمكنه إدارة الموظفين (بصلاحية محدودة)

- ✅ صلاحيات إضافية:
  - إدارة المخزون الطبي (optional feature)
  - إدارة الموردين
  - طلب تقارير مالية

**Permissions:**

```php
'manage_clinic_operations',
'manage_staff_schedule',
'manage_appointments',
'view_analytics',
'manage_patients',
'manage_inventory' // optional
```

**Use Cases:**

```
- مدير عيادة يدير عدة فروع
- موظف إداري مسؤول عن جدولة المواعيد
- مدير يراقب أداء الأطباء
```

---

### 5️⃣ **Staff (موظف العيادة - طبيب/ممرض/استقبال)**

**الصلاحيات حسب الدور:**

#### **A) Doctor/Veterinarian (الطبيب/الطبيب البيطري)**

- ✅ عرض مواعيده الخاصة فقط
- ✅ تأكيد/إلغاء مواعيده
- ✅ عرض ملف المريض
- ✅ إضافة ملاحظات طبية
- ✅ إضافة وصفات طبية
- ✅ رفع تقارير/صور طبية
- ✅ تحديث ساعات عمله الشخصية
- ✅ عرض إحصائياته الخاصة
- ❌ لا يمكنه رؤية مواعيد الأطباء الآخرين
- ❌ لا يمكنه رؤية البيانات المالية

**Permissions:**

```php
'view_own_appointments',
'manage_own_schedule',
'view_patient_records',
'add_medical_notes',
'add_prescriptions',
'upload_medical_files',
'view_own_stats'
```

#### **B) Nurse/Medical Assistant (ممرض/مساعد طبي)**

- ✅ عرض المواعيد اليومية للعيادة
- ✅ استقبال المرضى (Check-in)
- ✅ تحديث حالة الموعد (Waiting → In Progress → Completed)
- ✅ عرض ملف المريض (معلومات أساسية)
- ✅ إضافة قياسات (ضغط، حرارة، وزن)
- ❌ لا يمكنه حذف مواعيد
- ❌ لا يمكنه رؤية الوصفات الطبية

**Permissions:**

```php
'view_today_appointments',
'checkin_patient',
'update_appointment_status',
'view_basic_patient_info',
'add_vital_signs'
```

#### **C) Receptionist (موظف استقبال)**

- ✅ عرض جميع المواعيد
- ✅ إضافة موعد يدوياً
- ✅ إلغاء/إعادة جدولة موعد
- ✅ الرد على استفسارات المرضى
- ✅ طباعة جدول المواعيد
- ❌ لا يمكنه رؤية الملفات الطبية
- ❌ لا يمكنه رؤية البيانات المالية

**Permissions:**

```php
'view_all_appointments',
'add_appointment',
'cancel_appointment',
'reschedule_appointment',
'print_schedule',
'view_basic_patient_contact'
```

**Use Cases:**

```
Doctor:
- عرض مواعيد اليوم
- كتابة وصفة طبية بعد الكشف
- تحديث إجازة طارئة

Nurse:
- تسجيل وصول مريض
- قياس ضغط وحرارة المريض
- تجهيز غرفة الكشف

Receptionist:
- الرد على مكالمة وحجز موعد
- إعادة جدولة موعد بناءً على طلب المريض
- طباعة جدول مواعيد اليوم
```

---

### 6️⃣ **Super Admin (مدير النظام الكامل)**

**الصلاحيات:**

- ✅ **إدارة كاملة للنظام:**

  - عرض جميع العيادات في المنصة
  - تفعيل/تعطيل/حذف عيادة
  - عرض جميع المستخدمين
  - حذف/تعليق حسابات مخالفة

- ✅ **إدارة خطط الاشتراك:**

  - إنشاء/تعديل/حذف خطط
  - تحديد الأسعار
  - تحديد الحدود (limits)
  - منح اشتراك مجاني (للتجربة)

- ✅ **إدارة المحتوى:**

  - تعديل صفحات الموقع
  - إدارة المدونة
  - إدارة الـ FAQs

- ✅ **الدعم الفني:**

  - عرض طلبات الدعم
  - الرد على الاستفسارات
  - حل المشاكل التقنية

- ✅ **التقارير المالية:**

  - إجمالي الإيرادات
  - الاشتراكات النشطة
  - معدل التحويل
  - معدل الإلغاء (Churn Rate)

- ✅ **إدارة النظام:**

  - عرض Logs
  - Monitoring & Performance
  - Backup management
  - إعدادات عامة للنظام

- ✅ **الأدوار والصلاحيات:**
  - إنشاء أدوار جديدة
  - تعديل صلاحيات الأدوار
  - تعيين صلاحيات مخصصة

**Permissions:**

```php
'*' // Full access to everything
// OR specific:
'manage_all_clinics',
'manage_all_users',
'manage_subscription_plans',
'manage_system_settings',
'view_global_analytics',
'access_admin_panel',
'manage_roles_permissions',
'view_system_logs',
'manage_support_tickets'
```

**Use Cases:**

```
- مراجعة وتفعيل عيادة جديدة
- تعطيل عيادة مخالفة
- تحليل أداء المنصة الكلي
- إنشاء خطة اشتراك جديدة
- حل مشكلة تقنية لعيادة
```

---

## 🗂️ Database Schema Overview

### Core Tables

```
📁 Users & Authentication
├── users (جميع المستخدمين)
├── roles (الأدوار)
├── permissions (الصلاحيات)
├── model_has_roles (Spatie)
├── model_has_permissions (Spatie)
└── role_has_permissions (Spatie)

📁 Clinics
├── clinics
│   ├── id
│   ├── owner_id (FK → users)
│   ├── name
│   ├── slug
│   ├── clinic_type (enum: human, veterinary)
│   ├── specialties (JSON) - [cardiology, dentistry, etc.]
│   ├── logo
│   ├── description
│   ├── phone
│   ├── email
│   ├── website
│   ├── is_active
│   ├── subscription_id (FK)
│   └── settings (JSON)
│
├── clinic_branches
│   ├── id
│   ├── clinic_id (FK)
│   ├── name
│   ├── address
│   ├── city
│   ├── country
│   ├── lat/lng
│   └── is_main_branch
│
└── clinic_staff
    ├── id
    ├── clinic_id (FK)
    ├── user_id (FK)
    ├── branch_id (FK - nullable)
    ├── role (doctor, nurse, receptionist, manager)
    ├── specialty
    ├── is_active
    └── hired_at

📁 Services
├── services
│   ├── id
│   ├── clinic_id (FK)
│   ├── name
│   ├── description
│   ├── duration (minutes)
│   ├── price
│   ├── is_active
│   └── category
│
└── service_staff (many-to-many)
    ├── service_id
    └── staff_id

📁 Scheduling
├── working_hours (ساعات عمل العيادة)
│   ├── clinic_id (FK)
│   ├── day_of_week (0-6)
│   ├── start_time
│   ├── end_time
│   └── branch_id (nullable)
│
├── staff_working_hours (ساعات عمل الموظف)
│   ├── staff_id (FK)
│   ├── day_of_week
│   ├── start_time
│   └── end_time
│
└── holidays
    ├── clinic_id (FK)
    ├── date
    ├── name
    └── is_recurring

📁 Patients
├── patients
│   ├── id
│   ├── user_id (FK)
│   ├── patient_type (enum: self, family_member, pet)
│   ├── name
│   ├── date_of_birth
│   ├── gender
│   ├── phone
│   ├── blood_type (nullable)
│   ├── allergies (JSON)
│   ├── chronic_diseases (JSON)
│   ├── emergency_contact (JSON)
│   └── pet_data (JSON - للحيوانات)
│       ├── species (dog, cat, etc.)
│       ├── breed
│       ├── weight
│       └── microchip_number
│
└── medical_records
    ├── id
    ├── patient_id (FK)
    ├── appointment_id (FK)
    ├── doctor_id (FK)
    ├── diagnosis
    ├── prescription (JSON)
    ├── notes
    ├── attachments (JSON)
    └── created_at

📁 Appointments
├── appointments
│   ├── id
│   ├── clinic_id (FK)
│   ├── branch_id (FK)
│   ├── patient_id (FK)
│   ├── service_id (FK)
│   ├── staff_id (FK - الطبيب)
│   ├── appointment_date
│   ├── start_time
│   ├── end_time
│   ├── status (pending, confirmed, in_progress, completed, cancelled, no_show)
│   ├── customer_notes
│   ├── staff_notes
│   ├── cancellation_reason
│   ├── reminder_sent_at
│   └── timestamps
│
└── appointment_history (Audit trail)
    ├── appointment_id
    ├── action (created, confirmed, rescheduled, cancelled)
    ├── changed_by (user_id)
    ├── old_data (JSON)
    └── created_at

📁 Reviews & Ratings
└── reviews
    ├── id
    ├── clinic_id (FK)
    ├── patient_id (FK)
    ├── appointment_id (FK)
    ├── rating (1-5)
    ├── comment
    ├── is_approved
    └── timestamps

📁 Subscriptions & Payments
├── subscription_plans
│   ├── id
│   ├── name (Free, Starter, Professional, Enterprise)
│   ├── price_monthly
│   ├── price_yearly
│   ├── max_staff
│   ├── max_appointments_per_month
│   ├── features (JSON)
│   └── is_active
│
├── clinic_subscriptions
│   ├── id
│   ├── clinic_id (FK)
│   ├── plan_id (FK)
│   ├── status (active, cancelled, suspended)
│   ├── started_at
│   ├── ends_at
│   ├── trial_ends_at
│   └── auto_renew
│
└── payments
    ├── id
    ├── clinic_id (FK)
    ├── subscription_id (FK)
    ├── amount
    ├── currency
    ├── status (pending, completed, failed, refunded)
    ├── payment_method
    ├── stripe_payment_id
    └── timestamps

📁 Notifications
└── notifications (Laravel default)
    ├── type
    ├── notifiable_id
    ├── data (JSON)
    └── read_at

📁 System
├── activity_log (Spatie Activity Log)
├── failed_jobs
└── settings
    ├── key
    └── value (JSON)
```

---

## 🔐 Advanced Permission System

### Permission Naming Convention

```php
'{action}_{resource}_{scope?}'

Examples:
- view_appointments
- view_own_appointments
- manage_clinic_staff
- manage_all_clinics
- export_data
```

### Permission Categories

#### 1. Clinic Management

```php
'view_own_clinic',
'update_own_clinic',
'delete_own_clinic',
'manage_clinic_branches',
'manage_clinic_settings',
```

#### 2. Staff Management

```php
'view_clinic_staff',
'create_staff',
'update_staff',
'delete_staff',
'manage_staff_schedule',
```

#### 3. Services

```php
'view_services',
'create_service',
'update_service',
'delete_service',
```

#### 4. Appointments

```php
'view_all_appointments',      // Clinic Manager
'view_own_appointments',       // Doctor/Customer
'create_appointment',
'update_appointment',
'cancel_appointment',
'confirm_appointment',
```

#### 5. Patients

```php
'view_clinic_patients',
'view_patient_records',
'update_patient_records',
'add_medical_notes',
'add_prescriptions',
```

#### 6. Analytics

```php
'view_clinic_analytics',
'view_own_stats',             // Doctor stats only
'export_reports',
```

#### 7. Super Admin

```php
'manage_all_clinics',
'manage_all_users',
'manage_subscription_plans',
'view_global_analytics',
'access_admin_panel',
```

### Middleware Stack

```php
// Route protection examples

// Customer only
Route::middleware(['auth:sanctum', 'role:customer'])
    ->post('/appointments', [AppointmentController::class, 'store']);

// Clinic owner or manager
Route::middleware(['auth:sanctum', 'role:clinic_owner|clinic_manager'])
    ->get('/clinic/analytics', [AnalyticsController::class, 'index']);

// Doctor accessing own appointments
Route::middleware(['auth:sanctum', 'role:doctor', 'permission:view_own_appointments'])
    ->get('/my-appointments', [StaffController::class, 'myAppointments']);

// Super admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->prefix('admin')->group(function () {
        Route::resource('clinics', AdminClinicController::class);
    });
```

---

## 🏛️ Scalable Architecture Design

### 1. Entity Type System (للتوسع المستقبلي)

```php
// clinics table
'entity_type' => 'clinic' // حالياً فقط clinic، مستقبلاً: salon, gym, etc.
'business_category' => 'human_health' | 'veterinary' // قابل للتوسع
```

### 2. Polymorphic Relationships

```php
// services يمكن أن تُربط بأي entity
services table:
- serviceable_type (Clinic, Salon, Gym - مستقبلاً)
- serviceable_id

// نفس الشيء للمواعيد
appointments table:
- appointable_type
- appointable_id
```

### 3. Feature Flags

```php
// في جدول settings أو config
'features' => [
    'clinics' => true,
    'veterinary' => true,
    'salons' => false,      // مستقبلاً
    'gyms' => false,        // مستقبلاً
    'photography' => false, // مستقبلاً
]
```

### 4. Modular Structure

```
app/
├── Modules/
│   ├── Clinic/           // كل شيء متعلق بالعيادات
│   │   ├── Models/
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Requests/
│   │   └── Routes/
│   │
│   ├── Appointment/      // نظام الحجز (مشترك)
│   ├── Subscription/     // الاشتراكات (مشترك)
│   └── User/             // المستخدمين (مشترك)
│
└── Core/                 // Features مشتركة
    ├── Notifications/
    ├── Payments/
    └── Analytics/
```

---

## 🚀 API Endpoints Structure

### Public APIs (لا تحتاج Auth)

```
GET    /api/clinics/search
GET    /api/clinics/{slug}
GET    /api/clinics/{slug}/services
GET    /api/clinics/{slug}/staff
GET    /api/specialties
```

### Customer APIs

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/appointments
GET    /api/appointments/my
DELETE /api/appointments/{id}/cancel
GET    /api/patients/my
POST   /api/patients
```

### Clinic Owner APIs

```
GET    /api/clinic
PUT    /api/clinic
GET    /api/clinic/staff
POST   /api/clinic/staff
GET    /api/clinic/appointments
GET    /api/clinic/analytics
```

### Admin APIs

```
GET    /api/admin/clinics
GET    /api/admin/users
GET    /api/admin/subscriptions
GET    /api/admin/analytics
```

---

## 📦 Laravel Packages Required

### Authentication & Authorization

- ✅ `laravel/sanctum` - API Authentication
- ✅ `spatie/laravel-permission` - Roles & Permissions

### Media & Files

- ✅ `spatie/laravel-medialibrary` - File uploads (logos, medical files)

### Activity Tracking

- ✅ `spatie/laravel-activitylog` - Audit trail

### Queues & Jobs

- ✅ `laravel/horizon` - Queue monitoring

### Development

- ✅ `laravel/telescope` - Debugging
- ✅ `barryvdh/laravel-debugbar` - Debug bar

### API Documentation

- ✅ `knuckleswtf/scribe` - Auto API docs

### Payment

- ✅ `stripe/stripe-php` - Stripe integration

### Notifications

- ✅ Laravel Notifications (built-in)
- ✅ `laravel/vonage-notification-channel` - SMS (optional)

---

## 🎯 Key Features to Implement

### Phase 1: Core (Sprint 0-2)

- ✅ Authentication system
- ✅ Roles & Permissions
- ✅ Clinic management
- ✅ Staff management
- ✅ Services management

### Phase 2: Booking (Sprint 3)

- ✅ Availability calculation
- ✅ Appointment booking
- ✅ Calendar integration
- ✅ Email notifications

### Phase 3: Advanced (Sprint 4-5)

- ✅ Subscriptions & Payments
- ✅ Analytics & Reports
- ✅ Medical records
- ✅ Reviews & Ratings

### Phase 4: Optimization (Sprint 6-7)

- ✅ Performance optimization
- ✅ Testing
- ✅ Deployment

---

## 🔒 Security Considerations

1. **Data Privacy (GDPR Compliance)**

   - Medical data encryption
   - Right to be forgotten
   - Data export capability

2. **Access Control**

   - Row-level security (RLS)
   - Doctor يرى مرضاه فقط
   - Clinic owner يرى بيانات عيادته فقط

3. **API Rate Limiting**

   - 60 requests/minute للـ authenticated users
   - 10 requests/minute للـ guests

4. **Audit Logging**
   - تسجيل كل التغييرات الحساسة
   - من فتح الملف الطبي؟
   - من ألغى الموعد؟

---

## 📈 Scalability Features

1. **Database Indexing**

   ```sql
   INDEX on clinics(slug, is_active)
   INDEX on appointments(clinic_id, appointment_date, status)
   INDEX on users(email)
   ```

2. **Caching Strategy**

   - Redis لـ session storage
   - Cache للـ clinic data (TTL: 1 hour)
   - Cache للـ availability slots (TTL: 5 min)

3. **Queue Jobs**

   - Email notifications
   - SMS sending
   - Report generation
   - Data export

4. **CDN for Media**
   - S3 bucket للصور
   - CloudFront للتوزيع

---

## ✅ Next Steps

1. ✅ إنشاء Laravel project
2. ✅ Setup Database & Migrations
3. ✅ Install Spatie Permissions
4. ✅ Create Seeders للأدوار والصلاحيات
5. ✅ Build Authentication APIs
6. ✅ Build Clinic CRUD
7. ✅ Build Appointment System

---

**تم التحديث:** 25 نوفمبر 2025  
**الحالة:** جاهز للتنفيذ  
**Focus:** Medical & Veterinary Clinics  
**Future:** Scalable لإضافة أنواع أخرى من الأعمال
