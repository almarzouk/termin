"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  FileText,
  Video,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  clinic: {
    name: string;
    address?: string;
  };
  doctor: {
    name: string;
    specialty?: string;
  };
  service?: {
    name: string;
  };
  appointment_type?: string;
  notes?: string;
}

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.appointments.getAllByPatient();
      // Handle both paginated and direct array responses
      const appointmentsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Bestätigt";
      case "pending":
        return "Ausstehend";
      case "cancelled":
        return "Abgesagt";
      case "completed":
        return "Abgeschlossen";
      default:
        return status;
    }
  };

  const filterAppointments = () => {
    if (!Array.isArray(appointments)) return [];

    const now = new Date();

    switch (filter) {
      case "upcoming":
        return appointments.filter((apt) => {
          const aptDate = new Date(
            `${apt.appointment_date} ${apt.appointment_time}`
          );
          return aptDate >= now && apt.status !== "cancelled";
        });
      case "past":
        return appointments.filter((apt) => {
          const aptDate = new Date(
            `${apt.appointment_date} ${apt.appointment_time}`
          );
          return aptDate < now;
        });
      case "cancelled":
        return appointments.filter((apt) => apt.status === "cancelled");
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments();

  const upcomingCount = Array.isArray(appointments)
    ? appointments.filter((apt) => {
        const aptDate = new Date(
          `${apt.appointment_date} ${apt.appointment_time}`
        );
        return aptDate >= new Date() && apt.status !== "cancelled";
      }).length
    : 0;

  const pastCount = Array.isArray(appointments)
    ? appointments.filter((apt) => {
        const aptDate = new Date(
          `${apt.appointment_date} ${apt.appointment_time}`
        );
        return aptDate < new Date();
      }).length
    : 0;

  const cancelledCount = Array.isArray(appointments)
    ? appointments.filter((apt) => apt.status === "cancelled").length
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meine Termine</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Arzttermine</p>
        </div>
        <Button
          onClick={() => router.push("/patient/appointments/new")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neuer Termin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "all" ? "ring-2 ring-blue-600" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alle Termine</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {appointments.length}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "upcoming" ? "ring-2 ring-green-600" : ""
          }`}
          onClick={() => setFilter("upcoming")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anstehend</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {upcomingCount}
                </p>
              </div>
              <CalendarCheck className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "past" ? "ring-2 ring-gray-600" : ""
          }`}
          onClick={() => setFilter("past")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vergangen</p>
                <p className="text-3xl font-bold text-gray-600 mt-1">
                  {pastCount}
                </p>
              </div>
              <CalendarClock className="h-10 w-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            filter === "cancelled" ? "ring-2 ring-red-600" : ""
          }`}
          onClick={() => setFilter("cancelled")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abgesagt</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {cancelledCount}
                </p>
              </div>
              <CalendarX className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Termine gefunden
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "Sie haben noch keine Termine gebucht."
                : `Sie haben keine ${
                    filter === "upcoming"
                      ? "anstehenden"
                      : filter === "past"
                      ? "vergangenen"
                      : "abgesagten"
                  } Termine.`}
            </p>
            <Button
              onClick={() => router.push("/patient/appointments/new")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Jetzt Termin buchen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((appointment) => {
            const appointmentDateTime = new Date(
              `${appointment.appointment_date} ${appointment.appointment_time}`
            );
            const isPast = appointmentDateTime < new Date();

            return (
              <Card
                key={appointment.id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  isPast ? "opacity-75" : ""
                }`}
                onClick={() =>
                  router.push(`/patient/appointments/${appointment.id}`)
                }
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {format(
                                appointmentDateTime,
                                "EEEE, dd. MMMM yyyy",
                                {
                                  locale: de,
                                }
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">
                                {appointment.appointment_time} Uhr
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getStatusColor(appointment.status)}
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 ml-14">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {appointment.doctor.name}
                            </p>
                            {appointment.doctor.specialty && (
                              <p className="text-sm text-gray-600">
                                {appointment.doctor.specialty}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">
                              {appointment.clinic.name}
                            </p>
                            {appointment.clinic.address && (
                              <p className="text-sm text-gray-600">
                                {appointment.clinic.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {appointment.service && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <p>{appointment.service.name}</p>
                          </div>
                        )}

                        {appointment.appointment_type && (
                          <div className="flex items-center gap-2 text-gray-700">
                            {appointment.appointment_type === "online" ? (
                              <Video className="h-4 w-4 text-gray-500" />
                            ) : (
                              <MapPin className="h-4 w-4 text-gray-500" />
                            )}
                            <p>
                              {appointment.appointment_type === "online"
                                ? "Online-Termin"
                                : "Vor-Ort-Termin"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Action Button */}
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
