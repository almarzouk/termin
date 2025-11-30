# دليل الاختبارات - Mien-Termin API Testing Guide

## 📖 نظرة عامة

تم إنشاء مجموعة شاملة من الاختبارات لنظام Mien-Termin API لضمان جودة الكود وموثوقية النظام.

---

## 🚀 البدء السريع

### تثبيت الاعتماديات

```bash
cd backend
composer install
```

### إعداد قاعدة بيانات الاختبار

```bash
# تشغيل Migrations
php artisan migrate:fresh --env=testing --database=sqlite

# تشغيل Seeders
php artisan db:seed --env=testing --class=RolesAndPermissionsSeeder
```

### تشغيل جميع الاختبارات

```bash
php artisan test
```

### تشغيل اختبارات محددة

```bash
# اختبارات Authentication فقط
php artisan test --filter=Auth

# اختبارات Analytics فقط
php artisan test --filter=Analytics

# اختبار محدد
php artisan test --filter=test_user_can_register
```

### تشغيل مع تفاصيل كاملة

```bash
php artisan test --testsuite=Feature --verbose
```

---

## 📁 هيكل الاختبارات

```
backend/tests/Feature/
├── Auth/
│   └── AuthenticationTest.php       # 6 اختبارات
├── Clinic/
│   └── ClinicTest.php                # 6 اختبارات
├── Appointment/
│   └── AppointmentTest.php           # 6 اختبارات
├── Analytics/
│   └── AnalyticsTest.php             # 9 اختبارات
└── Notification/
    └── NotificationTest.php          # 8 اختبارات
```

---

## 🧪 الاختبارات المتوفرة

### 1. Authentication Tests (`AuthenticationTest.php`)

#### ✅ الاختبارات الناجحة (6/6)

```php
// تسجيل مستخدم جديد
test_user_can_register()

// تسجيل الدخول
test_user_can_login()

// فشل الدخول بكلمة مرور خاطئة
test_user_cannot_login_with_invalid_credentials()

// تسجيل الخروج
test_user_can_logout()

// عرض الملف الشخصي
test_user_can_get_profile()

// التحقق من صحة البيانات
test_registration_requires_valid_data()
```

**كيفية التشغيل:**

```bash
php artisan test tests/Feature/Auth/AuthenticationTest.php
```

**Endpoints المختبرة:**

-   `POST /api/auth/register`
-   `POST /api/auth/login`
-   `POST /api/auth/logout`
-   `GET /api/auth/user`

---

### 2. Clinic Tests (`ClinicTest.php`)

#### ⚠️ الاختبارات (2/6 ناجحة)

```php
// قائمة العيادات (يحتاج إصلاح)
test_admin_can_list_clinics()

// إنشاء عيادة (يحتاج إصلاح)
test_admin_can_create_clinic()

// تحديث عيادة (يحتاج إصلاح)
test_admin_can_update_clinic()

// حذف عيادة (يحتاج إصلاح)
test_admin_can_delete_clinic()

// ✅ التحقق من البيانات
test_clinic_creation_requires_valid_data()

// ✅ رفض الوصول غير المصرح
test_unauthorized_user_cannot_access_clinics()
```

**كيفية التشغيل:**

```bash
php artisan test tests/Feature/Clinic/ClinicTest.php
```

**المشاكل المعروفة:**

-   يحتاج تحديث `clinic_type` من `general` إلى `human`
-   بعض Factories missing

---

### 3. Appointment Tests (`AppointmentTest.php`)

#### ❌ الاختبارات (0/6 ناجحة - تحتاج إصلاح)

```php
// إنشاء موعد
test_admin_can_create_appointment()

// قائمة المواعيد
test_admin_can_list_appointments()

// تأكيد موعد
test_admin_can_confirm_appointment()

// إلغاء موعد
test_admin_can_cancel_appointment()

// التحقق من البيانات
test_appointment_creation_requires_valid_data()

// تصفية المواعيد
test_can_filter_appointments_by_status()
```

**كيفية التشغيل:**

```bash
php artisan test tests/Feature/Appointment/AppointmentTest.php
```

**المشاكل المعروفة:**

-   `ClinicBranchFactory` غير موجودة
-   `deleted_at` column مفقود في جدول appointments

---

### 4. Analytics Tests (`AnalyticsTest.php`)

#### ❌ الاختبارات (0/9 ناجحة - تحتاج إصلاح)

```php
// لوحة التحكم
test_admin_can_get_dashboard_overview()
test_admin_can_get_dashboard_kpis()

// تحليلات الإيرادات
test_admin_can_get_revenue_analytics()
test_admin_can_get_revenue_trend()

// تحليلات المواعيد
test_admin_can_get_appointment_analytics()

// تحليلات المرضى
test_admin_can_get_patient_analytics()

// أداء الموظفين
test_admin_can_get_staff_performance()

// صلاحيات الوصول
test_unauthorized_user_cannot_access_analytics()
test_regular_user_cannot_access_analytics()
```

**كيفية التشغيل:**

```bash
php artisan test tests/Feature/Analytics/AnalyticsTest.php
```

**المشاكل المعروفة:**

-   `App\Models\Staff` يجب أن يكون `App\Models\ClinicStaff`
-   `deleted_at` column مفقود
-   Role `patient` غير موجود (يجب استخدام `customer`)

---

### 5. Notification Tests (`NotificationTest.php`)

#### ❌ الاختبارات (0/8 ناجحة - تحتاج إصلاح)

```php
// قائمة الإشعارات
test_user_can_list_notifications()

// عدد الإشعارات غير المقروءة
test_user_can_get_unread_count()

// إنشاء إشعار
test_admin_can_create_notification()

// تعليم كمقروء
test_user_can_mark_notification_as_read()

// تعليم الكل كمقروء
test_user_can_mark_all_as_read()

// حذف إشعار
test_user_can_delete_notification()

// منع الوصول لإشعارات الآخرين
test_user_cannot_access_other_users_notifications()

// تصفية الإشعارات
test_can_filter_notifications_by_type()
```

**كيفية التشغيل:**

```bash
php artisan test tests/Feature/Notification/NotificationTest.php
```

**المشاكل المعروفة:**

-   `App\Models\Notification` غير موجود

---

## 🏭 Database Factories

تم إنشاء Factories للنماذج التالية:

### موجودة ✅

1. `UserFactory` - Laravel default
2. `ClinicFactory` - عيادات
3. `ServiceFactory` - خدمات
4. `PatientFactory` - مرضى
5. `AppointmentFactory` - مواعيد
6. `PaymentFactory` - مدفوعات
7. `NotificationFactory` - إشعارات

### تحتاج إعادة تسمية ⚠️

8. `BranchFactory` → يجب أن يكون `ClinicBranchFactory`
9. `StaffFactory` → يجب أن يكون `ClinicStaffFactory`

**مثال على استخدام Factory:**

```php
// إنشاء عيادة
$clinic = Clinic::factory()->create();

// إنشاء 5 مرضى
$patients = Patient::factory()->count(5)->create();

// إنشاء موعد مع relationships
$appointment = Appointment::factory()->create([
    'clinic_id' => $clinic->id,
    'status' => 'confirmed',
]);
```

---

## 🔧 إصلاح المشاكل الشائعة

### مشكلة: Database Schema مفقود

```bash
php artisan migrate:fresh --env=testing
php artisan db:seed --env=testing --class=RolesAndPermissionsSeeder
```

### مشكلة: Factory غير موجود

```bash
php artisan make:factory ModelNameFactory --model=ModelName
```

### مشكلة: Test فاشل بسبب Permissions

تأكد من تشغيل RolesAndPermissionsSeeder:

```php
protected function setUp(): void
{
    parent::setUp();
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
}
```

### مشكلة: Soft Deletes

تأكد من أن Model يستخدم SoftDeletes trait:

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class MyModel extends Model
{
    use SoftDeletes;
}
```

وأن Migration يحتوي على:

```php
$table->softDeletes();
```

---

## 📊 Test Coverage

### الحالة الحالية

| Module          | Endpoints | Tests  | Coverage |
| --------------- | --------- | ------ | -------- |
| Authentication  | 7         | 6      | 100% ✅  |
| Clinics         | 6         | 6      | 33% ⚠️   |
| Appointments    | 8         | 6      | 0% ❌    |
| Analytics       | 15        | 9      | 0% ❌    |
| Notifications   | 15        | 8      | 0% ❌    |
| **Subtotal**    | **51**    | **35** | **33%**  |
|                 |           |        |          |
| **غير مختبرة:** |           |        |          |
| Services        | 6         | 0      | 0%       |
| Patients        | 8         | 0      | 0%       |
| Medical Records | 10        | 0      | 0%       |
| Working Hours   | 6         | 0      | 0%       |
| Staff           | 8         | 0      | 0%       |
| Branches        | 6         | 0      | 0%       |
| **Total**       | **97**    | **35** | **36%**  |

---

## ✨ Best Practices

### 1. استخدام RefreshDatabase

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class MyTest extends TestCase
{
    use RefreshDatabase;

    // Tests...
}
```

### 2. Setup و Teardown

```php
protected function setUp(): void
{
    parent::setUp();

    // Seed roles and permissions
    $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

    // Create test user
    $this->user = User::factory()->create();
    $this->user->assignRole('super_admin');
}
```

### 3. استخدام Assertions بشكل صحيح

```php
// ✅ جيد
$response->assertStatus(200)
    ->assertJsonStructure([
        'success',
        'data' => ['id', 'name'],
    ]);

// ❌ سيء - فحص واحد فقط
$response->assertStatus(200);
```

### 4. اختبار الحالات الإيجابية والسلبية

```php
// Positive case
public function test_user_can_create_resource()
{
    // Test successful creation
}

// Negative case
public function test_user_cannot_create_resource_without_permission()
{
    // Test permission denial
}
```

---

## 🎯 TODO List

### عاجل (High Priority)

-   [ ] إنشاء `Notification` Model
-   [ ] إضافة `deleted_at` إلى جدول `appointments`
-   [ ] إعادة تسمية `BranchFactory` و `StaffFactory`
-   [ ] تحديث `StaffPerformanceController` لاستخدام `ClinicStaff`

### متوسطة (Medium Priority)

-   [ ] إصلاح جميع اختبارات Analytics (9 tests)
-   [ ] إصلاح جميع اختبارات Notifications (8 tests)
-   [ ] إصلاح جميع اختبارات Appointments (6 tests)
-   [ ] إكمال اختبارات Clinics (4 tests)

### منخفضة (Low Priority)

-   [ ] إنشاء اختبارات للـ modules المتبقية
-   [ ] إضافة Integration Tests
-   [ ] إضافة Performance Tests
-   [ ] تحسين Test Coverage إلى 80%+

---

## 📚 المراجع

-   [Laravel Testing Documentation](https://laravel.com/docs/12.x/testing)
-   [PHPUnit Documentation](https://phpunit.de/documentation.html)
-   [Laravel Factories](https://laravel.com/docs/12.x/eloquent-factories)
-   [HTTP Tests](https://laravel.com/docs/12.x/http-tests)

---

## 💡 نصائح

1. **اختبر بشكل متكرر:** شغّل الاختبارات بعد كل تغيير
2. **اكتب اختبارات قبل الكود:** TDD (Test-Driven Development)
3. **اجعل الاختبارات واضحة:** اسم الاختبار يجب أن يوضح ماذا يختبر
4. **عزل الاختبارات:** كل اختبار يجب أن يكون مستقلاً
5. **استخدم Factories:** بدلاً من إنشاء البيانات يدوياً

---

**آخر تحديث:** 26 نوفمبر 2025  
**الإصدار:** 1.0.0  
**الحالة:** ⚠️ تطوير نشط - يحتاج إصلاحات
