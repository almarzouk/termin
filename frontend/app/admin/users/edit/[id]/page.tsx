"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserClinicId, setCurrentUserClinicId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "",
    status: "active",
    clinic_id: "",
  });

  // Roles that require clinic assignment
  const staffRoles = [
    "receptionist",
    "nurse",
    "pharmacist",
    "lab_technician",
    "clinic_manager",
    "administrator",
    "doctor",
    "clinic_owner",
    "customer",
  ];

  useEffect(() => {
    // Get current user's role and clinic
    const userData = localStorage.getItem("user");
    let userRole = null;
    if (userData) {
      const user = JSON.parse(userData);
      userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
      setCurrentUserRole(userRole);
      setCurrentUserClinicId(user.clinic_id);
    }

    fetchRoles(userRole);
    fetchClinics();
    fetchUser();
  }, [userId]);

  const fetchRoles = async (userRole: string | null = null) => {
    try {
      const response = await api.admin.roles.getAll();
      let allRoles = response.data || [];

      // Use passed userRole or fall back to state
      const roleToCheck = userRole || currentUserRole;

      // Filter roles based on current user role
      if (roleToCheck === "clinic_owner") {
        // clinic_owner cannot assign super_admin or clinic_owner roles
        allRoles = allRoles.filter(
          (role: any) =>
            role.name !== "super_admin" && role.name !== "clinic_owner"
        );
      }

      setRoles(allRoles);
    } catch (error) {
      console.error("Roles fetch error:", error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await api.admin.clinics.getAll({});
      const data = response.data?.data || response.data || [];
      setClinics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Clinics fetch error:", error);
      setClinics([]);
    }
  };

  const fetchUser = async () => {
    try {
      setFetching(true);
      const response = await api.admin.users.getById(Number(userId));
      const user = response.data;
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        password_confirmation: "",
        role: user.roles && user.roles.length > 0 ? user.roles[0].name : "",
        status: user.status || "active",
        clinic_id: user.clinic_id ? String(user.clinic_id) : "",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Benutzer konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "❌ Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    // Check if clinic is required for this role
    if (staffRoles.includes(formData.role) && !formData.clinic_id) {
      toast({
        title: "❌ Fehler",
        description: "Bitte wählen Sie eine Klinik für diese Rolle aus",
        variant: "destructive",
      });
      return;
    }

    // Password validation (only if provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        toast({
          title: "❌ Fehler",
          description: "Passwort muss mindestens 8 Zeichen lang sein",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        toast({
          title: "❌ Fehler",
          description: "Passwörter stimmen nicht überein",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);
      // Remove password fields if empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      await api.admin.users.update(Number(userId), updateData);
      toast({
        title: "✅ Erfolg",
        description: `Benutzer ${formData.name} wurde erfolgreich aktualisiert`,
        variant: "success",
      });
      router.push("/admin/users");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description:
          error.response?.data?.message ||
          "Benutzer konnte nicht aktualisiert werden",
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetching) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Lädt Benutzerdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Benutzer bearbeiten
        </h1>
        <p className="text-gray-600 mt-1">
          Aktualisieren Sie die Benutzerdaten
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="z.B. Max Mustermann"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-Mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="z.B. max@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="z.B. +49 123 456789"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort (optional)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leer lassen um beizubehalten"
              minLength={8}
            />
            <p className="text-sm text-gray-500">
              Lassen Sie dieses Feld leer, wenn Sie das Passwort nicht ändern
              möchten
            </p>
          </div>

          {/* Password Confirmation */}
          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Passwort bestätigen</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Passwort wiederholen"
                minLength={8}
              />
            </div>
          )}

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rolle <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Rolle auswählen</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name === "super_admin"
                    ? "Super Administrator"
                    : role.name === "clinic_owner"
                    ? "Klinikinhaber"
                    : role.name === "doctor"
                    ? "Arzt"
                    : role.name === "nurse"
                    ? "Krankenpfleger/in"
                    : role.name === "receptionist"
                    ? "Rezeptionist/in"
                    : role.name === "customer"
                    ? "Kunde"
                    : role.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500">
              {currentUserRole === "clinic_owner"
                ? "Sie können nur Rollen für Mitarbeiter Ihrer Klinik ändern"
                : "Wählen Sie die Benutzerrolle aus. Die Rolle bestimmt die Zugriffsrechte."}
            </p>
          </div>

          {/* Clinic */}
          <div className="space-y-2">
            <Label htmlFor="clinic_id">
              Klinik{" "}
              {staffRoles.includes(formData.role) && (
                <span className="text-red-500">*</span>
              )}
            </Label>
            <select
              id="clinic_id"
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required={staffRoles.includes(formData.role)}
              disabled={currentUserRole !== "super_admin"}
            >
              <option value="">Klinik auswählen</option>
              {currentUserRole === "super_admin"
                ? // Super admin sees all clinics
                  clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))
                : // Clinic owner sees only their clinic
                  clinics
                    .filter((clinic) => clinic.id === currentUserClinicId)
                    .map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
            </select>
            <p className="text-sm text-gray-500">
              {currentUserRole === "super_admin"
                ? "Mitarbeiter und Ärzte müssen einer Klinik zugeordnet sein"
                : "Benutzer können nur zu Ihrer Klinik zugeordnet werden"}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/users">
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
