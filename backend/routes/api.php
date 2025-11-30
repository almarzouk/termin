<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\RegisterController;
use App\Modules\Auth\Controllers\LoginController;
use App\Modules\Auth\Controllers\LogoutController;
use App\Modules\Auth\Controllers\UserController;
use App\Modules\Auth\Controllers\ProfileController;
use App\Modules\Auth\Controllers\PasswordController;
use App\Modules\Clinic\Controllers\ClinicController;
use App\Modules\Clinic\Controllers\ServiceController;
use App\Modules\Clinic\Controllers\BranchController;
use App\Modules\Clinic\Controllers\StaffController;
use App\Modules\Patient\Controllers\PatientController;
use App\Modules\Appointment\Controllers\AppointmentController;
use App\Modules\WorkingHours\Controllers\WorkingHoursController;
use App\Modules\MedicalRecord\Controllers\MedicalRecordController;
use App\Modules\MedicalRecord\Controllers\PrescriptionController;
use App\Modules\Notification\Controllers\NotificationController;
use App\Modules\Notification\Controllers\NotificationPreferenceController;
use App\Modules\Notification\Controllers\ReminderController;
use App\Modules\Analytics\Controllers\DashboardController;
use App\Modules\Analytics\Controllers\RevenueController;
use App\Modules\Analytics\Controllers\AppointmentAnalyticsController;
use App\Modules\Analytics\Controllers\PatientAnalyticsController;
use App\Modules\Analytics\Controllers\StaffPerformanceController;
use App\Modules\Doctor\Controllers\DoctorController;
use App\Modules\Review\Controllers\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
});

// Public Subscription Plans (for homepage pricing)
Route::get('/subscription-plans', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'index']);

// Public Clinic Routes (for patient browsing)
Route::prefix('public')->group(function () {
    Route::get('/clinics', [ClinicController::class, 'index']); // Browse all clinics
    Route::get('/clinics/{slug}', [ClinicController::class, 'publicProfile']); // Clinic public profile
});

// Protected Auth Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', LogoutController::class);
        Route::get('/user', UserController::class);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::post('/avatar', [ProfileController::class, 'uploadAvatar']);
        Route::put('/password', [PasswordController::class, 'change']);
    });

    // Clinic Management
    Route::prefix('clinics')->group(function () {
        Route::get('/', [ClinicController::class, 'index']);
        Route::post('/', [ClinicController::class, 'store']);
        Route::get('/{clinic}', [ClinicController::class, 'show']);
        Route::put('/{clinic}', [ClinicController::class, 'update']);
        Route::delete('/{clinic}', [ClinicController::class, 'destroy']);
        Route::get('/{clinic}/statistics', [ClinicController::class, 'statistics']);

        // Services
        Route::get('/{clinic}/services', [ServiceController::class, 'index']);
        Route::post('/{clinic}/services', [ServiceController::class, 'store']);
        Route::get('/{clinic}/services/categories', [ServiceController::class, 'categories']);
        Route::get('/{clinic}/services/{service}', [ServiceController::class, 'show']);
        Route::put('/{clinic}/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/{clinic}/services/{service}', [ServiceController::class, 'destroy']);

        // Branches
        Route::get('/{clinic}/branches', [BranchController::class, 'index']);
        Route::post('/{clinic}/branches', [BranchController::class, 'store']);
        Route::get('/{clinic}/branches/cities', [BranchController::class, 'cities']);
        Route::get('/{clinic}/branches/{branch}', [BranchController::class, 'show']);
        Route::put('/{clinic}/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/{clinic}/branches/{branch}', [BranchController::class, 'destroy']);

        // Staff
        Route::get('/{clinic}/staff', [StaffController::class, 'index']);
        Route::post('/{clinic}/staff/invite', [StaffController::class, 'invite']);
        Route::get('/{clinic}/staff/role/{role}', [StaffController::class, 'byRole']);
        Route::get('/{clinic}/staff/{staff}', [StaffController::class, 'show']);
        Route::put('/{clinic}/staff/{staff}', [StaffController::class, 'update']);
        Route::delete('/{clinic}/staff/{staff}', [StaffController::class, 'destroy']);
        Route::post('/{clinic}/staff/{staff}/resend-invitation', [StaffController::class, 'resendInvitation']);
    });

    // Patient Management
    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index']);
        Route::post('/', [PatientController::class, 'store']);
        Route::get('/{id}', [PatientController::class, 'show']);
        Route::put('/{id}', [PatientController::class, 'update']);
        Route::delete('/{id}', [PatientController::class, 'destroy']);
        Route::get('/{id}/medical-history', [PatientController::class, 'medicalHistory']);
        Route::get('/{id}/appointments', [PatientController::class, 'appointments']);
    });

    // Doctor Management
    Route::prefix('doctors')->group(function () {
        Route::get('/', [DoctorController::class, 'index']);
        Route::post('/', [DoctorController::class, 'store']);
        Route::get('/{doctor}', [DoctorController::class, 'show']);
        Route::put('/{doctor}', [DoctorController::class, 'update']);
        Route::delete('/{doctor}', [DoctorController::class, 'destroy']);
        Route::get('/{doctor}/schedule', [DoctorController::class, 'schedule']);
    });

    // Appointment Management
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::post('/check-availability', [AppointmentController::class, 'checkAvailability']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::get('/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/{appointment}', [AppointmentController::class, 'update']);
        Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancel']);
        Route::post('/{appointment}/confirm', [AppointmentController::class, 'confirm']);
        Route::post('/{appointment}/complete', [AppointmentController::class, 'complete']);
    });

    // Working Hours Management
    Route::prefix('working-hours')->group(function () {
        Route::get('/', [WorkingHoursController::class, 'index']);
        Route::post('/', [WorkingHoursController::class, 'store']);
        Route::post('/bulk', [WorkingHoursController::class, 'bulkCreate']);
        Route::get('/{workingHours}', [WorkingHoursController::class, 'show']);
        Route::put('/{workingHours}', [WorkingHoursController::class, 'update']);
        Route::delete('/{workingHours}', [WorkingHoursController::class, 'destroy']);
    });

    // Medical Records Management
    Route::prefix('medical-records')->group(function () {
        Route::get('/', [MedicalRecordController::class, 'index']);
        Route::post('/', [MedicalRecordController::class, 'store']);
        Route::get('/patient/{patient}/history', [MedicalRecordController::class, 'patientHistory']);
        Route::get('/{medicalRecord}', [MedicalRecordController::class, 'show']);
        Route::put('/{medicalRecord}', [MedicalRecordController::class, 'update']);
        Route::delete('/{medicalRecord}', [MedicalRecordController::class, 'destroy']);
    });

    // Prescriptions Management
    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index']);
        Route::post('/', [PrescriptionController::class, 'store']);
        Route::get('/patient/{patient}/active', [PrescriptionController::class, 'activeByPatient']);
        Route::get('/{prescription}', [PrescriptionController::class, 'show']);
        Route::put('/{prescription}', [PrescriptionController::class, 'update']);
        Route::patch('/{prescription}/status', [PrescriptionController::class, 'updateStatus']);
        Route::delete('/{prescription}', [PrescriptionController::class, 'destroy']);
    });

    // Notifications Management
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/', [NotificationController::class, 'store']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/clear-read', [NotificationController::class, 'clearRead']);
        Route::get('/{notification}', [NotificationController::class, 'show']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

    // Notification Preferences
    Route::prefix('notification-preferences')->group(function () {
        Route::get('/', [NotificationPreferenceController::class, 'show']);
        Route::put('/', [NotificationPreferenceController::class, 'update']);
        Route::post('/reset', [NotificationPreferenceController::class, 'reset']);
    });

    // Reminders
    Route::prefix('reminders')->group(function () {
        Route::get('/upcoming-appointments', [ReminderController::class, 'upcomingAppointments']);
        Route::get('/prescriptions', [ReminderController::class, 'prescriptionReminders']);
        Route::get('/follow-ups', [ReminderController::class, 'followUpReminders']);
        Route::post('/send-appointment-reminders', [ReminderController::class, 'sendAppointmentReminders']);
    });

    // Analytics & Reporting
    Route::prefix('analytics')->group(function () {
        // Dashboard
        Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
        Route::get('/dashboard/kpis', [DashboardController::class, 'kpis']);

        // Revenue
        Route::get('/revenue', [RevenueController::class, 'index']);
        Route::get('/revenue/trend', [RevenueController::class, 'trend']);
        Route::get('/revenue/comparison', [RevenueController::class, 'comparison']);

        // Appointments
        Route::get('/appointments', [AppointmentAnalyticsController::class, 'index']);
        Route::get('/appointments/trends', [AppointmentAnalyticsController::class, 'trends']);
        Route::get('/appointments/performance', [AppointmentAnalyticsController::class, 'performance']);

        // Patients
        Route::get('/patients', [PatientAnalyticsController::class, 'index']);
        Route::get('/patients/growth', [PatientAnalyticsController::class, 'growth']);
        Route::get('/patients/demographics', [PatientAnalyticsController::class, 'demographics']);
        Route::get('/patients/engagement', [PatientAnalyticsController::class, 'engagement']);

        // Staff Performance
        Route::get('/staff', [StaffPerformanceController::class, 'index']);
        Route::get('/staff/{staffId}', [StaffPerformanceController::class, 'show']);
        Route::get('/staff/comparison', [StaffPerformanceController::class, 'comparison']);
    });
});

// Public routes for staff invitation
Route::post('/staff/accept-invitation', [StaffController::class, 'acceptInvitation']);

// Admin Routes (Super Admin Only)
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Dashboard & Statistics
    Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    Route::get('/dashboard/appointments-chart', [App\Http\Controllers\Admin\DashboardController::class, 'appointmentsChart']);
    Route::get('/dashboard/top-doctors', [App\Http\Controllers\Admin\DashboardController::class, 'topDoctors']);

    // Maintenance Mode
    Route::prefix('maintenance')->group(function () {
        Route::get('/status', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'status']);
        Route::post('/enable', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'enable']);
        Route::post('/disable', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'disable']);
        Route::post('/toggle', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'toggle']);
    });

    // Clinics Management
    Route::prefix('clinics')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ClinicController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\ClinicController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\ClinicController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\ClinicController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\ClinicController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\ClinicController::class, 'toggleStatus']);
        Route::get('/{id}/stats', [App\Http\Controllers\Admin\ClinicController::class, 'stats']);
    });

    // Users Management
    Route::prefix('users')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserManagementController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\UserManagementController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\UserManagementController::class, 'toggleStatus']);
        Route::post('/{id}/assign-role', [App\Http\Controllers\Admin\UserManagementController::class, 'assignRole']);
    });

    // Roles & Permissions
    Route::get('/roles', [App\Http\Controllers\Admin\UserManagementController::class, 'getRoles']);

    // Services Management
    Route::prefix('services')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ServiceController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\ServiceController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\ServiceController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\ServiceController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\ServiceController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\ServiceController::class, 'toggleStatus']);
    });

    // System Settings
    Route::prefix('settings')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SystemSettingsController::class, 'index']);
        Route::put('/', [App\Http\Controllers\Admin\SystemSettingsController::class, 'update']);
        Route::post('/clear-cache', [App\Http\Controllers\Admin\SystemSettingsController::class, 'clearCache']);
        Route::get('/system-info', [App\Http\Controllers\Admin\SystemSettingsController::class, 'systemInfo']);
        Route::post('/backup', [App\Http\Controllers\Admin\SystemSettingsController::class, 'backup']);
    });

    // Staff Management
    Route::prefix('staff')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\StaffController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\StaffController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\StaffController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\StaffController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\StaffController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\StaffController::class, 'toggleStatus']);
    });

    // Activity Logs
    Route::get('/activity-logs', [App\Http\Controllers\Admin\ActivityLogController::class, 'index']);
    Route::get('/activity-logs/export', [App\Http\Controllers\Admin\ActivityLogController::class, 'export']);

    // Notifications Management
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\NotificationManagementController::class, 'index']);
        Route::post('/send', [App\Http\Controllers\Admin\NotificationManagementController::class, 'send']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\NotificationManagementController::class, 'destroy']);
        Route::post('/{id}/mark-read', [App\Http\Controllers\Admin\NotificationManagementController::class, 'markAsRead']);
    });

    // Notification Templates
    Route::prefix('notification-templates')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\NotificationManagementController::class, 'getTemplates']);
        Route::post('/', [App\Http\Controllers\Admin\NotificationManagementController::class, 'createTemplate']);
    });

    // Permissions & Roles
    Route::prefix('roles')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\RoleController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\RoleController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\RoleController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\RoleController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\RoleController::class, 'destroy']);
        Route::get('/{id}/permissions', [App\Http\Controllers\Admin\RoleController::class, 'getPermissions']);
        Route::post('/{id}/permissions', [App\Http\Controllers\Admin\RoleController::class, 'updatePermissions']);
    });

    // Backups
    Route::prefix('backups')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\BackupController::class, 'index']);
        Route::post('/create', [App\Http\Controllers\Admin\BackupController::class, 'create']);
        Route::get('/settings', [App\Http\Controllers\Admin\BackupController::class, 'getSettings']);
        Route::put('/settings', [App\Http\Controllers\Admin\BackupController::class, 'updateSettings']);
        Route::get('/{id}/download', [App\Http\Controllers\Admin\BackupController::class, 'download']);
        Route::post('/{id}/restore', [App\Http\Controllers\Admin\BackupController::class, 'restore']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\BackupController::class, 'destroy']);
    });

    // System Settings (Advanced)
    Route::get('/system-settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'index']);
    Route::put('/system-settings', [App\Http\Controllers\Admin\SystemSettingsController::class, 'update']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/{type}', [App\Http\Controllers\Admin\ReportController::class, 'generate']);
        Route::post('/export', [App\Http\Controllers\Admin\ReportController::class, 'export']);
    });

    // Notifications Management
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\NotificationManagementController::class, 'index']);
        Route::post('/send', [App\Http\Controllers\Admin\NotificationManagementController::class, 'send']);
        Route::get('/templates', [App\Http\Controllers\Admin\NotificationManagementController::class, 'getTemplates']);
        Route::post('/templates', [App\Http\Controllers\Admin\NotificationManagementController::class, 'createTemplate']);
    });

    // Subscription Plans Management
    Route::prefix('subscription-plans')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\SubscriptionPlanController::class, 'toggleStatus']);
    });

    // Coupons Management
    Route::prefix('coupons')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CouponController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\CouponController::class, 'store']);
        Route::post('/generate', [App\Http\Controllers\Admin\CouponController::class, 'generate']);
        Route::post('/validate', [App\Http\Controllers\Admin\CouponController::class, 'validate']);
        Route::get('/stats', [App\Http\Controllers\Admin\CouponController::class, 'stats']);
        Route::get('/{id}', [App\Http\Controllers\Admin\CouponController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\Admin\CouponController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\CouponController::class, 'destroy']);
        Route::post('/{id}/toggle-status', [App\Http\Controllers\Admin\CouponController::class, 'toggleStatus']);
    });

    // Subscriptions Management
    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\SubscriptionController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Admin\SubscriptionController::class, 'store']);
        Route::get('/stats', [App\Http\Controllers\Admin\SubscriptionController::class, 'stats']);
        Route::get('/{id}', [App\Http\Controllers\Admin\SubscriptionController::class, 'show']);
        Route::post('/{id}/cancel', [App\Http\Controllers\Admin\SubscriptionController::class, 'cancel']);
        Route::post('/{id}/renew', [App\Http\Controllers\Admin\SubscriptionController::class, 'renew']);
    });

    // Reviews Management
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::get('/statistics', [ReviewController::class, 'statistics']);
        Route::get('/{id}', [ReviewController::class, 'show']);
        Route::post('/{id}/approve', [ReviewController::class, 'approve']);
        Route::post('/{id}/reject', [ReviewController::class, 'reject']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
    });
});

