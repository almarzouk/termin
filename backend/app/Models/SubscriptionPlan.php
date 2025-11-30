<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'price',
        'billing_period',
        'max_clinics',
        'max_doctors',
        'max_staff',
        'max_appointments_per_month',
        'has_sms',
        'has_email',
        'has_reports',
        'has_analytics',
        'has_api_access',
        'priority_support',
        'is_popular',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'has_sms' => 'boolean',
        'has_email' => 'boolean',
        'has_reports' => 'boolean',
        'has_analytics' => 'boolean',
        'has_api_access' => 'boolean',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getFeaturesList()
    {
        $features = [];

        if ($this->max_clinics) {
            $features[] = $this->max_clinics . ' Clinics';
        } else {
            $features[] = 'Unlimited Clinics';
        }

        if ($this->max_doctors) {
            $features[] = $this->max_doctors . ' Doctors';
        } else {
            $features[] = 'Unlimited Doctors';
        }

        if ($this->has_sms) $features[] = 'SMS Notifications';
        if ($this->has_email) $features[] = 'Email Notifications';
        if ($this->has_reports) $features[] = 'Advanced Reports';
        if ($this->has_analytics) $features[] = 'Analytics Dashboard';
        if ($this->has_api_access) $features[] = 'API Access';

        return $features;
    }
}
