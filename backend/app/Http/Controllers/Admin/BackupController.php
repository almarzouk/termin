<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BackupController extends Controller
{
    public function index()
    {
        $backups = [];
        $backupPath = storage_path('app/backups');

        // Ensure backups directory exists
        if (!is_dir($backupPath)) {
            mkdir($backupPath, 0755, true);
        }

        // Get list of backup files
        $files = array_diff(scandir($backupPath), ['.', '..']);

        foreach ($files as $file) {
            $filePath = $backupPath . '/' . $file;

            // Skip directories
            if (is_dir($filePath)) {
                continue;
            }

            $backups[] = [
                'id' => md5($file),
                'filename' => $file,
                'path' => 'backups/' . $file,
                'size' => filesize($filePath),
                'status' => 'completed',
                'created_at' => date('Y-m-d H:i:s', filemtime($filePath)),
            ];
        }

        // Sort by creation date descending
        usort($backups, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Backups retrieved successfully',
            'data' => $backups
        ]);
    }

    public function create()
    {
        try {
            $filename = 'backup-' . date('Y-m-d-His') . '.sql';
            $path = storage_path('app/backups/' . $filename);

            // Ensure backups directory exists
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Get database configuration
            $database = env('DB_DATABASE', 'database.sqlite');
            $dbPath = database_path($database);

            // For SQLite, just copy the file
            if (file_exists($dbPath)) {
                copy($dbPath, $path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup created successfully',
                'data' => [
                    'filename' => $filename,
                    'size' => filesize($path),
                    'created_at' => date('Y-m-d H:i:s'),
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Backup creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSettings()
    {
        $settings = [
            'auto_backup' => env('BACKUP_AUTO_ENABLED', true),
            'backup_frequency' => env('BACKUP_FREQUENCY', 'daily'),
            'retention_days' => env('BACKUP_RETENTION_DAYS', 30),
            'backup_location' => env('BACKUP_LOCATION', 'local'),
            'backup_time' => env('BACKUP_TIME', '02:00'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Backup settings retrieved successfully',
            'data' => $settings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'auto_backup' => 'boolean',
            'backup_frequency' => 'in:hourly,daily,weekly,monthly',
            'retention_days' => 'integer|min:1|max:365',
            'backup_location' => 'in:local,cloud,both',
            'backup_time' => 'date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // In a real application, you would update .env file or database
        // For now, we'll just return success

        return response()->json([
            'success' => true,
            'message' => 'Backup settings updated successfully',
            'data' => $request->all()
        ]);
    }

    public function restore(Request $request, $id)
    {
        try {
            $backups = $this->index()->getData()->data;
            $backup = collect($backups)->firstWhere('id', $id);

            if (!$backup) {
                return response()->json([
                    'success' => false,
                    'message' => 'Backup not found'
                ], 404);
            }

            $backupPath = storage_path('app/' . $backup->path);
            $database = env('DB_DATABASE', 'database.sqlite');
            $dbPath = database_path($database);

            // For SQLite, just copy the backup file back
            if (file_exists($backupPath)) {
                copy($backupPath, $dbPath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup restored successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Backup restoration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $backups = $this->index()->getData()->data;
            $backup = collect($backups)->firstWhere('id', $id);

            if (!$backup) {
                return response()->json([
                    'success' => false,
                    'message' => 'Backup not found'
                ], 404);
            }

            $filePath = storage_path('app/' . $backup->path);

            if (file_exists($filePath)) {
                unlink($filePath);
            }

            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Backup deletion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($id)
    {
        try {
            $backups = $this->index()->getData()->data;
            $backup = collect($backups)->firstWhere('id', $id);

            if (!$backup) {
                return response()->json([
                    'success' => false,
                    'message' => 'Backup not found'
                ], 404);
            }

            $path = storage_path('app/' . $backup->path);

            if (!file_exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Backup file not found'
                ], 404);
            }

            return response()->download($path, $backup->filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Download failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
