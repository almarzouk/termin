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
        Schema::table('appointments', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('notes');
            $table->unsignedBigInteger('recurring_parent_id')->nullable()->after('is_recurring');
            $table->string('recurring_pattern', 50)->nullable()->after('recurring_parent_id'); // daily, weekly, monthly, yearly
            $table->integer('recurring_interval')->default(1)->after('recurring_pattern'); // every X days/weeks/months
            $table->json('recurring_days')->nullable()->after('recurring_interval'); // for weekly: [1,3,5] = Mon, Wed, Fri
            $table->integer('recurring_day_of_month')->nullable()->after('recurring_days'); // for monthly: 15 = 15th of month
            $table->date('recurring_end_date')->nullable()->after('recurring_day_of_month');
            $table->integer('recurring_count')->nullable()->after('recurring_end_date'); // number of occurrences
            $table->integer('occurrence_number')->nullable()->after('recurring_count'); // which occurrence in the series

            // Index for better performance
            $table->index('is_recurring');
            $table->index('recurring_parent_id');
            $table->foreign('recurring_parent_id')->references('id')->on('appointments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['recurring_parent_id']);
            $table->dropIndex(['is_recurring']);
            $table->dropIndex(['recurring_parent_id']);
            $table->dropColumn([
                'is_recurring',
                'recurring_parent_id',
                'recurring_pattern',
                'recurring_interval',
                'recurring_days',
                'recurring_day_of_month',
                'recurring_end_date',
                'recurring_count',
                'occurrence_number',
            ]);
        });
    }
};
