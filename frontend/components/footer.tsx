"use client";

import Link from "next/link";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Mein<span className="text-blue-400">Termin</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Die fortschrittlichste Terminbuchungsplattform für medizinische
              Praxen. Vereinfachen Sie Ihre Terminverwaltung und verbessern Sie
              die Patientenerfahrung.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span>+49 30 1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>kontakt@meintermin.de</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span>Berliner Straße 123, 10115 Berlin</span>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Lösungen</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/praxis" className="hover:text-blue-400 transition">
                  Für Arztpraxen
                </Link>
              </li>
              <li>
                <Link href="/klinik" className="hover:text-blue-400 transition">
                  Für Kliniken
                </Link>
              </li>
              <li>
                <Link
                  href="/zahnarzt"
                  className="hover:text-blue-400 transition"
                >
                  Für Zahnärzte
                </Link>
              </li>
              <li>
                <Link
                  href="/therapeuten"
                  className="hover:text-blue-400 transition"
                >
                  Für Therapeuten
                </Link>
              </li>
              <li>
                <Link
                  href="/tierarzt"
                  className="hover:text-blue-400 transition"
                >
                  Für Tierärzte
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Ressourcen
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/hilfe" className="hover:text-blue-400 transition">
                  Hilfezentrum
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:text-blue-400 transition">
                  API Dokumentation
                </Link>
              </li>
              <li>
                <Link
                  href="/webinare"
                  className="hover:text-blue-400 transition"
                >
                  Webinare
                </Link>
              </li>
              <li>
                <Link
                  href="/erfolgsgeschichten"
                  className="hover:text-blue-400 transition"
                >
                  Erfolgsgeschichten
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Unternehmen
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/uber-uns"
                  className="hover:text-blue-400 transition"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/karriere"
                  className="hover:text-blue-400 transition"
                >
                  Karriere
                </Link>
              </li>
              <li>
                <Link href="/presse" className="hover:text-blue-400 transition">
                  Presse
                </Link>
              </li>
              <li>
                <Link
                  href="/partner"
                  className="hover:text-blue-400 transition"
                >
                  Partner werden
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="hover:text-blue-400 transition"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-semibold text-xl mb-2">
                Bleiben Sie auf dem Laufenden
              </h3>
              <p className="text-gray-400">
                Erhalten Sie die neuesten Updates, Tipps und Angebote direkt in
                Ihr Postfach.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                Abonnieren
              </Button>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <Link
                href="https://facebook.com"
                className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition"
                target="_blank"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="bg-gray-800 p-2 rounded-lg hover:bg-blue-400 transition"
                target="_blank"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com"
                className="bg-gray-800 p-2 rounded-lg hover:bg-pink-600 transition"
                target="_blank"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                className="bg-gray-800 p-2 rounded-lg hover:bg-blue-700 transition"
                target="_blank"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="https://youtube.com"
                className="bg-gray-800 p-2 rounded-lg hover:bg-red-600 transition"
                target="_blank"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>

            <div className="flex gap-6 text-sm">
              <Link
                href="/datenschutz"
                className="hover:text-blue-400 transition"
              >
                Datenschutz
              </Link>
              <Link
                href="/impressum"
                className="hover:text-blue-400 transition"
              >
                Impressum
              </Link>
              <Link href="/agb" className="hover:text-blue-400 transition">
                AGB
              </Link>
              <Link href="/cookies" className="hover:text-blue-400 transition">
                Cookie-Richtlinie
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} MeinTermin. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4">
              <img
                src="/badges/ssl-secure.svg"
                alt="SSL Secure"
                className="h-8 opacity-50"
              />
              <img
                src="/badges/gdpr-compliant.svg"
                alt="GDPR Compliant"
                className="h-8 opacity-50"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
