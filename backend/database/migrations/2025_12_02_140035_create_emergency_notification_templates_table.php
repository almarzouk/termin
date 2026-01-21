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
        Schema::create('emergency_notification_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['email', 'sms', 'in_app']);
            $table->enum('event', ['appointment_cancelled', 'appointment_reassigned', 'patient_approval_request']);
            $table->string('subject')->nullable();
            $table->text('body');
            $table->json('variables')->nullable(); // Available placeholders
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['clinic_id', 'type', 'event']);
            $table->index(['is_active', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emergency_notification_templates');
    }
};
