<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Invoice;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Seeding subscriptions...');

        // Get all clinic owners
        $clinicOwners = User::role('clinic_owner')->get();

        if ($clinicOwners->isEmpty()) {
            $this->command->warn('⚠️  No clinic owners found. Skipping subscription seeding.');
            return;
        }

        // Get all subscription plans
        $plans = SubscriptionPlan::all();

        if ($plans->isEmpty()) {
            $this->command->warn('⚠️  No subscription plans found. Please run SubscriptionPlanSeeder first.');
            return;
        }

        $subscriptionCount = 0;
        $invoiceCount = 0;

        foreach ($clinicOwners as $owner) {
            // Skip if already has a subscription
            if (Subscription::where('user_id', $owner->id)->exists()) {
                continue;
            }

            // Random plan selection (weighted towards Professional)
            $rand = rand(1, 100);
            if ($rand <= 10) {
                $plan = $plans->where('name', 'Basic')->first();
            } elseif ($rand <= 80) {
                $plan = $plans->where('name', 'Professional')->first();
            } else {
                $plan = $plans->where('name', 'Enterprise')->first();
            }

            if (!$plan) {
                $plan = $plans->random();
            }

            // Random start date (within last 6 months)
            $startDate = Carbon::now()->subDays(rand(0, 180));
            $endDate = $startDate->copy()->addMonth();

            // Random status (weighted towards active)
            $statusRand = rand(1, 100);
            if ($statusRand <= 85) {
                $status = 'active';
            } elseif ($statusRand <= 95) {
                $status = 'expired';
            } else {
                $status = 'cancelled';
            }

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => $owner->id,
                'subscription_plan_id' => $plan->id,
                'clinic_id' => $owner->clinic_id ?? null,
                'original_price' => $plan->price,
                'discount_amount' => 0,
                'final_price' => $plan->price,
                'status' => $status,
                'starts_at' => $startDate,
                'ends_at' => $endDate,
                'auto_renew' => $status === 'active' ? (rand(1, 100) <= 80) : false,
                'cancelled_at' => $status === 'cancelled' ? $endDate->copy()->subDays(rand(1, 10)) : null,
                'cancellation_reason' => $status === 'cancelled' ? 'User cancelled' : null,
            ]);

            $subscriptionCount++;

            // Create 1-3 invoices for each subscription
            $numInvoices = rand(1, 3);

            for ($i = 0; $i < $numInvoices; $i++) {
                $invoiceDate = $startDate->copy()->addMonths($i);

                // Invoice status
                if ($i < $numInvoices - 1 || $status === 'cancelled') {
                    // Old invoices are paid
                    $invoiceStatus = 'paid';
                    $paidAt = $invoiceDate->copy()->addDays(rand(1, 5));
                } elseif ($status === 'active') {
                    // Latest invoice for active subscriptions
                    $invoiceStatus = rand(1, 100) <= 90 ? 'paid' : 'pending';
                    $paidAt = $invoiceStatus === 'paid' ? $invoiceDate->copy()->addDays(rand(1, 5)) : null;
                } else {
                    // Expired subscriptions may have unpaid invoices
                    $invoiceStatus = rand(1, 100) <= 50 ? 'paid' : 'pending';
                    $paidAt = $invoiceStatus === 'paid' ? $invoiceDate->copy()->addDays(rand(1, 5)) : null;
                }

                Invoice::create([
                    'user_id' => $owner->id,
                    'subscription_id' => $subscription->id,
                    'invoice_number' => 'INV-' . strtoupper(uniqid()),
                    'amount' => $subscription->final_price,
                    'status' => $invoiceStatus,
                    'issued_at' => $invoiceDate,
                    'paid_at' => $paidAt,
                    'due_at' => $invoiceDate->copy()->addDays(14),
                ]);

                $invoiceCount++;
            }
        }

        $this->command->info("✅ Created {$subscriptionCount} subscriptions");
        $this->command->info("✅ Created {$invoiceCount} invoices");

        // Statistics
        $activeCount = Subscription::where('status', 'active')->count();
        $expiredCount = Subscription::where('status', 'expired')->count();
        $cancelledCount = Subscription::where('status', 'cancelled')->count();

        $this->command->info("📊 Statistics:");
        $this->command->info("   - Active: {$activeCount}");
        $this->command->info("   - Expired: {$expiredCount}");
        $this->command->info("   - Cancelled: {$cancelledCount}");

        $paidInvoices = Invoice::where('status', 'paid')->count();
        $pendingInvoices = Invoice::where('status', 'pending')->count();

        $this->command->info("💰 Invoices:");
        $this->command->info("   - Paid: {$paidInvoices}");
        $this->command->info("   - Pending: {$pendingInvoices}");
    }
}
