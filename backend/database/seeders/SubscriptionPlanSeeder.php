<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basis',
                'name_ar' => null,
                'description' => 'Perfekt für kleine Praxen, die gerade erst anfangen',
                'description_ar' => null,
                'price' => 49.99,
                'billing_period' => 'monthly',
                'max_clinics' => 1,
                'max_doctors' => 2,
                'max_staff' => 5,
                'max_appointments_per_month' => 100,
                'has_sms' => false,
                'has_email' => true,
                'has_reports' => false,
                'has_analytics' => false,
                'has_api_access' => false,
                'priority_support' => 0,
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Professional',
                'name_ar' => null,
                'description' => 'Ideal für wachsende Praxen mit mehreren Ärzten',
                'description_ar' => null,
                'price' => 99.99,
                'billing_period' => 'monthly',
                'max_clinics' => 3,
                'max_doctors' => 5,
                'max_staff' => 15,
                'max_appointments_per_month' => 500,
                'has_sms' => true,
                'has_email' => true,
                'has_reports' => true,
                'has_analytics' => false,
                'has_api_access' => false,
                'priority_support' => 1,
                'is_popular' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'name_ar' => null,
                'description' => 'Komplettlösung für große Gesundheitseinrichtungen',
                'description_ar' => null,
                'price' => 199.99,
                'billing_period' => 'monthly',
                'max_clinics' => null, // unlimited
                'max_doctors' => null,
                'max_staff' => null,
                'max_appointments_per_month' => null,
                'has_sms' => true,
                'has_email' => true,
                'has_reports' => true,
                'has_analytics' => true,
                'has_api_access' => true,
                'priority_support' => 2,
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Basis Jährlich',
                'name_ar' => null,
                'description' => 'Sparen Sie 20% mit jährlicher Abrechnung',
                'description_ar' => null,
                'price' => 479.99,
                'billing_period' => 'yearly',
                'max_clinics' => 1,
                'max_doctors' => 2,
                'max_staff' => 5,
                'max_appointments_per_month' => 100,
                'has_sms' => false,
                'has_email' => true,
                'has_reports' => false,
                'has_analytics' => false,
                'has_api_access' => false,
                'priority_support' => 0,
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Professional Jährlich',
                'name_ar' => null,
                'description' => 'Sparen Sie 20% mit jährlicher Abrechnung',
                'description_ar' => null,
                'price' => 959.99,
                'billing_period' => 'yearly',
                'max_clinics' => 3,
                'max_doctors' => 5,
                'max_staff' => 15,
                'max_appointments_per_month' => 500,
                'has_sms' => true,
                'has_email' => true,
                'has_reports' => true,
                'has_analytics' => false,
                'has_api_access' => false,
                'priority_support' => 1,
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}
