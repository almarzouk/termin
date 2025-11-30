"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Calendar,
  Stethoscope,
  Users,
  Award,
  Building2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface Clinic {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: any;
  status: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  years_of_experience: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

interface Statistics {
  total_doctors: number;
  total_patients: number;
  total_appointments: number;
  average_rating: number;
  total_reviews: number;
}

export default function ClinicProfilePage() {
  const params = useParams();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchClinicData();
    }
  }, [params.slug]);

  const fetchClinicData = async () => {
    try {
      setLoading(true);

      // Fetch clinic details with reviews and statistics
      const response = await fetch(
        `http://localhost:8000/api/public/clinics/${params.slug}`
      );
      const data = await response.json();

      if (data.success) {
        setClinic(data.data.clinic);
        setReviews(data.data.reviews);
        setStatistics(data.data.statistics);

        // Extract doctors and services from clinic data
        if (data.data.clinic.staff) {
          const doctorsList = data.data.clinic.staff
            .filter((s: any) => s.role === "doctor")
            .map((s: any) => ({
              id: s.id,
              name: s.user.name,
              email: s.user.email,
              specialty: s.specialty || "Allgemeinmedizin",
              bio: s.bio || "",
              years_of_experience: s.years_of_experience || 0,
            }));
          setDoctors(doctorsList);
        }

        if (data.data.clinic.services) {
          setServices(data.data.clinic.services);
        }
      }
    } catch (error) {
      console.error("Error fetching clinic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Klinik wird geladen...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!clinic) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Klinik nicht gefunden
            </h2>
            <Link href="/clinics">
              <Button>Zurück zur Übersicht</Button>
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

      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header Section */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {clinic.name}
                </h1>
                {statistics && statistics.average_rating > 0 && (
                  <div className="flex items-center gap-3">
                    {renderStars(statistics.average_rating)}
                    <span className="text-lg font-semibold">
                      {statistics.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({statistics.total_reviews} Bewertungen)
                    </span>
                  </div>
                )}
              </div>
              <Link href={`/appointment/book?clinic=${clinic.id}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="h-5 w-5 mr-2" />
                  Termin buchen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Stethoscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.total_doctors}
                  </div>
                  <div className="text-sm text-gray-500">Ärzte</div>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.total_patients}+
                  </div>
                  <div className="text-sm text-gray-500">Patienten</div>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.total_appointments}+
                  </div>
                  <div className="text-sm text-gray-500">Termine</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">Bewertung</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Kontaktinformationen</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <div className="font-medium">Adresse</div>
                      <div className="text-gray-600 text-sm">
                        {clinic.address}
                        <br />
                        {clinic.zip_code} {clinic.city}
                        {clinic.state && `, ${clinic.state}`}
                      </div>
                    </div>
                  </div>

                  {clinic.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Telefon</div>
                        <a
                          href={`tel:${clinic.phone}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {clinic.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {clinic.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">E-Mail</div>
                        <a
                          href={`mailto:${clinic.email}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {clinic.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {clinic.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Website</div>
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {clinic.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {clinic.opening_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium mb-2">Öffnungszeiten</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Mo - Fr:</span>
                            <span>08:00 - 18:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sa:</span>
                            <span>09:00 - 13:00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>So:</span>
                            <span>Geschlossen</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Tabs */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="about">Über uns</TabsTrigger>
                  <TabsTrigger value="doctors">Ärzte</TabsTrigger>
                  <TabsTrigger value="services">Leistungen</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Bewertungen ({reviews.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Über die Klinik</h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {clinic.description ||
                        "Willkommen in unserer modernen medizinischen Einrichtung. Wir bieten umfassende Gesundheitsdienstleistungen mit einem erfahrenen Team von Fachärzten."}
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="doctors" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Unsere Ärzte</h2>
                    {doctors.length > 0 ? (
                      <div className="grid gap-4">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className="flex gap-4 p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">
                                {doctor.name}
                              </h3>
                              <Badge className="mb-2">{doctor.specialty}</Badge>
                              <p className="text-sm text-gray-600">
                                {doctor.bio}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Ärzteinformationen werden bald verfügbar sein.
                      </p>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="services" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      Unsere Leistungen
                    </h2>
                    {services.length > 0 ? (
                      <div className="grid gap-4">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold">{service.name}</h3>
                              <span className="font-bold text-blue-600">
                                €{service.price}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {service.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              Dauer: {service.duration} Min.
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        Leistungsinformationen werden bald verfügbar sein.
                      </p>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">
                      Patientenbewertungen
                    </h2>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="pb-4 border-b last:border-0"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString(
                                  "de-DE"
                                )}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">
                              {review.comment}
                            </p>
                            {review.patient && (
                              <div className="text-sm text-gray-500">
                                - {review.patient.first_name}{" "}
                                {review.patient.last_name?.[0]}.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Noch keine Bewertungen vorhanden
                        </p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
