import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Smartphone,
  CheckCircle2,
  Monitor,
  Tablet,
  Wifi,
  Zap,
  Cloud,
  Download,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function MobileBenefitsPage() {
  const features = [
    {
      icon: Smartphone,
      title: "Native Mobile Apps",
      description:
        "iOS und Android Apps für optimale Performance und Benutzererfahrung",
    },
    {
      icon: Monitor,
      title: "Responsive Web-App",
      description:
        "Funktioniert perfekt auf Desktop, Tablet und Smartphone im Browser",
    },
    {
      icon: Cloud,
      title: "Cloud-Synchronisation",
      description: "Alle Daten in Echtzeit auf allen Geräten synchronisiert",
    },
    {
      icon: Wifi,
      title: "Offline-Modus",
      description: "Grundfunktionen auch ohne Internetverbindung verfügbar",
    },
    {
      icon: Zap,
      title: "Push-Benachrichtigungen",
      description:
        "Sofortige Benachrichtigungen bei neuen Terminen und Änderungen",
    },
    {
      icon: Download,
      title: "Schneller Zugriff",
      description: "Alle wichtigen Funktionen mit wenigen Klicks erreichbar",
    },
  ];

  const useCases = [
    {
      title: "Hausbesuche",
      description:
        "Zugriff auf Patientendaten und Termine während Hausbesuchen",
      icon: "🏠",
    },
    {
      title: "Unterwegs",
      description: "Terminänderungen vornehmen, auch auf dem Weg zur Arbeit",
      icon: "🚗",
    },
    {
      title: "Home Office",
      description: "Vollständiger Zugriff auf alle Funktionen von zu Hause",
      icon: "💻",
    },
    {
      title: "Notfälle",
      description:
        "Schneller Zugriff auf wichtige Patienteninformationen in Notfällen",
      icon: "🚨",
    },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Smartphone}
        title="Ihre Praxis in der Hosentasche"
        description="Voller Zugriff auf Ihre Terminverwaltung von überall – auf jedem Gerät. Native Apps für iOS und Android oder im Browser."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Vorteile", href: "/#benefits" },
          { label: "Mobile", href: "/benefits/mobile" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Überall und jederzeit verfügbar
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Egal ob Smartphone, Tablet oder Desktop – MeinTermin passt sich
              Ihrem Gerät an
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

      {/* Device Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Optimiert für jedes Gerät
            </h2>
            <p className="text-lg text-gray-600">
              Nahtlose Erfahrung auf allen Plattformen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 text-center">
              <Smartphone className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smartphone</h3>
              <p className="text-gray-600 mb-4">
                Native Apps für iOS und Android mit voller Funktionalität
              </p>
              <div className="flex gap-2 justify-center">
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  App Store
                </div>
                <div className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold">
                  Play Store
                </div>
              </div>
            </Card>

            <Card className="p-8 text-center">
              <Tablet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tablet</h3>
              <p className="text-gray-600 mb-4">
                Optimierte Ansicht für große Displays und Touch-Bedienung
              </p>
              <div className="text-sm text-gray-500">
                iPad, Android Tablets, Surface
              </div>
            </Card>

            <Card className="p-8 text-center">
              <Monitor className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Desktop</h3>
              <p className="text-gray-600 mb-4">
                Vollwertige Web-App für maximale Produktivität am Arbeitsplatz
              </p>
              <div className="text-sm text-gray-500">Windows, macOS, Linux</div>
            </Card>
          </div>

          <Card className="p-8 bg-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Echtzeit-Synchronisation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">
                        Automatische Updates
                      </h4>
                      <p className="text-gray-600">
                        Änderungen erscheinen sofort auf allen Geräten
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">
                        Konfliktfreie Bearbeitung
                      </h4>
                      <p className="text-gray-600">
                        Mehrere Nutzer können gleichzeitig arbeiten
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Immer aktuell</h4>
                      <p className="text-gray-600">
                        Keine manuellen Updates oder Synchronisationen nötig
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow">
                    <Smartphone className="h-8 w-8 text-blue-600" />
                    <div className="flex-grow">
                      <div className="font-semibold">iPhone</div>
                      <div className="text-sm text-gray-600">
                        Vor 2 Sekunden
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow">
                    <Monitor className="h-8 w-8 text-blue-600" />
                    <div className="flex-grow">
                      <div className="font-semibold">Desktop PC</div>
                      <div className="text-sm text-gray-600">
                        Vor 5 Sekunden
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow">
                    <Tablet className="h-8 w-8 text-blue-600" />
                    <div className="flex-grow">
                      <div className="font-semibold">iPad</div>
                      <div className="text-sm text-gray-600">
                        Vor 8 Sekunden
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Praktische Anwendungsfälle
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Alle Vorteile mobiler Verfügbarkeit
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Zugriff von überall und jederzeit",
              "Native Apps für beste Performance",
              "Offline-Funktionalität für wichtige Features",
              "Push-Benachrichtigungen in Echtzeit",
              "Echtzeit-Synchronisation aller Daten",
              "Optimiert für Touch-Bedienung",
              "Schneller als klassische Desktop-Software",
              "Keine Installation oder Updates nötig",
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
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Smartphone className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Starten Sie jetzt mobil durch!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Erleben Sie die Freiheit, Ihre Praxis von überall zu verwalten
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
