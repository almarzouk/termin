"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Calendar,
} from "lucide-react";

const employees = [
  {
    id: 1,
    name: "Anna Schmidt",
    position: "Chefärztin Kardiologie",
    department: "Kardiologie",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
    email: "anna.schmidt@hospital.de",
    phone: "+49 30 11111111",
    joinDate: "15.01.2020",
    salary: "€8,500",
    status: "Aktiv",
  },
  {
    id: 2,
    name: "Michael Müller",
    position: "Oberarzt Neurologie",
    department: "Neurologie",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    email: "m.mueller@hospital.de",
    phone: "+49 30 22222222",
    joinDate: "20.03.2019",
    salary: "€7,200",
    status: "Aktiv",
  },
  {
    id: 3,
    name: "Sarah Weber",
    position: "Fachärztin Pädiatrie",
    department: "Pädiatrie",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    email: "sarah.weber@hospital.de",
    phone: "+49 30 33333333",
    joinDate: "10.06.2021",
    salary: "€6,800",
    status: "Aktiv",
  },
  {
    id: 4,
    name: "Thomas Wagner",
    position: "Krankenpfleger",
    department: "Notaufnahme",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    email: "t.wagner@hospital.de",
    phone: "+49 30 44444444",
    joinDate: "05.09.2018",
    salary: "€4,200",
    status: "Aktiv",
  },
  {
    id: 5,
    name: "Lisa Hoffmann",
    position: "Verwaltungsassistentin",
    department: "Administration",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    email: "lisa.hoffmann@hospital.de",
    phone: "+49 30 55555555",
    joinDate: "12.11.2022",
    salary: "€3,500",
    status: "Urlaub",
  },
];

export default function HRPage() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Personalwesen
          </h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Mitarbeiter</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Mitarbeiter suchen..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Gesamt</p>
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Ärzte</p>
          <p className="text-2xl font-bold text-blue-600">3</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pfleger</p>
          <p className="text-2xl font-bold text-green-600">1</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Verwaltung</p>
          <p className="text-2xl font-bold text-purple-600">1</p>
        </Card>
      </div>

      {/* Employees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <Card
            key={employee.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={employee.image} />
                  <AvatarFallback>{employee.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                  <Badge className="mt-1 bg-blue-100 text-blue-700">
                    {employee.department}
                  </Badge>
                </div>
              </div>
              <Badge
                className={
                  employee.status === "Aktiv"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }
              >
                {employee.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {employee.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {employee.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Beitritt: {employee.joinDate}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                Gehalt: {employee.salary}/Monat
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                Profil anzeigen
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Bearbeiten
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
