"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "10am", punctual: 20, late: 10 },
  { time: "11am", punctual: 40, late: 25 },
  { time: "12pm", punctual: 35, late: 30 },
  { time: "01pm", punctual: 50, late: 20 },
  { time: "02pm", punctual: 45, late: 35 },
  { time: "03pm", punctual: 60, late: 30 },
  { time: "04pm", punctual: 70, late: 40 },
  { time: "05pm", punctual: 65, late: 45 },
  { time: "06pm", punctual: 55, late: 35 },
  { time: "07am", punctual: 40, late: 20 },
];

export default function PatientChart() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Patientenübersicht
          </h3>
          <p className="text-sm text-gray-500">
            Terminstatistiken im Zeitverlauf
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Pünktlich</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Zu spät</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "14px" }}
            formatter={(value) =>
              value === "punctual" ? "Pünktlich" : "Zu spät"
            }
          />
          <Line
            type="monotone"
            dataKey="punctual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="late"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
