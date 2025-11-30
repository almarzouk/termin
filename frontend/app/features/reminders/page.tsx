import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  Mail,
  MessageSquare,
  Clock,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function RemindersPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "SMS-Erinnerungen",
      description:
        "Automatische SMS-Benachrichtigungen vor Terminen – höchste Erreichbarkeit",
    },
    {
      icon: Mail,
      title: "E-Mail-Erinnerungen",
      description:
        "Professionelle E-Mail-Erinnerungen mit allen wichtigen Termininformationen",
    },
    {
      icon: Clock,
      title: "Flexible Zeitplanung",
      description:
        "Versenden Sie Erinnerungen 24h, 48h oder 1 Woche vor dem Termin",
    },
    {
      icon: Settings,
      title: "Individuelle Vorlagen",
      description:
        "Erstellen Sie eigene Nachrichtenvorlagen für verschiedene Termintypen",
    },
    {
      icon: BarChart3,
      title: "Erfolgs-Tracking",
      description:
        "Messen Sie die Wirksamkeit Ihrer Erinnerungen und optimieren Sie",
    },
    {
      icon: Zap,
      title: "Sofort-Benachrichtigung",
      description: "Automatische Bestätigung direkt nach der Terminbuchung",
    },
  ];

  const stats = [
    { number: "80%", label: "Weniger No-Shows" },
    { number: "95%", label: "Öffnungsrate SMS" },
    { number: "5 Min", label: "Setup-Zeit" },
    { number: "∞", label: "Automatisch" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Bell}
        title="Automatische Terminerinnerungen"
        description="Reduzieren Sie No-Shows um bis zu 80% durch intelligente SMS- und E-Mail-Erinnerungen. Vollautomatisch und individuell anpassbar."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Funktionen", href: "/#features" },
          { label: "Erinnerungen", href: "/features/reminders" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Erinnerungen, die funktionieren
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Multi-Kanal-Kommunikation für maximale Termintreue Ihrer Patienten
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

      {/* How it Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              So funktioniert's
            </h2>
            <p className="text-lg text-gray-600">
              In nur 3 Schritten zu weniger No-Shows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Erinnerungen aktivieren
              </h3>
              <p className="text-gray-600">
                Wählen Sie Zeitpunkt und Kanal für Ihre automatischen
                Erinnerungen
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Vorlage anpassen</h3>
              <p className="text-gray-600">
                Personalisieren Sie die Nachrichten mit Ihrem Praxisnamen und
                Logo
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Automatisch versenden
              </h3>
              <p className="text-gray-600">
                Das System versendet alle Erinnerungen vollautomatisch zur
                richtigen Zeit
              </p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-white shadow-lg">
              <h3 className="font-semibold text-lg mb-4">
                Beispiel SMS-Erinnerung
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Von: Ihre Praxis</p>
                <p className="text-base">
                  Hallo Max Mustermann,
                  <br />
                  <br />
                  Erinnerung an Ihren Termin:
                  <br />
                  📅 Morgen, 25. Nov um 14:30 Uhr
                  <br />
                  📍 Praxis Dr. Schmidt
                  <br />
                  <br />
                  Bei Verhinderung bitte unter 030-12345 absagen.
                  <br />
                  <br />
                  Ihr Praxisteam
                </p>
              </div>
            </Card>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Messbare Erfolge
              </h3>
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
        </div>
      </section>

      {/* Benefits Checklist */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Alle Vorteile auf einen Blick
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "80% weniger No-Shows und Terminausfälle",
              "Automatischer Versand – kein manueller Aufwand",
              "Multi-Kanal: SMS, E-Mail und Push-Benachrichtigungen",
              "Individuelle Zeitplanung pro Termintyp",
              "Personalisierte Nachrichten mit Patientennamen",
              "Erfolgs-Tracking und Analytics",
              "DSGVO-konform und sicher",
              "Integration mit Online-Terminbuchung",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Schluss mit No-Shows!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Aktivieren Sie jetzt automatische Erinnerungen und sparen Sie Zeit
            und Geld
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Jetzt kostenlos testen
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
