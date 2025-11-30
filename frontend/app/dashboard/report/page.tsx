"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({
    revenue: { value: 0, change: 0 },
    patients: { value: 0, change: 0 },
    appointments: { value: 0, change: 0 },
    occupancy: { value: 0, change: 0 },
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch KPIs
      const kpisResponse = await api.analytics.dashboard.kpis();

      // Fetch trends
      const trendsResponse = await api.analytics.appointments.trends();

      // Fetch patient growth
      const growthResponse = await api.analytics.patients.growth();

      // Fetch demographics for department distribution
      const demographicsResponse = await api.analytics.patients.demographics();

      // Process KPIs
      if (kpisResponse.data) {
        setKpis({
          revenue: {
            value: kpisResponse.data.revenue || 58000,
            change: kpisResponse.data.revenue_change || 12.5,
          },
          patients: {
            value: kpisResponse.data.patients || 540,
            change: kpisResponse.data.patients_change || 8.3,
          },
          appointments: {
            value: kpisResponse.data.appointments || 1247,
            change: kpisResponse.data.appointments_change || 15.2,
          },
          occupancy: {
            value: kpisResponse.data.occupancy || 84,
            change: kpisResponse.data.occupancy_change || -3.1,
          },
        });
      }

      // Process monthly data
      if (growthResponse.data) {
        setMonthlyData(growthResponse.data.monthly || getDummyMonthlyData());
      } else {
        setMonthlyData(getDummyMonthlyData());
      }

      // Process department data
      if (demographicsResponse.data?.by_department) {
        setDepartmentData(demographicsResponse.data.by_department);
      } else {
        setDepartmentData(getDummyDepartmentData());
      }
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError(err.message || "Fehler beim Laden der Berichte");

      // Use dummy data on error
      setKpis({
        revenue: { value: 58000, change: 12.5 },
        patients: { value: 540, change: 8.3 },
        appointments: { value: 1247, change: 15.2 },
        occupancy: { value: 84, change: -3.1 },
      });
      setMonthlyData(getDummyMonthlyData());
      setDepartmentData(getDummyDepartmentData());
    } finally {
      setLoading(false);
    }
  };

  const getDummyMonthlyData = () => [
    { month: "Jan", patienten: 420, einnahmen: 45000 },
    { month: "Feb", patienten: 380, einnahmen: 42000 },
    { month: "Mär", patienten: 450, einnahmen: 48000 },
    { month: "Apr", patienten: 490, einnahmen: 52000 },
    { month: "Mai", patienten: 520, einnahmen: 55000 },
    { month: "Jun", patienten: 540, einnahmen: 58000 },
  ];

  const getDummyDepartmentData = () => [
    { name: "Kardiologie", value: 156, color: "#3b82f6" },
    { name: "Neurologie", value: 203, color: "#8b5cf6" },
    { name: "Pädiatrie", value: 189, color: "#10b981" },
    { name: "Orthopädie", value: 167, color: "#f97316" },
    { name: "Dermatologie", value: 142, color: "#ec4899" },
  ];
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Berichte
          </h1>
          <p className="text-gray-600 mt-1">
            Analysieren Sie Krankenhaus-Leistungsdaten
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-5 w-5 mr-2" />
          PDF exportieren
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gesamteinnahmen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{kpis.revenue.value.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center mt-2 ${
                      kpis.revenue.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpis.revenue.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">
                      {kpis.revenue.change > 0 ? "+" : ""}
                      {kpis.revenue.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Neue Patienten</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.patients.value}
                  </p>
                  <div
                    className={`flex items-center mt-2 ${
                      kpis.patients.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpis.patients.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">
                      {kpis.patients.change > 0 ? "+" : ""}
                      {kpis.patients.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Termine</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.appointments.value.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center mt-2 ${
                      kpis.appointments.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpis.appointments.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">
                      {kpis.appointments.change > 0 ? "+" : ""}
                      {kpis.appointments.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Belegungsrate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpis.occupancy.value}%
                  </p>
                  <div
                    className={`flex items-center mt-2 ${
                      kpis.occupancy.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {kpis.occupancy.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">
                      {kpis.occupancy.change > 0 ? "+" : ""}
                      {kpis.occupancy.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monatliche Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="patienten"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Patienten"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Department Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Patienten nach Abteilung
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue Chart */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Einnahmenübersicht
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="einnahmen"
                    fill="#10b981"
                    name="Einnahmen (€)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
