import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Code,
  Book,
  Zap,
  Shield,
  CheckCircle2,
  Terminal,
  FileText,
  Github,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/appointments",
      description: "Liste aller Termine abrufen",
    },
    {
      method: "POST",
      path: "/api/appointments",
      description: "Neuen Termin erstellen",
    },
    {
      method: "GET",
      path: "/api/patients",
      description: "Patientenliste abrufen",
    },
    {
      method: "POST",
      path: "/api/patients",
      description: "Neuen Patienten anlegen",
    },
    {
      method: "GET",
      path: "/api/schedule",
      description: "Verfügbare Zeitslots abrufen",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "RESTful API",
      description:
        "Moderne REST-API mit JSON-Responses und standardisierten HTTP-Methoden",
    },
    {
      icon: Shield,
      title: "OAuth 2.0 Authentifizierung",
      description: "Sichere API-Zugriffe mit OAuth 2.0 und API-Keys",
    },
    {
      icon: FileText,
      title: "OpenAPI/Swagger",
      description: "Vollständige API-Dokumentation im OpenAPI 3.0 Format",
    },
    {
      icon: Terminal,
      title: "Webhooks",
      description: "Echtzeit-Benachrichtigungen für Ereignisse in Ihrem System",
    },
    {
      icon: Github,
      title: "Code-Beispiele",
      description: "Fertige Beispiele in Python, JavaScript, PHP und mehr",
    },
    {
      icon: Book,
      title: "Umfassende Docs",
      description: "Detaillierte Anleitungen, Guides und Best Practices",
    },
  ];

  const useCases = [
    {
      title: "Integration mit Praxissoftware",
      description:
        "Verbinden Sie MeinTermin mit Ihrer bestehenden Praxisverwaltungssoftware",
      tags: ["KIS", "PVS", "Abrechnungssoftware"],
    },
    {
      title: "Eigene Website-Integration",
      description:
        "Integrieren Sie die Terminbuchung direkt in Ihre Praxis-Website",
      tags: ["WordPress", "React", "Custom"],
    },
    {
      title: "Mobile Apps",
      description:
        "Entwickeln Sie eigene Mobile Apps mit Zugriff auf Ihre Termindaten",
      tags: ["iOS", "Android", "React Native"],
    },
    {
      title: "Automatisierung",
      description:
        "Automatisieren Sie Workflows mit Zapier, Make oder eigenen Skripten",
      tags: ["Zapier", "Make", "Python"],
    },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={Code}
        title="API-Dokumentation"
        description="Integrieren Sie MeinTermin nahtlos in Ihre bestehenden Systeme mit unserer umfassenden REST-API."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Ressourcen", href: "/#resources" },
          { label: "API", href: "/api-docs" },
        ]}
        ctaText="API-Key erhalten"
        ctaHref="/register"
      />

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Leistungsstarke API für Entwickler
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Alles was Sie brauchen, um MeinTermin in Ihre Systeme zu
              integrieren
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

      {/* Quick Start */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Schnellstart
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">API-Key generieren</h3>
                    <p className="text-gray-600">
                      Erstellen Sie einen API-Key in Ihren Kontoeinstellungen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      API-Endpunkt aufrufen
                    </h3>
                    <p className="text-gray-600">
                      Nutzen Sie Ihren API-Key für authentifizierte Anfragen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Daten verarbeiten</h3>
                    <p className="text-gray-600">
                      Empfangen Sie JSON-Responses und integrieren Sie die Daten
                    </p>
                  </div>
                </div>
              </div>

              <Card className="p-6 bg-white">
                <h3 className="font-semibold mb-4">Base URL</h3>
                <code className="block bg-gray-100 p-3 rounded text-sm mb-4">
                  https://api.meintermin.de/v1
                </code>
                <h3 className="font-semibold mb-2">Authentifizierung</h3>
                <p className="text-sm text-gray-600 mb-2">Header:</p>
                <code className="block bg-gray-100 p-3 rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </Card>
            </div>

            <div>
              <Card className="p-6 bg-gray-900 text-green-400 font-mono text-sm overflow-x-auto">
                <div className="mb-2 text-gray-500">
                  # Beispiel: Termin erstellen
                </div>
                <div className="mb-4">
                  <span className="text-purple-400">curl</span> -X POST \<br />
                  &nbsp;&nbsp;
                  <span className="text-yellow-300">
                    &apos;https://api.meintermin.de/v1/appointments&apos;
                  </span>{" "}
                  \<br />
                  &nbsp;&nbsp;-H{" "}
                  <span className="text-yellow-300">
                    &apos;Authorization: Bearer YOUR_API_KEY&apos;
                  </span>{" "}
                  \<br />
                  &nbsp;&nbsp;-H{" "}
                  <span className="text-yellow-300">
                    &apos;Content-Type: application/json&apos;
                  </span>{" "}
                  \<br />
                  &nbsp;&nbsp;-d{" "}
                  <span className="text-yellow-300">&apos;&#123;</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-blue-300">
                    &quot;patient_id&quot;
                  </span>: <span className="text-orange-300">123</span>,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-blue-300">&quot;date&quot;</span>:{" "}
                  <span className="text-yellow-300">
                    &quot;2024-11-28&quot;
                  </span>
                  ,<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-blue-300">&quot;time&quot;</span>:{" "}
                  <span className="text-yellow-300">&quot;14:30&quot;</span>,
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-blue-300">&quot;type&quot;</span>:{" "}
                  <span className="text-yellow-300">
                    &quot;consultation&quot;
                  </span>
                  <br />
                  &nbsp;&nbsp;
                  <span className="text-yellow-300">&#125;&apos;</span>
                </div>
                <div className="text-gray-500 mb-2"># Response:</div>
                <div>
                  <span className="text-yellow-300">&#123;</span>
                  <br />
                  &nbsp;&nbsp;
                  <span className="text-blue-300">&quot;id&quot;</span>:{" "}
                  <span className="text-orange-300">456</span>,<br />
                  &nbsp;&nbsp;
                  <span className="text-blue-300">
                    &quot;status&quot;
                  </span>:{" "}
                  <span className="text-yellow-300">&quot;confirmed&quot;</span>
                  ,<br />
                  &nbsp;&nbsp;
                  <span className="text-blue-300">
                    &quot;created_at&quot;
                  </span>:{" "}
                  <span className="text-yellow-300">
                    &quot;2024-11-27T10:30:00Z&quot;
                  </span>
                  <br />
                  <span className="text-yellow-300">&#125;</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Wichtigste API-Endpunkte
          </h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Methode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpunkt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beschreibung
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {endpoints.map((endpoint, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            endpoint.method === "GET"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {endpoint.path}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {endpoint.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Vollständige API-Dokumentation anzeigen
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Anwendungsbeispiele
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Entwickler-Ressourcen
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">API-Referenz</h3>
              <p className="text-gray-600 mb-4">
                Detaillierte Dokumentation aller Endpunkte und Parameter
              </p>
              <Button variant="outline" className="w-full">
                Dokumentation öffnen
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <Github className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Code-Beispiele</h3>
              <p className="text-gray-600 mb-4">
                Fertige Beispiele in verschiedenen Programmiersprachen
              </p>
              <Button variant="outline" className="w-full">
                Zu GitHub
              </Button>
            </Card>

            <Card className="p-6 text-center">
              <Terminal className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">API-Playground</h3>
              <p className="text-gray-600 mb-4">
                Testen Sie API-Calls direkt im Browser
              </p>
              <Button variant="outline" className="w-full">
                Playground öffnen
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Code className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bereit zum Entwickeln?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Erstellen Sie jetzt Ihren kostenlosen Account und erhalten Sie
            sofort Zugriff auf die API
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Kostenlos registrieren
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Support kontaktieren
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
