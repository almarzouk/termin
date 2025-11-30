<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        echo "⚠️  Skipping payments - no appointments to link payments to.\n";
        echo "💡 Enable AppointmentSeeder first, then re-enable PaymentSeeder.\n";
    }
}
