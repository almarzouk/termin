"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "male",
    blood_type: "",
    address: "",
    city: "",
    country: "Deutschland",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setFetching(true);
      const response = await api.patients.getById(parseInt(patientId));
      const patient = response.data;

      // Format date to YYYY-MM-DD for input field
      let formattedDate = "";
      if (patient.date_of_birth) {
        const date = new Date(patient.date_of_birth);
        formattedDate = date.toISOString().split("T")[0];
      }

      setFormData({
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        date_of_birth: formattedDate,
        gender: patient.gender || "male",
        blood_type: patient.blood_type || "",
        address: patient.address || "",
        city: patient.city || "",
        country: patient.country || "Deutschland",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Patient konnte nicht geladen werden",
        variant: "destructive",
      });
      router.push("/dashboard/patient");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log("📤 Sending update request:", {
        id: patientId,
        data: formData,
      });

      const response = await api.patients.update(parseInt(patientId), formData);

      console.log("✅ Update response:", response);

      toast({
        title: "✅ Erfolgreich!",
        description: `${formData.first_name} ${formData.last_name} wurde erfolgreich aktualisiert`,
        variant: "success",
      });

      router.push("/dashboard/patient");
    } catch (error: any) {
      console.error("❌ Full error object:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.message);

      toast({
        title: "❌ Fehler",
        description:
          error.message || "Der Patient konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Patient bearbeiten
          </h1>
          <p className="text-gray-600 mt-1">
            Aktualisieren Sie die Patientendaten
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Persönliche Informationen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Vorname *
                  </label>
                  <Input
                    required
                    placeholder="z.B. Max"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nachname *
                  </label>
                  <Input
                    required
                    placeholder="z.B. Mustermann"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    E-Mail-Adresse *
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="patient@beispiel.de"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Telefonnummer *
                  </label>
                  <Input
                    required
                    placeholder="+49 30 12345678"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Geburtsdatum *
                  </label>
                  <Input
                    required
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Geschlecht *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="other">Divers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Blutgruppe
                  </label>
                  <Input
                    placeholder="z.B. A+"
                    value={formData.blood_type}
                    onChange={(e) =>
                      setFormData({ ...formData, blood_type: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Stadt
                  </label>
                  <Input
                    placeholder="z.B. Berlin"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <Input
                    placeholder="Straße, Hausnummer, PLZ"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notfallkontakt
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name des Notfallkontakts
                  </label>
                  <Input
                    placeholder="z.B. Anna Mustermann"
                    value={formData.emergency_contact_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Telefonnummer Notfallkontakt
                  </label>
                  <Input
                    placeholder="+49 30 87654321"
                    value={formData.emergency_contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Wird aktualisiert...
                  </>
                ) : (
                  "Änderungen speichern"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
