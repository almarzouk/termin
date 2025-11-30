"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  User,
  Building,
  Stethoscope,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface Appointment {
  id: number;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_name: string;
  clinic_name: string;
  service_name?: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  notes?: string;
  created_at: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  });

  // Form state for creating appointment
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    clinic_id: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.admin.appointments.getAll({
        per_page: 100,
      });

      const appointmentsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setAppointments(appointmentsData);
      calculateStats(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Fehler",
        description: "Termine konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Appointment[]) => {
    setStats({
      total: data.length,
      pending: data.filter((a) => a.status === "pending").length,
      confirmed: data.filter((a) => a.status === "confirmed").length,
      completed: data.filter((a) => a.status === "completed").length,
      cancelled: data.filter((a) => a.status === "cancelled").length,
      noShow: data.filter((a) => a.status === "no-show").length,
    });
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((apt) => apt.appointment_date === dateFilter);
    }

    // Sort by date and time (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.appointment_date + " " + a.appointment_time);
      const dateB = new Date(b.appointment_date + " " + b.appointment_time);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredAppointments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "outline" | "default" | "secondary" | "destructive";
        icon: React.ElementType;
        label: string;
      }
    > = {
      pending: {
        variant: "outline",
        icon: AlertCircle,
        label: "Ausstehend",
      },
      confirmed: {
        variant: "default",
        icon: CheckCircle,
        label: "Bestätigt",
      },
      completed: {
        variant: "secondary",
        icon: CheckCircle,
        label: "Abgeschlossen",
      },
      cancelled: {
        variant: "destructive",
        icon: XCircle,
        label: "Storniert",
      },
      "no-show": {
        variant: "destructive",
        icon: AlertCircle,
        label: "Nicht erschienen",
      },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.admin.appointments.updateStatus(id, newStatus);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? { ...apt, status: newStatus as Appointment["status"] }
            : apt
        )
      );

      toast({
        title: "Status aktualisiert",
        description: "Der Terminstatus wurde erfolgreich aktualisiert",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie diesen Termin wirklich löschen?")) return;

    try {
      await api.admin.appointments.delete(id);

      setAppointments((prev) => prev.filter((apt) => apt.id !== id));

      toast({
        title: "Termin gelöscht",
        description: "Der Termin wurde erfolgreich gelöscht",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };
  };

  const handleExport = () => {
    // TODO: Implement export to CSV/Excel
    toast({
      title: "Export gestartet",
      description: "Termine werden exportiert...",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terminverwaltung</h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie alle Termine und Buchungen
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          <Button variant="outline" onClick={fetchAppointments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Termin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gesamt</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ausstehend</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bestätigt</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Abgeschlossen</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Storniert</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">No-Show</p>
              <p className="text-2xl font-bold">{stats.noShow}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Suche nach Patient, Arzt oder Klinik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
              <SelectItem value="no-show">Nicht erschienen</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Datum filtern"
          />

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setDateFilter("");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter zurücksetzen
          </Button>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Arzt</TableHead>
                <TableHead>Klinik</TableHead>
                <TableHead>Leistung</TableHead>
                <TableHead>Datum & Zeit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Lade Termine...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Keine Termine gefunden</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {appointment.patient_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.patient_phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        {appointment.doctor_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {appointment.clinic_name}
                      </div>
                    </TableCell>
                    <TableCell>{appointment.service_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {formatDate(appointment.appointment_date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.appointment_time} Uhr
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {appointment.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(appointment.id, "confirmed")
                            }
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Termindetails</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Patient</Label>
                  <p className="font-medium">
                    {selectedAppointment.patient_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.patient_email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.patient_phone}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Arzt</Label>
                  <p className="font-medium">
                    {selectedAppointment.doctor_name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Klinik</Label>
                  <p className="font-medium">
                    {selectedAppointment.clinic_name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Leistung</Label>
                  <p className="font-medium">
                    {selectedAppointment.service_name || "Nicht angegeben"}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Datum & Zeit</Label>
                  <p className="font-medium">
                    {formatDate(selectedAppointment.appointment_date)} um{" "}
                    {selectedAppointment.appointment_time} Uhr
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <Label className="text-gray-500">Notizen</Label>
                  <p className="mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedAppointment.status === "pending" && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, "confirmed");
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bestätigen
                  </Button>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, "completed");
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Als abgeschlossen markieren
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, "cancelled");
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Stornieren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuen Termin erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_id">Patient</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, patient_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Patient auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Max Mustermann</SelectItem>
                    <SelectItem value="2">Anna Weber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="doctor_id">Arzt</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, doctor_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Arzt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dr. Schmidt</SelectItem>
                    <SelectItem value="2">Dr. Müller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clinic_id">Klinik</Label>
                <Select
                  value={formData.clinic_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, clinic_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Klinik auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Zahnarztpraxis am Markt</SelectItem>
                    <SelectItem value="2">Allgemeinpraxis Berlin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service_id">Leistung</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Leistung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Kontrolluntersuchung</SelectItem>
                    <SelectItem value="2">Beratung</SelectItem>
                    <SelectItem value="3">Zahnreinigung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="appointment_date">Datum</Label>
                <Input
                  type="date"
                  id="appointment_date"
                  value={formData.appointment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="appointment_time">Uhrzeit</Label>
                <Input
                  type="time"
                  id="appointment_time"
                  value={formData.appointment_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointment_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notizen (Optional)</Label>
              <Input
                id="notes"
                placeholder="Zusätzliche Informationen..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement create appointment
                toast({
                  title: "Termin erstellt",
                  description: "Der Termin wurde erfolgreich erstellt",
                });
                setIsCreateDialogOpen(false);
              }}
            >
              Termin erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
