import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Users,
  Calendar,
  Clock,
  Download,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function AnalyticsPage() {
  const features = [
    {
      icon: BarChart3,
      title: "Auslastungs-Analytics",
      description:
        "Übersicht über Ihre Praxisauslastung nach Tag, Woche und Monat",
    },
    {
      icon: Users,
      title: "Patienten-Insights",
      description:
        "Analysen zu Patientenfrequenz, Neupatienten und Wiederkehrrate",
    },
    {
      icon: Calendar,
      title: "Termin-Statistiken",
      description:
        "No-Show-Rate, durchschnittliche Behandlungsdauer und Termintypen",
    },
    {
      icon: Clock,
      title: "Wartezeit-Analyse",
      description:
        "Messen Sie Wartezeiten und optimieren Sie Ihre Terminplanung",
    },
    {
      icon: TrendingUp,
      title: "Umsatz-Tracking",
      description: "Übersicht über Umsatzentwicklung und Behandlungserträge",
    },
    {
      icon: Download,
      title: "Export-Funktion",
      description:
        "Exportieren Sie alle Reports als PDF oder Excel für weitere Analysen",
    },
  ];

  const metrics = [
    {
      title: "Auslastung",
      value: "87%",
      trend: "+5%",
      description: "Diese Woche",
    },
    {
      title: "No-Show-Rate",
      value: "3.2%",
      trend: "-12%",
      description: "vs. letzten Monat",
    },
    {
      title: "Neue Patienten",
      value: "42",
      trend: "+18",
      description: "Dieser Monat",
    },
    {
      title: "Ø Behandlungszeit",
      value: "24 Min",
      trend: "-2 Min",
      description: "Optimiert",
    },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={BarChart3}
        title="Umfassende Praxis-Analytics"
        description="Treffen Sie datenbasierte Entscheidungen mit detaillierten Analysen und Berichten. Optimieren Sie Ihre Praxisführung mit Echtzeit-Insights."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Funktionen", href: "/#features" },
          { label: "Analytics", href: "/features/analytics" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alle wichtigen Kennzahlen im Blick
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Von Auslastung bis Umsatz – verstehen Sie Ihre Praxis besser
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

      {/* Dashboard Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ihr Dashboard auf einen Blick
            </h2>
            <p className="text-lg text-gray-600">
              Alle wichtigen Metriken in Echtzeit visualisiert
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <Card key={index} className="p-6 bg-white">
                <div className="text-sm text-gray-500 mb-1">{metric.title}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">
                    {metric.trend}
                  </span>
                  <span className="text-gray-500">{metric.description}</span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-white shadow-lg">
            <h3 className="font-semibold text-lg mb-6">
              Beispiel: Wöchentliche Auslastung
            </h3>
            <div className="space-y-4">
              {[
                { day: "Montag", percentage: 92, appointments: 23 },
                { day: "Dienstag", percentage: 88, appointments: 22 },
                { day: "Mittwoch", percentage: 95, appointments: 24 },
                { day: "Donnerstag", percentage: 78, appointments: 19 },
                { day: "Freitag", percentage: 85, appointments: 21 },
              ].map((day, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-gray-600">
                      {day.percentage}% ({day.appointments} Termine)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Datenbasierte Entscheidungen treffen
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Optimale Personalplanung
                    </h3>
                    <p className="text-gray-600">
                      Erkennen Sie Stoßzeiten und planen Sie Ihr Team optimal
                      ein
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Umsatzpotenziale erkennen
                    </h3>
                    <p className="text-gray-600">
                      Identifizieren Sie unterausgelastete Zeiten und erhöhen
                      Sie Ihre Auslastung
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">No-Shows minimieren</h3>
                    <p className="text-gray-600">
                      Analysieren Sie Ausfallmuster und entwickeln Sie
                      Gegenmaßnahmen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Behandlungsqualität steigern
                    </h3>
                    <p className="text-gray-600">
                      Optimieren Sie Behandlungsabläufe durch Zeitanalysen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <PieChart className="h-16 w-16 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Echtzeit-Daten</h3>
              <p className="text-lg mb-6 opacity-90">
                Alle Analytics werden in Echtzeit aktualisiert und sind
                jederzeit auf allen Geräten verfügbar.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Automatische Berichterstellung</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Individuelle Dashboards</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Export als PDF oder Excel</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Historische Datenanalyse</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Verstehen Sie Ihre Praxis besser
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Starten Sie jetzt und nutzen Sie datenbasierte Insights für bessere
            Entscheidungen
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
