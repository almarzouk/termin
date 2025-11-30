<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Modules\Doctor\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        echo "⚠️  Appointments table structure is different. Skipping appointment seeding for now.\n";
        echo "📝 Note: appointments table uses staff_id, clinic_id, service_id instead of doctor_id\n";
        echo "💡 To enable appointments, create Staff and Services seeders first.\n";
    }
}
