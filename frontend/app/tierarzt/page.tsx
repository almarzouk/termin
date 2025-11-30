import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Heart,
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

export default function TierarztPage() {
  const features = [
    {
      icon: Calendar,
      title: "Tierfreundliche Terminplanung",
      description:
        "Online-Buchung für Routineuntersuchungen, Impfungen, OPs und Notfälle.",
    },
    {
      icon: Users,
      title: "Tierpatienten-Verwaltung",
      description:
        "Zentrale Verwaltung von Tierbesitzern, mehreren Tieren pro Besitzer und Behandlungshistorie.",
    },
    {
      icon: Clock,
      title: "Impf- & Wurmkur-Erinnerungen",
      description:
        "Automatische Erinnerungen für Impfungen, Wurmkuren und Vorsorgeuntersuchungen.",
    },
    {
      icon: BarChart3,
      title: "Praxis-Analytics",
      description:
        "Auswertungen zu Tierarten, Behandlungstypen, Auslastung und Umsatzentwicklung.",
    },
    {
      icon: Shield,
      title: "DSGVO-konform",
      description:
        "Sichere Verwaltung von Tierhalter- und Patientendaten nach höchsten Standards.",
    },
    {
      icon: Smartphone,
      title: "Mobile Tierarzt-App",
      description:
        "Zugriff auf Termine und Patientendaten auch bei Hausbesuchen oder unterwegs.",
    },
  ];

  const stats = [
    { number: "200+", label: "Tierarztpraxen" },
    { number: "70%", label: "Weniger No-Shows" },
    { number: "12h", label: "Zeitersparnis pro Woche" },
    { number: "99.9%", label: "Verfügbarkeit" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Heart}
        title="Terminverwaltung für Tierarztpraxen"
        description="Spezialisierte Terminverwaltung für Tierarztpraxen und Tierkliniken. Mehr Zeit für Ihre tierischen Patienten."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Lösungen", href: "/#solutions" },
          { label: "Tierarzt", href: "/tierarzt" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Speziell für Tierarztpraxen entwickelt
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Berücksichtigt die besonderen Anforderungen der
              veterinärmedizinischen Praxis
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
                Warum MeinTermin für Ihre Tierarztpraxis?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Mehrere Tiere pro Besitzer
                    </h3>
                    <p className="text-gray-600">
                      Einfache Verwaltung von Familien mit mehreren Haustieren
                      und deren individuellen Terminen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Intelligente Impferinnerungen
                    </h3>
                    <p className="text-gray-600">
                      Automatisches Recall-System für Impfungen, Wurmkuren und
                      jährliche Check-ups
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Notfall-Terminslots</h3>
                    <p className="text-gray-600">
                      Separate Zeitfenster für Notfälle und planbare
                      Behandlungen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">GOT-Abrechnung</h3>
                    <p className="text-gray-600">
                      Unterstützung für tierärztliche Gebührenordnung und
                      einfache Abrechnung
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
                Die Online-Terminbuchung wird von unseren Tierbesitzern sehr
                geschätzt. Die automatischen Impferinnerungen sorgen dafür, dass
                keine wichtige Vorsorge vergessen wird. Ein echter Gewinn für
                unsere Praxis!
              </p>
              <div className="border-t border-white/30 pt-6 w-full">
                <p className="font-semibold text-lg">
                  Dr. med. vet. Anna Schneider
                </p>
                <p className="text-blue-100">
                  Kleintierpraxis am Park, Stuttgart
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
            Bereit für die digitale Tierarztpraxis?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Starten Sie jetzt Ihre kostenlose 14-Tage-Testphase – ohne
            Kreditkarte, ohne Risiko
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
          >
            Jetzt kostenlos testen
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
