"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    available: 0,
  });

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get appointments for the selected date
      const dateStr = selectedDate.toISOString().split("T")[0];
      const appointmentsResponse = await api.appointments.getAll({
        date: dateStr,
      });

      console.log("Schedule API Response:", appointmentsResponse);

      // Get all doctors
      const doctorsResponse = await api.doctors.getAll();
      const doctors = Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : doctorsResponse.data?.data || [];

      // Process appointments by doctor
      const schedulesByDoctor: any[] = [];
      let totalCount = 0;
      let confirmedCount = 0;
      let pendingCount = 0;

      for (const doctor of doctors) {
        try {
          // Get doctor's schedule
          const doctorSchedule = await api.doctors.getSchedule(
            doctor.id,
            dateStr
          );

          schedulesByDoctor.push({
            id: doctor.id,
            doctor:
              doctor.name || `Dr. ${doctor.first_name} ${doctor.last_name}`,
            specialty: doctor.specialty || doctor.specialization || "Allgemein",
            image:
              doctor.image ||
              doctor.photo ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`,
            date: formatDate(selectedDate),
            timeSlots: doctorSchedule.data || [],
          });

          // Update stats
          if (doctorSchedule.data) {
            doctorSchedule.data.forEach((slot: any) => {
              totalCount++;
              if (slot.status === "confirmed") confirmedCount++;
              if (slot.status === "pending") pendingCount++;
            });
          }
        } catch (err) {
          console.error(
            `Error fetching schedule for doctor ${doctor.id}:`,
            err
          );
        }
      }

      if (schedulesByDoctor.length > 0) {
        setSchedules(schedulesByDoctor);
        setStats({
          total: totalCount,
          confirmed: confirmedCount,
          pending: pendingCount,
          available: totalCount - confirmedCount - pendingCount,
        });
      } else {
        // Use dummy data if no data from API
        setSchedules(getDummySchedules());
        setStats({ total: 12, confirmed: 7, pending: 2, available: 5 });
      }
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      setError(err.message || "Fehler beim Laden des Terminplans");
      // Use dummy data on error
      setSchedules(getDummySchedules());
      setStats({ total: 12, confirmed: 7, pending: 2, available: 5 });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const getDummySchedules = () => [
    {
      id: 1,
      doctor: "Dr. Anna Schmidt",
      specialty: "Kardiologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
      date: formatDate(selectedDate),
      timeSlots: [
        { time: "09:00", patient: "Emma Becker", status: "confirmed" },
        { time: "10:00", patient: "Felix Schneider", status: "pending" },
        { time: "11:00", patient: null, status: "available" },
        { time: "14:00", patient: "Sophie Meyer", status: "confirmed" },
        { time: "15:00", patient: null, status: "available" },
        { time: "16:00", patient: "Lukas Richter", status: "confirmed" },
      ],
    },
    {
      id: 2,
      doctor: "Dr. Michael Müller",
      specialty: "Neurologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      date: formatDate(selectedDate),
      timeSlots: [
        { time: "08:00", patient: "Hannah Koch", status: "confirmed" },
        { time: "09:00", patient: null, status: "available" },
        { time: "10:00", patient: "Noah Bauer", status: "pending" },
        { time: "11:00", patient: null, status: "available" },
        { time: "14:00", patient: null, status: "available" },
        { time: "15:00", patient: "Emma Becker", status: "confirmed" },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Bestätigt</Badge>;
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-700">Ausstehend</Badge>
        );
      case "available":
        return <Badge className="bg-gray-100 text-gray-700">Verfügbar</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Terminplan
          </h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Arzttermine</p>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {formatDate(selectedDate)}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Gesamt Termine</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Bestätigt</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Ausstehend</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Verfügbar</p>
          <p className="text-2xl font-bold text-gray-600">{stats.available}</p>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Schedule Grid */}
          <div className="space-y-6">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="p-6">
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={schedule.image} />
                    <AvatarFallback>{schedule.doctor[4]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {schedule.doctor}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {schedule.specialty}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedule.timeSlots.map((slot: any, index: number) => (
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
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {slot.time}
                          </span>
                        </div>
                        {getStatusBadge(slot.status)}
                      </div>
                      {slot.patient ? (
                        <p className="text-sm text-gray-700 font-medium">
                          {slot.patient}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Keine Buchung</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
