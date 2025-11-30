import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  CheckCircle2,
  Lock,
  Server,
  FileCheck,
  Eye,
  AlertTriangle,
  Award,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function SecurityBenefitsPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Ende-zu-Ende-Verschlüsselung",
      description:
        "Alle Daten werden mit modernsten Verschlüsselungsstandards geschützt (AES-256)",
    },
    {
      icon: Server,
      title: "Deutsche Server-Standorte",
      description:
        "Ihre Daten bleiben in Deutschland und unterliegen deutschen Datenschutzgesetzen",
    },
    {
      icon: FileCheck,
      title: "DSGVO-Konformität",
      description: "Vollständig konform mit der EU-Datenschutzgrundverordnung",
    },
    {
      icon: Eye,
      title: "Zugriffskontrolle",
      description:
        "Detaillierte Berechtigungssysteme und Audit-Logs für jeden Zugriff",
    },
    {
      icon: AlertTriangle,
      title: "Automatische Backups",
      description: "Tägliche verschlüsselte Backups schützen vor Datenverlust",
    },
    {
      icon: Award,
      title: "ISO 27001 Zertifiziert",
      description:
        "Höchste internationale Sicherheitsstandards für Informationssicherheit",
    },
  ];

  const compliance = [
    { standard: "DSGVO", description: "EU-Datenschutzgrundverordnung" },
    { standard: "BDSG", description: "Bundesdatenschutzgesetz" },
    { standard: "ISO 27001", description: "Informationssicherheit" },
    { standard: "HIPAA", description: "Health Insurance Portability" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Shield}
        title="Maximale Sicherheit für Ihre Daten"
        description="Höchste Sicherheitsstandards für sensible Patientendaten. DSGVO-konform, verschlüsselt und auf deutschen Servern."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Vorteile", href: "/#benefits" },
          { label: "Sicherheit", href: "/benefits/security" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Security Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mehrfach geschützt
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wir setzen auf modernste Sicherheitstechnologien und Best
              Practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
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

      {/* DSGVO Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                100% DSGVO-konform
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Als medizinische Einrichtung unterliegen Sie strengen
                Datenschutzvorschriften. MeinTermin erfüllt alle Anforderungen
                der DSGVO und darüber hinaus.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Verarbeitungsverzeichnis inklusive
                    </h3>
                    <p className="text-gray-600">
                      Automatisch generierte Dokumentation aller
                      Datenverarbeitungen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Auftragsverarbeitungsvertrag (AVV)
                    </h3>
                    <p className="text-gray-600">
                      Rechtssicherer AVV gemäß Art. 28 DSGVO inklusive
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Patientenrechte garantiert
                    </h3>
                    <p className="text-gray-600">
                      Auskunft, Berichtigung, Löschung – alles mit einem Klick
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Regelmäßige Audits</h3>
                    <p className="text-gray-600">
                      Externe Sicherheitsaudits und Penetrationstests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 bg-white shadow-lg">
              <h3 className="text-xl font-semibold mb-6">
                Compliance-Zertifizierungen
              </h3>
              <div className="space-y-4">
                {compliance.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {item.standard}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Security */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Technische Sicherheitsmaßnahmen
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <Lock className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Verschlüsselung</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>AES-256 Verschlüsselung für gespeicherte Daten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>TLS 1.3 für Datenübertragung</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Verschlüsselte Backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Sichere Passwort-Hashing (bcrypt)</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <Server className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Infrastruktur</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Server-Standorte ausschließlich in Deutschland</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Redundante Systeme für 99.9% Verfügbarkeit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>24/7 Monitoring und Intrusion Detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Physische Sicherheit in zertifizierten Rechenzentren
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <Eye className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Zugriffskontrolle</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Rollenbasierte Zugriffsrechte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Zwei-Faktor-Authentifizierung (2FA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Vollständige Audit-Logs aller Zugriffe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Automatische Session-Timeouts</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <AlertTriangle className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Notfallvorsorge</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tägliche automatische Backups</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Disaster Recovery Plan mit RTO &lt; 4h</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Geo-redundante Datensicherung</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Incident Response Team 24/7 verfügbar</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ihre Daten in sicheren Händen
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Vertrauen Sie auf höchste Sicherheitsstandards und DSGVO-Konformität
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            Jetzt sicher starten
          </Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
