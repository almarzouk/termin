"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clinic_id: "",
    name: "",
    description: "",
    price: "",
    duration: "",
    category_id: "",
    status: "active",
  });

  useEffect(() => {
    fetchClinics();
    fetchService();
  }, [serviceId]);

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

  const fetchService = async () => {
    try {
      setFetching(true);
      const response = await api.admin.services.getById(Number(serviceId));
      const service = response.data;
      setFormData({
        clinic_id: service.clinic_id || "",
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        duration: service.duration || "",
        category_id: service.category_id || "",
        status: service.status || "active",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Dienst konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clinic_id || !formData.name) {
      toast({
        title: "❌ Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      toast({
        title: "❌ Fehler",
        description: "Preis muss eine positive Zahl sein",
        variant: "destructive",
      });
      return;
    }

    if (formData.duration && parseInt(formData.duration) < 1) {
      toast({
        title: "❌ Fehler",
        description: "Dauer muss mindestens 1 Minute betragen",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await api.admin.services.update(Number(serviceId), formData);
      toast({
        title: "✅ Erfolg",
        description: `Dienst ${formData.name} wurde erfolgreich aktualisiert`,
        variant: "success",
      });
      router.push("/admin/services");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description:
          error.response?.data?.message ||
          "Dienst konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetching) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Lädt Dienstdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/services">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Dienst bearbeiten</h1>
        <p className="text-gray-600 mt-1">Aktualisieren Sie die Dienstdaten</p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Clinic */}
          <div className="space-y-2">
            <Label htmlFor="clinic_id">
              Klinik <span className="text-red-500">*</span>
            </Label>
            <select
              id="clinic_id"
              name="clinic_id"
              value={formData.clinic_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Klinik auswählen</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Dienstname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="z.B. Allgemeine Untersuchung"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Beschreiben Sie den Dienst..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preis (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="z.B. 50.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Dauer (Minuten)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                placeholder="z.B. 30"
              />
            </div>
          </div>

          {/* Category (optional for now) */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategorie</Label>
            <Input
              id="category_id"
              name="category_id"
              type="number"
              value={formData.category_id}
              onChange={handleChange}
              placeholder="Kategorie-ID (optional)"
            />
            <p className="text-sm text-gray-500">
              Lassen Sie dieses Feld leer, wenn keine Kategorie zugeordnet ist
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Inaktiv</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/services">
              <Button type="button" variant="outline" disabled={loading}>
                Abbrechen
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Wird gespeichert..." : "Änderungen speichern"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
