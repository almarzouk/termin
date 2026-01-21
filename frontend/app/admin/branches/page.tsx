"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Users,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
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

interface Branch {
  id: number;
  clinic_id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  lat: number | null;
  lng: number | null;
  is_main: boolean;
  is_active: boolean;
  opening_hours: any;
  created_at: string;
  clinic?: {
    id: number;
    name: string;
  };
}

export default function BranchesManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userClinicId, setUserClinicId] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    branchId: null as number | null,
    branchName: "",
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
        setSelectedClinic(clinicId);
      }
    }

    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchBranches();
    }
  }, [selectedClinic]);

  const fetchClinics = async () => {
    try {
      const response = await api.admin.clinics.getAll();
      const clinicsList = response.data?.data || response.data || [];
      setClinics(Array.isArray(clinicsList) ? clinicsList : []);

      // Auto-select first clinic only for super_admin
      if (
        userRole !== "clinic_owner" &&
        clinicsList.length > 0 &&
        !selectedClinic
      ) {
        setSelectedClinic(clinicsList[0].id);
      }
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Kliniken konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const fetchBranches = async () => {
    if (!selectedClinic) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/clinics/${selectedClinic}/branches`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Fehler beim Laden der Filialen");

      const data = await response.json();
      const branchesData = data.data || [];
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Filialen konnten nicht geladen werden",
        variant: "destructive",
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, branchId: id, branchName: name });
  };

  const handleDelete = async () => {
    if (!deleteDialog.branchId || !selectedClinic) return;

    try {
      await fetch(
        `http://localhost:8000/api/clinics/${selectedClinic}/branches/${deleteDialog.branchId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "✅ Erfolg",
        description: "Filiale erfolgreich gelöscht",
        variant: "success",
      });

      setDeleteDialog({ open: false, branchId: null, branchName: "" });
      fetchBranches();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Filiale konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const filteredBranches = Array.isArray(branches)
    ? branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          branch.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Filialen Verwaltung
          </h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Filialen</p>
        </div>
        <Link href="/admin/branches/add">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Neue Filiale
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Gesamtfilialen
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {Array.isArray(branches) ? branches.length : 0}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Aktive Filialen
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {Array.isArray(branches)
                  ? branches.filter((b) => b.is_active).length
                  : 0}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Städte</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {Array.isArray(branches)
                  ? new Set(branches.map((b) => b.city)).size
                  : 0}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hauptfiliale</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {Array.isArray(branches)
                  ? branches.filter((b) => b.is_main).length
                  : 0}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clinic Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klinik
            </label>
            <select
              value={selectedClinic || ""}
              onChange={(e) => setSelectedClinic(Number(e.target.value))}
              disabled={userRole === "clinic_owner"}
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
                Sie können nur Filialen Ihrer eigenen Klinik verwalten
              </p>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suchen
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Nach Name, Stadt oder Adresse suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Branches List */}
      {loading ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lädt Filialen...</p>
          </div>
        </Card>
      ) : filteredBranches.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Filialen gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Keine Filialen entsprechen Ihrer Suche"
                : "Erstellen Sie Ihre erste Filiale"}
            </p>
            {!searchTerm && (
              <Link href="/admin/branches/add">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Neue Filiale
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="p-6 hover:shadow-lg transition">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {branch.name}
                    </h3>
                    {branch.clinic && (
                      <p className="text-sm text-gray-500 mt-1">
                        {branch.clinic.name}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {branch.is_main && (
                      <Badge className="bg-blue-100 text-blue-800">Haupt</Badge>
                    )}
                    <Badge variant={branch.is_active ? "success" : "secondary"}>
                      {branch.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">
                      {branch.address}, {branch.postal_code} {branch.city}
                    </span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{branch.phone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Link
                    href={`/admin/branches/edit/${branch.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="sm"
                    onClick={() => handleDeleteClick(branch.id, branch.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Löschen
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Filiale löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Filiale &quot;{deleteDialog.branchName}&quot;
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
