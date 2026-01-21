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
        Schema::create('appointment_reassignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bulk_operation_id')->constrained('bulk_cancellation_operations')->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->foreignId('original_staff_id')->constrained('clinic_staff')->onDelete('cascade');
            $table->foreignId('new_staff_id')->nullable()->constrained('clinic_staff')->onDelete('set null');
            $table->dateTime('original_start_time');
            $table->dateTime('new_start_time')->nullable();
            $table->enum('status', ['pending', 'patient_notified', 'patient_approved', 'patient_rejected', 'completed', 'failed'])->default('pending');
            $table->text('patient_notification_sent')->nullable();
            $table->timestamp('patient_notified_at')->nullable();
            $table->timestamp('patient_response_at')->nullable();
            $table->text('patient_rejection_reason')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['bulk_operation_id', 'status']);
            $table->index(['appointment_id']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_reassignments');
    }
};
