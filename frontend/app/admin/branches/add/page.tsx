"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddBranchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      const role = user.roles?.[0] || null;
      const clinicId = user.clinic_id;
      setUserRole(role);
      setUserClinicId(clinicId);

      // For clinic_owner, auto-set their clinic
      if (role === "clinic_owner" && clinicId) {
        setFormData((prev) => ({ ...prev, clinic_id: String(clinicId) }));
      }
    }

    fetchClinics();
  }, []);

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
        `http://localhost:8000/api/clinics/${formData.clinic_id}/branches`,
        {
          method: "POST",
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
          errorData.message || "Fehler beim Erstellen der Filiale"
        );
      }

      toast({
        title: "✅ Erfolg",
        description: `Filiale ${formData.name} wurde erfolgreich erstellt`,
        variant: "success",
      });
      router.push("/admin/branches");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Filiale konnte nicht erstellt werden",
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
            Neue Filiale
          </h1>
          <p className="text-gray-600 mt-1">Erstellen Sie eine neue Filiale</p>
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
                Die Filiale wird automatisch Ihrer Klinik zugeordnet
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
              {loading ? "Wird gespeichert..." : "Filiale erstellen"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
