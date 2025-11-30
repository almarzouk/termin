<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            // Super Admin
            [
                'name' => 'System Administrator',
                'email' => 'admin@system.de',
                'password' => 'Admin@123',
                'phone' => '+49 30 11111111',
                'gender' => 'male',
                'role' => 'super_admin',
                'is_active' => true,
            ],

            // Clinic Owner
            [
                'name' => 'Dr. Klaus Schneider',
                'email' => 'owner@klinik.de',
                'password' => 'Owner@123',
                'phone' => '+49 30 22222222',
                'gender' => 'male',
                'role' => 'clinic_owner',
                'is_active' => true,
            ],

            // Clinic Manager
            [
                'name' => 'Maria Fischer',
                'email' => 'manager@klinik.de',
                'password' => 'Manager@123',
                'phone' => '+49 30 33333333',
                'gender' => 'female',
                'role' => 'clinic_manager',
                'is_active' => true,
            ],

            // Doctor 1
            [
                'name' => 'Dr. Andreas Müller',
                'email' => 'doctor1@klinik.de',
                'password' => 'Doctor@123',
                'phone' => '+49 30 44444444',
                'gender' => 'male',
                'role' => 'doctor',
                'is_active' => true,
            ],

            // Doctor 2
            [
                'name' => 'Dr. Sarah Schmidt',
                'email' => 'doctor2@klinik.de',
                'password' => 'Doctor@123',
                'phone' => '+49 30 55555555',
                'gender' => 'female',
                'role' => 'doctor',
                'is_active' => true,
            ],

            // Nurse 1
            [
                'name' => 'Anna Weber',
                'email' => 'nurse1@klinik.de',
                'password' => 'Nurse@123',
                'phone' => '+49 30 66666666',
                'gender' => 'female',
                'role' => 'nurse',
                'is_active' => true,
            ],

            // Nurse 2
            [
                'name' => 'Lisa Hoffmann',
                'email' => 'nurse2@klinik.de',
                'password' => 'Nurse@123',
                'phone' => '+49 30 77777777',
                'gender' => 'female',
                'role' => 'nurse',
                'is_active' => true,
            ],

            // Receptionist
            [
                'name' => 'Sophie Becker',
                'email' => 'reception@klinik.de',
                'password' => 'Reception@123',
                'phone' => '+49 30 88888888',
                'gender' => 'female',
                'role' => 'receptionist',
                'is_active' => true,
            ],

            // Customer/Patient 1
            [
                'name' => 'Max Mustermann',
                'email' => 'patient1@test.de',
                'password' => 'Patient@123',
                'phone' => '+49 30 99999999',
                'gender' => 'male',
                'role' => 'customer',
                'is_active' => true,
            ],

            // Customer/Patient 2
            [
                'name' => 'Emma Meyer',
                'email' => 'patient2@test.de',
                'password' => 'Patient@123',
                'phone' => '+49 30 10101010',
                'gender' => 'female',
                'role' => 'customer',
                'is_active' => true,
            ],

            // Demo Account (for testing)
            [
                'name' => 'Demo User',
                'email' => 'demo@test.de',
                'password' => 'Demo@123',
                'phone' => '+49 30 00000000',
                'gender' => 'male',
                'role' => 'clinic_owner',
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            // Hash password
            $userData['password'] = Hash::make($userData['password']);

            // Set default values
            $userData['country'] = 'Germany';
            $userData['language'] = 'de';
            $userData['email_verified_at'] = now();

            // Create user
            $user = User::create($userData);

            // Assign role
            $user->assignRole($role);
        }
    }
}
