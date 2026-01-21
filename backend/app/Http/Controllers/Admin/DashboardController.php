<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Clinic;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function stats()
    {
        try {
            $stats = [
                // Users Statistics
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('status', 'active')->count(),
                    'inactive' => User::where('status', 'inactive')->count(),
                    'new_this_month' => User::whereMonth('created_at', Carbon::now()->month)->count(),
                ],

                // Patients Statistics
                'patients' => [
                    'total' => Patient::count(),
                    'new_this_month' => Patient::whereMonth('created_at', Carbon::now()->month)->count(),
                    'new_today' => Patient::whereDate('created_at', Carbon::today())->count(),
                ],

                // Appointments Statistics
                'appointments' => [
                    'total' => Appointment::count(),
                    'pending' => Appointment::where('status', 'pending')->count(),
                    'confirmed' => Appointment::where('status', 'confirmed')->count(),
                    'completed' => Appointment::where('status', 'completed')->count(),
                    'cancelled' => Appointment::where('status', 'cancelled')->count(),
                    'today' => Appointment::whereDate('appointment_date', Carbon::today())->count(),
                    'this_week' => Appointment::whereBetween('appointment_date', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ])->count(),
                ],

                // Clinics Statistics
                'clinics' => [
                    'total' => Clinic::count(),
                    'active' => Clinic::where('status', 'active')->count(),
                    'inactive' => Clinic::where('status', 'inactive')->count(),
                ],

                // Doctors Statistics
                'doctors' => [
                    'total' => Doctor::count(),
                    'active' => Doctor::where('status', 'active')->count(),
                    'available' => Doctor::where('status', 'active')->count(),
                ],

                // Revenue Statistics (if payments table exists)
                'revenue' => $this->getRevenueStats(),

                // Recent Activity
                'recent_appointments' => Appointment::with(['patient', 'clinic'])
                    ->latest()
                    ->take(5)
                    ->get(),

                'recent_patients' => Patient::latest()
                    ->take(5)
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Laden der Dashboard-Statistiken: ' . $e->getMessage(),
                'data' => [
                    'users' => ['total' => 0, 'active' => 0, 'inactive' => 0, 'new_this_month' => 0],
                    'patients' => ['total' => 0, 'new_this_month' => 0, 'new_today' => 0],
                    'appointments' => ['total' => 0, 'pending' => 0, 'confirmed' => 0, 'completed' => 0, 'cancelled' => 0, 'today' => 0, 'this_week' => 0],
                    'clinics' => ['total' => 0, 'active' => 0, 'inactive' => 0],
                    'doctors' => ['total' => 0, 'active' => 0, 'available' => 0],
                    'revenue' => ['total' => 0, 'this_month' => 0, 'today' => 0, 'pending' => 0],
                    'recent_appointments' => [],
                    'recent_patients' => [],
                ],
            ], 500);
        }
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats()
    {
        try {
            // Check if payments table exists
            if (!DB::getSchemaBuilder()->hasTable('payments')) {
                return [
                    'total' => 0,
                    'this_month' => 0,
                    'today' => 0,
                    'pending' => 0,
                ];
            }

            return [
                'total' => DB::table('payments')->sum('amount'),
                'this_month' => DB::table('payments')
                    ->whereMonth('created_at', Carbon::now()->month)
                    ->sum('amount'),
                'today' => DB::table('payments')
                    ->whereDate('created_at', Carbon::today())
                    ->sum('amount'),
                'pending' => DB::table('payments')
                    ->where('status', 'pending')
                    ->sum('amount'),
            ];
        } catch (\Exception $e) {
            return [
                'total' => 0,
                'this_month' => 0,
                'today' => 0,
                'pending' => 0,
            ];
        }
    }

    /**
     * Get chart data for appointments
     */
    public function appointmentsChart(Request $request)
    {
        $period = $request->get('period', 'week'); // week, month, year

        $query = Appointment::select(
            DB::raw('DATE(appointment_date) as date'),
            DB::raw('COUNT(*) as count'),
            'status'
        );

        switch ($period) {
            case 'week':
                $query->whereBetween('appointment_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'month':
                $query->whereMonth('appointment_date', Carbon::now()->month);
                break;
            case 'year':
                $query->whereYear('appointment_date', Carbon::now()->year);
                break;
        }

        $data = $query->groupBy('date', 'status')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get top performing doctors
     */
    public function topDoctors()
    {
        try {
            // Get all doctors with appointment count
            $doctors = Doctor::all()->map(function($doctor) {
                $appointmentCount = DB::table('appointments')
                    ->where('doctor_id', $doctor->id)
                    ->count();

                $doctor->total_appointments = $appointmentCount;
                return $doctor;
            })
            ->sortByDesc('total_appointments')
            ->take(10)
            ->values();

            return response()->json([
                'success' => true,
                'data' => $doctors,
            ]);
        } catch (\Exception $e) {
            Log::error('Top doctors error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Laden der Top-Ärzte',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get appointments trend for the last 7 days
     */
    public function appointmentsTrend()
    {
        try {
            $days = [];
            $data = [];

            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayName = $date->locale('de')->isoFormat('dd');
                $count = Appointment::whereDate('start_time', $date)->count();

                $days[] = $dayName;
                $data[] = $count;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'labels' => $days,
                    'values' => $data,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Appointments trend error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Fehler beim Laden des Trends',
                'data' => ['labels' => [], 'values' => []],
            ], 500);
        }
    }

    /**
     * Get revenue trend for the last 7 days
     */
    public function revenueTrend()
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('payments')) {
                return response()->json([
                    'success' => true,
                    'data' => ['labels' => [], 'values' => []],
                ]);
            }

            $days = [];
            $data = [];

            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayName = $date->locale('de')->isoFormat('dd');
                $revenue = DB::table('payments')
                    ->whereDate('created_at', $date)
                    ->where('status', 'completed')
                    ->sum('amount');

                $days[] = $dayName;
                $data[] = (float) $revenue;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'labels' => $days,
                    'values' => $data,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Revenue trend error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => ['labels' => [], 'values' => []],
            ]);
        }
    }

    /**
     * Get appointments by status distribution
     */
    public function appointmentsByStatus()
    {
        try {
            $statuses = [
                'pending' => Appointment::where('status', 'pending')->count(),
                'confirmed' => Appointment::where('status', 'confirmed')->count(),
                'completed' => Appointment::where('status', 'completed')->count(),
                'cancelled' => Appointment::where('status', 'cancelled')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $statuses,
            ]);
        } catch (\Exception $e) {
            Log::error('Appointments by status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Fehler',
                'data' => [],
            ], 500);
        }
    }
}

