"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  category: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export default function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clinicId = searchParams.get("clinic");

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    service_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    // Guest fields
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    checkAuth();
    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch("http://localhost:8000/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          // Pre-fill user data
          setFormData((prev) => ({
            ...prev,
            first_name: data.name?.split(" ")[0] || "",
            last_name: data.name?.split(" ")[1] || "",
            email: data.email || "",
            phone: data.phone || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const fetchClinicData = async () => {
    try {
      setLoading(true);

      // First, get clinic slug by ID
      const clinicsListResponse = await fetch(
        `http://localhost:8000/api/public/clinics?is_active=1`
      );

      if (!clinicsListResponse.ok) {
        console.error("Failed to fetch clinics list");
        setLoading(false);
        return;
      }

      const clinicsListData = await clinicsListResponse.json();
      const clinicsList =
        clinicsListData.data?.data || clinicsListData.data || [];
      const targetClinic = clinicsList.find((c: any) => c.id == clinicId);

      if (!targetClinic) {
        console.error("Clinic not found");
        setLoading(false);
        return;
      }

      // Now fetch full clinic data using slug
      const clinicResponse = await fetch(
        `http://localhost:8000/api/public/clinics/${targetClinic.slug}`
      );

      if (!clinicResponse.ok) {
        console.error("Failed to fetch clinic details");
        setLoading(false);
        return;
      }

      const clinicData = await clinicResponse.json();

      if (clinicData.success && clinicData.data) {
        const clinicInfo = clinicData.data.clinic;
        setClinic({
          id: clinicInfo.id,
          name: clinicInfo.name,
          address: clinicInfo.address,
          phone: clinicInfo.phone,
        });

        // Extract services
        if (clinicData.data.clinic.services) {
          setServices(clinicData.data.clinic.services);
        }

        // Extract doctors from staff
        if (clinicData.data.clinic.staff) {
          const doctorsList = clinicData.data.clinic.staff
            .filter((s: any) => s.role === "doctor" && s.is_active)
            .map((s: any) => ({
              id: s.user_id,
              name: s.user?.name || "Unbekannt",
              specialty: s.specialty || "Allgemeinmedizin",
            }));
          setDoctors(doctorsList);
        }
      }
    } catch (error) {
      console.error("Error fetching clinic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint = user
        ? "http://localhost:8000/api/appointments"
        : "http://localhost:8000/api/appointments/guest";

      const appointmentData = {
        clinic_id: clinicId,
        service_id: formData.service_id,
        staff_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes,
        // Guest data (only if not logged in)
        ...(!user && {
          guest_name: `${formData.first_name} ${formData.last_name}`,
          guest_email: formData.email,
          guest_phone: formData.phone,
        }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setSuccess(true);
        setTimeout(() => {
          if (user) {
            router.push("/dashboard/appointment");
          } else {
            router.push("/");
          }
        }, 3000);
      } else {
        alert(data.message || "Fehler beim Buchen des Termins");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Fehler beim Buchen des Termins");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Wird geladen...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50">
          <Card className="p-8 max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Termin erfolgreich gebucht!
            </h2>
            <p className="text-gray-600 mb-6">
              Sie erhalten eine Bestätigungs-E-Mail mit allen Details.
            </p>
            <Link href={user ? "/dashboard/appointment" : "/"}>
              <Button className="w-full">
                {user ? "Zu meinen Terminen" : "Zur Startseite"}
              </Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!clinic) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Klinik nicht gefunden
            </h2>
            <Link href="/clinics">
              <Button>Zurück zur Kliniksuche</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/clinics/${clinic.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Klinik
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Termin buchen
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">{clinic.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <Label htmlFor="service_id">Leistung auswählen *</Label>
                    <select
                      id="service_id"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Bitte wählen...</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - €{service.price} ({service.duration}{" "}
                          Min.)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Selection */}
                  {doctors.length > 0 && (
                    <div>
                      <Label htmlFor="doctor_id">
                        Arzt auswählen (optional)
                      </Label>
                      <select
                        id="doctor_id"
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Kein Arzt ausgewählt</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialty}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="appointment_date">Datum *</Label>
                      <Input
                        id="appointment_date"
                        name="appointment_date"
                        type="date"
                        value={formData.appointment_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appointment_time">Uhrzeit *</Label>
                      <Input
                        id="appointment_time"
                        name="appointment_time"
                        type="time"
                        value={formData.appointment_time}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Guest Information (if not logged in) */}
                  {!user && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Ihre Kontaktdaten
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">Vorname *</Label>
                          <Input
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Nachname *</Label>
                          <Input
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Anmerkungen (optional)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Besondere Wünsche oder Anmerkungen..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Wird gebucht...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 mr-2" />
                        Termin verbindlich buchen
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Clinic Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h3 className="text-lg font-semibold mb-4">Klinikdetails</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">{clinic.name}</div>
                      <div className="text-gray-600">{clinic.address}</div>
                    </div>
                  </div>
                  {clinic.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <a
                        href={`tel:${clinic.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {clinic.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Wichtige Hinweise</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Bitte erscheinen Sie pünktlich zum Termin</li>
                    <li>• Bringen Sie Ihre Versichertenkarte mit</li>
                    <li>• Bei Verhinderung bitte rechtzeitig absagen</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
