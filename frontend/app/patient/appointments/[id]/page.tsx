"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Video,
  Phone,
  Mail,
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface AppointmentDetails {
  id: number;
  appointment_date: string;
  appointment_time: string;
  start_time: string;
  end_time: string;
  status: string;
  clinic: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  doctor: {
    id: number;
    name: string;
    specialty?: string;
    phone?: string;
    user?: {
      name: string;
      email?: string;
    };
  };
  service?: {
    id: number;
    name: string;
    duration?: number;
    price?: number;
  };
  appointment_type?: string;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
}

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.appointments.getById(Number(appointmentId));
      setAppointment(response.data);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht geladen werden",
        variant: "destructive",
      });
      router.push("/patient/appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      setCancelling(true);
      await api.appointments.cancel(
        Number(appointmentId),
        "Vom Patienten storniert"
      );

      toast({
        title: "Termin abgesagt",
        description: "Ihr Termin wurde erfolgreich abgesagt.",
      });

      setShowCancelDialog(false);
      fetchAppointment(); // Refresh to show updated status
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht storniert werden",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const appointmentDateTime = new Date(
    `${appointment.appointment_date} ${appointment.appointment_time}`
  );
  const isPast = appointmentDateTime < new Date();
  const canCancel =
    !isPast &&
    appointment.status !== "cancelled" &&
    appointment.status !== "completed";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/patient/appointments")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Termindetails</h1>
            <p className="text-gray-600 mt-1">Termin #{appointment.id}</p>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            <XCircle className="h-5 w-5 mr-2" />
            Termin absagen
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Termininformationen</CardTitle>
              <Badge
                variant="outline"
                className={getStatusColor(appointment.status)}
              >
                <span className="mr-2">
                  {getStatusIcon(appointment.status)}
                </span>
                {getStatusText(appointment.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Datum</p>
                <p className="font-semibold text-lg">
                  {format(appointmentDateTime, "EEEE, dd. MMMM yyyy", {
                    locale: de,
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {appointment.start_time} - {appointment.end_time} Uhr
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Doctor Info */}
            <div className="flex items-start gap-4">
              <User className="h-6 w-6 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Arzt</p>
                <p className="font-semibold text-lg">
                  {appointment.doctor.user?.name || appointment.doctor.name}
                </p>
                {appointment.doctor.specialty && (
                  <p className="text-gray-600">
                    {appointment.doctor.specialty}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Clinic Info */}
            <div className="flex items-start gap-4">
              <Building2 className="h-6 w-6 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Klinik</p>
                <p className="font-semibold text-lg">
                  {appointment.clinic.name}
                </p>
                {appointment.clinic.address && (
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <p className="text-gray-600">
                      {appointment.clinic.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {appointment.service && (
              <>
                <Separator />
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Leistung</p>
                    <p className="font-semibold text-lg">
                      {appointment.service.name}
                    </p>
                    {appointment.service.duration && (
                      <p className="text-gray-600">
                        Dauer: {appointment.service.duration} Minuten
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {appointment.appointment_type && (
              <>
                <Separator />
                <div className="flex items-start gap-4">
                  {appointment.appointment_type === "online" ? (
                    <Video className="h-6 w-6 text-gray-500 mt-1" />
                  ) : (
                    <MapPin className="h-6 w-6 text-gray-500 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Terminart</p>
                    <p className="font-semibold text-lg">
                      {appointment.appointment_type === "online"
                        ? "Online-Termin"
                        : "Vor-Ort-Termin"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {appointment.notes && (
              <>
                <Separator />
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Notizen</p>
                    <p className="text-gray-700 mt-1">{appointment.notes}</p>
                  </div>
                </div>
              </>
            )}

            {appointment.cancellation_reason && (
              <>
                <Separator />
                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-semibold">
                      Stornierungsgrund
                    </p>
                    <p className="text-gray-700 mt-1">
                      {appointment.cancellation_reason}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointment.clinic.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <a
                      href={`tel:${appointment.clinic.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {appointment.clinic.phone}
                    </a>
                  </div>
                </div>
              )}

              {appointment.clinic.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">E-Mail</p>
                    <a
                      href={`mailto:${appointment.clinic.email}`}
                      className="text-blue-600 hover:underline break-all"
                    >
                      {appointment.clinic.email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          {!isPast && appointment.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <CardTitle>Aktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Termin ändern
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Termin absagen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin absagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diesen Termin absagen möchten? Diese
              Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelling}
            >
              {cancelling ? "Wird abgesagt..." : "Termin absagen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
