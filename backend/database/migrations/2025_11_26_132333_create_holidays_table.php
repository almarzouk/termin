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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained('clinic_branches')->onDelete('cascade');
            $table->date('date');
            $table->string('name');
            $table->boolean('is_recurring')->default(false); // e.g., Christmas every year
            $table->timestamps();

            // Indexes
            $table->index('clinic_id');
            $table->index('branch_id');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
