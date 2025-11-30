"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, User, Activity } from "lucide-react";

const beds = [
  {
    id: 1,
    number: "101",
    type: "Privat",
    department: "Kardiologie",
    patient: "Emma Becker",
    status: "Belegt",
  },
  {
    id: 2,
    number: "102",
    type: "Privat",
    department: "Kardiologie",
    patient: null,
    status: "Verfügbar",
  },
  {
    id: 3,
    number: "103",
    type: "Allgemein",
    department: "Kardiologie",
    patient: "Felix Schneider",
    status: "Belegt",
  },
  {
    id: 4,
    number: "201",
    type: "Privat",
    department: "Neurologie",
    patient: "Sophie Meyer",
    status: "Belegt",
  },
  {
    id: 5,
    number: "202",
    type: "Allgemein",
    department: "Neurologie",
    patient: null,
    status: "Verfügbar",
  },
  {
    id: 6,
    number: "203",
    type: "Allgemein",
    department: "Neurologie",
    patient: "Lukas Richter",
    status: "Belegt",
  },
  {
    id: 7,
    number: "301",
    type: "Privat",
    department: "Pädiatrie",
    patient: null,
    status: "Wartung",
  },
  {
    id: 8,
    number: "302",
    type: "Privat",
    department: "Pädiatrie",
    patient: "Hannah Koch",
    status: "Belegt",
  },
  {
    id: 9,
    number: "303",
    type: "Allgemein",
    department: "Pädiatrie",
    patient: null,
    status: "Verfügbar",
  },
  {
    id: 10,
    number: "401",
    type: "Privat",
    department: "Orthopädie",
    patient: "Noah Bauer",
    status: "Belegt",
  },
  {
    id: 11,
    number: "402",
    type: "Allgemein",
    department: "Orthopädie",
    patient: null,
    status: "Verfügbar",
  },
  {
    id: 12,
    number: "403",
    type: "Allgemein",
    department: "Orthopädie",
    patient: null,
    status: "Verfügbar",
  },
];

export default function BedManagerPage() {
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "Belegt").length;
  const availableBeds = beds.filter((b) => b.status === "Verfügbar").length;
  const maintenanceBeds = beds.filter((b) => b.status === "Wartung").length;
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Belegt":
        return "bg-red-100 text-red-700";
      case "Verfügbar":
        return "bg-green-100 text-green-700";
      case "Wartung":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBedTypeColor = (type: string) => {
    return type === "Privat"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Bettenverwaltung
        </h1>
        <p className="text-gray-600 mt-1">
          Überwachen Sie die Bettenbelegung im Krankenhaus
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{totalBeds}</p>
            </div>
            <BedDouble className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belegt</p>
              <p className="text-2xl font-bold text-red-600">{occupiedBeds}</p>
            </div>
            <User className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verfügbar</p>
              <p className="text-2xl font-bold text-green-600">
                {availableBeds}
              </p>
            </div>
            <BedDouble className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wartung</p>
              <p className="text-2xl font-bold text-orange-600">
                {maintenanceBeds}
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belegung</p>
              <p className="text-2xl font-bold text-blue-600">
                {occupancyRate}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">
                {occupancyRate}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {beds.map((bed) => (
          <Card
            key={bed.id}
            className={`p-6 transition-all hover:shadow-lg ${
              bed.status === "Belegt"
                ? "border-red-200 bg-red-50"
                : bed.status === "Verfügbar"
                ? "border-green-200 bg-green-50"
                : "border-orange-200 bg-orange-50"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BedDouble className="h-8 w-8 text-gray-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Bett {bed.number}
                  </h3>
                  <p className="text-sm text-gray-600">{bed.department}</p>
                </div>
              </div>
              <Badge className={getStatusColor(bed.status)}>{bed.status}</Badge>
            </div>

            <div className="space-y-2">
              <Badge className={getBedTypeColor(bed.type)} variant="outline">
                {bed.type}
              </Badge>
              {bed.patient ? (
                <div className="pt-3 border-t mt-3">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">{bed.patient}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 pt-3 border-t mt-3">
                  Kein Patient
                </p>
              )}
            </div>

            {bed.status === "Verfügbar" && (
              <Button
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                Patient zuweisen
              </Button>
            )}
            {bed.status === "Belegt" && (
              <Button variant="outline" className="w-full mt-4" size="sm">
                Details anzeigen
              </Button>
            )}
            {bed.status === "Wartung" && (
              <Button
                variant="outline"
                className="w-full mt-4 text-green-600"
                size="sm"
              >
                Wartung abschließen
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
