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

export default function EditClinicPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    description: "",
    logo: "",
    status: "active",
  });

  useEffect(() => {
    fetchClinic();
  }, [clinicId]);

  const fetchClinic = async () => {
    try {
      setFetching(true);
      const response = await api.admin.clinics.getById(Number(clinicId));
      const clinic = response.data;
      setFormData({
        name: clinic.name || "",
        email: clinic.email || "",
        phone: clinic.phone || "",
        address: clinic.address || "",
        city: clinic.city || "",
        country: clinic.country || "",
        website: clinic.website || "",
        description: clinic.description || "",
        logo: clinic.logo || "",
        status: clinic.status || "active",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Klinik konnte nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "❌ Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "❌ Fehler",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
        variant: "destructive",
      });
      return;
    }

    // Website URL validation (if provided)
    if (formData.website) {
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(formData.website)) {
        toast({
          title: "❌ Fehler",
          description: "Website muss mit http:// oder https:// beginnen",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);
      await api.admin.clinics.update(Number(clinicId), formData);
      toast({
        title: "✅ Erfolg",
        description: `Klinik ${formData.name} wurde erfolgreich aktualisiert`,
        variant: "success",
      });
      router.push("/admin/clinics");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Klinik konnte nicht aktualisiert werden",
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
          <p className="text-gray-600">Lädt Klinikdaten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/clinics">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Klinik bearbeiten</h1>
        <p className="text-gray-600 mt-1">Aktualisieren Sie die Klinikdaten</p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Klinikname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="z.B. Praxis Dr. Müller"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-Mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="z.B. info@praxis-mueller.de"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="z.B. +49 123 456789"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="z.B. Hauptstraße 123"
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="z.B. Berlin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="z.B. Deutschland"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="z.B. https://www.praxis-mueller.de"
            />
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              name="logo"
              type="url"
              value={formData.logo}
              onChange={handleChange}
              placeholder="z.B. https://example.com/logo.png"
            />
            <p className="text-sm text-gray-500">
              Geben Sie die URL des Klinik-Logos ein
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Beschreiben Sie die Klinik..."
              rows={4}
              className="resize-none"
            />
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
            <Link href="/admin/clinics">
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
