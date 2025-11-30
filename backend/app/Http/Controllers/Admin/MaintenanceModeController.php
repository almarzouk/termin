<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MaintenanceModeController extends Controller
{
    /**
     * Get maintenance mode status
     */
    public function status()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => Cache::get('maintenance_mode', false),
                'message' => Cache::get('maintenance_message', 'Die Website befindet sich im Wartungsmodus.'),
            ],
        ]);
    }

    /**
     * Enable maintenance mode
     */
    public function enable(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        Cache::forever('maintenance_mode', true);
        Cache::forever('maintenance_message', $request->message ?? 'Die Website befindet sich im Wartungsmodus. Wir arbeiten an Verbesserungen.');

        return response()->json([
            'success' => true,
            'message' => 'Wartungsmodus wurde aktiviert.',
        ]);
    }

    /**
     * Disable maintenance mode
     */
    public function disable()
    {
        Cache::forget('maintenance_mode');
        Cache::forget('maintenance_message');

        return response()->json([
            'success' => true,
            'message' => 'Wartungsmodus wurde deaktiviert.',
        ]);
    }

    /**
     * Toggle maintenance mode
     */
    public function toggle(Request $request)
    {
        $currentStatus = Cache::get('maintenance_mode', false);

        if ($currentStatus) {
            return $this->disable();
        } else {
            return $this->enable($request);
        }
    }
}
