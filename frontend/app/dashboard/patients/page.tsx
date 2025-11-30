"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, Phone, Mail, Calendar, User } from "lucide-react";
import { api } from "@/lib/api";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  clinic_id: number;
  created_at: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userClinicId, setUserClinicId] = useState<number | null>(null);

  useEffect(() => {
    const initializeClinicId = async () => {
      // Get user's clinic_id
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        let clinicId = user.clinic_id;

        // If user has no clinic_id, try to get updated user data
        if (!clinicId) {
          console.log("⚠️ User has no clinic_id, fetching latest user data...");
          try {
            const meResponse: any = await api.auth.me();
            if (meResponse.user && meResponse.user.clinic_id) {
              clinicId = meResponse.user.clinic_id;
              // Update localStorage with new user data
              localStorage.setItem("user", JSON.stringify(meResponse.user));
              console.log("✅ User data updated with clinic_id:", clinicId);
            }
          } catch (meErr) {
            console.error("Error fetching user data:", meErr);
          }
        }

        setUserClinicId(clinicId);
      }
    };

    initializeClinicId();
  }, []);

  useEffect(() => {
    if (userClinicId) {
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, userClinicId]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response: any = await api.patients.getAll({
        page: currentPage,
        search: searchTerm || undefined,
      });

      // Get the data array from response
      const allPatients = response.data?.data || response.data || [];

      // Filter patients by clinic_id
      const filteredPatients = Array.isArray(allPatients)
        ? allPatients.filter(
            (patient: Patient) => patient.clinic_id === userClinicId
          )
        : [];

      setPatients(filteredPatients);
      setTotalPages(response.data?.last_page || response.last_page || 1);
      setError(null);
    } catch (err) {
      console.error("Error fetching patients:", err);
      const error = err as Error;
      setError(error.message || "Fehler beim Laden der Patientendaten");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE");
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "-";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} Jahre`;
  };

  if (!userClinicId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-orange-600">
              <p className="text-lg font-semibold">Warnung</p>
              <p className="mt-2">
                Benutzer ist keiner Klinik zugeordnet. Bitte melden Sie sich
                erneut an.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patienten</h1>
        <p className="text-gray-600">
          Verwalten Sie die Patienten Ihrer Klinik
        </p>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Suchen Sie nach Name, E-Mail oder Telefonnummer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Suchen</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {patients.length}
                </p>
                <p className="text-sm text-gray-600">Patienten</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patientenliste</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Keine Patienten gefunden</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Kontakt</TableHead>
                      <TableHead>Geburtsdatum</TableHead>
                      <TableHead>Alter</TableHead>
                      <TableHead>Geschlecht</TableHead>
                      <TableHead>Registriert</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {patient.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-700">
                                {patient.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-700">
                                {patient.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatDate(patient.date_of_birth)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {calculateAge(patient.date_of_birth)}
                        </TableCell>
                        <TableCell>
                          {patient.gender === "male"
                            ? "Männlich"
                            : patient.gender === "female"
                            ? "Weiblich"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(patient.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Zurück
                  </Button>
                  <span className="text-sm text-gray-600">
                    Seite {currentPage} von {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Weiter
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
