"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Clock,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api";

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  opening_hours?: string;
  total_doctors?: number;
  total_patients?: number;
  total_staff?: number;
}

export default function ClinicPage() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");

        if (!userData) {
          setError("Benutzer ist nicht angemeldet");
          return;
        }

        const user = JSON.parse(userData);
        let clinicId = user.clinic_id;

        // If user has no clinic_id, try to get updated user data
        if (!clinicId) {
          console.log("⚠️ User has no clinic_id, fetching latest user data...");
          try {
            const meResponse: any = await api.auth.me();
            if (meResponse.user && meResponse.user.clinic_id) {
              clinicId = meResponse.user.clinic_id;
              // Update localStorage with new user data
              localStorage.setItem("user", JSON.stringify(meResponse.user));
              console.log("✅ User data updated with clinic_id:", clinicId);
            } else {
              setError(
                "Benutzer ist keiner Klinik zugeordnet. Bitte kontaktieren Sie den Administrator."
              );
              return;
            }
          } catch (meErr) {
            console.error("Error fetching user data:", meErr);
            setError(
              "Benutzer ist keiner Klinik zugeordnet. Bitte melden Sie sich erneut an."
            );
            return;
          }
        }

        // Fetch clinic details
        const response: any = await api.clinics.getById(clinicId);
        setClinic(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching clinic:", err);
        const error = err as Error;
        setError(error.message || "Fehler beim Laden der Klinikdaten");
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Klinikdaten werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Fehler</p>
              <p className="mt-2">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p className="text-lg font-semibold">Keine Daten</p>
              <p className="mt-2">Keine Klinikdaten gefunden</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meine Klinik</h1>
        <p className="text-gray-600">Informationen zu Ihrer Klinik</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Clinic Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              {clinic.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clinic.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Beschreibung</p>
                <p className="text-gray-700">{clinic.description}</p>
              </div>
            )}

            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="text-gray-900">{clinic.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="text-gray-900">{clinic.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">E-Mail</p>
                  <p className="text-gray-900">{clinic.email}</p>
                </div>
              </div>

              {clinic.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
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

              {clinic.opening_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Öffnungszeiten</p>
                    <p className="text-gray-900">{clinic.opening_hours}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="space-y-4">
          {clinic.total_doctors !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {clinic.total_doctors}
                    </p>
                    <p className="text-sm text-gray-600">Ärzte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {clinic.total_patients !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {clinic.total_patients}
                    </p>
                    <p className="text-sm text-gray-600">Patienten</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {clinic.total_staff !== undefined && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {clinic.total_staff}
                    </p>
                    <p className="text-sm text-gray-600">Mitarbeiter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
