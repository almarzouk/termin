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
use App\Modules\CancellationPolicy\Controllers\CancellationPolicyController;

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

// Public Maintenance Status (accessible without auth)
Route::get('/maintenance/status', [App\Http\Controllers\Admin\MaintenanceModeController::class, 'status']);

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

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::get('/recent', [App\Http\Controllers\Api\NotificationController::class, 'recent']);
        Route::get('/unread-count', [App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
        Route::post('/{id}/mark-as-read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        Route::post('/{id}/mark-as-unread', [App\Http\Controllers\Api\NotificationController::class, 'markAsUnread']);
        Route::post('/mark-all-as-read', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [App\Http\Controllers\Api\NotificationController::class, 'destroy']);
        Route::delete('/read/all', [App\Http\Controllers\Api\NotificationController::class, 'deleteAllRead']);
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

        // Cancellation Policy
        Route::get('/{clinic}/cancellation-policy', [CancellationPolicyController::class, 'show']);
        Route::put('/{clinic}/cancellation-policy', [CancellationPolicyController::class, 'update']);
        Route::get('/{clinic}/cancellation-reasons', [CancellationPolicyController::class, 'getReasons']);
        Route::post('/{clinic}/cancellation-reasons', [CancellationPolicyController::class, 'createReason']);
        Route::put('/{clinic}/cancellation-reasons/{reason}', [CancellationPolicyController::class, 'updateReason']);
        Route::delete('/{clinic}/cancellation-reasons/{reason}', [CancellationPolicyController::class, 'deleteReason']);
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

        // Doctor Appointment Settings
        Route::get('/{doctor}/appointment-settings', [\App\Http\Controllers\Admin\DoctorAppointmentSettingsController::class, 'show']);
        Route::put('/{doctor}/appointment-settings', [\App\Http\Controllers\Admin\DoctorAppointmentSettingsController::class, 'update']);
        Route::get('/{doctor}/daily-stats', [\App\Http\Controllers\Admin\DoctorAppointmentSettingsController::class, 'dailyStats']);
        Route::get('/{doctor}/weekly-stats', [\App\Http\Controllers\Admin\DoctorAppointmentSettingsController::class, 'weeklyStats']);
    });

    // Appointment Management
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::post('/check-availability', [AppointmentController::class, 'checkAvailability']);
        Route::post('/', [AppointmentController::class, 'store']);

        // Appointment Availability & Distribution (MUST be before /{appointment} routes)
        Route::get('/available-slots', [\App\Http\Controllers\Api\AppointmentAvailabilityController::class, 'getAvailableSlots']);
        Route::get('/clinic-capacity', [\App\Http\Controllers\Api\AppointmentAvailabilityController::class, 'getClinicCapacity']);
        Route::post('/find-best-doctor', [\App\Http\Controllers\Api\AppointmentAvailabilityController::class, 'findBestDoctor']);
        Route::get('/next-available', [\App\Http\Controllers\Api\AppointmentAvailabilityController::class, 'getNextAvailable']);
        Route::post('/capacity-range', [\App\Http\Controllers\Api\AppointmentAvailabilityController::class, 'getCapacityRange']);

        // Recurring Appointments (before /{appointment})
        Route::post('/recurring', [AppointmentController::class, 'createRecurring']);
        Route::get('/cancellation-stats', [AppointmentController::class, 'getCancellationStats']);

        // Dynamic routes with parameters (MUST be last)
        Route::get('/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/{appointment}', [AppointmentController::class, 'update']);
        Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancel']);
        Route::post('/{appointment}/confirm', [AppointmentController::class, 'confirm']);
        Route::post('/{appointment}/complete', [AppointmentController::class, 'complete']);
        Route::get('/{appointment}/recurring-series', [AppointmentController::class, 'getRecurringSeries']);
        Route::put('/{appointment}/recurring-series', [AppointmentController::class, 'updateRecurringSeries']);
        Route::delete('/{appointment}/recurring-series', [AppointmentController::class, 'deleteRecurringSeries']);
        Route::get('/{appointment}/cancellation-policy', [AppointmentController::class, 'checkCancellationPolicy']);
        Route::post('/{appointment}/reminders', [AppointmentController::class, 'scheduleReminders']);
        Route::get('/{appointment}/reminders', [AppointmentController::class, 'getReminders']);
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
    Route::get('/dashboard/appointments-trend', [App\Http\Controllers\Admin\DashboardController::class, 'appointmentsTrend']);
    Route::get('/dashboard/revenue-trend', [App\Http\Controllers\Admin\DashboardController::class, 'revenueTrend']);
    Route::get('/dashboard/appointments-by-status', [App\Http\Controllers\Admin\DashboardController::class, 'appointmentsByStatus']);

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
        Route::get('/{id}/working-hours', [App\Http\Controllers\Admin\StaffController::class, 'getWorkingHours']);
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

    // Appointments Management (Admin)
    Route::prefix('appointments')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'index']);
        Route::get('/stats', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'stats']);
        Route::get('/{id}', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'show']);
        Route::post('/', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'store']);
        Route::put('/{id}', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'destroy']);
        Route::post('/{id}/status', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'updateStatus']);
        Route::post('/{id}/confirm', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'confirm']);
        Route::post('/{id}/cancel', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'cancel']);
        Route::post('/{id}/complete', [App\Http\Controllers\Admin\AppointmentManagementController::class, 'complete']);
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

    // Bulk Cancellation & Reassignment (Doctor Emergency Management)
    Route::prefix('bulk-cancellation')->group(function () {
        Route::post('/preview', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'preview']);
        Route::post('/', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'create']);
        Route::get('/', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'show']);
        Route::post('/{id}/execute', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'execute']);
        Route::post('/{id}/cancel', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'cancel']);

        // Patient reassignment approval/rejection
        Route::post('/reassignment/{id}/approve', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'approveReassignment']);
        Route::post('/reassignment/{id}/reject', [App\Http\Controllers\Api\Admin\DoctorBulkCancellationController::class, 'rejectReassignment']);
    });

    // Staff Unavailability Periods Management
    Route::prefix('staff-unavailability')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\StaffUnavailabilityController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\Admin\StaffUnavailabilityController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\Admin\StaffUnavailabilityController::class, 'show']);
        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\StaffUnavailabilityController::class, 'destroy']);
    });
});

// Subscription Routes (Protected)
Route::prefix('subscriptions')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/my-subscription', [App\Modules\Subscription\Controllers\SubscriptionController::class, 'mySubscription']);
    Route::get('/invoices', [App\Modules\Subscription\Controllers\SubscriptionController::class, 'getInvoices']);
    Route::get('/invoices/{id}/download', [App\Modules\Subscription\Controllers\SubscriptionController::class, 'downloadInvoice']);
    Route::post('/upgrade', [App\Modules\Subscription\Controllers\SubscriptionController::class, 'upgrade']);
    Route::post('/cancel', [App\Modules\Subscription\Controllers\SubscriptionController::class, 'cancel']);

    // Subscription Limits
    Route::get('/limits', [App\Http\Controllers\Api\SubscriptionLimitController::class, 'index']);
    Route::get('/limits/clinics', [App\Http\Controllers\Api\SubscriptionLimitController::class, 'checkClinicLimit']);
    Route::get('/limits/doctors', [App\Http\Controllers\Api\SubscriptionLimitController::class, 'checkDoctorLimit']);
    Route::get('/limits/staff', [App\Http\Controllers\Api\SubscriptionLimitController::class, 'checkStaffLimit']);
    Route::get('/limits/appointments', [App\Http\Controllers\Api\SubscriptionLimitController::class, 'checkAppointmentLimit']);
});

