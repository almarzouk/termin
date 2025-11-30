"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Filter,
  Video,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function AppointmentPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [currentPage]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.appointments.getAll({
        page: currentPage,
      });

      console.log("Appointments API Response:", response);

      // التعامل مع الـ response structure المختلف
      let appointmentsData = [];
      let lastPage = 1;

      if (response.data) {
        // إذا كان response.data يحتوي على data (nested structure)
        if (response.data.data && Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
          lastPage = response.data.last_page || 1;
        }
        // إذا كان response.data هو array مباشرة
        else if (Array.isArray(response.data)) {
          appointmentsData = response.data;
          lastPage = response.last_page || 1;
        }
      }
      // إذا كان response نفسه array
      else if (Array.isArray(response)) {
        appointmentsData = response;
      }

      if (appointmentsData.length > 0) {
        setAppointments(appointmentsData);
        setTotalPages(lastPage);
      } else {
        console.log("No appointments data, using dummy data");
        setAppointments(getDummyAppointments());
      }
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Fehler beim Laden der Termine");
      setAppointments(getDummyAppointments());
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    const appointmentToCancel = appointments.find((a) => a.id === id);

    try {
      await api.appointments.cancel(id);

      toast({
        title: "✅ Termin abgesagt",
        description: `Der Termin ${
          appointmentToCancel?.patient
            ? "mit " + appointmentToCancel.patient
            : ""
        } wurde erfolgreich abgesagt`,
        variant: "success",
      });

      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description: err.message || "Der Termin konnte nicht abgesagt werden",
        variant: "destructive",
      });
    }
  };

  const handleConfirm = async (id: number) => {
    const appointmentToConfirm = appointments.find((a) => a.id === id);

    try {
      await api.appointments.confirm(id);

      toast({
        title: "✅ Termin bestätigt",
        description: `Der Termin ${
          appointmentToConfirm?.patient
            ? "mit " + appointmentToConfirm.patient
            : ""
        } wurde erfolgreich bestätigt`,
        variant: "success",
      });

      fetchAppointments();
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description: err.message || "Der Termin konnte nicht bestätigt werden",
        variant: "destructive",
      });
    }
  };

  const getDummyAppointments = () => [
    {
      id: 1,
      patient: "Emma Becker",
      patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      doctor: "Dr. Anna Schmidt",
      specialty: "Kardiologie",
      date: "26.11.2025",
      time: "09:00",
      type: "Vor Ort",
      status: "Bestätigt",
      reason: "Routineuntersuchung",
    },
    {
      id: 2,
      patient: "Felix Schneider",
      patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      doctor: "Dr. Michael Müller",
      specialty: "Neurologie",
      date: "26.11.2025",
      time: "10:00",
      type: "Online",
      status: "Ausstehend",
      reason: "Nachsorge",
    },
    {
      id: 3,
      patient: "Sophie Meyer",
      patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      doctor: "Dr. Sarah Weber",
      specialty: "Pädiatrie",
      date: "27.11.2025",
      time: "14:00",
      type: "Vor Ort",
      status: "Bestätigt",
      reason: "Impfung",
    },
    {
      id: 4,
      patient: "Lukas Richter",
      patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lukas",
      doctor: "Dr. Thomas Wagner",
      specialty: "Orthopädie",
      date: "27.11.2025",
      time: "15:00",
      type: "Vor Ort",
      status: "Bestätigt",
      reason: "Gelenkschmerzen",
    },
    {
      id: 5,
      patient: "Hannah Koch",
      patientImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah",
      doctor: "Dr. Lisa Hoffmann",
      specialty: "Dermatologie",
      date: "28.11.2025",
      time: "11:00",
      type: "Online",
      status: "Abgesagt",
      reason: "Hautuntersuchung",
    },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bestätigt":
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "Ausstehend":
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "Abgesagt":
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(
      (a) => a.status === "Bestätigt" || a.status === "confirmed"
    ).length,
    pending: appointments.filter(
      (a) => a.status === "Ausstehend" || a.status === "pending"
    ).length,
    cancelled: appointments.filter(
      (a) => a.status === "Abgesagt" || a.status === "cancelled"
    ).length,
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Termine
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Patiententermine
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push("/patient/appointments/new")}
        >
          <Plus className="h-5 w-5 mr-2" />
          Neuer Termin
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

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Termin suchen..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Bestätigt</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Abgesagt</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.cancelled}
              </p>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={appointment.patientImage} />
                      <AvatarFallback>{appointment.patient[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.reason}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="lg:text-center">
                    <p className="font-medium text-gray-900">
                      {appointment.doctor}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.specialty}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {appointment.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">
                        {appointment.time}
                      </span>
                    </div>
                  </div>

                  {/* Type & Status */}
                  <div className="flex items-center space-x-2">
                    {appointment.type === "Online" && (
                      <Badge
                        variant="outline"
                        className="border-blue-600 text-blue-600"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                    {appointment.status !== "Abgesagt" &&
                      appointment.status !== "cancelled" && (
                        <>
                          {(appointment.status === "Ausstehend" ||
                            appointment.status === "pending") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleConfirm(appointment.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Bestätigen
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleCancel(appointment.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Absagen
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Zurück
              </Button>
              <span className="text-sm text-gray-600">
                Seite {currentPage} von {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
