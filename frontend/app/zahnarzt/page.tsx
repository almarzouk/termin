import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
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

export default function ZahnarztPage() {
  const features = [
    {
      icon: Calendar,
      title: "Online-Terminbuchung",
      description:
        "Patienten buchen Termine 24/7 online – für Kontrollen, Prophylaxe oder Behandlungen.",
    },
    {
      icon: Users,
      title: "Patientenverwaltung",
      description:
        "Zentrale Verwaltung aller Patientendaten mit Behandlungshistorie und Zahlungsstatus.",
    },
    {
      icon: Clock,
      title: "Automatische Erinnerungen",
      description:
        "SMS- und E-Mail-Erinnerungen für Termine und Recall-Termine reduzieren No-Shows erheblich.",
    },
    {
      icon: BarChart3,
      title: "Praxis-Analytics",
      description:
        "Detaillierte Auswertungen zu Auslastung, Behandlungsarten und Umsatzentwicklung.",
    },
    {
      icon: Shield,
      title: "DSGVO-konform",
      description:
        "Höchste Sicherheitsstandards für sensible Patientendaten in Ihrer Zahnarztpraxis.",
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description:
        "Zugriff auf Terminkalender und Patientendaten von überall – auch unterwegs.",
    },
  ];

  const stats = [
    { number: "300+", label: "Zahnarztpraxen" },
    { number: "75%", label: "Weniger No-Shows" },
    { number: "8h", label: "Zeitersparnis pro Woche" },
    { number: "99.9%", label: "Verfügbarkeit" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Calendar}
        title="Terminverwaltung für Zahnarztpraxen"
        description="Optimieren Sie Ihre Zahnarztpraxis mit unserem digitalen Terminmanagement-System. Mehr Zeit für Ihre Patienten, weniger Verwaltungsaufwand."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Lösungen", href: "/#solutions" },
          { label: "Zahnarzt", href: "/zahnarzt" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Speziell für Zahnarztpraxen entwickelt
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unsere Lösung berücksichtigt die speziellen Anforderungen von
              Zahnarztpraxen
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
                Warum MeinTermin für Ihre Zahnarztpraxis?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Spezialisiert auf Zahnarztpraxen
                    </h3>
                    <p className="text-gray-600">
                      Behandlungstypen, Recall-System und GOZ-Abrechnungen
                      berücksichtigt
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Automatisches Recall-System
                    </h3>
                    <p className="text-gray-600">
                      Erinnern Sie Patienten automatisch an Kontroll- und
                      Prophylaxetermine
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Optimale Terminplanung
                    </h3>
                    <p className="text-gray-600">
                      Verschiedene Zeitslots für Kontrollen, Prophylaxe und
                      umfangreiche Behandlungen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Integration mit Praxissoftware
                    </h3>
                    <p className="text-gray-600">
                      Nahtlose Anbindung an gängige
                      Zahnarzt-Praxisverwaltungssysteme
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
                MeinTermin hat unsere Praxisorganisation revolutioniert. Die
                Online-Terminbuchung wird von unseren Patienten sehr gut
                angenommen, und das automatische Recall-System spart uns täglich
                wertvolle Zeit.
              </p>
              <div className="border-t border-white/30 pt-6 w-full">
                <p className="font-semibold text-lg">Dr. Michael Schmidt</p>
                <p className="text-blue-100">
                  Zahnarztpraxis am Marktplatz, München
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
            Bereit für die digitale Praxis?
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
