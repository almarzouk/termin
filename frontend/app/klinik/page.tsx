import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Building2,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Shield,
  Smartphone,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function KlinikPage() {
  const features = [
    {
      icon: Calendar,
      title: "Zentrale Terminverwaltung",
      description:
        "Koordination aller Abteilungen, Behandlungsräume und medizinischen Fachkräfte.",
    },
    {
      icon: Users,
      title: "Multi-Abteilungs-Management",
      description:
        "Verwaltung mehrerer Fachabteilungen mit individuellen Workflows und Ressourcen.",
    },
    {
      icon: Clock,
      title: "Wartelistenverwaltung",
      description:
        "Intelligente Wartelisten mit automatischer Benachrichtigung bei freien Terminen.",
    },
    {
      icon: BarChart3,
      title: "Umfassende Analytics",
      description:
        "Auslastung pro Abteilung, Behandlungsarten, Wartezeiten und Patientenströme.",
    },
    {
      icon: Shield,
      title: "Krankenhaus-Sicherheit",
      description:
        "Höchste Sicherheitsstandards und Compliance für Kliniken und Krankenhäuser.",
    },
    {
      icon: Smartphone,
      title: "Enterprise-Integration",
      description:
        "Nahtlose Integration mit KIS, Laborinformationssystemen und Abrechnungssoftware.",
    },
  ];

  const stats = [
    { number: "50+", label: "Kliniken" },
    { number: "85%", label: "Bessere Auslastung" },
    { number: "30%", label: "Kürzere Wartezeiten" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Building2}
        title="Terminverwaltung für Kliniken"
        description="Enterprise-Lösung für Krankenhäuser und große medizinische Einrichtungen. Optimieren Sie Patientenströme und Ressourcenplanung."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Lösungen", href: "/#solutions" },
          { label: "Klinik", href: "/klinik" },
        ]}
        ctaText="Jetzt Demo vereinbaren"
        ctaHref="/contact"
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Lösung für medizinische Einrichtungen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Skalierbar, sicher und speziell auf die Anforderungen von Kliniken
              zugeschnitten
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Warum MeinTermin für Ihre Klinik?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Skalierbare Enterprise-Architektur
                    </h3>
                    <p className="text-gray-600">
                      Bewältigt Tausende von Terminen täglich über mehrere
                      Abteilungen hinweg
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Abteilungsübergreifende Koordination
                    </h3>
                    <p className="text-gray-600">
                      Automatische Terminabstimmung zwischen Diagnose,
                      Behandlung und Nachsorge
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Ressourcen-Optimierung
                    </h3>
                    <p className="text-gray-600">
                      Optimale Auslastung von OP-Sälen, Behandlungsräumen und
                      medizinischem Personal
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">KIS-Integration</h3>
                    <p className="text-gray-600">
                      Nahtlose Anbindung an bestehende
                      Krankenhausinformationssysteme
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl mb-6">"</div>
              <p className="text-xl md:text-2xl mb-6 leading-relaxed">
                MeinTermin hat unsere Terminverwaltung über 5 Fachabteilungen
                hinweg revolutioniert. Die Patientenzufriedenheit ist gestiegen,
                und unsere Auslastung hat sich um 30% verbessert.
              </p>
              <div className="border-t border-white/30 pt-6 w-full">
                <p className="font-semibold text-lg">Prof. Dr. Thomas Müller</p>
                <p className="text-blue-100">
                  Ärztlicher Direktor, St. Marien Klinik, Frankfurt
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Bereit für optimierte Klinikprozesse?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Vereinbaren Sie jetzt eine persönliche Demo für Ihre Klinik
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
          >
            Demo vereinbaren
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
