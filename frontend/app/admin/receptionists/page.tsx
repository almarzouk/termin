"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  UserCheck,
  UserX,
  Users,
  Power,
} from "lucide-react";
import { api } from "@/lib/api";

interface Receptionist {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  roles: Array<{ id: number; name: string }>;
  created_at: string;
}

export default function ReceptionistsPage() {
  const router = useRouter();
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userClinicId, setUserClinicId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Stats
  const totalReceptionists = receptionists.length;
  const activeReceptionists = receptionists.filter(
    (r) => r.status === "active"
  ).length;
  const inactiveReceptionists = receptionists.filter(
    (r) => r.status === "inactive"
  ).length;

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
      fetchReceptionists();
    }
  }, [userRole, userClinicId]);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const response = await api.admin.users.getAll({ role: "receptionist" });
      const userData = response.data?.data || response.data || [];
      let receptionistsList = Array.isArray(userData) ? userData : [];

      if (userRole === "clinic_owner" && userClinicId) {
        receptionistsList = receptionistsList.filter(
          (receptionist: any) => receptionist.clinic_id === userClinicId
        );
      }

      setReceptionists(receptionistsList);
    } catch (error) {
      console.error("Error fetching receptionists:", error);
      setReceptionists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie diesen Rezeptionisten wirklich löschen?")) return;

    try {
      await api.admin.users.delete(id);
      fetchReceptionists();
    } catch (error) {
      console.error("Error deleting receptionist:", error);
      alert("Fehler beim Löschen des Rezeptionisten");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.admin.users.toggleStatus(id);
      fetchReceptionists();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Fehler beim Ändern des Status");
    }
  };

  // Filter receptionists
  const filteredReceptionists = receptionists.filter((receptionist) => {
    const matchesSearch =
      receptionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receptionist.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || receptionist.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="h-8 w-8 text-yellow-600" />
            Rezeptionistenverwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Rezeptionisten in Ihrem System
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/users/add?role=receptionist")}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Rezeptionisten hinzufügen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">
              Gesamtzahl Rezeptionisten
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {totalReceptionists}
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Registrierte Rezeptionisten
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Aktive Rezeptionisten
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {activeReceptionists}
            </div>
            <p className="text-xs text-green-600 mt-1">Derzeit aktiv</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900">
              Inaktive Rezeptionisten
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {inactiveReceptionists}
            </div>
            <p className="text-xs text-red-600 mt-1">Nicht verfügbar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rezeptionisten filtern</CardTitle>
          <CardDescription>
            Suchen und filtern Sie Rezeptionisten nach verschiedenen Kriterien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Nach Name oder E-Mail suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Receptionists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rezeptionistenliste</CardTitle>
          <CardDescription>
            {filteredReceptionists.length} Rezeptionist(en) gefunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Lade Rezeptionisten...</p>
            </div>
          ) : filteredReceptionists.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Keine Rezeptionisten gefunden</p>
              <Button
                onClick={() =>
                  router.push("/admin/users/add?role=receptionist")
                }
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ersten Rezeptionisten hinzufügen
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registriert</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceptionists.map((receptionist) => (
                    <TableRow key={receptionist.id}>
                      <TableCell className="font-medium">
                        #{receptionist.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">
                            {receptionist.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{receptionist.email}</TableCell>
                      <TableCell>{receptionist.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          Rezeptionist/in
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {receptionist.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800">
                            Aktiv
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Inaktiv
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(receptionist.created_at).toLocaleDateString(
                          "de-DE"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/admin/users/edit/${receptionist.id}`
                              )
                            }
                            className="hover:bg-yellow-50 hover:text-yellow-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(receptionist.id)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(receptionist.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
