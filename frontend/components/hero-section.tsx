"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Star } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              ✨ Das fortschrittlichste Terminbuchungssystem
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Gesundheit pflegen,
              <br />
              <span className="text-blue-600">Leben inspirieren</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Ermöglichen Sie Ihrer Praxis eine umfassende Versorgung durch ein
              intelligentes und benutzerfreundliches Terminbuchungssystem.
              Sparen Sie Zeit, steigern Sie die Produktivität und verbessern Sie
              das Patientenerlebnis.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">150+</p>
                  <p className="text-sm text-gray-600">Registrierte Praxen</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">20+</p>
                  <p className="text-sm text-gray-600">Jahre Erfahrung</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">96%</p>
                  <p className="text-sm text-gray-600">Zufriedene Nutzer</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-lg px-8">
                <Calendar className="mr-2 h-5 w-5" />
                Jetzt Termin buchen
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Clock className="mr-2 h-5 w-5" />
                Wie es funktioniert
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  150+ vertrauenswürdige Ärzte
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-xs text-gray-600 mr-1">
                    (150+ Bewertungen)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Doctors Images */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-4">
              {/* Doctor Cards */}
              <div className="space-y-4">
                <DoctorCard
                  name="Dr. Andreas Müller"
                  specialty="Allgemeinchirurg"
                  image="/doctors/doctor-1.jpg"
                />
                <DoctorCard
                  name="Dr. Sarah Schmidt"
                  specialty="Kinderärztin"
                  image="/doctors/doctor-2.jpg"
                />
              </div>

              <div className="space-y-4 mt-8">
                <DoctorCard
                  name="Dr. Michael Wagner"
                  specialty="Kardiologe"
                  image="/doctors/doctor-3.jpg"
                  featured
                />
                <DoctorCard
                  name="Dr. Fatima Klein"
                  specialty="Zahnärztin"
                  image="/doctors/doctor-4.jpg"
                />
              </div>

              <div className="space-y-4">
                <DoctorCard
                  name="Dr. Klaus Hoffmann"
                  specialty="Augenarzt"
                  image="/doctors/doctor-5.jpg"
                />
                <DoctorCard
                  name="Dr. Nora Becker"
                  specialty="Dermatologin"
                  image="/doctors/doctor-6.jpg"
                />
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">265k</p>
                  <p className="text-sm text-gray-600">Erfolgreiche Termine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DoctorCard({
  name,
  specialty,
  image,
  featured = false,
}: {
  name: string;
  specialty: string;
  image: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
        featured ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 relative">
        {/* Placeholder for doctor image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="h-16 w-16 text-gray-400" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
        <p className="text-xs text-gray-600">{specialty}</p>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}
