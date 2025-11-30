"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Search,
  Filter,
  Eye,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Settings,
  Clock,
  User,
  Calendar,
  Download,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const activityTypes = [
    { value: "", label: "Alle Aktivitäten" },
    { value: "create", label: "Erstellt" },
    { value: "update", label: "Aktualisiert" },
    { value: "delete", label: "Gelöscht" },
    { value: "login", label: "Anmeldung" },
    { value: "logout", label: "Abmeldung" },
    { value: "view", label: "Angesehen" },
  ];

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, selectedType, selectedUser]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.admin.activityLogs.getAll({
        user: selectedUser || undefined,
        action: selectedType || undefined,
        from: dateRange.start || undefined,
        to: dateRange.end || undefined,
      });
      // Handle both array and paginated response
      const logsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setLogs(logsData);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Aktivitätsprotokolle konnten nicht geladen werden",
        variant: "destructive",
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
      case "created":
        return <UserPlus className="h-4 w-4" />;
      case "update":
      case "updated":
        return <Edit className="h-4 w-4" />;
      case "delete":
      case "deleted":
        return <Trash2 className="h-4 w-4" />;
      case "login":
        return <User className="h-4 w-4" />;
      case "logout":
        return <UserMinus className="h-4 w-4" />;
      case "view":
        return <Eye className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
      case "created":
        return "bg-green-100 text-green-800";
      case "update":
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "delete":
      case "deleted":
        return "bg-red-100 text-red-800";
      case "login":
        return "bg-purple-100 text-purple-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      case "view":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const exportLogs = async () => {
    try {
      toast({
        title: "📥 Export gestartet",
        description: "Aktivitätsprotokolle werden exportiert...",
        variant: "default",
      });

      const response = await api.admin.activityLogs.export("csv");

      // Create blob from response
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Export erfolgreich",
        description: "Aktivitätsprotokolle wurden exportiert",
        variant: "success",
      });
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
            Aktivitätsprotokolle
          </h1>
          <p className="text-gray-600 mt-1">
            Verfolgen Sie alle Systemaktivitäten
          </p>
        </div>
        <Button
          onClick={exportLogs}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportieren
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Activity Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Date Start */}
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            placeholder="Startdatum"
          />

          {/* Date End */}
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            placeholder="Enddatum"
          />
        </div>
      </Card>

      {/* Activity Logs */}
      {loading ? (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Lädt Aktivitätsprotokolle...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Aktivitäten gefunden
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedType
              ? "Versuchen Sie andere Filter"
              : "Keine Aktivitäten aufgezeichnet"}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktivität
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschreibung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP-Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zeitstempel
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getActivityColor(log.type)}>
                        {getActivityIcon(log.type)}
                        <span className="ml-1">{log.type}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {log.user?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.user?.name || "System"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{log.description}</p>
                      {log.model && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.model} #{log.model_id}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(log.created_at).toLocaleString("de-DE")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
