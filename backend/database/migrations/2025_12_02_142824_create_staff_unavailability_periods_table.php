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
        Schema::create('staff_unavailability_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('clinic_staff')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('reason', ['sick_leave', 'vacation', 'emergency', 'other'])->default('other');
            $table->text('notes')->nullable();
            $table->foreignId('bulk_operation_id')->nullable()->constrained('bulk_cancellation_operations')->onDelete('set null');
            $table->timestamps();

            $table->index(['staff_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_unavailability_periods');
    }
};
