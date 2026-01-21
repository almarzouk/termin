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
        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');
                $table->string('invoice_number')->unique();
                $table->decimal('amount', 10, 2);
                $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');
                $table->timestamp('issued_at');
                $table->timestamp('paid_at')->nullable();
                $table->timestamp('due_at')->nullable();
                $table->timestamps();

                $table->index('user_id');
                $table->index('subscription_id');
                $table->index('status');
                $table->index('invoice_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
