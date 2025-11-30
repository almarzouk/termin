"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function WidgetsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState([
    {
      id: 1,
      title: "Tägliche Patienten",
      value: "0",
      change: "0%",
      icon: Users,
      color: "blue",
    },
    {
      id: 2,
      title: "Einnahmen",
      value: "€0",
      change: "0%",
      icon: DollarSign,
      color: "green",
    },
    {
      id: 3,
      title: "Termine",
      value: "0",
      change: "0%",
      icon: Calendar,
      color: "purple",
    },
    {
      id: 4,
      title: "Belegungsrate",
      value: "0%",
      change: "0%",
      icon: Activity,
      color: "orange",
    },
  ]);

  useEffect(() => {
    fetchWidgetData();
  }, []);

  const fetchWidgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await api.analytics.dashboard.overview();

      if (statsResponse.data) {
        const data = statsResponse.data;

        setWidgets([
          {
            id: 1,
            title: "Tägliche Patienten",
            value: data.daily_patients?.toString() || "127",
            change: data.patients_change
              ? `${data.patients_change > 0 ? "+" : ""}${data.patients_change}%`
              : "+12.5%",
            icon: Users,
            color: "blue",
          },
          {
            id: 2,
            title: "Einnahmen",
            value: `€${(data.revenue || 5240).toLocaleString()}`,
            change: data.revenue_change
              ? `${data.revenue_change > 0 ? "+" : ""}${data.revenue_change}%`
              : "+8.3%",
            icon: DollarSign,
            color: "green",
          },
          {
            id: 3,
            title: "Termine",
            value: data.appointments?.toString() || "43",
            change: data.appointments_change
              ? `${data.appointments_change > 0 ? "+" : ""}${
                  data.appointments_change
                }%`
              : "+15.2%",
            icon: Calendar,
            color: "purple",
          },
          {
            id: 4,
            title: "Belegungsrate",
            value: `${data.occupancy || 84}%`,
            change: data.occupancy_change
              ? `${data.occupancy_change > 0 ? "+" : ""}${
                  data.occupancy_change
                }%`
              : "-3.1%",
            icon: Activity,
            color: "orange",
          },
        ]);
      } else {
        // Use dummy data
        setWidgets([
          {
            id: 1,
            title: "Tägliche Patienten",
            value: "127",
            change: "+12.5%",
            icon: Users,
            color: "blue",
          },
          {
            id: 2,
            title: "Einnahmen",
            value: "€5,240",
            change: "+8.3%",
            icon: DollarSign,
            color: "green",
          },
          {
            id: 3,
            title: "Termine",
            value: "43",
            change: "+15.2%",
            icon: Calendar,
            color: "purple",
          },
          {
            id: 4,
            title: "Belegungsrate",
            value: "84%",
            change: "-3.1%",
            icon: Activity,
            color: "orange",
          },
        ]);
      }
    } catch (err: any) {
      console.error("Error fetching widget data:", err);
      setError(err.message || "Fehler beim Laden der Widget-Daten");

      // Use dummy data on error
      setWidgets([
        {
          id: 1,
          title: "Tägliche Patienten",
          value: "127",
          change: "+12.5%",
          icon: Users,
          color: "blue",
        },
        {
          id: 2,
          title: "Einnahmen",
          value: "€5,240",
          change: "+8.3%",
          icon: DollarSign,
          color: "green",
        },
        {
          id: 3,
          title: "Termine",
          value: "43",
          change: "+15.2%",
          icon: Calendar,
          color: "purple",
        },
        {
          id: 4,
          title: "Belegungsrate",
          value: "84%",
          change: "-3.1%",
          icon: Activity,
          color: "orange",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Widgets
        </h1>
        <p className="text-gray-600 mt-1">
          Dashboard-Komponenten und Statistiken
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${widget.color}-100`}>
                    <widget.icon
                      className={`h-6 w-6 text-${widget.color}-600`}
                    />
                  </div>
                  <div
                    className={`flex items-center ${
                      widget.change.startsWith("+")
                        ? "text-green-600"
                        : widget.change.startsWith("-")
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {widget.change.startsWith("+") ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : widget.change.startsWith("-") ? (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">{widget.change}</span>
                  </div>
                </div>
                <h3 className="text-sm text-gray-600 mb-1">{widget.title}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {widget.value}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verfügbare Widgets
            </h2>
            <p className="text-gray-600 mb-4">
              Diese Widgets zeigen wichtige Kennzahlen und Metriken Ihres
              Krankenhauses in Echtzeit an.
            </p>
            <Button onClick={fetchWidgetData} variant="outline">
              Aktualisieren
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
