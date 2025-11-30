import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Users,
  BarChart3,
  Smartphone,
  Mail,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function TimeBenefitsPage() {
  const timesSavers = [
    {
      icon: Calendar,
      title: "Automatische Terminbuchung",
      description:
        "Patienten buchen selbst online – kein Telefon, keine Wartezeit",
      timeSaved: "5h / Woche",
    },
    {
      icon: Mail,
      title: "Automatische Erinnerungen",
      description: "Keine manuellen Anrufe oder SMS mehr – alles automatisch",
      timeSaved: "3h / Woche",
    },
    {
      icon: Users,
      title: "Digitale Patientenverwaltung",
      description: "Schneller Zugriff auf alle Daten ohne Papier und Suchen",
      timeSaved: "4h / Woche",
    },
    {
      icon: BarChart3,
      title: "Automatische Reports",
      description: "Berichte und Statistiken werden automatisch erstellt",
      timeSaved: "2h / Woche",
    },
  ];

  const stats = [
    { number: "14h", label: "Zeitersparnis pro Woche" },
    { number: "60%", label: "Weniger Telefonate" },
    { number: "90%", label: "Schnellere Terminvergabe" },
    { number: "100%", label: "Automatisierung" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Clock}
        title="Sparen Sie wertvolle Zeit"
        description="Bis zu 14 Stunden pro Woche durch intelligente Automatisierung. Mehr Zeit für das Wesentliche: Ihre Patienten."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Vorteile", href: "/#benefits" },
          { label: "Zeitersparnis", href: "/benefits/time" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Time Savers Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Wo Sie Zeit sparen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automatisieren Sie repetitive Aufgaben und konzentrieren Sie sich
              auf Ihre Kernkompetenz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {timesSavers.map((saver, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <saver.icon className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{saver.title}</h3>
                      <span className="text-green-600 font-bold text-sm whitespace-nowrap ml-4">
                        {saver.timeSaved}
                      </span>
                    </div>
                    <p className="text-gray-600">{saver.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Messbare Zeitersparnis
            </h2>
            <p className="text-lg text-gray-600">
              Unsere Kunden berichten durchschnittlich von diesen Verbesserungen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center bg-white">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Vorher vs. Nachher
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-red-500">✗</span> Ohne MeinTermin
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">—</span>
                  <div>
                    <p className="font-semibold">
                      15+ Stunden pro Woche am Telefon
                    </p>
                    <p className="text-gray-600 text-sm">
                      Terminvereinbarungen, Änderungen, Erinnerungen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">—</span>
                  <div>
                    <p className="font-semibold">Manuelle Terminerinnerungen</p>
                    <p className="text-gray-600 text-sm">
                      Zeitaufwändige Anrufe einen Tag vorher
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">—</span>
                  <div>
                    <p className="font-semibold">Papierbasierte Verwaltung</p>
                    <p className="text-gray-600 text-sm">
                      Suchen, sortieren, archivieren
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-1">—</span>
                  <div>
                    <p className="font-semibold">Hohe No-Show-Rate</p>
                    <p className="text-gray-600 text-sm">
                      15-20% Terminausfälle ohne Absage
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle2 className="text-green-600" /> Mit MeinTermin
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">24/7 Online-Terminbuchung</p>
                    <p className="text-gray-600 text-sm">
                      Patienten buchen selbstständig – kein Telefonat nötig
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Automatische SMS & E-Mail</p>
                    <p className="text-gray-600 text-sm">
                      System erinnert vollautomatisch – Sie tun nichts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">
                      Digitale Patientenverwaltung
                    </p>
                    <p className="text-gray-600 text-sm">
                      Alles digital, sofort auffindbar, überall verfügbar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Nur 3-5% No-Shows</p>
                    <p className="text-gray-600 text-sm">
                      Dank automatischer Erinnerungen drastisch reduziert
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            14 Stunden pro Woche = 728 Stunden pro Jahr
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Das entspricht über 18 Arbeitswochen, die Sie für wichtigere Dinge
            nutzen können
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">728h</div>
              <div className="text-sm opacity-90">Gesparte Zeit jährlich</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">18+</div>
              <div className="text-sm opacity-90">Arbeitswochen eingespart</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-sm opacity-90">Automatisierungsgrad</div>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Jetzt Zeit sparen
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
