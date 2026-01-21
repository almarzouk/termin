"use client";

import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import {
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

// Appointments Trend Chart Component
export function AppointmentsTrendChart({
  data,
}: {
  data: { labels: string[]; values: number[] };
}) {
  console.log("Appointments Trend Data:", data);

  const chartData = data.labels.map((label, index) => ({
    name: label,
    termine: data.values[index],
  }));

  console.log("Appointments Chart Data:", chartData);

  if (!data.labels || data.labels.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Termine-Trend (7 Tage)
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Keine Daten verfügbar
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Termine-Trend (7 Tage)
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="termine"
            name="Termine"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Revenue Trend Chart Component
export function RevenueTrendChart({
  data,
}: {
  data: { labels: string[]; values: number[] };
}) {
  console.log("Revenue Trend Data:", data);

  const chartData = data.labels.map((label, index) => ({
    name: label,
    umsatz: data.values[index],
  }));

  console.log("Revenue Chart Data:", chartData);

  if (!data.labels || data.labels.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Umsatz-Trend (7 Tage)
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Keine Daten verfügbar
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Umsatz-Trend (7 Tage)
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} />
          <Tooltip
            formatter={(value) => `€${value}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="umsatz"
            name="Umsatz (€)"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Appointments By Status Pie Chart Component
export function AppointmentsByStatusChart({
  data,
}: {
  data: Record<string, number>;
}) {
  console.log("Appointments by Status Data:", data);

  const COLORS = {
    pending: "#f59e0b", // orange
    confirmed: "#3b82f6", // blue
    completed: "#10b981", // green
    cancelled: "#ef4444", // red
  };

  const STATUS_LABELS = {
    pending: "Ausstehend",
    confirmed: "Bestätigt",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
  };

  const chartData = Object.entries(data).map(([status, value]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    value,
    color: COLORS[status as keyof typeof COLORS],
  }));

  const totalAppointments = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  console.log("Status Chart Data:", chartData);

  if (!chartData || chartData.length === 0 || totalAppointments === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Termine nach Status
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          Keine Daten verfügbar
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">Termine nach Status</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Gesamt</span>
          <span className="text-lg font-bold text-gray-900">
            {totalAppointments}
          </span>
        </div>
      </div>
    </Card>
  );
}
