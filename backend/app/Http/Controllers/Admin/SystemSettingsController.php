<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class SystemSettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $settings = [
            // General
            'app_name' => Cache::get('settings.app_name', config('app.name')),
            'app_url' => Cache::get('settings.app_url', config('app.url')),
            'timezone' => Cache::get('settings.timezone', config('app.timezone')),
            'locale' => Cache::get('settings.locale', config('app.locale')),
            'date_format' => Cache::get('settings.date_format', 'd.m.Y'),
            'time_format' => Cache::get('settings.time_format', 'H:i'),

            // Email
            'mail_driver' => Cache::get('settings.mail_driver', 'smtp'),
            'mail_host' => Cache::get('settings.mail_host', ''),
            'mail_port' => Cache::get('settings.mail_port', '587'),
            'mail_username' => Cache::get('settings.mail_username', ''),
            'mail_password' => Cache::get('settings.mail_password', ''),
            'mail_encryption' => Cache::get('settings.mail_encryption', 'tls'),
            'mail_from_address' => Cache::get('settings.mail_from_address', config('mail.from.address')),
            'mail_from_name' => Cache::get('settings.mail_from_name', config('mail.from.name')),

            // SMS
            'sms_provider' => Cache::get('settings.sms_provider', 'twilio'),
            'sms_api_key' => Cache::get('settings.sms_api_key', ''),
            'sms_api_secret' => Cache::get('settings.sms_api_secret', ''),
            'sms_from_number' => Cache::get('settings.sms_from_number', ''),

            // Payment
            'payment_gateway' => Cache::get('settings.payment_gateway', 'stripe'),
            'stripe_public_key' => Cache::get('settings.stripe_public_key', ''),
            'stripe_secret_key' => Cache::get('settings.stripe_secret_key', ''),
            'paypal_client_id' => Cache::get('settings.paypal_client_id', ''),
            'paypal_secret' => Cache::get('settings.paypal_secret', ''),
            'currency' => Cache::get('settings.currency', 'EUR'),
            'tax_rate' => Cache::get('settings.tax_rate', 19),

            // Security
            'two_factor_enabled' => Cache::get('settings.two_factor_enabled', false),
            'session_lifetime' => Cache::get('settings.session_lifetime', 120),
            'password_expiry_days' => Cache::get('settings.password_expiry_days', 90),
            'max_login_attempts' => Cache::get('settings.max_login_attempts', 5),
            'ip_whitelist' => Cache::get('settings.ip_whitelist', ''),

            // Notifications
            'notification_email' => Cache::get('settings.notification_email', true),
            'notification_sms' => Cache::get('settings.notification_sms', false),
            'notification_push' => Cache::get('settings.notification_push', true),
            'appointment_reminders' => Cache::get('settings.appointment_reminders', true),
            'payment_notifications' => Cache::get('settings.payment_notifications', true),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        // Get all settings from request
        $data = $request->all();

        // Save each setting to cache
        foreach ($data as $key => $value) {
            Cache::forever("settings.{$key}", $value);
        }

        return response()->json([
            'success' => true,
            'message' => 'Einstellungen erfolgreich aktualisiert.',
            'data' => $data,
        ]);
    }

    /**
     * Clear cache
     */
    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        return response()->json([
            'success' => true,
            'message' => 'Cache erfolgreich geleert.',
        ]);
    }

    /**
     * Get system info
     */
    public function systemInfo()
    {
        $info = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug'),
            'timezone' => config('app.timezone'),
            'database' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
        ];

        return response()->json([
            'success' => true,
            'data' => $info,
        ]);
    }

    /**
     * Backup database
     */
    public function backup()
    {
        try {
            $filename = 'backup_' . date('Y_m_d_His') . '.sql';
            $path = storage_path('app/backups/' . $filename);

            // Create backups directory if it doesn't exist
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Run backup command (for SQLite)
            $database = database_path('database.sqlite');
            if (file_exists($database)) {
                copy($database, $path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup erfolgreich erstellt.',
                'filename' => $filename,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Backup fehlgeschlagen: ' . $e->getMessage(),
            ], 500);
        }
    }
}
