<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Find staff (doctor) in clinic 4
$staff = App\Models\ClinicStaff::where('clinic_id', 4)->first();
if (!$staff) {
    echo "No staff found in clinic 4. Creating one...\n";
    
    // Create a doctor user
    $doctorUser = App\Models\User::create([
        'name' => 'Dr. Schmidt',
        'email' => 'schmidt@clinic.de',
        'password' => bcrypt('password'),
        'email_verified_at' => now(),
    ]);
    
    // Assign doctor role
    $doctorRole = Spatie\Permission\Models\Role::where('name', 'doctor')->first();
    if ($doctorRole) {
        $doctorUser->assignRole($doctorRole);
    }
    
    // Create staff record
    $staff = App\Models\ClinicStaff::create([
        'user_id' => $doctorUser->id,
        'clinic_id' => 4,
        'specialty' => 'Allgemeinmedizin',
        'is_active' => true,
    ]);
    
    echo "Created doctor: {$doctorUser->name}\n";
}

echo "Staff ID: {$staff->id} | Doctor: {$staff->user->name}\n";

// Find a patient
$patient = App\Models\Patient::first();
if (!$patient) {
    echo "No patient found!\n";
    exit(1);
}

echo "Patient ID: {$patient->id} | Name: {$patient->user->name}\n";

// Create 3 test appointments for clinic 4
$appointments = [
    ['2025-12-02 10:00:00', 'pending'],
    ['2025-12-02 11:00:00', 'confirmed'],
    ['2025-12-03 14:00:00', 'pending'],
];

foreach ($appointments as $data) {
    $apt = App\Models\Appointment::create([
        'user_id' => $patient->user_id,
        'patient_id' => $patient->id,
        'staff_id' => $staff->id,
        'clinic_id' => 4,
        'start_time' => $data[0],
        'end_time' => date('Y-m-d H:i:s', strtotime($data[0]) + 1800), // 30 minutes
        'status' => $data[1],
        'appointment_number' => 'APT-' . strtoupper(uniqid()),
    ]);
    
    echo "Created appointment: {$apt->id} at {$apt->start_time} - {$apt->status}\n";
}

echo "\nTotal appointments in clinic 4: " . App\Models\Appointment::where('clinic_id', 4)->count() . "\n";
