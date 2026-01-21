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
        Schema::create('cancellation_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->integer('minimum_notice_hours')->default(24); // minimum hours before appointment
            $table->decimal('late_cancellation_fee', 10, 2)->default(0);
            $table->integer('max_cancellations_per_month')->default(3);
            $table->integer('auto_block_after_cancellations')->nullable(); // null = no auto-block
            $table->boolean('allow_patient_cancellation')->default(true);
            $table->boolean('require_reason')->default(false);
            $table->json('cancellation_reasons')->nullable(); // predefined reasons list
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Unique per clinic
            $table->unique('clinic_id');
        });

        // Create cancellation reasons table
        Schema::create('cancellation_reasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('reason');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cancellation_reasons');
        Schema::dropIfExists('cancellation_policies');
    }
};
