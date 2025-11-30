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
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('clinic_type', ['human', 'veterinary'])->default('human');
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('website')->nullable();
            $table->string('logo')->nullable();
            $table->json('specialties')->nullable(); // ["Dentistry", "Orthodontics"]
            $table->json('languages')->nullable(); // ["de", "en", "ar"]
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('subscription_id')->nullable();
            $table->json('settings')->nullable(); // Clinic-specific settings
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('owner_id');
            $table->index('clinic_type');
            $table->index('is_active');
        });
    }    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};
