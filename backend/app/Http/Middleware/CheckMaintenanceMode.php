<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if maintenance mode is enabled
        $maintenanceMode = cache('maintenance_mode', false);

        if ($maintenanceMode) {
            // Allow super admins to bypass maintenance mode
            if (auth()->check() && auth()->user()->hasRole('super_admin')) {
                return $next($request);
            }

            // Check for bypass token in request
            if ($request->header('X-Maintenance-Bypass') === config('app.maintenance_bypass_token')) {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'message' => 'Die Website befindet sich im Wartungsmodus. Bitte versuchen Sie es später erneut.',
                'maintenance_mode' => true,
            ], 503);
        }

        return $next($request);
    }
}
