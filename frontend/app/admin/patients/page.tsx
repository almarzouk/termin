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
  UserCheck,
  UserX,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function PatientsManagementPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userClinicId, setUserClinicId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null as number | null,
    userName: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserClinicId(user.clinic_id);
      setUserRole(user.roles && user.roles.length > 0 ? user.roles[0] : null);
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchPatients();
    }
  }, [searchTerm, userRole, userClinicId]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.admin.users.getAll({
        search: searchTerm || undefined,
        role: "customer",
      });
      const userData = response.data?.data || response.data || [];
      let patientsList = Array.isArray(userData) ? userData : [];

      if (userRole === "clinic_owner" && userClinicId) {
        patientsList = patientsList.filter(
          (patient: any) => patient.clinic_id === userClinicId
        );
      }

      setPatients(patientsList);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Patienten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await api.admin.users.toggleStatus(id);
      toast({
        title: "✅ Erfolg",
        description: "Patientenstatus erfolgreich aktualisiert",
        variant: "success",
      });
      fetchPatients();
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
      fetchPatients();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message,
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
            Patientenverwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Patienten im System
          </p>
        </div>
        <Link href="/admin/users/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Patient hinzufügen
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gesamt Patienten</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {patients.length}
              </h3>
            </div>
            <Users className="h-10 w-10 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktive Patienten</p>
              <h3 className="text-2xl font-bold text-green-600">
                {patients.filter((p) => p.status === "active").length}
              </h3>
            </div>
            <UserCheck className="h-10 w-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inaktive Patienten</p>
              <h3 className="text-2xl font-bold text-gray-600">
                {patients.filter((p) => p.status === "inactive").length}
              </h3>
            </div>
            <UserX className="h-10 w-10 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Patient suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Lädt Patienten...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Patienten gefunden</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kontakt
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
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {patient.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {patient.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {patient.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          patient.status === "active" ? "default" : "secondary"
                        }
                        className={
                          patient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {patient.status === "active" ? (
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
                            handleToggleStatus(patient.id, patient.status)
                          }
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/users/edit/${patient.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(patient.id, patient.name)
                          }
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
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="Patient löschen"
        description={`Sind Sie sicher, dass Sie ${deleteDialog.userName} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Löschen"
        cancelText="Abbrechen"
      />
    </div>
  );
}
