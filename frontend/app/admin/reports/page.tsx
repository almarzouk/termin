"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    {
      id: "overview",
      title: "Übersicht",
      description: "Allgemeine Systemstatistiken",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      id: "appointments",
      title: "Termine",
      description: "Terminstatistiken und -trends",
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: "revenue",
      title: "Umsatz",
      description: "Finanzielle Berichte",
      icon: DollarSign,
      color: "bg-emerald-500",
    },
    {
      id: "patients",
      title: "Patienten",
      description: "Patientenanalyse",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      id: "staff",
      title: "Mitarbeiter",
      description: "Personalleistung",
      icon: Activity,
      color: "bg-orange-500",
    },
    {
      id: "services",
      title: "Dienste",
      description: "Dienstleistungsanalyse",
      icon: PieChart,
      color: "bg-cyan-500",
    },
  ];

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchReportData();
    }
  }, [selectedReport, dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/reports/${selectedReport}`, {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });
      setReportData(response.data.data);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Bericht konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      toast({
        title: "📥 Export gestartet",
        description: `Bericht wird als ${format.toUpperCase()} exportiert...`,
        variant: "success",
      });
      // Implement export logic
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Export fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Berichte & Analysen
          </h1>
          <p className="text-gray-600 mt-1">
            Detaillierte Systemberichte generieren
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport("pdf")}
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={() => handleExport("excel")}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedReport === report.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`${report.color} h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-2`}
            >
              <report.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {report.title}
            </h3>
            <p className="text-xs text-gray-500">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="start_date">Startdatum</Label>
            <Input
              id="start_date"
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end_date">Enddatum</Label>
            <Input
              id="end_date"
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
          <Button
            onClick={fetchReportData}
            disabled={!dateRange.start || !dateRange.end || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            {loading ? "Lädt..." : "Bericht generieren"}
          </Button>
        </div>
      </Card>

      {/* Report Content */}
      {reportData ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {reportTypes.find((r) => r.id === selectedReport)?.title}
              </h3>
              <p className="text-gray-600">
                Zeitraum:{" "}
                {new Date(dateRange.start).toLocaleDateString("de-DE")} -{" "}
                {new Date(dateRange.end).toLocaleDateString("de-DE")}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(reportData.stats || {}).map(
                ([key, value]: any) => (
                  <Card key={key} className="p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {value}
                    </h3>
                  </Card>
                )
              )}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Diagramme und detaillierte Analysen werden hier angezeigt
              </p>
            </div>

            {/* Data Table */}
            {reportData.data && reportData.data.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {Object.keys(reportData.data[0]).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.data.map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((cell: any, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 text-sm text-gray-900"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wählen Sie einen Berichtstyp
          </h3>
          <p className="text-gray-600">
            Wählen Sie einen Berichtstyp und Datumsbereich, um zu beginnen
          </p>
        </Card>
      )}
    </div>
  );
}
