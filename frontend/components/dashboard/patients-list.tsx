"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreVertical } from "lucide-react";

const patients = [
  {
    id: 1,
    name: "Anna Schmidt",
    age: 28,
    dob: "15.03.1996",
    status: "Aktiv",
    email: "anna.schmidt@email.de",
    phone: "+49 30 12345678",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
  },
  {
    id: 2,
    name: "Michael Müller",
    age: 45,
    dob: "22.08.1979",
    status: "Aktiv",
    email: "m.mueller@email.de",
    phone: "+49 30 23456789",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
  },
  {
    id: 3,
    name: "Sarah Weber",
    age: 32,
    dob: "10.11.1992",
    status: "Aktiv",
    email: "sarah.weber@email.de",
    phone: "+49 30 34567890",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 4,
    name: "Thomas Wagner",
    age: 56,
    dob: "05.04.1968",
    status: "Aktiv",
    email: "t.wagner@email.de",
    phone: "+49 30 45678901",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
  },
  {
    id: 5,
    name: "Lisa Hoffmann",
    age: 39,
    dob: "18.09.1985",
    status: "Aktiv",
    email: "lisa.hoffmann@email.de",
    phone: "+49 30 56789012",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
  },
];

export default function PatientsList() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Patientenübersicht
          </h3>
          <p className="text-sm text-gray-500">Verwalten Sie Ihre Patienten</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + Neuer Patient
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Nr.
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Alter
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Geburtsdatum
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                E-Mail-Adresse
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Telefon
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {patient.id}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={patient.image} alt={patient.name} />
                      <AvatarFallback>{patient.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900">
                      {patient.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {patient.age}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {patient.dob}
                </td>
                <td className="py-4 px-4">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    {patient.status}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {patient.email}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {patient.phone}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.image} alt={patient.name} />
                  <AvatarFallback>{patient.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-500">{patient.age} Jahre</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">
                {patient.status}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Geburtsdatum:</span> {patient.dob}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">E-Mail:</span> {patient.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Telefon:</span> {patient.phone}
              </p>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-blue-600"
              >
                <Edit className="h-4 w-4 mr-1" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Löschen
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Zeige 1 bis {patients.length} von {patients.length} Einträgen
        </p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Zurück
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-600 text-white border-blue-600"
          >
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            Weiter
          </Button>
        </div>
      </div>
    </Card>
  );
}
