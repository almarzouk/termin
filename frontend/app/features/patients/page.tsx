import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  FileText,
  Search,
  Calendar,
  Bell,
  Shield,
  Smartphone,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function PatientsPage() {
  const features = [
    {
      icon: FileText,
      title: "Zentrale Patientenakte",
      description:
        "Alle Patientendaten, Behandlungshistorie und Dokumente an einem Ort",
    },
    {
      icon: Search,
      title: "Schnelle Suche",
      description:
        "Finden Sie Patienten in Sekunden durch intelligente Suchfunktionen",
    },
    {
      icon: Calendar,
      title: "Terminhistorie",
      description:
        "Vollständige Übersicht über vergangene und zukünftige Termine",
    },
    {
      icon: Bell,
      title: "Automatische Erinnerungen",
      description:
        "Patienten werden automatisch an Termine und Folgetermine erinnert",
    },
    {
      icon: Shield,
      title: "DSGVO-konform",
      description: "Höchste Sicherheitsstandards für sensible Patientendaten",
    },
    {
      icon: Smartphone,
      title: "Mobiler Zugriff",
      description: "Zugriff auf Patienteninformationen von jedem Gerät",
    },
  ];

  const benefits = [
    {
      title: "Zeitersparnis",
      description:
        "Bis zu 5 Stunden pro Woche durch digitale Patientenverwaltung",
    },
    {
      title: "Fehlerreduktion",
      description: "Weniger Fehler durch automatische Datenvalidierung",
    },
    {
      title: "Besserer Überblick",
      description: "Alle relevanten Informationen auf einen Blick",
    },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Users}
        title="Intelligente Patientenverwaltung"
        description="Verwalten Sie alle Patientendaten zentral, sicher und effizient. Mehr Zeit für die Behandlung, weniger Zeit für die Verwaltung."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Funktionen", href: "/#features" },
          { label: "Patientenverwaltung", href: "/features/patients" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Alles für effiziente Patientenverwaltung
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Von der Ersterfassung bis zur langfristigen Betreuung – alles in
              einem System
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

      {/* Demo Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Patientendaten immer im Blick
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Vollständige Patientenhistorie
                    </h3>
                    <p className="text-gray-600">
                      Alle Termine, Behandlungen, Diagnosen und Notizen
                      chronologisch aufbereitet
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Dokumentenmanagement</h3>
                    <p className="text-gray-600">
                      Befunde, Röntgenbilder und andere Dokumente direkt bei der
                      Patientenakte
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Intelligente Suche</h3>
                    <p className="text-gray-600">
                      Finden Sie Patienten nach Name, Geburtsdatum,
                      Versicherungsnummer oder Telefon
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Datenexport</h3>
                    <p className="text-gray-600">
                      Exportieren Sie Patientendaten für Überweisungen oder
                      Abrechnungen
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white shadow-lg">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">
                    Beispiel Patientenakte
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">Max Mustermann</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Geburtsdatum</p>
                      <p className="font-medium">15.03.1985</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Versicherung</p>
                      <p className="font-medium">AOK</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telefon</p>
                      <p className="font-medium">0173 1234567</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Letzte Termine</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Kontrolluntersuchung</span>
                      <span className="text-gray-500">15.11.2024</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Zahnreinigung</span>
                      <span className="text-gray-500">20.08.2024</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>Füllungsbehandlung</span>
                      <span className="text-gray-500">12.05.2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ihre Vorteile auf einen Blick
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit für digitale Patientenverwaltung?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Starten Sie jetzt und erleben Sie, wie einfach Patientenverwaltung
            sein kann
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
