"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";

export default function PatientPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    patientId: number | null;
    patientName: string;
  }>({ open: false, patientId: null, patientName: "" });

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  // Helper function to calculate age from date of birth
  const calculateAge = (dob: string | null | undefined): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Helper function to normalize patient data
  const normalizePatient = (patient: any) => {
    const age = calculateAge(patient.date_of_birth || patient.dob);
    return {
      ...patient,
      name:
        patient.name ||
        `${patient.first_name || ""} ${patient.last_name || ""}`.trim(),
      bloodGroup:
        patient.blood_type || patient.blood_group || patient.bloodGroup,
      image:
        patient.photo ||
        patient.image ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${
          patient.first_name || patient.id
        }`,
      age: age,
      dob: patient.date_of_birth || patient.dob,
      status: patient.status || "Aktiv",
      lastVisit: patient.last_visit || patient.lastVisit,
    };
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patients.getAll({
        page: currentPage,
        search: searchTerm || undefined,
      });

      console.log("Patients API Response:", response);

      // التعامل مع الـ response structure المختلف
      let patientsData = [];
      let lastPage = 1;

      if (response.data) {
        // إذا كان response.data يحتوي على data (nested structure)
        if (response.data.data && Array.isArray(response.data.data)) {
          patientsData = response.data.data.map(normalizePatient);
          lastPage = response.data.last_page || 1;
        }
        // إذا كان response.data هو array مباشرة
        else if (Array.isArray(response.data)) {
          patientsData = response.data.map(normalizePatient);
          lastPage = response.last_page || 1;
        }
      }
      // إذا كان response نفسه يحتوي على data
      else if (Array.isArray(response)) {
        patientsData = response.map(normalizePatient);
      }

      if (patientsData.length > 0) {
        setPatients(patientsData);
        setTotalPages(lastPage);
      } else {
        console.log("No patients data, using dummy data");
        setPatients(getDummyPatients());
      }
    } catch (err: any) {
      console.error("Error fetching patients:", err);
      setError(err.message || "Fehler beim Laden der Patientenliste");
      setPatients(getDummyPatients());
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, patientId: id, patientName: name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.patientId) return;

    try {
      await api.patients.delete(deleteDialog.patientId);

      toast({
        title: "✅ Patient gelöscht",
        description: `${deleteDialog.patientName} wurde erfolgreich gelöscht`,
        variant: "success",
      });

      setDeleteDialog({ open: false, patientId: null, patientName: "" });
      fetchPatients();
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description: err.message || "Der Patient konnte nicht gelöscht werden",
        variant: "destructive",
      });
      setDeleteDialog({ open: false, patientId: null, patientName: "" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients();
  };

  const getDummyPatients = () => [
    {
      id: 1,
      name: "Emma Becker",
      age: 28,
      dob: "15.03.1996",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      email: "emma.becker@email.de",
      phone: "+49 30 11111111",
      bloodGroup: "A+",
      lastVisit: "20.11.2025",
      status: "Aktiv",
    },
    {
      id: 2,
      name: "Felix Schneider",
      age: 45,
      dob: "22.08.1979",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      email: "felix.schneider@email.de",
      phone: "+49 30 22222222",
      bloodGroup: "O+",
      lastVisit: "18.11.2025",
      status: "Aktiv",
    },
    {
      id: 3,
      name: "Sophie Meyer",
      age: 32,
      dob: "10.11.1992",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      email: "sophie.meyer@email.de",
      phone: "+49 30 33333333",
      bloodGroup: "B+",
      lastVisit: "25.11.2025",
      status: "Aktiv",
    },
    {
      id: 4,
      name: "Lukas Richter",
      age: 56,
      dob: "05.04.1968",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lukas",
      email: "lukas.richter@email.de",
      phone: "+49 30 44444444",
      bloodGroup: "AB+",
      lastVisit: "15.11.2025",
      status: "Inaktiv",
    },
    {
      id: 5,
      name: "Hannah Koch",
      age: 39,
      dob: "18.09.1985",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah",
      email: "hannah.koch@email.de",
      phone: "+49 30 55555555",
      bloodGroup: "O-",
      lastVisit: "22.11.2025",
      status: "Aktiv",
    },
    {
      id: 6,
      name: "Noah Bauer",
      age: 62,
      dob: "30.12.1962",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
      email: "noah.bauer@email.de",
      phone: "+49 30 66666666",
      bloodGroup: "A-",
      lastVisit: "10.11.2025",
      status: "Aktiv",
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Patientenliste
          </h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Patienten</p>
        </div>
        <Link href="/dashboard/patient/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Patient hinzufügen
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="p-4">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Patient suchen..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            <Filter className="h-5 w-5 mr-2" />
            Suchen
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Nr.
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Patient
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Alter
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Blutgruppe
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Kontakt
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Letzter Besuch
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-600">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={patient.image} />
                          <AvatarFallback>
                            {patient.name?.split(" ")[0]?.[0] || "P"}
                            {patient.name?.split(" ")[1]?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {patient.age ? `${patient.age} Jahre` : "-"}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={patient.bloodGroup ? "" : "text-gray-400"}
                      >
                        {patient.bloodGroup || "-"}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {patient.phone}
                    </td>
                    <td className="p-4 text-gray-600">
                      {patient.lastVisit || "-"}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          patient.status === "Aktiv" ||
                          patient.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {patient.status === "active"
                          ? "Aktiv"
                          : patient.status || "Inaktiv"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/patient/edit/${patient.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleDeleteClick(patient.id, patient.name)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {patients.map((patient) => (
              <Card key={patient.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={patient.image} />
                      <AvatarFallback>
                        {patient.name?.split(" ")[0]?.[0] || "P"}
                        {patient.name?.split(" ")[1]?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.age
                          ? `${patient.age} Jahre`
                          : "Alter unbekannt"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      patient.status === "Aktiv" || patient.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {patient.status === "active"
                      ? "Aktiv"
                      : patient.status || "Inaktiv"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {patient.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Letzter Besuch: {patient.lastVisit || "-"}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Blutgruppe:</span>
                    <Badge
                      variant="outline"
                      className={patient.bloodGroup ? "" : "text-gray-400"}
                    >
                      {patient.bloodGroup || "-"}
                    </Badge>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/patient/edit/${patient.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteClick(patient.id, patient.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Zurück
              </Button>
              <span className="text-sm text-gray-600">
                Seite {currentPage} von {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteConfirm}
        title="Patient löschen?"
        description={`Möchten Sie ${deleteDialog.patientName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
