<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Clinic Management
            'view_own_clinic', 'update_own_clinic', 'delete_own_clinic',
            'manage_clinic_branches', 'manage_clinic_settings',
            'view_all_clinics', 'activate_clinic', 'deactivate_clinic',

            // Staff Management
            'view_clinic_staff', 'create_staff', 'update_staff', 'delete_staff',
            'manage_staff_schedule', 'invite_staff',

            // Services
            'view_services', 'create_service', 'update_service', 'delete_service',

            // Appointments
            'view_all_appointments', 'view_own_appointments', 'create_appointment',
            'update_appointment', 'cancel_appointment', 'confirm_appointment',
            'complete_appointment', 'mark_no_show',

            // Patients & Medical
            'view_clinic_patients', 'view_patient_records', 'update_patient_records',
            'add_medical_notes', 'add_prescriptions', 'upload_medical_files',

            // Analytics
            'view_clinic_analytics', 'view_own_stats', 'export_reports', 'view_global_analytics',

            // Subscriptions
            'manage_subscription_plans', 'view_subscription', 'upgrade_subscription', 'cancel_subscription',

            // Reviews
            'view_reviews', 'approve_reviews', 'delete_reviews',

            // Settings
            'manage_system_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // 1. Super Admin
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. Clinic Owner
        $clinicOwner = Role::create(['name' => 'clinic_owner']);
        $clinicOwner->givePermissionTo([
            'view_own_clinic', 'update_own_clinic', 'delete_own_clinic', 'manage_clinic_branches', 'manage_clinic_settings',
            'view_clinic_staff', 'create_staff', 'update_staff', 'delete_staff', 'manage_staff_schedule', 'invite_staff',
            'view_services', 'create_service', 'update_service', 'delete_service',
            'view_all_appointments', 'create_appointment', 'update_appointment', 'cancel_appointment', 'confirm_appointment',
            'view_clinic_patients', 'view_clinic_analytics', 'export_reports',
            'view_subscription', 'upgrade_subscription', 'cancel_subscription',
            'view_reviews', 'approve_reviews', 'delete_reviews',
        ]);

        // 3. Clinic Manager
        $clinicManager = Role::create(['name' => 'clinic_manager']);
        $clinicManager->givePermissionTo([
            'view_own_clinic', 'update_own_clinic', 'manage_clinic_branches',
            'view_clinic_staff', 'create_staff', 'update_staff', 'manage_staff_schedule', 'invite_staff',
            'view_services', 'create_service', 'update_service',
            'view_all_appointments', 'create_appointment', 'update_appointment', 'cancel_appointment', 'confirm_appointment', 'complete_appointment', 'mark_no_show',
            'view_clinic_patients', 'view_clinic_analytics', 'export_reports', 'view_reviews',
        ]);

        // 4. Doctor
        $doctor = Role::create(['name' => 'doctor']);
        $doctor->givePermissionTo([
            'view_own_clinic', 'view_clinic_staff', 'view_services', 'view_own_appointments', 'update_appointment', 'complete_appointment',
            'view_clinic_patients', 'view_patient_records', 'update_patient_records', 'add_medical_notes', 'add_prescriptions', 'upload_medical_files',
            'view_own_stats',
        ]);

        // 5. Nurse
        $nurse = Role::create(['name' => 'nurse']);
        $nurse->givePermissionTo([
            'view_own_clinic', 'view_own_appointments', 'view_clinic_patients', 'view_patient_records', 'add_medical_notes',
        ]);

        // 6. Receptionist
        $receptionist = Role::create(['name' => 'receptionist']);
        $receptionist->givePermissionTo([
            'view_own_clinic', 'view_clinic_staff', 'view_services',
            'view_all_appointments', 'create_appointment', 'update_appointment', 'cancel_appointment', 'confirm_appointment', 'mark_no_show',
            'view_clinic_patients',
        ]);

        // 7. Customer
        $customer = Role::create(['name' => 'customer']);
        $customer->givePermissionTo(['view_own_appointments', 'create_appointment', 'cancel_appointment']);
    }
}

