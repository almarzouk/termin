"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Stethoscope,
  BedDouble,
  Activity,
  TrendingUp,
} from "lucide-react";

const departments = [
  {
    id: 1,
    name: "Kardiologie",
    icon: Activity,
    head: "Dr. Anna Schmidt",
    doctors: 12,
    patients: 156,
    beds: 45,
    occupancy: 87,
    color: "blue",
  },
  {
    id: 2,
    name: "Neurologie",
    icon: Activity,
    head: "Dr. Michael Müller",
    doctors: 10,
    patients: 203,
    beds: 38,
    occupancy: 92,
    color: "purple",
  },
  {
    id: 3,
    name: "Pädiatrie",
    icon: Users,
    head: "Dr. Sarah Weber",
    doctors: 15,
    patients: 189,
    beds: 52,
    occupancy: 78,
    color: "green",
  },
  {
    id: 4,
    name: "Orthopädie",
    icon: Stethoscope,
    head: "Dr. Thomas Wagner",
    doctors: 8,
    patients: 167,
    beds: 30,
    occupancy: 85,
    color: "orange",
  },
  {
    id: 5,
    name: "Dermatologie",
    icon: Activity,
    head: "Dr. Lisa Hoffmann",
    doctors: 6,
    patients: 142,
    beds: 20,
    occupancy: 65,
    color: "pink",
  },
  {
    id: 6,
    name: "Radiologie",
    icon: Activity,
    head: "Dr. Klaus Fischer",
    doctors: 9,
    patients: 178,
    beds: 25,
    occupancy: 88,
    color: "cyan",
  },
];

export default function DepartmentsPage() {
  const getColorClass = (color: string) => {
    const colors: any = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
      pink: "bg-pink-100 text-pink-600",
      cyan: "bg-cyan-100 text-cyan-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Abteilungen
        </h1>
        <p className="text-gray-600 mt-1">
          Übersicht aller Krankenhausabteilungen
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Abteilungen</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Ärzte</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((acc, d) => acc + d.doctors, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Patienten</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((acc, d) => acc + d.patients, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Betten</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.reduce((acc, d) => acc + d.beds, 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BedDouble className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClass(dept.color)}`}>
                <dept.icon className="h-6 w-6" />
              </div>
              <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {dept.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">Leiter: {dept.head}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ärzte</span>
                <span className="font-semibold text-gray-900">
                  {dept.doctors}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Patienten</span>
                <span className="font-semibold text-gray-900">
                  {dept.patients}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Betten</span>
                <span className="font-semibold text-gray-900">{dept.beds}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Auslastung</span>
                  <span className="font-semibold text-gray-900">
                    {dept.occupancy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.occupancy > 90
                        ? "bg-red-500"
                        : dept.occupancy > 75
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${dept.occupancy}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              Details anzeigen
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Building2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
