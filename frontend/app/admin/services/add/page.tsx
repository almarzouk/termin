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
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await api.admin.clinics.getAll();
      setClinics(response.data || []);
    } catch (error) {
      console.error("Clinics fetch error:", error);
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
      const response = await api.admin.services.create(formData);
      toast({
        title: "✅ Erfolg",
        description: `Dienst ${formData.name} wurde erfolgreich erstellt`,
        variant: "success",
      });
      router.push("/admin/services");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description:
          error.response?.data?.message ||
          "Dienst konnte nicht erstellt werden",
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
        <h1 className="text-3xl font-bold text-gray-900">Dienst hinzufügen</h1>
        <p className="text-gray-600 mt-1">Erstellen Sie einen neuen Dienst</p>
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
              {loading ? "Wird gespeichert..." : "Dienst erstellen"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
