"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Phone,
  Star,
  Users,
  Stethoscope,
  ArrowRight,
  Building2,
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
  zip_code: string;
  phone: string;
  status: string;
  statistics?: {
    total_doctors?: number;
    total_patients?: number;
    average_rating?: number;
    total_reviews?: number;
  };
}

export default function ClinicsListPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    filterClinics();
  }, [searchTerm, cityFilter, clinics]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/public/clinics?is_active=1",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const clinicsData = data.data?.data || data.data || [];
      setClinics(clinicsData);

      // Extract unique cities
      const uniqueCities = [
        ...new Set(clinicsData.map((c: Clinic) => c.city).filter(Boolean)),
      ];
      setCities(uniqueCities as string[]);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterClinics = () => {
    let filtered = clinics;

    if (searchTerm) {
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clinic.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          clinic.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clinic.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter((clinic) => clinic.city === cityFilter);
    }

    setFilteredClinics(filtered);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Finden Sie die beste Klinik
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Durchsuchen Sie unsere verifizierten Kliniken und buchen Sie
              online einen Termin
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Klinikname, Stadt oder Adresse suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-gray-900 border-0 focus-visible:ring-0"
                  />
                </div>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-12 px-4 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Städte</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredClinics.length} Klinik
            {filteredClinics.length !== 1 ? "en" : ""} gefunden
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Kliniken werden geladen...</p>
          </div>
        ) : filteredClinics.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Kliniken gefunden
            </h3>
            <p className="text-gray-500">
              Versuchen Sie es mit anderen Suchbegriffen
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <Card
                key={clinic.id}
                className="overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {clinic.name}
                  </h3>

                  {clinic.statistics?.average_rating &&
                  clinic.statistics.average_rating > 0 ? (
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(clinic.statistics.average_rating)}
                      <span className="text-sm text-gray-600">
                        {clinic.statistics.average_rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({clinic.statistics.total_reviews || 0} Bewertungen)
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3 text-sm text-gray-400">
                      Noch keine Bewertungen
                    </div>
                  )}

                  {clinic.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {clinic.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {clinic.address}
                        {clinic.city && `, ${clinic.city}`}
                        {clinic.zip_code && ` ${clinic.zip_code}`}
                      </span>
                    </div>
                    {clinic.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                  </div>

                  {clinic.statistics && (
                    <div className="flex gap-4 mb-4 pb-4 border-b">
                      {clinic.statistics.total_doctors && (
                        <div className="flex items-center gap-1 text-sm">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600">
                            {clinic.statistics.total_doctors} Ärzte
                          </span>
                        </div>
                      )}
                      {clinic.statistics.total_patients && (
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-gray-600">
                            {clinic.statistics.total_patients}+ Patienten
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Link href={`/clinics/${clinic.slug || clinic.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Klinik ansehen
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
