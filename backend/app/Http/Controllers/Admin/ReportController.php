<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Clinic;
use App\Models\Service;

class ReportController extends Controller
{
    public function generate(Request $request, $type)
    {
        $startDate = $request->start_date ?? now()->subMonth()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->format('Y-m-d');

        switch ($type) {
            case 'overview':
                return $this->overviewReport($startDate, $endDate);
            case 'appointments':
                return $this->appointmentsReport($startDate, $endDate);
            case 'revenue':
                return $this->revenueReport($startDate, $endDate);
            case 'patients':
                return $this->patientsReport($startDate, $endDate);
            case 'staff':
                return $this->staffReport($startDate, $endDate);
            case 'services':
                return $this->servicesReport($startDate, $endDate);
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid report type'
                ], 400);
        }
    }

    private function overviewReport($startDate, $endDate)
    {
        $stats = [
            'total_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_clinics' => Clinic::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_services' => Service::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_appointments' => DB::table('appointments')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'active_users' => User::where('status', 'active')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Overview report generated successfully',
            'data' => [
                'stats' => $stats,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
                'data' => []
            ]
        ]);
    }

    private function appointmentsReport($startDate, $endDate)
    {
        $appointments = DB::table('appointments')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $stats = [
            'total_appointments' => $appointments->count(),
            'confirmed' => $appointments->where('status', 'confirmed')->count(),
            'pending' => $appointments->where('status', 'pending')->count(),
            'cancelled' => $appointments->where('status', 'cancelled')->count(),
            'completed' => $appointments->where('status', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Appointments report generated successfully',
            'data' => [
                'stats' => $stats,
                'data' => $appointments,
            ]
        ]);
    }

    private function revenueReport($startDate, $endDate)
    {
        $payments = DB::table('payments')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $stats = [
            'total_revenue' => $payments->sum('amount'),
            'total_transactions' => $payments->count(),
            'average_transaction' => $payments->avg('amount'),
            'successful_payments' => $payments->where('status', 'completed')->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Revenue report generated successfully',
            'data' => [
                'stats' => $stats,
                'data' => $payments,
            ]
        ]);
    }

    private function patientsReport($startDate, $endDate)
    {
        $patients = DB::table('patients')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $stats = [
            'total_patients' => $patients->count(),
            'new_patients' => $patients->count(),
            'male_patients' => $patients->where('gender', 'male')->count(),
            'female_patients' => $patients->where('gender', 'female')->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Patients report generated successfully',
            'data' => [
                'stats' => $stats,
                'data' => $patients,
            ]
        ]);
    }

    private function staffReport($startDate, $endDate)
    {
        $staff = DB::table('staff')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $stats = [
            'total_staff' => $staff->count(),
            'active_staff' => $staff->where('status', 'active')->count(),
            'inactive_staff' => $staff->where('status', 'inactive')->count(),
            'by_role' => [
                'receptionist' => $staff->where('role', 'receptionist')->count(),
                'nurse' => $staff->where('role', 'nurse')->count(),
                'clinic_manager' => $staff->where('role', 'clinic_manager')->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Staff report generated successfully',
            'data' => [
                'stats' => $stats,
                'data' => $staff,
            ]
        ]);
    }

    private function servicesReport($startDate, $endDate)
    {
        $services = Service::whereBetween('created_at', [$startDate, $endDate])->get();

        $stats = [
            'total_services' => $services->count(),
            'active_services' => $services->where('status', 'active')->count(),
            'inactive_services' => $services->where('status', 'inactive')->count(),
            'average_price' => $services->avg('price'),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Services report generated successfully',
            'data' => [
                'stats' => $stats,
                'data' => $services,
            ]
        ]);
    }

    public function export(Request $request)
    {
        // Implementation for exporting reports to PDF/Excel
        return response()->json([
            'success' => true,
            'message' => 'Report export initiated',
            'data' => []
        ]);
    }
}
