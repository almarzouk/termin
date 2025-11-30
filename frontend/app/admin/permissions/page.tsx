"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Lock,
  Unlock,
  Search,
  Save,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function PermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [rolePermissions, setRolePermissions] = useState<any>({});

  const permissionCategories = [
    {
      name: "Klinikenverwaltung",
      permissions: [
        { key: "view_own_clinic", label: "Eigene Klinik ansehen" },
        { key: "update_own_clinic", label: "Eigene Klinik bearbeiten" },
        { key: "delete_own_clinic", label: "Eigene Klinik löschen" },
        { key: "view_all_clinics", label: "Alle Kliniken ansehen" },
        { key: "activate_clinic", label: "Klinik aktivieren" },
        { key: "deactivate_clinic", label: "Klinik deaktivieren" },
        { key: "manage_clinic_branches", label: "Filialen verwalten" },
        { key: "manage_clinic_settings", label: "Klinikeinstellungen" },
        { key: "view_clinic_analytics", label: "Klinikanalysen ansehen" },
      ],
    },
    {
      name: "Mitarbeiterverwaltung",
      permissions: [
        { key: "view_clinic_staff", label: "Mitarbeiter ansehen" },
        { key: "create_staff", label: "Mitarbeiter erstellen" },
        { key: "update_staff", label: "Mitarbeiter bearbeiten" },
        { key: "delete_staff", label: "Mitarbeiter löschen" },
        { key: "invite_staff", label: "Mitarbeiter einladen" },
        { key: "manage_staff_schedule", label: "Zeitpläne verwalten" },
      ],
    },
    {
      name: "Diensteverwaltung",
      permissions: [
        { key: "view_services", label: "Dienste ansehen" },
        { key: "create_service", label: "Dienst erstellen" },
        { key: "update_service", label: "Dienst bearbeiten" },
        { key: "delete_service", label: "Dienst löschen" },
      ],
    },
    {
      name: "Terminverwaltung",
      permissions: [
        { key: "view_own_appointments", label: "Eigene Termine ansehen" },
        { key: "view_all_appointments", label: "Alle Termine ansehen" },
        { key: "create_appointment", label: "Termin erstellen" },
        { key: "update_appointment", label: "Termin bearbeiten" },
        { key: "cancel_appointment", label: "Termin stornieren" },
        { key: "confirm_appointment", label: "Termin bestätigen" },
        { key: "complete_appointment", label: "Termin abschließen" },
        { key: "mark_no_show", label: "Als Nichterschienen markieren" },
      ],
    },
    {
      name: "Patientenverwaltung",
      permissions: [
        { key: "view_clinic_patients", label: "Patienten ansehen" },
        { key: "view_patient_records", label: "Patientenakten ansehen" },
        { key: "update_patient_records", label: "Patientenakten bearbeiten" },
        { key: "add_medical_notes", label: "Medizinische Notizen" },
        { key: "add_prescriptions", label: "Rezepte hinzufügen" },
        { key: "upload_medical_files", label: "Medizinische Dateien" },
      ],
    },
    {
      name: "Abonnements & Berichte",
      permissions: [
        { key: "view_subscription", label: "Abonnement ansehen" },
        { key: "upgrade_subscription", label: "Abonnement upgraden" },
        { key: "cancel_subscription", label: "Abonnement kündigen" },
        { key: "manage_subscription_plans", label: "Pläne verwalten" },
        { key: "export_reports", label: "Berichte exportieren" },
        { key: "view_own_stats", label: "Eigene Statistiken" },
        { key: "view_global_analytics", label: "Globale Analysen" },
      ],
    },
    {
      name: "Bewertungen & System",
      permissions: [
        { key: "view_reviews", label: "Bewertungen ansehen" },
        { key: "approve_reviews", label: "Bewertungen genehmigen" },
        { key: "delete_reviews", label: "Bewertungen löschen" },
        { key: "manage_system_settings", label: "Systemeinstellungen" },
      ],
    },
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.admin.permissions.getRoles();
      const roles = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setRoles(roles);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Rollen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: any) => {
    setSelectedRole(role);
    try {
      const response = await api.admin.permissions.getRolePermissions(role.id);
      const perms = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      const permMap: any = {};
      if (Array.isArray(perms)) {
        perms.forEach((p: string) => {
          permMap[p] = true;
        });
      }
      setRolePermissions(permMap);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handlePermissionToggle = (key: string) => {
    setRolePermissions((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const permissions = Object.keys(rolePermissions).filter(
        (key) => rolePermissions[key]
      );
      await api.admin.permissions.updateRolePermissions(
        selectedRole.id,
        permissions
      );
      toast({
        title: "✅ Erfolg",
        description: "Berechtigungen erfolgreich gespeichert",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Berechtigungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast({
        title: "❌ Fehler",
        description: "Bitte geben Sie einen Rollennamen ein",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.admin.permissions.createRole(newRole);
      toast({
        title: "✅ Erfolg",
        description: "Rolle erfolgreich erstellt",
        variant: "success",
      });
      setShowAddRole(false);
      setNewRole({ name: "", description: "" });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Rolle konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rollen & Berechtigungen
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Benutzerrollen und deren Berechtigungen
          </p>
        </div>
        <Button
          onClick={() => setShowAddRole(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Rolle hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Rollen
          </h3>
          <div className="space-y-2">
            {loading ? (
              <p className="text-gray-500 text-center py-8">Lädt Rollen...</p>
            ) : roles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Keine Rollen verfügbar
              </p>
            ) : (
              roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedRole?.id === role.id
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{role.name}</p>
                      <p className="text-sm text-gray-500">
                        {role.users_count || 0} Benutzer
                      </p>
                    </div>
                    {role.name === "super_admin" && (
                      <Badge className="bg-red-100 text-red-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Geschützt
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Permissions */}
        <Card className="lg:col-span-2 p-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Berechtigungen für: {selectedRole.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedRole.description}
                  </p>
                </div>
                <Button
                  onClick={handleSavePermissions}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedRole.name === "super_admin"}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>

              {selectedRole.name === "super_admin" ? (
                <div className="text-center py-12">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Geschützte Rolle
                  </h4>
                  <p className="text-gray-600">
                    Super Admin-Berechtigungen können nicht geändert werden
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.name}>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.permissions.map((permission) => (
                          <div
                            key={permission.key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <Label
                              htmlFor={permission.key}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                            <Switch
                              id={permission.key}
                              checked={!!rolePermissions[permission.key]}
                              onCheckedChange={() =>
                                handlePermissionToggle(permission.key)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Keine Rolle ausgewählt
              </h4>
              <p className="text-gray-600">
                Wählen Sie eine Rolle aus, um Berechtigungen zu verwalten
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Add Role Dialog */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Neue Rolle erstellen
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rollenname</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  placeholder="z.B. Manager"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Input
                  id="description"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  placeholder="z.B. Klinikmanager"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddRole(false);
                    setNewRole({ name: "", description: "" });
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateRole}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Erstellen
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
