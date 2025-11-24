"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Calendar,
  ChevronDown,
  Stethoscope,
  Building2,
  Users,
  FileText,
  BarChart3,
  HelpCircle,
  BookOpen,
  Sparkles,
  Clock,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const megaMenus = {
    solutions: {
      title: "Lösungen",
      sections: [
        {
          title: "Nach Fachbereich",
          icon: Stethoscope,
          items: [
            { name: "Arztpraxen", href: "/praxis", icon: Stethoscope },
            { name: "Zahnärzte", href: "/zahnarzt", icon: Sparkles },
            { name: "Therapeuten", href: "/therapeuten", icon: Users },
            { name: "Kliniken", href: "/klinik", icon: Building2 },
            { name: "Tierärzte", href: "/tierarzt", icon: Users },
          ],
        },
        {
          title: "Funktionen",
          icon: Zap,
          items: [
            {
              name: "Online-Buchung",
              href: "/features/booking",
              icon: Calendar,
            },
            {
              name: "Patientenverwaltung",
              href: "/features/patients",
              icon: Users,
            },
            {
              name: "Automatische Erinnerungen",
              href: "/features/reminders",
              icon: Clock,
            },
            {
              name: "Berichte & Analysen",
              href: "/features/analytics",
              icon: BarChart3,
            },
          ],
        },
        {
          title: "Vorteile",
          icon: Sparkles,
          items: [
            { name: "Zeitersparnis", href: "/benefits/time", icon: Clock },
            { name: "Sicherheit", href: "/benefits/security", icon: Shield },
            {
              name: "Mobilfreundlich",
              href: "/benefits/mobile",
              icon: Smartphone,
            },
          ],
        },
      ],
    },
    resources: {
      title: "Ressourcen",
      sections: [
        {
          title: "Lernen",
          icon: BookOpen,
          items: [
            { name: "Blog", href: "/blog", icon: FileText },
            { name: "Hilfezentrum", href: "/help", icon: HelpCircle },
            { name: "Webinare", href: "/webinars", icon: Users },
            { name: "API Dokumentation", href: "/api-docs", icon: FileText },
          ],
        },
        {
          title: "Support",
          icon: HelpCircle,
          items: [
            { name: "Kontakt", href: "/contact", icon: Users },
            { name: "FAQ", href: "/faq", icon: HelpCircle },
            { name: "Live-Chat", href: "#", icon: Users },
          ],
        },
      ],
    },
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Mein<span className="text-blue-600">Termin</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Lösungen Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu("solutions")}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition rounded-lg hover:bg-gray-50">
                Lösungen
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Mega Menu Dropdown */}
              {activeMegaMenu === "solutions" && (
                <div className="absolute left-0 top-full pt-2 w-screen max-w-4xl">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                    <div className="grid grid-cols-3 gap-8">
                      {megaMenus.solutions.sections.map((section, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">
                              {section.title}
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition group"
                                >
                                  <item.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                  <span className="text-sm text-gray-700 group-hover:text-blue-600">
                                    {item.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {/* CTA Section in Mega Menu */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Bereit loszulegen?
                          </h4>
                          <p className="text-sm text-gray-600">
                            Starten Sie Ihre kostenlose 14-Tage-Testversion
                          </p>
                        </div>
                        <Button>Jetzt testen</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ressourcen Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaMenu("resources")}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 transition rounded-lg hover:bg-gray-50">
                Ressourcen
                <ChevronDown className="h-4 w-4" />
              </button>

              {activeMegaMenu === "resources" && (
                <div className="absolute left-0 top-full pt-2 w-96">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {megaMenus.resources.sections.map((section, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 mb-4">
                            <section.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">
                              {section.title}
                            </h3>
                          </div>
                          <ul className="space-y-2">
                            {section.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition group"
                                >
                                  <item.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                  <span className="text-sm text-gray-700 group-hover:text-blue-600">
                                    {item.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simple Links */}
            <Link
              href="/pricing"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition rounded-lg hover:bg-gray-50"
            >
              Preise
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition rounded-lg hover:bg-gray-50"
            >
              Kontakt
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Kostenlos starten</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {/* Mobile Lösungen */}
              <details className="group">
                <summary className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>Lösungen</span>
                  <ChevronDown className="h-4 w-4 group-open:rotate-180 transition" />
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  {megaMenus.solutions.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {section.title}
                      </p>
                      {section.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-blue-50 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </details>

              {/* Mobile Ressourcen */}
              <details className="group">
                <summary className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>Ressourcen</span>
                  <ChevronDown className="h-4 w-4 group-open:rotate-180 transition" />
                </summary>
                <div className="pl-4 mt-2 space-y-2">
                  {megaMenus.resources.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        {section.title}
                      </p>
                      {section.items.map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-blue-50 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </details>

              <Link
                href="/pricing"
                className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Preise
              </Link>
              <Link
                href="/contact"
                className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </Link>

              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Anmelden
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full">Kostenlos starten</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
