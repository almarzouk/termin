<?php

namespace App\Modules\Subscription\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class SubscriptionController extends Controller
{
    /**
     * Get current user's subscription
     */
    public function mySubscription()
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->with('plan')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found',
                'data' => null
            ], 404);
        }

        // Get plan features
        $features = $this->getPlanFeatures($subscription->plan->name);

        $data = [
            'id' => $subscription->id,
            'plan_name' => $subscription->plan->name,
            'status' => $subscription->status,
            'started_at' => $subscription->starts_at,
            'expires_at' => $subscription->ends_at,
            'auto_renew' => $subscription->auto_renew,
            'payment_status' => 'active', // or derive from subscription status
            'amount' => $subscription->final_price ?? $subscription->original_price,
            'features' => $features,
        ];

        return response()->json([
            'message' => 'Subscription retrieved successfully',
            'data' => $data
        ]);
    }

    /**
     * Get invoices for current user
     */
    public function getInvoices()
    {
        $user = Auth::user();

        $invoices = Invoice::where('user_id', $user->id)
            ->orderBy('issued_at', 'desc')
            ->get()
            ->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'amount' => $invoice->amount,
                    'status' => $invoice->status,
                    'issued_at' => $invoice->issued_at,
                    'paid_at' => $invoice->paid_at,
                ];
            });

        return response()->json([
            'message' => 'Invoices retrieved successfully',
            'data' => $invoices
        ]);
    }

    /**
     * Download invoice as PDF
     */
    public function downloadInvoice($invoiceId)
    {
        $user = Auth::user();

        $invoice = Invoice::where('id', $invoiceId)
            ->where('user_id', $user->id)
            ->with(['user', 'subscription.plan'])
            ->firstOrFail();

        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));

        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }

    /**
     * Upgrade subscription
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $user = Auth::user();

        $currentSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($currentSubscription) {
            // Cancel current subscription
            $currentSubscription->cancel('Upgraded to new plan');
        }

        $plan = \App\Models\SubscriptionPlan::findOrFail($request->plan_id);

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $request->plan_id,
            'clinic_id' => $user->clinic_id ?? null,
            'original_price' => $plan->price,
            'final_price' => $plan->price,
            'status' => 'pending',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
            'auto_renew' => true,
        ]);

        // In a real application, you would redirect to payment gateway here
        // For now, we'll just mark it as active
        $subscription->update([
            'status' => 'active',
        ]);

        // Create invoice
        Invoice::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'invoice_number' => 'INV-' . strtoupper(uniqid()),
            'amount' => $subscription->final_price,
            'status' => 'paid',
            'issued_at' => now(),
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscription upgraded successfully',
            'data' => $subscription
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancel()
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->firstOrFail();

        $subscription->cancel('Cancelled by user');

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'data' => $subscription
        ]);
    }

    /**
     * Get plan features based on plan name
     */
    private function getPlanFeatures($planName)
    {
        $features = [
            'Basic' => [
                'Bis zu 100 Termine pro Monat',
                'Terminverwaltung',
                'Patientenverwaltung',
                'E-Mail-Support',
                '1 Klinik',
                'Basic Berichte',
            ],
            'Professional' => [
                'Unbegrenzte Termine',
                'Terminverwaltung',
                'Patientenverwaltung',
                'Prioritäts-Support',
                'Bis zu 3 Kliniken',
                'Erweiterte Berichte',
                'SMS-Erinnerungen',
                'Online-Buchungen',
            ],
            'Enterprise' => [
                'Unbegrenzte Termine',
                'Terminverwaltung',
                'Patientenverwaltung',
                '24/7 Premium Support',
                'Unbegrenzte Kliniken',
                'Erweiterte Berichte & Analytics',
                'SMS-Erinnerungen',
                'Online-Buchungen',
                'API-Zugang',
                'White-Label-Option',
                'Dedizierter Account Manager',
                'Telemedizin',
            ],
        ];

        return $features[$planName] ?? [];
    }
}
