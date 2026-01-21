<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clinic_staff', function (Blueprint $table) {
            $table->integer('max_daily_appointments')->default(20)->after('is_active');
            $table->integer('appointment_duration_minutes')->default(30)->after('max_daily_appointments');
            $table->boolean('allow_online_booking')->default(true)->after('appointment_duration_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinic_staff', function (Blueprint $table) {
            $table->dropColumn(['max_daily_appointments', 'appointment_duration_minutes', 'allow_online_booking']);
        });
    }
};
