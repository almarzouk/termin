"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  Mail,
  Phone,
  MapPin,
  Globe,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ClinicsManagementPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userClinicId, setUserClinicId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    clinicId: null as number | null,
    clinicName: "",
  });

  useEffect(() => {
    // Get user's clinic_id and role
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserClinicId(user.clinic_id);
      setUserRole(user.roles && user.roles.length > 0 ? user.roles[0] : null);
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchClinics();
    }
  }, [searchTerm, userRole, userClinicId]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await api.admin.clinics.getAll({
        search: searchTerm || undefined,
      });
      // Handle both paginated and direct array responses
      const clinicsData = response.data?.data || response.data || [];
      let clinicsList = Array.isArray(clinicsData) ? clinicsData : [];

      // Filter by clinic_id if user is clinic_owner (not super_admin)
      if (userRole === "clinic_owner" && userClinicId) {
        clinicsList = clinicsList.filter(
          (clinic: any) => clinic.id === userClinicId
        );
      }

      setClinics(clinicsList);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Kliniken konnten nicht geladen werden",
        variant: "destructive",
      });
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await api.admin.clinics.toggleStatus(id);
      toast({
        title: "✅ Erfolg",
        description: "Status erfolgreich aktualisiert",
        variant: "success",
      });
      fetchClinics();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, clinicId: id, clinicName: name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.admin.clinics.delete(deleteDialog.clinicId!);
      toast({
        title: "✅ Gelöscht",
        description: `${deleteDialog.clinicName} wurde erfolgreich gelöscht`,
        variant: "success",
      });
      setDeleteDialog({ open: false, clinicId: null, clinicName: "" });
      fetchClinics();
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
            Kliniken Verwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Kliniken im System
          </p>
        </div>
        <Link href="/admin/clinics/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Klinik hinzufügen
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Klinik suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Clinics Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Lädt Kliniken...</p>
        </div>
      ) : clinics.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Kliniken gefunden
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Versuchen Sie einen anderen Suchbegriff"
              : "Fügen Sie Ihre erste Klinik hinzu"}
          </p>
          <Link href="/admin/clinics/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Klinik hinzufügen
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="overflow-hidden">
              {/* Clinic Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {clinic.name}
                      </h3>
                      <Badge
                        variant={
                          clinic.status === "active" ? "default" : "secondary"
                        }
                        className={
                          clinic.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {clinic.status === "active" ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinic Details */}
              <div className="p-6 space-y-3">
                {clinic.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {clinic.email}
                  </div>
                )}
                {clinic.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {clinic.phone}
                  </div>
                )}
                {clinic.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {clinic.address}
                  </div>
                )}
                {clinic.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      Website besuchen
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleStatus(clinic.id, clinic.status)}
                >
                  <Power className="h-4 w-4 mr-1" />
                  {clinic.status === "active" ? "Deaktivieren" : "Aktivieren"}
                </Button>
                <Link href={`/admin/clinics/${clinic.id}`}>
                  <Button variant="outline" size="sm" title="Details ansehen">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/clinics/edit/${clinic.id}`}>
                  <Button variant="outline" size="sm" title="Bearbeiten">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(clinic.id, clinic.name)}
                  className="text-red-600 hover:text-red-700"
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open &&
          setDeleteDialog({ open: false, clinicId: null, clinicName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Klinik löschen?"
        description={`Möchten Sie ${deleteDialog.clinicName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
