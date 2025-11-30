<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('subscription_plans')->insert([
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Perfect for testing the platform',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_staff' => 1,
                'max_branches' => 1,
                'max_appointments_per_month' => 50,
                'features' => json_encode([
                    'Basic booking system',
                    'Email notifications',
                    '50 appointments/month',
                    '1 staff member',
                ]),
                'is_active' => true,
                'trial_days' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Great for small clinics',
                'price_monthly' => 29.00,
                'price_yearly' => 290.00, // 2 months free
                'max_staff' => 5,
                'max_branches' => 1,
                'max_appointments_per_month' => 200,
                'features' => json_encode([
                    'Everything in Free',
                    '200 appointments/month',
                    'Up to 5 staff members',
                    'SMS reminders',
                    'Basic analytics',
                    'Patient records',
                ]),
                'is_active' => true,
                'trial_days' => 14,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'For growing medical practices',
                'price_monthly' => 79.00,
                'price_yearly' => 790.00, // 2 months free
                'max_staff' => 15,
                'max_branches' => 3,
                'max_appointments_per_month' => 1000,
                'features' => json_encode([
                    'Everything in Starter',
                    '1000 appointments/month',
                    'Up to 15 staff members',
                    'Multi-branch support (3 branches)',
                    'Advanced analytics',
                    'CRM features',
                    'Custom branding',
                    'Priority support',
                ]),
                'is_active' => true,
                'trial_days' => 14,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large clinics and hospitals',
                'price_monthly' => 199.00,
                'price_yearly' => 1990.00, // 2 months free
                'max_staff' => 0, // unlimited
                'max_branches' => 0, // unlimited
                'max_appointments_per_month' => 0, // unlimited
                'features' => json_encode([
                    'Everything in Professional',
                    'Unlimited appointments',
                    'Unlimited staff members',
                    'Unlimited branches',
                    'API access',
                    'White-label solution',
                    'Dedicated account manager',
                    '24/7 support',
                    'Custom integrations',
                ]),
                'is_active' => true,
                'trial_days' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

