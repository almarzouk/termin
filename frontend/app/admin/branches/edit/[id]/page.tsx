"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchingBranch, setFetchingBranch] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userClinicId, setUserClinicId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    clinic_id: "",
    name: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Germany",
    phone: "",
    email: "",
    lat: "",
    lng: "",
    is_main: false,
    is_active: true,
  });

  useEffect(() => {
    // Get user info
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.roles?.[0] || null);
      setUserClinicId(user.clinic_id);
    }

    fetchClinics();
    fetchBranch();
  }, [branchId]);

  const fetchClinics = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/clinics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Fehler beim Laden der Kliniken");

      const data = await response.json();
      const clinicsList = data.data || data || [];
      setClinics(Array.isArray(clinicsList) ? clinicsList : []);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Kliniken konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const fetchBranch = async () => {
    try {
      setFetchingBranch(true);

      // First, get all clinics to find which one has this branch
      const clinicsResponse = await fetch("http://localhost:8000/api/clinics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!clinicsResponse.ok) throw new Error("Fehler beim Laden");

      const clinicsData = await clinicsResponse.json();
      const clinicsList = clinicsData.data || clinicsData || [];

      // Try to find the branch in each clinic
      let branchData = null;
      let clinicId = null;

      for (const clinic of clinicsList) {
        try {
          const branchResponse = await fetch(
            `http://localhost:8000/api/clinics/${clinic.id}/branches/${branchId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (branchResponse.ok) {
            const data = await branchResponse.json();
            branchData = data.data || data;
            clinicId = clinic.id;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!branchData) {
        throw new Error("Filiale nicht gefunden");
      }

      setFormData({
        clinic_id: String(clinicId),
        name: branchData.name || "",
        address: branchData.address || "",
        city: branchData.city || "",
        postal_code: branchData.postal_code || "",
        country: branchData.country || "Germany",
        phone: branchData.phone || "",
        email: branchData.email || "",
        lat: branchData.lat ? String(branchData.lat) : "",
        lng: branchData.lng ? String(branchData.lng) : "",
        is_main: branchData.is_main || false,
        is_active: branchData.is_active !== false,
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Filiale konnte nicht geladen werden",
        variant: "destructive",
      });
      router.push("/admin/branches");
    } finally {
      setFetchingBranch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.clinic_id ||
      !formData.name ||
      !formData.address ||
      !formData.city ||
      !formData.phone
    ) {
      toast({
        title: "❌ Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    // Email validation (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "❌ Fehler",
          description: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/clinics/${formData.clinic_id}/branches/${branchId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            lat: formData.lat ? parseFloat(formData.lat) : null,
            lng: formData.lng ? parseFloat(formData.lng) : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Fehler beim Aktualisieren der Filiale"
        );
      }

      toast({
        title: "✅ Erfolg",
        description: `Filiale ${formData.name} wurde erfolgreich aktualisiert`,
        variant: "success",
      });
      router.push("/admin/branches");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description:
          error.message || "Filiale konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  if (fetchingBranch) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lädt Filiale...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/branches">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Filiale bearbeiten
          </h1>
          <p className="text-gray-600 mt-1">
            Aktualisieren Sie die Filialinformationen
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinic Selection */}
          <div>
            <Label htmlFor="clinic_id">
              Klinik <span className="text-red-500">*</span>
            </Label>
            <select
              id="clinic_id"
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleChange}
              disabled={userRole === "clinic_owner"}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Klinik auswählen</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            {userRole === "clinic_owner" && (
              <p className="text-xs text-gray-500 mt-1">
                Sie können die Klinikzuordnung nicht ändern
              </p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <Label htmlFor="name">
              Filiale Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="z.B. Hauptfiliale Berlin"
              required
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">
              Adresse <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="z.B. Hauptstraße 123"
              required
            />
          </div>

          {/* City & Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">
                Stadt <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="z.B. Berlin"
                required
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postleitzahl</Label>
              <Input
                id="postal_code"
                name="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="z.B. 10115"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country">Land</Label>
            <Input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              placeholder="z.B. Germany"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">
                Telefon <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="z.B. +49 30 12345678"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="z.B. berlin@klinik.de"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Breitengrad (Optional)</Label>
              <Input
                id="lat"
                name="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={handleChange}
                placeholder="z.B. 52.520008"
              />
            </div>
            <div>
              <Label htmlFor="lng">Längengrad (Optional)</Label>
              <Input
                id="lng"
                name="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={handleChange}
                placeholder="z.B. 13.404954"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="is_main"
                name="is_main"
                type="checkbox"
                checked={formData.is_main}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_main" className="font-normal cursor-pointer">
                Dies ist die Hauptfiliale
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_active" className="font-normal cursor-pointer">
                Filiale ist aktiv
              </Label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/branches">
              <Button type="button" variant="outline" disabled={loading}>
                Abbrechen
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Wird gespeichert..." : "Änderungen speichern"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
