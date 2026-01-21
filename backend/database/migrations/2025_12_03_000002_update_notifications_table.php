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
        Schema::table('notifications', function (Blueprint $table) {
            // Add missing columns
            $table->foreignId('clinic_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_read')->default(false)->after('data');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium')->after('is_read');
            $table->string('category')->default('general')->after('priority');
            $table->string('action_url')->nullable()->after('category');
            $table->string('action_text')->nullable()->after('action_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
            $table->dropColumn([
                'clinic_id',
                'is_read',
                'priority',
                'category',
                'action_url',
                'action_text'
            ]);
        });
    }
};
