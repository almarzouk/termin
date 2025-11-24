"use client";

import { Card } from "@/components/ui/card";
import {
  Calendar,
  Users,
  Clock,
  Bell,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Intelligente & flexible Buchung",
    description:
      "Ein fortschrittliches Buchungssystem, das Patienten ermöglicht, jederzeit und überall einfach Termine zu vereinbaren.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    title: "Professionelles Team-Management",
    description:
      "Verwalten Sie Ihr medizinisches Team effizient, legen Sie Arbeitszeiten, Urlaube und Fachgebiete einfach fest.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Bell,
    title: "Automatische Erinnerungen",
    description:
      "Automatische Benachrichtigungen per SMS und E-Mail zur Reduzierung von Ausfallquoten und Verbesserung der Termintreue.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: BarChart3,
    title: "Berichte & Analysen",
    description:
      "Erhalten Sie präzise Einblicke in die Leistung Ihrer Praxis, Einnahmen und Patienten durch umfassende Berichte.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Clock,
    title: "Zeitersparnis",
    description:
      "Reduzieren Sie Wartezeiten und steigern Sie die Produktivität durch Automatisierung des Buchungs- und Planungsprozesses.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Shield,
    title: "Sicherheit & Datenschutz",
    description:
      "Vollständiger Schutz der Patientendaten mit höchsten internationalen Sicherheits- und Datenschutzstandards.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Smartphone,
    title: "Mobilfreundlich",
    description:
      "Eine responsive Oberfläche, die nahtlos auf allen Geräten funktioniert - Smartphone, Tablet oder Computer.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Zap,
    title: "Blitzschnell",
    description:
      "Schnelle und zuverlässige Leistung für ein reibungsloses Erlebnis für Sie und Ihre Patienten zu jeder Zeit.",
    color: "bg-yellow-100 text-yellow-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Wir bieten eine breite Palette medizinischer Dienstleistungen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wir bieten Ihrer Praxis alle notwendigen Tools zur Bereitstellung
            umfassender und herausragender Versorgung durch vielfältige Dienste,
            die auf Ihre Bedürfnisse zugeschnitten sind.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none"
            >
              <div
                className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-6">
            Bereit, die Verwaltung Ihrer Praxis zu verbessern?
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Kostenlos testen
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition">
              Kontaktieren Sie uns
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
