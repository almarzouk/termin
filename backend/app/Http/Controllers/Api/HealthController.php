<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Einfacher Health‑Check für die API
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'mien-termin api',
            'locale' => 'de'
        ]);
    }
}
