"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail } from "lucide-react";

const doctors = [
  {
    name: "Dr. Andreas Müller",
    specialty: "Facharzt für Allgemeinmedizin",
    rating: 4.9,
    reviews: 127,
    initials: "AM",
    color: "bg-blue-500",
  },
  {
    name: "Dr. Sarah Schmidt",
    specialty: "Internistin",
    rating: 4.8,
    reviews: 98,
    initials: "SS",
    color: "bg-purple-500",
  },
  {
    name: "Dr. Michael Wagner",
    specialty: "Allgemeinchirurg",
    rating: 5.0,
    reviews: 156,
    initials: "MW",
    color: "bg-green-500",
  },
];

const nurses = [
  {
    name: "Schwester Fatima",
    specialty: "Intensivpflege",
    experience: "8 Jahre",
    initials: "F",
    color: "bg-pink-500",
  },
  {
    name: "Pfleger Josef",
    specialty: "Notaufnahme",
    experience: "6 Jahre",
    initials: "J",
    color: "bg-orange-500",
  },
  {
    name: "Schwester Nora",
    specialty: "Kinderkrankenpflege",
    experience: "5 Jahre",
    initials: "N",
    color: "bg-indigo-500",
  },
];

export default function TeamSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">
            Unser medizinisches Team
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hochqualifiziertes Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wir sind stolz auf unser Team von erfahrenen Ärzten und
            Pflegepersonal mit hervorragenden Qualifikationen, die sich für die
            beste Gesundheitsversorgung einsetzen.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Unsere herausragenden Ärzte
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4 ring-4 ring-white">
                      <AvatarFallback
                        className={`${doctor.color} text-white text-2xl`}
                      >
                        {doctor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{doctor.specialty}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(doctor.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {doctor.rating} ({doctor.reviews} Bewertungen)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Anrufen
                    </button>
                    <button className="flex-1 border-2 border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:border-gray-300 transition flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      Nachricht
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Nurses & Staff */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Qualifiziertes Pflegepersonal
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {nurses.map((nurse, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-none"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback
                      className={`${nurse.color} text-white text-lg`}
                    >
                      {nurse.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {nurse.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {nurse.specialty}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Erfahrung {nurse.experience}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold mb-2">265K</p>
                <p className="text-blue-100">Zufriedene Patienten</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl">
                <Star className="h-12 w-12" />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-green-600 to-teal-600 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold mb-2">96%</p>
                <p className="text-green-100">Zufriedenheitsrate</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl">
                <Badge className="bg-white text-green-600 text-3xl px-4 py-2">
                  ✓
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
