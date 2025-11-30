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
        Schema::create('clinic_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained('clinic_branches')->onDelete('set null');
            $table->enum('role', ['doctor', 'nurse', 'receptionist', 'manager']);
            $table->string('specialty')->nullable();
            $table->string('license_number')->nullable();
            $table->text('bio')->nullable();
            $table->integer('experience_years')->nullable();
            $table->json('qualifications')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('clinic_id');
            $table->index('user_id');
            $table->index('role');
            $table->index('is_active');
            $table->unique(['clinic_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_staff');
    }
};
