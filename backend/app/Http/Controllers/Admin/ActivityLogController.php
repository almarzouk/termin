<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with(['causer', 'subject']);

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('causer', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Action filter (event)
        if ($request->has('action') && $request->action) {
            $query->where('event', $request->action);
        }

        // User filter
        if ($request->has('user') && $request->user) {
            $query->where('causer_id', $request->user);
        }

        // Date range filter
        if ($request->has('from') && $request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->has('to') && $request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(50);

        // Transform the data to match frontend expectations
        $transformedLogs = $logs->getCollection()->map(function ($log) {
            return [
                'id' => $log->id,
                'type' => $log->event ?? 'update',
                'description' => $log->description,
                'user' => [
                    'name' => $log->causer?->name ?? 'System',
                    'email' => $log->causer?->email ?? null,
                ],
                'model' => $log->subject_type ? class_basename($log->subject_type) : null,
                'model_id' => $log->subject_id,
                'ip_address' => $log->properties['ip'] ?? null,
                'created_at' => $log->created_at,
                'properties' => $log->properties,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Activity logs retrieved successfully',
            'data' => $transformedLogs,
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');

        $query = Activity::with(['causer', 'subject']);

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('causer', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('action') && $request->action) {
            $query->where('event', $request->action);
        }

        if ($request->has('user') && $request->user) {
            $query->where('causer_id', $request->user);
        }

        if ($request->has('from') && $request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->has('to') && $request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'csv') {
            $filename = 'activity-logs-' . date('Y-m-d-His') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ];

            $callback = function() use ($logs) {
                $file = fopen('php://output', 'w');

                // Headers
                fputcsv($file, ['ID', 'Aktivität', 'Beschreibung', 'Benutzer', 'E-Mail', 'Modell', 'IP-Adresse', 'Datum']);

                // Data
                foreach ($logs as $log) {
                    fputcsv($file, [
                        $log->id,
                        $log->event ?? 'N/A',
                        $log->description,
                        $log->causer?->name ?? 'System',
                        $log->causer?->email ?? 'N/A',
                        $log->subject_type ? class_basename($log->subject_type) : 'N/A',
                        $log->properties['ip'] ?? 'N/A',
                        $log->created_at->format('d.m.Y H:i:s'),
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unsupported format',
        ], 400);
    }
}
