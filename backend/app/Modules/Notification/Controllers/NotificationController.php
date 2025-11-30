<?php

namespace App\Modules\Notification\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Requests\CreateNotificationRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Display notifications for authenticated user
     */
    public function index(Request $request)
    {
        $query = Notification::where('user_id', auth()->id());

        // Filter by read status
        if ($request->has('read')) {
            if ($request->read === 'true' || $request->read === '1') {
                $query->whereNotNull('read_at');
            } else {
                $query->whereNull('read_at');
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $count = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    /**
     * Create a notification (Admin/Staff only)
     */
    public function store(CreateNotificationRequest $request)
    {
        try {
            // Check authorization
            if (!auth()->user()->hasAnyRole(['super_admin', 'clinic_owner', 'clinic_manager', 'receptionist'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie sind nicht berechtigt, Benachrichtigungen zu erstellen.',
                ], 403);
            }

            $notification = Notification::create([
                'user_id' => $request->user_id,
                'type' => $request->type,
                'title' => $request->title,
                'message' => $request->message,
                'scheduled_for' => $request->scheduled_for,
                'data' => $request->data,
            ]);

            // Send notification immediately if not scheduled
            if (!$request->scheduled_for) {
                $this->sendNotification($notification);
            }

            return response()->json([
                'success' => true,
                'message' => 'Benachrichtigung erfolgreich erstellt.',
                'data' => $notification,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Erstellen der Benachrichtigung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified notification
     */
    public function show($id)
    {
        $notification = Notification::findOrFail($id);

        // Check if user owns this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Sie haben keine Berechtigung, diese Benachrichtigung anzuzeigen.',
            ], 403);
        }

        // Mark as read
        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'data' => $notification,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);

        // Check if user owns this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Sie haben keine Berechtigung, diese Benachrichtigung zu ändern.',
            ], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Benachrichtigung als gelesen markiert.',
            'data' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Alle Benachrichtigungen als gelesen markiert.',
        ]);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        try {
            $notification = Notification::findOrFail($id);

            // Check if user owns this notification
            if ($notification->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sie haben keine Berechtigung, diese Benachrichtigung zu löschen.',
                ], 403);
            }

            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Benachrichtigung erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Benachrichtigung.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete all read notifications
     */
    public function clearRead()
    {
        try {
            Notification::where('user_id', auth()->id())
                ->whereNotNull('read_at')
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gelesene Benachrichtigungen erfolgreich gelöscht.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Löschen der Benachrichtigungen.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send notification via configured channels
     */
    private function sendNotification(Notification $notification)
    {
        // Get user preferences
        $user = $notification->user;
        $preferences = $user->notificationPreferences ?? null;

        // Send email notification
        if (!$preferences || $preferences->email_notifications) {
            // Queue email job
            // dispatch(new SendEmailNotification($notification));
        }

        // Send SMS notification
        if ($preferences && $preferences->sms_notifications) {
            // Queue SMS job
            // dispatch(new SendSMSNotification($notification));
        }

        // Send push notification
        if ($preferences && $preferences->push_notifications) {
            // Queue push notification job
            // dispatch(new SendPushNotification($notification));
        }

        $notification->update(['sent_at' => now()]);
    }
}
