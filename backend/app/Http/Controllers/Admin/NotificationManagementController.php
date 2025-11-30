<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class NotificationManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('notifications')
            ->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('channel') && $request->channel) {
            $query->where('channel', $request->channel);
        }

        $notifications = $query->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Notifications retrieved successfully',
            'data' => $notifications
        ]);
    }

    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,success,warning,error',
            'channel' => 'required|in:email,sms,push,all',
            'target' => 'required|string',
            'scheduled_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get target users
        $users = $this->getTargetUsers($request->target);

        // Create notification for each user
        foreach ($users as $user) {
            DB::table('notifications')->insert([
                'user_id' => $user->id,
                'type' => $request->type,
                'title' => $request->title,
                'message' => $request->message,
                'data' => json_encode([
                    'channel' => $request->channel,
                    'target' => $request->target,
                    'scheduled_at' => $request->scheduled_at,
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Benachrichtigung ' . ($request->scheduled_at ? 'geplant' : 'gesendet'),
            'data' => [
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type,
                'channel' => $request->channel,
                'target' => $request->target,
                'created_at' => now(),
            ]
        ], 201);
    }

    private function sendNotification($notificationId)
    {
        $notification = DB::table('notifications')->find($notificationId);

        if (!$notification) {
            return;
        }

        // Get target users
        $users = $this->getTargetUsers($notification->target);

        foreach ($users as $user) {
            switch ($notification->channel) {
                case 'email':
                    $this->sendEmail($user, $notification);
                    break;
                case 'sms':
                    $this->sendSMS($user, $notification);
                    break;
                case 'push':
                    $this->sendPush($user, $notification);
                    break;
                case 'all':
                    $this->sendEmail($user, $notification);
                    $this->sendSMS($user, $notification);
                    $this->sendPush($user, $notification);
                    break;
            }
        }

        // Update notification status
        DB::table('notifications')
            ->where('id', $notificationId)
            ->update(['status' => 'sent', 'updated_at' => now()]);
    }

    private function getTargetUsers($target)
    {
        if ($target === 'all') {
            return DB::table('users')->get();
        }

        // Parse target (e.g., "role:doctor", "clinic:1", etc.)
        $parts = explode(':', $target);
        if (count($parts) === 2) {
            list($type, $value) = $parts;

            switch ($type) {
                case 'role':
                    return DB::table('users')->where('role', $value)->get();
                case 'clinic':
                    return DB::table('users')->where('clinic_id', $value)->get();
                default:
                    return collect([]);
            }
        }

        return collect([]);
    }

    private function sendEmail($user, $notification)
    {
        // Email sending logic
        // Mail::to($user->email)->send(new NotificationEmail($notification));
    }

    private function sendSMS($user, $notification)
    {
        // SMS sending logic
    }

    private function sendPush($user, $notification)
    {
        // Push notification logic
    }

    public function getTemplates()
    {
        $templates = [
            [
                'id' => 1,
                'name' => 'Terminerinnerung',
                'subject' => 'Ihr Termin morgen',
                'body' => 'Sehr geehrte/r {patient_name}, dies ist eine Erinnerung an Ihren Termin am {appointment_date} um {appointment_time}.',
                'type' => 'appointment_reminder',
            ],
            [
                'id' => 2,
                'name' => 'Terminbestätigung',
                'subject' => 'Terminbestätigung',
                'body' => 'Ihr Termin am {appointment_date} um {appointment_time} wurde bestätigt.',
                'type' => 'appointment_confirmation',
            ],
            [
                'id' => 3,
                'name' => 'Zahlungsbestätigung',
                'subject' => 'Zahlungsbestätigung',
                'body' => 'Ihre Zahlung über {amount} wurde erfolgreich verarbeitet.',
                'type' => 'payment_confirmation',
            ],
            [
                'id' => 4,
                'name' => 'Willkommensnachricht',
                'subject' => 'Willkommen bei Mien Termin',
                'body' => 'Willkommen bei Mien Termin! Wir freuen uns, Sie als neuen Patienten begrüßen zu dürfen.',
                'type' => 'welcome',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    public function createTemplate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'required|in:email,sms,push',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $templateId = DB::table('notification_templates')->insertGetId([
            'name' => $request->name,
            'subject' => $request->subject,
            'body' => $request->body,
            'type' => $request->type,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $template = DB::table('notification_templates')->find($templateId);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'data' => $template
        ], 201);
    }
}
