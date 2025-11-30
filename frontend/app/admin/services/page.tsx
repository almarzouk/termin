"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  Building,
  Euro,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    serviceId: null as number | null,
    serviceName: "",
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedClinic]);

  const fetchClinics = async () => {
    try {
      const response = await api.admin.clinics.getAll();
      const clinicsData = response.data?.data || response.data || [];
      setClinics(Array.isArray(clinicsData) ? clinicsData : []);
    } catch (error) {
      console.error("Clinics fetch error:", error);
      setClinics([]);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.admin.services.getAll({
        search: searchTerm || undefined,
        clinic_id: selectedClinic ? Number(selectedClinic) : undefined,
      });
      const servicesData = response.data?.data || response.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Dienste konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await api.admin.services.toggleStatus(id);
      toast({
        title: "✅ Erfolg",
        description: "Dienststatus erfolgreich aktualisiert",
        variant: "success",
      });
      fetchServices();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ open: true, serviceId: id, serviceName: name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.admin.services.delete(deleteDialog.serviceId!);
      toast({
        title: "✅ Gelöscht",
        description: `${deleteDialog.serviceName} wurde erfolgreich gelöscht`,
        variant: "success",
      });
      setDeleteDialog({ open: false, serviceId: null, serviceName: "" });
      fetchServices();
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
            Dienste & Leistungen
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle medizinischen Dienste
          </p>
        </div>
        <Link href="/admin/services/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Dienst hinzufügen
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Dienste suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Kliniken</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Lädt Dienste...</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Dienste gefunden
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedClinic
              ? "Versuchen Sie andere Filter"
              : "Fügen Sie Ihren ersten Dienst hinzu"}
          </p>
          <Link href="/admin/services/add">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Dienst hinzufügen
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                  <Badge
                    variant={
                      service.status === "active" ? "default" : "secondary"
                    }
                    className={
                      service.status === "active"
                        ? "bg-white/20 text-white border-white/40"
                        : "bg-white/10 text-white/70"
                    }
                  >
                    {service.status === "active" ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Clinic */}
                {service.clinic && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{service.clinic.name}</span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center text-sm text-gray-600">
                  <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-gray-900">
                    {service.price ? `€${service.price}` : "Preis auf Anfrage"}
                  </span>
                </div>

                {/* Duration */}
                {service.duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{service.duration} Minuten</span>
                  </div>
                )}

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleToggleStatus(service.id, service.status)
                    }
                  >
                    <Power className="h-4 w-4 mr-1" />
                    {service.status === "active"
                      ? "Deaktivieren"
                      : "Aktivieren"}
                  </Button>
                  <Link href={`/admin/services/edit/${service.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(service.id, service.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
          setDeleteDialog({ open: false, serviceId: null, serviceName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Dienst löschen?"
        description={`Möchten Sie ${deleteDialog.serviceName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
