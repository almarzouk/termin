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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('avatar')->nullable()->after('password');
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('avatar');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('address')->nullable()->after('date_of_birth');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('country', 100)->default('Germany')->after('city');
            $table->string('postal_code', 20)->nullable()->after('country');
            $table->string('language', 5)->default('de')->after('postal_code');
            $table->boolean('is_active')->default(true)->after('language');
            $table->timestamp('last_login_at')->nullable()->after('is_active');

            // Indexes
            $table->index('phone');
            $table->index('city');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar',
                'gender',
                'date_of_birth',
                'address',
                'city',
                'country',
                'postal_code',
                'language',
                'is_active',
                'last_login_at'
            ]);
        });
    }
};
