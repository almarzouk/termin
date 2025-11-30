"use client";

import { Card } from "@/components/ui/card";
import { Users, Stethoscope, UserCheck, BedDouble, TrendingUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Besucher",
    value: "4,592",
    change: "+ 15.9%",
    icon: Users,
    description: "Bleiben Sie mit Echtzeitdaten auf dem Laufenden, um die Patientenversorgung zu verbessern.",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Ärzte",
    value: "260",
    change: "+ 15.9%",
    icon: Stethoscope,
    description: "Bleiben Sie mit wichtigen Daten auf dem Laufenden, um erstklassige medizinische Versorgung zu gewährleisten.",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Patienten",
    value: "540",
    change: "+ 15.9%",
    icon: UserCheck,
    description: "Behalten Sie Patienteninformationen im Blick mit einfachem Zugriff auf personalisierte Pflege.",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "Gesamtbetten",
    value: "1205",
    subtitle: "Verfügbar",
    extra: [
      { label: "Privates Bett", value: "110" },
      { label: "Allgemeines Bett", value: "215" },
    ],
    icon: BedDouble,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <span className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </span>
              )}
            </div>

            {stat.subtitle && (
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            )}

            {stat.description && (
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            )}

            {stat.extra && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                {stat.extra.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-900">
                      {item.value} Bett
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
