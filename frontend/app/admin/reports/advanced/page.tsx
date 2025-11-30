"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  FileText,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface ReportData {
  totalAppointments: number;
  totalRevenue: number;
  totalPatients: number;
  avgAppointmentsPerDay: number;
  appointmentsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
  };
  revenueByMonth: Array<{ month: string; amount: number }>;
  topDoctors: Array<{ name: string; appointments: number; revenue: number }>;
  topServices: Array<{ name: string; count: number; revenue: number }>;
}

export default function AdvancedReportsPage() {
  const [reportType, setReportType] = useState("appointments");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Zeitraum",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case "appointments":
          response = await api.admin.reports.appointments(dateFrom, dateTo);
          break;
        case "revenue":
          response = await api.admin.reports.revenue(dateFrom, dateTo);
          break;
        case "patients":
          response = await api.admin.reports.patients(dateFrom, dateTo);
          break;
        case "doctors":
          response = await api.admin.reports.doctors(dateFrom, dateTo);
          break;
        case "services":
          response = await api.admin.reports.services(dateFrom, dateTo);
          break;
        default:
          response = await api.admin.reports.appointments(dateFrom, dateTo);
      }

      setReportData(response.data || null);
      setLoading(false);

      toast({
        title: "Bericht erstellt",
        description: "Der Bericht wurde erfolgreich generiert",
      });
    } catch (error) {
      setLoading(false);
      toast({
        title: "Fehler",
        description: "Bericht konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const exportReport = async (format: "pdf" | "excel") => {
    try {
      const response = await api.admin.reports.export(reportType, format, {
        from: dateFrom,
        to: dateTo,
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report-${reportType}-${new Date().toISOString().split("T")[0]}.${
          format === "pdf" ? "pdf" : "xlsx"
        }`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: `Export als ${format.toUpperCase()}`,
        description: `Bericht wurde als ${format.toUpperCase()} heruntergeladen`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Export fehlgeschlagen",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Erweiterte Berichte
        </h1>
        <p className="text-gray-500 mt-1">
          Detaillierte Analysen und Statistiken
        </p>
      </div>

      {/* Report Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Bericht konfigurieren</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="reportType">Berichtstyp</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointments">Termine</SelectItem>
                <SelectItem value="revenue">Umsatz</SelectItem>
                <SelectItem value="patients">Patienten</SelectItem>
                <SelectItem value="doctors">Ärzte</SelectItem>
                <SelectItem value="services">Leistungen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateFrom">Von</Label>
            <Input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="dateTo">Bis</Label>
            <Input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateReport}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Lädt...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Erstellen
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {reportData && (
        <>
          {/* Export Options */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">Bericht exportieren:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("pdf")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport("excel")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Termine Gesamt</p>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {reportData.totalAppointments.toLocaleString("de-DE")}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Ø {reportData.avgAppointmentsPerDay} pro Tag
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Umsatz Gesamt</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {formatCurrency(reportData.totalRevenue)}
              </h3>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% vs. Vorperiode
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Patienten</p>
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {reportData.totalPatients.toLocaleString("de-DE")}
              </h3>
              <p className="text-sm text-gray-500 mt-2">Aktive Patienten</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Auslastung</p>
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">87%</h3>
              <p className="text-sm text-gray-500 mt-2">Durchschnittlich</p>
            </Card>
          </div>

          {/* Appointments by Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Termine nach Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Bestätigt</p>
                <p className="text-2xl font-bold text-green-700">
                  {reportData.appointmentsByStatus.confirmed}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(
                    (reportData.appointmentsByStatus.confirmed /
                      reportData.totalAppointments) *
                      100
                  )}
                  %
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ausstehend</p>
                <p className="text-2xl font-bold text-orange-700">
                  {reportData.appointmentsByStatus.pending}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(
                    (reportData.appointmentsByStatus.pending /
                      reportData.totalAppointments) *
                      100
                  )}
                  %
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Abgeschlossen</p>
                <p className="text-2xl font-bold text-blue-700">
                  {reportData.appointmentsByStatus.completed}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(
                    (reportData.appointmentsByStatus.completed /
                      reportData.totalAppointments) *
                      100
                  )}
                  %
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Storniert</p>
                <p className="text-2xl font-bold text-red-700">
                  {reportData.appointmentsByStatus.cancelled}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round(
                    (reportData.appointmentsByStatus.cancelled /
                      reportData.totalAppointments) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </Card>

          {/* Revenue by Month */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Umsatzentwicklung
            </h2>
            <div className="space-y-3">
              {reportData.revenueByMonth.map((item, index) => {
                const maxRevenue = Math.max(
                  ...reportData.revenueByMonth.map((r) => r.amount)
                );
                const percentage = (item.amount / maxRevenue) * 100;

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.month}</span>
                      <span className="text-gray-600">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Doctors */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Top 5 Ärzte</h2>
              <div className="space-y-3">
                {reportData.topDoctors.map((doctor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-gray-500">
                          {doctor.appointments} Termine
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(doctor.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Services */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Top 5 Leistungen</h2>
              <div className="space-y-3">
                {reportData.topServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.count} Buchungen
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {!reportData && !loading && (
        <Card className="p-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kein Bericht ausgewählt
            </h3>
            <p className="text-gray-500">
              Konfigurieren Sie einen Bericht und klicken Sie auf "Erstellen"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
