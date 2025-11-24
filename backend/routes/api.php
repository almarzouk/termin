<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;

// API Health Endpoint
Route::get('/health', [HealthController::class, 'index']);

// Hier werden später weitere API‑Routen eingefügt (deutsch kommentiert)
