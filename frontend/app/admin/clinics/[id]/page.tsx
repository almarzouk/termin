"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Users,
  Stethoscope,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Globe,
  Edit,
  BarChart3,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ClinicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [clinic, setClinic] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});

  useEffect(() => {
    if (id) {
      fetchClinicDetails();
    }
  }, [id]);

  const fetchClinicDetails = async () => {
    try {
      setLoading(true);
      const response = await api.admin.clinics.getById(Number(id));
      const data = response.data;

      setClinic(data.clinic || data);
      setStaff(data.staff || []);
      setRecentAppointments(data.recent_appointments || []);
      setStatistics(data.statistics || {});
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Klinikdaten konnten nicht geladen werden",
        variant: "destructive",
      });
      router.push("/admin/clinics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="p-12 text-center">
          <p className="text-gray-600">Lädt Klinikdaten...</p>
        </Card>
      </div>
    );
  }

  if (!clinic) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/clinics">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              {clinic.name}
            </h1>
            <p className="text-gray-600 mt-1">{clinic.description}</p>
          </div>
          <Link href={`/admin/clinics/edit/${clinic.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mitarbeiter</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total_staff || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ärzte</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total_doctors || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Termine</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total_appointments || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patienten</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total_patients || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinic Information */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Klinikinformationen
          </h2>
          <div className="space-y-4">
            {clinic.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="text-gray-900">{clinic.email}</p>
                </div>
              </div>
            )}
            {clinic.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="text-gray-900">{clinic.phone}</p>
                </div>
              </div>
            )}
            {clinic.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="text-gray-900">
                    {clinic.address}
                    {clinic.city && `, ${clinic.city}`}
                    {clinic.country && `, ${clinic.country}`}
                  </p>
                </div>
              </div>
            )}
            {clinic.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {clinic.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Appointment Status */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Terminstatus</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium">Ausstehend</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {statistics.pending_appointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Bestätigt</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {statistics.confirmed_appointments || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Mitarbeiter ({staff.length})
        </h2>
        {staff.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Keine Mitarbeiter gefunden
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member: any) => (
              <div
                key={member.id}
                className="p-4 border rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {member.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                {member.roles && member.roles.length > 0 && (
                  <Badge className="mt-3 bg-blue-100 text-blue-800">
                    {member.roles[0].name}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Appointments */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-purple-600" />
          Letzte Termine
        </h2>
        {recentAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Keine Termine gefunden
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Arzt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentAppointments.map((appointment: any) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(appointment.start_time).toLocaleDateString(
                        "de-DE"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {appointment.patient?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {appointment.staff?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          appointment.status === "confirmed"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Services */}
      {clinic.services && clinic.services.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-green-600" />
            Dienste ({clinic.services.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinic.services.map((service: any) => (
              <div
                key={service.id}
                className="p-4 border rounded-lg hover:shadow-md transition"
              >
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {service.price && (
                    <span className="text-lg font-bold text-blue-600">
                      {service.price}€
                    </span>
                  )}
                  {service.duration && (
                    <span className="text-sm text-gray-500">
                      {service.duration} Min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
