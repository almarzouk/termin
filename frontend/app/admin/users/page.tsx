"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRoleCheck } from "@/hooks/useRoleCheck";

export default function UsersManagementPage() {
  // Check if user is super_admin
  const {
    user,
    isAuthorized,
    isLoading: authLoading,
  } = useRoleCheck({
    allowedRoles: ["super_admin"],
    redirectTo: "/admin/dashboard",
  });

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null as number | null,
    userName: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.admin.users.getAll({
        search: searchTerm || undefined,
        role: selectedRole || undefined,
      });
      // Handle paginated response
      const userData = response.data?.data || response.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Benutzer konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.admin.roles.getAll();
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Roles fetch error:", error);
      toast({
        title: "⚠️ Warnung",
        description: "Rollen konnten nicht geladen werden",
        variant: "destructive",
      });
      setRoles([]);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await api.admin.users.toggleStatus(id);
      toast({
        title: "✅ Erfolg",
        description: "Benutzerstatus erfolgreich aktualisiert",
        variant: "success",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, userId: id, userName: name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.admin.users.delete(deleteDialog.userId!);
      toast({
        title: "✅ Gelöscht",
        description: `${deleteDialog.userName} wurde erfolgreich gelöscht`,
        variant: "success",
      });
      setDeleteDialog({ open: false, userId: null, userName: "" });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-red-100 text-red-800",
      clinic_owner: "bg-purple-100 text-purple-800",
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      receptionist: "bg-yellow-100 text-yellow-800",
      customer: "bg-gray-100 text-gray-800",
    };
    return colors[roleName] || "bg-gray-100 text-gray-800";
  };

  // Show loading while checking authorization
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Überprüfe Berechtigungen...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Benutzerverwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Benutzer und deren Rollen
          </p>
        </div>
        <Link href="/admin/users/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Benutzer hinzufügen
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Rollen</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Lädt Benutzer...</p>
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Benutzer gefunden
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedRole
              ? "Versuchen Sie andere Filter"
              : "Fügen Sie Ihren ersten Benutzer hinzu"}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kontakt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Klinik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.roles && user.roles.length > 0 ? (
                        <Badge
                          className={getRoleBadgeColor(user.roles[0].name)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.roles[0].name === "super_admin"
                            ? "Super Administrator"
                            : user.roles[0].name === "clinic_owner"
                            ? "Klinikinhaber"
                            : user.roles[0].name === "doctor"
                            ? "Arzt"
                            : user.roles[0].name === "nurse"
                            ? "Krankenpfleger/in"
                            : user.roles[0].name === "receptionist"
                            ? "Rezeptionist/in"
                            : user.roles[0].name === "customer"
                            ? "Kunde"
                            : user.roles[0].name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Keine Rolle</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.clinic ? (
                        <div className="text-sm text-gray-900">
                          {user.clinic.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {user.status === "active" ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Aktiv
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inaktiv
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(user.id, user.status)
                          }
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/users/edit/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id, user.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y">
            {users.map((user) => (
              <div key={user.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      {user.roles && user.roles.length > 0 && (
                        <Badge
                          className={getRoleBadgeColor(user.roles[0].name)}
                        >
                          {user.roles[0].name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
                    className={
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {user.status === "active" ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleStatus(user.id, user.status)}
                  >
                    <Power className="h-4 w-4 mr-1" />
                    {user.status === "active" ? "Deaktivieren" : "Aktivieren"}
                  </Button>
                  <Link href={`/admin/users/edit/${user.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(user.id, user.name)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, userId: null, userName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Benutzer löschen?"
        description={`Möchten Sie ${deleteDialog.userName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
