"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicSelect } from "@/components/ui/clinic-select";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserClinicId, setCurrentUserClinicId] = useState<number | null>(
    null
  );
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [limitType, setLimitType] = useState<"doctor" | "staff" | "">("");
  const { limits, canCreateDoctor, canCreateStaff, refetch } =
    useSubscriptionLimits();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "",
    clinic_id: "",
    status: "active",
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
  ];

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem("user");
    let userRole = null;
    let userClinicId = null;
    if (userData) {
      const user = JSON.parse(userData);
      userRole = user.roles?.[0] || null;
      userClinicId = user.clinic_id;
      setCurrentUserRole(userRole);
      setCurrentUserClinicId(userClinicId);
    }

    fetchRoles(userRole);
    fetchClinics(userRole, userClinicId);
  }, []);

  const fetchRoles = async (userRole: string | null = null) => {
    try {
      const response = await api.admin.roles.getAll();
      let allRoles = response.data || [];

      // Use passed userRole or fall back to state
      const roleToCheck = userRole || currentUserRole;

      // Filter roles based on current user role
      if (roleToCheck === "clinic_owner") {
        // clinic_owner cannot create super_admin or clinic_owner
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

  const fetchClinics = async (
    userRole: string | null = null,
    userClinicId: number | null = null
  ) => {
    try {
      const response = await api.admin.clinics.getAll();
      let data = response.data?.data || response.data || [];
      data = Array.isArray(data) ? data : [];

      // Use passed parameters or fall back to state
      const roleToCheck = userRole || currentUserRole;
      const clinicIdToCheck = userClinicId || currentUserClinicId;

      // If clinic_owner, set their clinic automatically
      if (roleToCheck === "clinic_owner" && clinicIdToCheck) {
        const ownClinic = data.filter((c: any) => c.id === clinicIdToCheck);
        setClinics(ownClinic);
        // Auto-set clinic_id if not already set
        if (ownClinic.length > 0 && !formData.clinic_id) {
          setFormData((prev) => ({
            ...prev,
            clinic_id: String(clinicIdToCheck),
          }));
        }
      } else {
        setClinics(data);
      }
    } catch (error) {
      console.error("Clinics fetch error:", error);
      setClinics([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
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

    // Check subscription limits for doctors and staff (only for clinic_owner)
    if (currentUserRole === "clinic_owner") {
      if (formData.role === "doctor" && !canCreateDoctor()) {
        setLimitType("doctor");
        setLimitMessage(
          `Sie haben das Limit von ${limits.doctors.limit} Ärzten erreicht. Um weitere Ärzte hinzuzufügen, müssen Sie Ihren Abonnementplan upgraden.`
        );
        setShowLimitDialog(true);
        return;
      } else if (
        ["receptionist", "nurse", "pharmacist", "lab_technician"].includes(
          formData.role
        ) &&
        !canCreateStaff()
      ) {
        setLimitType("staff");
        setLimitMessage(
          `Sie haben das Limit von ${limits.staff.limit} Mitarbeitern erreicht. Um weitere Mitarbeiter hinzuzufügen, müssen Sie Ihren Abonnementplan upgraden.`
        );
        setShowLimitDialog(true);
        return;
      }
    }

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

    try {
      setLoading(true);
      const response = await api.admin.users.create(formData);
      toast({
        title: "✅ Erfolg",
        description: `Benutzer ${formData.name} wurde erfolgreich erstellt`,
        variant: "success",
      });
      router.push("/admin/users");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description:
          error.response?.data?.message ||
          "Benutzer konnte nicht erstellt werden",
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
          Benutzer hinzufügen
        </h1>
        <p className="text-gray-600 mt-1">Erstellen Sie einen neuen Benutzer</p>
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
            <Label htmlFor="password">
              Passwort <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
            />
            <p className="text-sm text-gray-500">
              Das Passwort muss mindestens 8 Zeichen lang sein
            </p>
          </div>

          {/* Password Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">
              Passwort bestätigen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Passwort wiederholen"
              required
              minLength={8}
            />
          </div>

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
                ? "Sie können Mitarbeiter und Ärzte für Ihre Klinik erstellen"
                : "Wählen Sie die Benutzerrolle aus. Die Rolle bestimmt die Zugriffsrechte."}
            </p>
          </div>

          {/* Clinic - Show only for staff roles */}
          {formData.role && staffRoles.includes(formData.role) && (
            <div className="space-y-2">
              <Label htmlFor="clinic_id">
                Klinik <span className="text-red-500">*</span>
              </Label>
              <ClinicSelect
                clinics={clinics}
                value={formData.clinic_id}
                onChange={(value) =>
                  setFormData({ ...formData, clinic_id: value })
                }
                placeholder="Klinik auswählen und suchen..."
                required
                disabled={currentUserRole === "clinic_owner"}
              />
              <p className="text-sm text-gray-500">
                {currentUserRole === "clinic_owner"
                  ? "Neue Benutzer werden automatisch Ihrer Klinik zugeordnet"
                  : "Mitarbeiter und Ärzte müssen einer Klinik zugeordnet sein"}
              </p>
            </div>
          )}

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
              {loading ? "Wird gespeichert..." : "Benutzer erstellen"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Limit Exceeded Dialog */}
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Limit erreicht
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {limitMessage}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Aktuelle Nutzung:
                </p>
                {limitType === "doctor" && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      {limits.doctors.current} / {limits.doctors.limit}
                    </span>{" "}
                    Ärzte verwendet
                  </p>
                )}
                {limitType === "staff" && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      {limits.staff.current} / {limits.staff.limit}
                    </span>{" "}
                    Mitarbeiter verwendet
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowLimitDialog(false);
                router.push("/subscription-plans");
              }}
            >
              Plan upgraden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
