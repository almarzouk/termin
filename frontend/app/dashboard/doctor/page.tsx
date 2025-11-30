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
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    doctorId: number | null;
    doctorName: string;
  }>({ open: false, doctorId: null, doctorName: "" });

  // Fetch doctors from API
  useEffect(() => {
    fetchDoctors();
  }, [currentPage, searchTerm]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.doctors.getAll({
        page: currentPage,
        search: searchTerm || undefined,
      });

      console.log("Doctors API Response:", response);

      // التعامل مع الـ response structure المختلف
      let doctorsData = [];
      let lastPage = 1;

      // إذا كان response array مباشرة (من pagination response)
      if (Array.isArray(response.data)) {
        doctorsData = response.data;
        lastPage = response.last_page || 1;
      }
      // إذا كان response نفسه array
      else if (Array.isArray(response)) {
        doctorsData = response;
      }
      // إذا كان response.data موجود
      else if (response.data) {
        doctorsData = Array.isArray(response.data) ? response.data : [];
        lastPage = response.last_page || 1;
      }

      if (doctorsData.length > 0) {
        setDoctors(doctorsData);
        setTotalPages(lastPage);
      } else {
        console.log("No doctors data, using dummy data");
        setDoctors(getDummyDoctors());
      }
    } catch (err: any) {
      console.error("Error fetching doctors:", err);
      setError(err.message || "Fehler beim Laden der Ärzteliste");
      setDoctors(getDummyDoctors());
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, doctorId: id, doctorName: name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.doctorId) return;

    try {
      await api.doctors.delete(deleteDialog.doctorId);

      toast({
        title: "✅ Arzt gelöscht",
        description: `${deleteDialog.doctorName} wurde erfolgreich gelöscht`,
        variant: "success",
      });

      setDeleteDialog({ open: false, doctorId: null, doctorName: "" });
      fetchDoctors();
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description: err.message || "Der Arzt konnte nicht gelöscht werden",
        variant: "destructive",
      });
      setDeleteDialog({ open: false, doctorId: null, doctorName: "" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDoctors();
  };

  // Dummy data fallback
  const getDummyDoctors = () => [
    {
      id: 1,
      name: "Dr. Anna Schmidt",
      specialty: "Kardiologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
      email: "anna.schmidt@hospital.de",
      phone: "+49 30 11111111",
      patients: 156,
      rating: 4.9,
      status: "Verfügbar",
    },
    {
      id: 2,
      name: "Dr. Michael Müller",
      specialty: "Neurologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      email: "m.mueller@hospital.de",
      phone: "+49 30 22222222",
      patients: 203,
      rating: 4.8,
      status: "Beschäftigt",
    },
    {
      id: 3,
      name: "Dr. Sarah Weber",
      specialty: "Pädiatrie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      email: "sarah.weber@hospital.de",
      phone: "+49 30 33333333",
      patients: 189,
      rating: 4.9,
      status: "Verfügbar",
    },
    {
      id: 4,
      name: "Dr. Thomas Wagner",
      specialty: "Orthopädie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
      email: "t.wagner@hospital.de",
      phone: "+49 30 44444444",
      patients: 167,
      rating: 4.7,
      status: "Verfügbar",
    },
    {
      id: 5,
      name: "Dr. Lisa Hoffmann",
      specialty: "Dermatologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      email: "lisa.hoffmann@hospital.de",
      phone: "+49 30 55555555",
      patients: 142,
      rating: 4.8,
      status: "Urlaub",
    },
    {
      id: 6,
      name: "Dr. Klaus Fischer",
      specialty: "Radiologie",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Klaus",
      email: "klaus.fischer@hospital.de",
      phone: "+49 30 66666666",
      patients: 178,
      rating: 4.9,
      status: "Verfügbar",
    },
  ];
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Ärzteliste
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Ärzte in Ihrem Krankenhaus
          </p>
        </div>
        <Link href="/dashboard/doctor/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Arzt hinzufügen
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
              placeholder="Arzt suchen..."
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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.image} />
                      <AvatarFallback>
                        {doctor.name.split(" ")[1]?.[0] || "D"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {doctor.specialty}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">
                          {doctor.rating || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      doctor.status === "Verfügbar"
                        ? "bg-green-100 text-green-700"
                        : doctor.status === "Beschäftigt"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {doctor.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {doctor.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {doctor.phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{doctor.patients || 0}</span>{" "}
                    Patienten
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/doctor/edit/${doctor.id}`}
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
                    onClick={() => handleDeleteClick(doctor.id, doctor.name)}
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
        title="Arzt löschen?"
        description={`Möchten Sie ${deleteDialog.doctorName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
