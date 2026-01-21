"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Users,
  Building,
  Stethoscope,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import SubscriptionLimitsCard from "@/components/subscription/SubscriptionLimitsCard";
import { StaffUnavailabilityAlerts } from "@/components/admin/staff-unavailability-alerts";
import {
  AppointmentsTrendChart,
  RevenueTrendChart,
  AppointmentsByStatusChart,
} from "@/components/admin/dashboard-charts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalClinics: 0,
    totalServices: 0,
    totalAppointments: 0,
    activeUsers: 0,
    pendingAppointments: 0,
    revenue: 0,
    growth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [appointmentsTrend, setAppointmentsTrend] = useState<{
    labels: string[];
    values: number[];
  }>({ labels: [], values: [] });
  const [revenueTrend, setRevenueTrend] = useState<{
    labels: string[];
    values: number[];
  }>({ labels: [], values: [] });
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, doctorsRes, trendRes, revenueRes, statusRes] =
        await Promise.all([
          api.admin.dashboard.getStats(),
          api.admin.dashboard.getTopDoctors(),
          api.admin.dashboard.getAppointmentsTrend(),
          api.admin.dashboard.getRevenueTrend(),
          api.admin.dashboard.getAppointmentsByStatus(),
        ]);

      console.log("📊 Dashboard API Responses:");
      console.log("Stats:", statsRes);
      console.log("Top Doctors:", doctorsRes);
      console.log("Appointments Trend:", trendRes);
      console.log("Revenue Trend:", revenueRes);
      console.log("Appointments by Status:", statusRes);

      setStats(statsRes.data.data || {});
      setTopDoctors(doctorsRes.data.data || []);

      // For chart endpoints, data is directly in response.data (not response.data.data)
      const appointmentsTrendData = trendRes.data || {
        labels: [],
        values: [],
      };
      console.log("Setting Appointments Trend:", appointmentsTrendData);
      setAppointmentsTrend(appointmentsTrendData);

      const revenueTrendData = revenueRes.data || {
        labels: [],
        values: [],
      };
      console.log("Setting Revenue Trend:", revenueTrendData);
      setRevenueTrend(revenueTrendData);

      const statusData = statusRes.data || {};
      console.log("Setting Status Data:", statusData);
      setAppointmentsByStatus(statusData);
    } catch (error: any) {
      console.error("❌ Dashboard Error:", error);
      toast({
        title: "❌ Fehler",
        description: "Dashboard-Daten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Gesamtbenutzer",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Kliniken",
      value: stats.totalClinics || 0,
      icon: Building,
      color: "bg-green-500",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Dienste",
      value: stats.totalServices || 0,
      icon: Stethoscope,
      color: "bg-purple-500",
      change: "+15%",
      trend: "up",
    },
    {
      title: "Termine",
      value: stats.totalAppointments || 0,
      icon: Calendar,
      color: "bg-orange-500",
      change: "+5%",
      trend: "up",
    },
    {
      title: "Aktive Benutzer",
      value: stats.activeUsers || 0,
      icon: UserCheck,
      color: "bg-cyan-500",
      change: "+18%",
      trend: "up",
    },
    {
      title: "Ausstehend",
      value: stats.pendingAppointments || 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: "-3%",
      trend: "down",
    },
    {
      title: "Umsatz",
      value: `€${(stats.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      change: "+22%",
      trend: "up",
    },
    {
      title: "Wachstum",
      value: `${stats.growth || 0}%`,
      icon: TrendingUp,
      color: "bg-pink-500",
      change: "+10%",
      trend: "up",
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Systemübersicht und Statistiken</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Lädt Dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </h3>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        vs. letzter Monat
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments Trend Chart */}
            <div className="lg:col-span-2">
              <AppointmentsTrendChart data={appointmentsTrend} />
            </div>

            {/* Appointments By Status Pie Chart */}
            <div className="lg:col-span-1">
              <AppointmentsByStatusChart data={appointmentsByStatus} />
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="grid grid-cols-1 gap-6">
            <RevenueTrendChart data={revenueTrend} />
          </div>

          {/* Staff Unavailability Alerts */}
          <StaffUnavailabilityAlerts maxItems={5} />

          {/* Subscription Limits + Top Doctors & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Limits Card */}
            <div className="lg:col-span-1">
              <SubscriptionLimitsCard />
            </div>

            {/* Top Doctors */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Top Ärzte
              </h3>
              <div className="space-y-3">
                {topDoctors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Keine Daten verfügbar
                  </p>
                ) : (
                  topDoctors.map((doctor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {doctor.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {doctor.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {doctor.appointments || 0}
                        </p>
                        <p className="text-sm text-gray-500">Termine</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* System Status */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Systemstatus
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Datenbank</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  Aktiv
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">API Server</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  Aktiv
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">
                    E-Mail Service
                  </span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  Aktiv
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">
                    Backup Service
                  </span>
                </div>
                <span className="text-sm font-semibold text-yellow-600">
                  Ausstehend
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Schnellaktionen
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Benutzer
                </span>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition text-center">
                <Building className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Kliniken
                </span>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-center">
                <Stethoscope className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Dienste
                </span>
              </button>
              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition text-center">
                <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Termine
                </span>
              </button>
              <button className="p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition text-center">
                <Activity className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Aktivität
                </span>
              </button>
              <button className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition text-center">
                <TrendingUp className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Berichte
                </span>
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
