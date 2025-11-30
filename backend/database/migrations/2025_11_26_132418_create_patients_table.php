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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer who created the patient
            $table->enum('patient_type', ['self', 'family_member', 'pet'])->default('self');
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('blood_type', 5)->nullable(); // For humans
            $table->json('allergies')->nullable();
            $table->json('chronic_diseases')->nullable();
            $table->text('notes')->nullable();

            // Pet-specific fields (for veterinary clinics)
            $table->string('species')->nullable(); // Dog, Cat, Bird, etc.
            $table->string('breed')->nullable();
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->string('microchip_number')->nullable();
            $table->json('pet_data')->nullable(); // Additional pet info

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('patient_type');
            $table->index('email');
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
