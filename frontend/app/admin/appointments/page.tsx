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
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Building,
  Stethoscope,
  Settings,
  BarChart,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BulkCancellationDialog } from "@/components/admin/bulk-cancellation-dialog";
import { StaffUnavailabilityAlerts } from "@/components/admin/staff-unavailability-alerts";
import { DoctorAvailabilityCalendar } from "@/components/admin/doctor-availability-calendar";

interface Appointment {
  id: number;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_name: string;
  clinic_name: string;
  clinic_id?: number;
  service_name?: string;
  appointment_date: string;
  appointment_time: string;
  start_time?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  notes?: string;
  created_at: string;
}

interface Doctor {
  id: number;
  user_id: number;
  clinic_id: number;
  user: {
    name: string;
    email: string;
  };
  clinic: {
    name: string;
  };
  specialty?: string;
  specialization?: string;
  max_daily_appointments: number;
  appointment_duration_minutes: number;
  allow_online_booking: boolean;
}

interface DoctorStats {
  date: string;
  max_daily_appointments: number;
  booked_appointments: number;
  available_slots: number;
  utilization_percentage: number;
  appointments: Array<{
    id: number;
    patient_name: string;
    appointment_time: string;
    service: string | null;
    status: string;
  }>;
}

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isDoctorSettingsOpen, setIsDoctorSettingsOpen] = useState(false);
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null);
  const [workingHours, setWorkingHours] = useState<any[]>([]);

  // Daily View State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailySchedules, setDailySchedules] = useState<any[]>([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [selectedDoctorTab, setSelectedDoctorTab] = useState<string>("all");

  // Bulk Cancellation Dialog State
  const [isBulkCancellationOpen, setIsBulkCancellationOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  });

  // Doctor Settings Form
  const [doctorSettings, setDoctorSettings] = useState({
    max_daily_appointments: 20,
    appointment_duration_minutes: 30,
    allow_online_booking: true,
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDailySchedules(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors]);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, searchTerm, statusFilter, dateFilter, doctorFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.admin.appointments.getAll({
        per_page: 100,
      });

      console.log("📅 Appointments API Response - Full:", response);
      console.log("📅 Appointments API Response - Data:", response.data);

      // Laravel pagination returns data directly in response.data.data
      // The axios response is: { data: { current_page, data: [...], total, ... } }
      const appointmentsData = response.data?.data || response.data || [];

      console.log(
        "📋 Appointments loaded:",
        appointmentsData.length,
        appointmentsData
      );

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

  const fetchDoctors = async () => {
    try {
      const response = await api.admin.staff.getAll({
        page: 1,
        per_page: 100,
      });

      console.log("👨‍⚕️ Staff API Response:", response.data);

      // Backend returns: { data: { data: [...], current_page, total } }
      // But the response.data already contains the pagination object
      const staffData = response.data?.data || [];

      console.log("👨‍⚕️ Staff data extracted:", staffData.length, staffData);

      // Filter only clinic staff with user and clinic data
      const doctorsData = staffData
        .filter((staff: any) => staff.user && staff.clinic)
        .map((staff: any) => ({
          ...staff,
          // Ensure clinic_id is present
          clinic_id: staff.clinic_id || staff.clinic?.id,
        }));

      console.log("👨‍⚕️ Doctors loaded:", doctorsData.length, doctorsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Error fetching doctors:", err);
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

    // Doctor filter
    if (doctorFilter && doctorFilter !== "all") {
      filtered = filtered.filter((apt) => apt.doctor_name === doctorFilter);
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
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
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

  const handleConfirmAppointment = async (id: number) => {
    try {
      await api.admin.appointments.confirm(id);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: "confirmed" } : apt
        )
      );

      toast({
        title: "Termin bestätigt",
        description: "Der Termin wurde erfolgreich bestätigt",
      });

      // Refresh the list to ensure consistency
      fetchAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht bestätigt werden",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (id: number, reason?: string) => {
    try {
      await api.admin.appointments.cancel(id, reason);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: "cancelled" } : apt
        )
      );

      toast({
        title: "Termin abgesagt",
        description: "Der Termin wurde erfolgreich abgesagt",
      });

      // Refresh the list to ensure consistency
      fetchAppointments();
    } catch (error) {
      console.error("Error canceling appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht abgesagt werden",
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

  const handleViewDoctorStats = async (doctor: Doctor) => {
    try {
      setSelectedDoctor(doctor);
      const response = await api.doctors.getDailyStats(
        doctor.id,
        new Date().toISOString().split("T")[0]
      );
      setDoctorStats(response.data.data);
      setIsStatsDialogOpen(true);
    } catch (err) {
      console.error("Error fetching stats:", err);
      toast({
        title: "Fehler",
        description: "Statistiken konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleEditDoctorSettings = async (doctor: Doctor) => {
    try {
      if (!doctor?.id) {
        toast({
          title: "Fehler",
          description: "Ungültige Arzt-Daten",
          variant: "destructive",
        });
        return;
      }

      setSelectedDoctor(doctor);
      const response = await api.doctors.getAppointmentSettings(doctor.id);

      const settingsData = response.data?.data || response.data || {};

      setDoctorSettings({
        max_daily_appointments: settingsData.max_daily_appointments || 20,
        appointment_duration_minutes:
          settingsData.appointment_duration_minutes || 30,
        allow_online_booking: settingsData.allow_online_booking !== false,
      });
      setIsDoctorSettingsOpen(true);
    } catch (err) {
      console.error("Error fetching settings:", err);

      // If settings don't exist yet, use defaults
      setDoctorSettings({
        max_daily_appointments: doctor.max_daily_appointments || 20,
        appointment_duration_minutes: doctor.appointment_duration_minutes || 30,
        allow_online_booking: doctor.allow_online_booking !== false,
      });
      setIsDoctorSettingsOpen(true);
    }
  };

  const handleManageWorkingHours = async (doctor: Doctor) => {
    try {
      setSelectedDoctor(doctor);

      // Ensure clinic_id exists
      if (!doctor?.clinic_id) {
        toast({
          title: "Fehler",
          description: "Klinik-ID nicht gefunden",
          variant: "destructive",
        });
        return;
      }

      const response = await api.workingHours.getByStaff(
        doctor.id,
        doctor.clinic_id
      );

      // Response interceptor returns response.data, so we access .data directly
      // API structure: { success: true, data: [...] }
      const hours = response.data || [];

      // Initialize working hours for all days
      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const initializedHours = daysOfWeek.map((day) => {
        const existing = Array.isArray(hours)
          ? hours.find((h: any) => h.day_of_week === day)
          : null;

        return (
          existing || {
            day_of_week: day,
            start_time: "09:00",
            end_time: "17:00",
            is_available: false,
          }
        );
      });

      setWorkingHours(initializedHours);
      setIsWorkingHoursOpen(true);
    } catch (err) {
      console.error("Error fetching working hours:", err);
      toast({
        title: "Fehler",
        description: "Arbeitszeiten konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleSaveWorkingHours = async () => {
    if (!selectedDoctor) return;

    try {
      await api.workingHours.bulkCreate(
        selectedDoctor.id,
        selectedDoctor.clinic_id,
        {
          working_hours: workingHours.map((wh) => ({
            day_of_week: wh.day_of_week,
            start_time: wh.start_time,
            end_time: wh.end_time,
            is_available: wh.is_available,
          })),
        }
      );

      toast({
        title: "Erfolg",
        description: "Arbeitszeiten wurden erfolgreich gespeichert",
      });
      setIsWorkingHoursOpen(false);
    } catch (err) {
      console.error("Error saving working hours:", err);
      toast({
        title: "Fehler",
        description: "Arbeitszeiten konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const updateWorkingHour = (index: number, field: string, value: any) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  // Daily View Functions
  const fetchDailySchedules = async (date: Date) => {
    try {
      setLoadingDaily(true);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // Fetch appointments for the selected date
      const appointmentsResponse = await api.admin.appointments.getAll({
        date: dateStr,
        per_page: 1000,
      });

      const appointmentsData = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data
        : appointmentsResponse.data?.data || [];

      console.log("📅 Appointments for date:", dateStr, appointmentsData);

      // Build schedules for each doctor
      const schedulesByDoctor: any[] = [];

      for (const doctor of doctors) {
        try {
          // Fetch working hours for this doctor
          const workingHoursResponse = await api.admin.staff.getWorkingHours(
            doctor.id
          );
          const allWorkingHours = Array.isArray(workingHoursResponse.data)
            ? workingHoursResponse.data
            : workingHoursResponse.data?.data || [];

          // Get working hours for this specific day
          const todayWorkingHours = allWorkingHours.find(
            (wh: any) => wh.day_of_week === dayOfWeek && wh.is_available
          );

          console.log(
            `👨‍⚕️ ${doctor.user.name} working hours for day ${dayOfWeek}:`,
            todayWorkingHours
          );

          if (!todayWorkingHours) {
            // Doctor doesn't work on this day
            schedulesByDoctor.push({
              id: doctor.id,
              doctor: doctor.user.name,
              specialty:
                doctor.specialty || doctor.specialization || "Allgemein",
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.user.name}`,
              date: formatGermanDate(date),
              timeSlots: [],
            });
            continue;
          }

          // Generate time slots based on working hours
          const startTime = todayWorkingHours.start_time; // e.g., "09:00:00"
          const endTime = todayWorkingHours.end_time; // e.g., "17:00:00"
          const duration = doctor.appointment_duration_minutes || 30;

          // Parse start and end times
          const [startHour, startMinute] = startTime.split(":").map(Number);
          const [endHour, endMinute] = endTime.split(":").map(Number);

          // Generate all possible time slots
          const allSlots: any[] = [];
          let currentHour = startHour;
          let currentMinute = startMinute;

          while (
            currentHour < endHour ||
            (currentHour === endHour && currentMinute < endMinute)
          ) {
            const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
              currentMinute
            ).padStart(2, "0")}`;

            // Check if this time slot has an appointment
            const appointment = appointmentsData.find(
              (apt: any) =>
                apt.staff_id === doctor.id && apt.appointment_time === timeStr
            );

            if (appointment) {
              allSlots.push({
                time: timeStr,
                patient: appointment.patient_name,
                status: appointment.status,
                appointment_id: appointment.id,
                service: appointment.service_name || null,
              });
            } else {
              allSlots.push({
                time: timeStr,
                patient: null,
                status: "available",
                appointment_id: null,
              });
            }

            // Add duration to get next slot
            currentMinute += duration;
            if (currentMinute >= 60) {
              currentHour += Math.floor(currentMinute / 60);
              currentMinute = currentMinute % 60;
            }
          }

          console.log(
            `⏰ Generated ${allSlots.length} slots for ${doctor.user.name}`
          );

          schedulesByDoctor.push({
            id: doctor.id,
            doctor: doctor.user.name,
            specialty: doctor.specialty || doctor.specialization || "Allgemein",
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.user.name}`,
            date: formatGermanDate(date),
            timeSlots: allSlots,
          });
        } catch (error) {
          console.error(
            `Error fetching schedule for doctor ${doctor.user.name}:`,
            error
          );
          // Skip this doctor if there's an error
        }
      }

      console.log("📊 Final schedules:", schedulesByDoctor);
      setDailySchedules(schedulesByDoctor);
    } catch (error) {
      console.error("Error fetching daily schedules:", error);
      toast({
        title: "Fehler",
        description: "Tagesplan konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoadingDaily(false);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    fetchDailySchedules(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    fetchDailySchedules(newDate);
  };

  const formatGermanDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleSaveDoctorSettings = async () => {
    if (!selectedDoctor) return;

    try {
      await api.doctors.updateAppointmentSettings(
        selectedDoctor.id,
        doctorSettings
      );
      toast({
        title: "Einstellungen gespeichert",
        description: "Termineinstellungen wurden erfolgreich aktualisiert",
      });
      setIsDoctorSettingsOpen(false);
      fetchDoctors();
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Erweiterte Terminverwaltung
          </h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie alle Termine, Ärzte und Einstellungen
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAppointments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Aktualisieren
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsBulkCancellationOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Massen-Terminabsage
          </Button>
        </div>
      </div>

      {/* Staff Unavailability Alerts */}
      <StaffUnavailabilityAlerts maxItems={3} onUpdate={fetchAppointments} />

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-2" />
            Termine
          </TabsTrigger>
          <TabsTrigger value="daily">
            <ClockIcon className="h-4 w-4 mr-2" />
            Tagesansicht
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Verfügbarkeit
          </TabsTrigger>
          <TabsTrigger value="doctors">
            <Stethoscope className="h-4 w-4 mr-2" />
            Ärzte & Einstellungen
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="h-4 w-4 mr-2" />
            Statistiken
          </TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Suche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
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

              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Arzt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Ärzte</SelectItem>
                  {doctors
                    .filter((doctor) => doctor.user && doctor.user.name)
                    .map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.user.name}>
                        {doctor.user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Datum"
              />

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDoctorFilter("all");
                  setDateFilter("");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Zurücksetzen
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
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
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
                                  handleConfirmAppointment(appointment.id)
                                }
                                title="Bestätigen"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {(appointment.status === "pending" ||
                              appointment.status === "confirmed") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCancelAppointment(appointment.id)
                                }
                                title="Stornieren"
                              >
                                <XCircle className="h-4 w-4 text-orange-600" />
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
        </TabsContent>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Ärzteübersicht & Einstellungen
              </h2>
              <div className="space-y-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Keine Ärzte gefunden</p>
                  </div>
                ) : (
                  doctors
                    .filter((doctor) => doctor.user && doctor.clinic)
                    .map((doctor) => (
                      <Card key={doctor.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {doctor.user?.name || "N/A"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {doctor.specialty ||
                                  doctor.specialization ||
                                  "Allgemeinmedizin"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {doctor.clinic?.name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {doctor.max_daily_appointments}
                              </p>
                              <p className="text-xs text-gray-500">
                                Max. Termine/Tag
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {doctor.appointment_duration_minutes}
                              </p>
                              <p className="text-xs text-gray-500">
                                Min./Termin
                              </p>
                            </div>
                            <div className="text-center">
                              <Badge
                                variant={
                                  doctor.allow_online_booking
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {doctor.allow_online_booking
                                  ? "Online"
                                  : "Offline"}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Buchung
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDoctorStats(doctor)}
                              >
                                <BarChart className="h-4 w-4 mr-2" />
                                Statistiken
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleManageWorkingHours(doctor)}
                              >
                                <ClockIcon className="h-4 w-4 mr-2" />
                                Arbeitszeiten
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDoctorSettings(doctor)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Einstellungen
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Daily View Tab */}
        <TabsContent value="daily" className="space-y-6">
          {/* Date Navigation */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {formatGermanDate(selectedDate)}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>

          {/* Daily Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Gesamt Termine</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailySchedules.reduce(
                  (sum, schedule) => sum + schedule.timeSlots.length,
                  0
                )}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Bestätigt</p>
              <p className="text-2xl font-bold text-green-600">
                {dailySchedules.reduce(
                  (sum, schedule) =>
                    sum +
                    schedule.timeSlots.filter(
                      (s: any) => s.status === "confirmed"
                    ).length,
                  0
                )}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-2xl font-bold text-orange-600">
                {dailySchedules.reduce(
                  (sum, schedule) =>
                    sum +
                    schedule.timeSlots.filter(
                      (s: any) => s.status === "pending"
                    ).length,
                  0
                )}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Verfügbar</p>
              <p className="text-2xl font-bold text-gray-600">
                {dailySchedules.reduce(
                  (sum, schedule) =>
                    sum +
                    schedule.timeSlots.filter(
                      (s: any) => s.status === "available"
                    ).length,
                  0
                )}
              </p>
            </Card>
          </div>

          {/* Daily Schedules */}
          {loadingDaily ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : dailySchedules.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Keine Termine
              </h3>
              <p className="text-gray-600">
                Für diesen Tag sind keine Termine verfügbar.
              </p>
            </Card>
          ) : (
            <>
              {/* Doctor Tabs */}
              <Card className="p-4">
                <Tabs
                  value={selectedDoctorTab}
                  onValueChange={setSelectedDoctorTab}
                >
                  <TabsList
                    className="w-full grid"
                    style={{
                      gridTemplateColumns: `repeat(${
                        dailySchedules.length + 1
                      }, minmax(0, 1fr))`,
                    }}
                  >
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2"
                    >
                      <Stethoscope className="h-4 w-4" />
                      Alle Ärzte
                    </TabsTrigger>
                    {dailySchedules.map((schedule) => (
                      <TabsTrigger
                        key={schedule.id}
                        value={schedule.id.toString()}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={schedule.image} />
                          <AvatarFallback>{schedule.doctor[0]}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{schedule.doctor}</span>
                        <Badge variant="outline" className="ml-auto">
                          {
                            schedule.timeSlots.filter(
                              (s: any) => s.status !== "available"
                            ).length
                          }
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* All Doctors Tab Content */}
                  <TabsContent value="all" className="space-y-6 mt-6">
                    {dailySchedules.map((schedule) => (
                      <Card key={schedule.id} className="p-6">
                        <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={schedule.image} />
                            <AvatarFallback>
                              {schedule.doctor[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {schedule.doctor}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {schedule.specialty}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Gebucht</p>
                              <p className="text-lg font-bold text-blue-600">
                                {
                                  schedule.timeSlots.filter(
                                    (s: any) => s.status !== "available"
                                  ).length
                                }{" "}
                                / {schedule.timeSlots.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {schedule.timeSlots.map(
                            (slot: any, index: number) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  slot.status === "confirmed"
                                    ? "border-green-200 bg-green-50"
                                    : slot.status === "pending"
                                    ? "border-orange-200 bg-orange-50"
                                    : "border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <ClockIcon className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-900">
                                      {slot.time}
                                    </span>
                                  </div>
                                  {slot.status === "confirmed" && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      Bestätigt
                                    </Badge>
                                  )}
                                  {slot.status === "pending" && (
                                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                                      Ausstehend
                                    </Badge>
                                  )}
                                  {slot.status === "available" && (
                                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                                      Frei
                                    </Badge>
                                  )}
                                </div>
                                {slot.patient ? (
                                  <p className="text-sm text-gray-700 font-medium truncate">
                                    {slot.patient}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Keine Buchung
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Individual Doctor Tab Contents */}
                  {dailySchedules.map((schedule) => (
                    <TabsContent
                      key={schedule.id}
                      value={schedule.id.toString()}
                      className="mt-6"
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={schedule.image} />
                              <AvatarFallback className="text-xl">
                                {schedule.doctor[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {schedule.doctor}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {schedule.specialty}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gesamt</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {schedule.timeSlots.length}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gebucht</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {
                                  schedule.timeSlots.filter(
                                    (s: any) => s.status !== "available"
                                  ).length
                                }
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Verfügbar</p>
                              <p className="text-2xl font-bold text-green-600">
                                {
                                  schedule.timeSlots.filter(
                                    (s: any) => s.status === "available"
                                  ).length
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {schedule.timeSlots.map(
                            (slot: any, index: number) => (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  slot.status === "confirmed"
                                    ? "border-green-200 bg-green-50"
                                    : slot.status === "pending"
                                    ? "border-orange-200 bg-orange-50"
                                    : "border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <ClockIcon className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-900">
                                      {slot.time}
                                    </span>
                                  </div>
                                  {slot.status === "confirmed" && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      Bestätigt
                                    </Badge>
                                  )}
                                  {slot.status === "pending" && (
                                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                                      Ausstehend
                                    </Badge>
                                  )}
                                  {slot.status === "available" && (
                                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                                      Frei
                                    </Badge>
                                  )}
                                </div>
                                {slot.patient ? (
                                  <p className="text-sm text-gray-700 font-medium truncate">
                                    {slot.patient}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Keine Buchung
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Calendar Tab - Doctor Availability */}
        <TabsContent value="calendar" className="space-y-6">
          <DoctorAvailabilityCalendar
            doctors={doctors}
            clinicId={doctors[0]?.clinic_id}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Terminstatistiken</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <p className="text-sm text-gray-500">Gesamte Termine</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-400 mt-1">Alle Zeiträume</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <p className="text-sm text-gray-500">Abschlussrate</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.completed} von {stats.total}
                </p>
              </Card>

              <Card className="p-4 border-l-4 border-l-orange-500">
                <p className="text-sm text-gray-500">Stornierungsrate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.total > 0
                    ? Math.round((stats.cancelled / stats.total) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.cancelled} von {stats.total}
                </p>
              </Card>

              <Card className="p-4 border-l-4 border-l-red-500">
                <p className="text-sm text-gray-500">No-Show Rate</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.total > 0
                    ? Math.round((stats.noShow / stats.total) * 100)
                    : 0}
                  %
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.noShow} von {stats.total}
                </p>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Doctor Settings Dialog */}
      <Dialog
        open={isDoctorSettingsOpen}
        onOpenChange={setIsDoctorSettingsOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Termineinstellungen - {selectedDoctor?.user?.name || "Arzt"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="max_daily">Maximale Termine pro Tag</Label>
              <Input
                id="max_daily"
                type="number"
                min="1"
                max="100"
                value={doctorSettings.max_daily_appointments}
                onChange={(e) =>
                  setDoctorSettings({
                    ...doctorSettings,
                    max_daily_appointments: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="duration">Termindauer (Minuten)</Label>
              <Select
                value={doctorSettings.appointment_duration_minutes.toString()}
                onValueChange={(value) =>
                  setDoctorSettings({
                    ...doctorSettings,
                    appointment_duration_minutes: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                  <SelectItem value="45">45 Minuten</SelectItem>
                  <SelectItem value="60">60 Minuten</SelectItem>
                  <SelectItem value="90">90 Minuten</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="online_booking"
                checked={doctorSettings.allow_online_booking}
                onChange={(e) =>
                  setDoctorSettings({
                    ...doctorSettings,
                    allow_online_booking: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="online_booking">Online-Buchung erlauben</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDoctorSettingsOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSaveDoctorSettings}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Doctor Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Tagesstatistiken - {selectedDoctor?.user?.name || "Arzt"}
            </DialogTitle>
          </DialogHeader>
          {doctorStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Gebucht</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {doctorStats.booked_appointments}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Verfügbar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {doctorStats.available_slots}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Auslastung</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {doctorStats.utilization_percentage}%
                  </p>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Heutige Termine</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {doctorStats.appointments.map((apt) => (
                    <Card key={apt.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{apt.patient_name}</p>
                          <p className="text-sm text-gray-500">
                            {apt.service || "Konsultation"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {apt.appointment_time}
                          </p>
                          {getStatusBadge(apt.status)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Termindetails</DialogTitle>
            <DialogDescription>
              Detaillierte Informationen zum Termin
            </DialogDescription>
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
                      handleConfirmAppointment(selectedAppointment.id);
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
                    handleCancelAppointment(selectedAppointment.id);
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

      {/* Working Hours Dialog */}
      <Dialog open={isWorkingHoursOpen} onOpenChange={setIsWorkingHoursOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Arbeitszeiten verwalten - {selectedDoctor?.user?.name}
            </DialogTitle>
            <DialogDescription>
              Legen Sie die Arbeitszeiten für jeden Wochentag fest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {workingHours.map((wh, index) => {
              const dayNames: Record<string, string> = {
                monday: "Montag",
                tuesday: "Dienstag",
                wednesday: "Mittwoch",
                thursday: "Donnerstag",
                friday: "Freitag",
                saturday: "Samstag",
                sunday: "Sonntag",
              };

              return (
                <Card key={wh.day_of_week} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={wh.is_available}
                        onChange={(e) =>
                          updateWorkingHour(
                            index,
                            "is_available",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                      <Label className="font-medium">
                        {dayNames[wh.day_of_week]}
                      </Label>
                    </div>

                    {wh.is_available && (
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Von</Label>
                          <Input
                            type="time"
                            value={wh.start_time}
                            onChange={(e) =>
                              updateWorkingHour(
                                index,
                                "start_time",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-gray-500">Bis</Label>
                          <Input
                            type="time"
                            value={wh.end_time}
                            onChange={(e) =>
                              updateWorkingHour(
                                index,
                                "end_time",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {!wh.is_available && (
                      <p className="text-sm text-gray-400 flex-1">
                        Nicht verfügbar
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWorkingHoursOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSaveWorkingHours}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Cancellation Dialog */}
      <BulkCancellationDialog
        open={isBulkCancellationOpen}
        onOpenChange={setIsBulkCancellationOpen}
        clinicId={doctors.length > 0 ? doctors[0].clinic_id : 0}
        doctors={doctors}
        onSuccess={() => {
          fetchAppointments();
          fetchDoctors();
        }}
      />
    </div>
  );
}
