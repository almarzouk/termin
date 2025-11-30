"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Melisa Rubi",
    specialty: "Sr. Neurologe",
    rating: 4.9,
    reviews: 127,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Melisa",
    date: "20 Jul, 2026",
    times: [
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
    ],
  },
  {
    id: 2,
    name: "Dr. Josh Smith",
    specialty: "Asst. Neurologe",
    rating: 4.8,
    reviews: 98,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josh",
    date: "21 Jul, 2026",
    times: [
      "10:00 AM",
      "11:00 AM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ],
  },
  {
    id: 3,
    name: "Dr. Rubi Roy",
    specialty: "Sr. Neurologe",
    rating: 4.9,
    reviews: 156,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rubi",
    date: "22 Jul, 2026",
    times: [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
    ],
  },
];

export default function DoctorsList() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Beliebte Spezialisten
          </h3>
          <p className="text-sm text-gray-500">
            Buchen Sie Ihren Termin mit Top-Ärzten
          </p>
        </div>
        <Button variant="link" className="text-blue-600">
          Mehr ansehen →
        </Button>
      </div>

      <div className="space-y-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback>
                    {doctor.name.split(" ")[1][0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700 ml-1">
                      {doctor.rating}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({doctor.reviews} Bewertungen)
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Heart className="h-5 w-5 text-gray-400" />
              </Button>
            </div>

            {/* Date Selection */}
            <div className="flex items-center justify-between mb-3 bg-gray-50 p-3 rounded-lg">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700">
                {doctor.date}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {doctor.times.map((time, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`text-xs ${
                    index === 0
                      ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                      : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
                  }`}
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Details prüfen
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600">
                Jetzt planen
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
