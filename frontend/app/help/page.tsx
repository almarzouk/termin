import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageSquare,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";

export default function HelpPage() {
  const categories = [
    {
      icon: Book,
      title: "Erste Schritte",
      description: "Alles was Sie für den Start benötigen",
      articles: [
        "Wie erstelle ich ein Konto?",
        "Praxis-Einstellungen konfigurieren",
        "Ersten Termin anlegen",
        "Team-Mitglieder hinzufügen",
      ],
    },
    {
      icon: FileText,
      title: "Terminverwaltung",
      description: "Alles rund um Termine und Buchungen",
      articles: [
        "Online-Terminbuchung einrichten",
        "Termine manuell erstellen",
        "Terminerinnerungen konfigurieren",
        "Warteliste verwalten",
      ],
    },
    {
      icon: MessageSquare,
      title: "Patientenverwaltung",
      description: "Verwaltung Ihrer Patienten",
      articles: [
        "Neue Patienten anlegen",
        "Patientendaten bearbeiten",
        "Behandlungshistorie pflegen",
        "Dokumente hochladen",
      ],
    },
    {
      icon: Video,
      title: "Video-Tutorials",
      description: "Schritt-für-Schritt Anleitungen",
      articles: [
        "Grundlagen (5 Min)",
        "Terminbuchung (8 Min)",
        "Patientenverwaltung (6 Min)",
        "Berichte & Analytics (10 Min)",
      ],
    },
  ];

  const popularArticles = [
    { title: "Wie richte ich die Online-Terminbuchung ein?", views: "2.5k" },
    { title: "Automatische Terminerinnerungen aktivieren", views: "1.8k" },
    { title: "Mehrere Praxisstandorte verwalten", views: "1.2k" },
    { title: "Patienten importieren aus Excel", views: "980" },
    { title: "DSGVO-konforme Datenverwaltung", views: "850" },
  ];

  return (
    <>
      <Navbar />
      <PageHero
        icon={HelpCircle}
        title="Hilfe & Support"
        description="Finden Sie Antworten auf Ihre Fragen in unserer umfassenden Wissensdatenbank oder kontaktieren Sie unser Support-Team."
        breadcrumbs={[
          { label: "Start", href: "/" },
          { label: "Ressourcen", href: "/#resources" },
          { label: "Hilfe", href: "/help" },
        ]}
        ctaText="Live-Chat starten"
        ctaHref="#chat"
      />

      {/* Search Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Wonach suchen Sie? (z.B. 'Terminbuchung', 'Erinnerungen')"
              className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Beliebte Suchbegriffe: Terminbuchung, Erinnerungen, Patientenimport,
            DSGVO
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Hilfe-Kategorien
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <category.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li
                      key={i}
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                    >
                      → {article}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meistgelesene Artikel
          </h2>

          <Card className="divide-y">
            {popularArticles.map((article, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{article.title}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {article.views} Aufrufe
                </span>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Brauchen Sie weitere Hilfe?
            </h2>
            <p className="text-lg text-gray-600">
              Unser Support-Team ist für Sie da
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live-Chat</h3>
              <p className="text-gray-600 mb-4">
                Mo-Fr: 9-18 Uhr
                <br />Ø Antwortzeit: 2 Min
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Chat starten
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">E-Mail Support</h3>
              <p className="text-gray-600 mb-4">
                support@meintermin.de
                <br />Ø Antwortzeit: 4 Stunden
              </p>
              <Button variant="outline" className="w-full">
                E-Mail schreiben
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Telefon-Support</h3>
              <p className="text-gray-600 mb-4">
                +49 30 1234 5678
                <br />
                Mo-Fr: 9-18 Uhr
              </p>
              <Button variant="outline" className="w-full">
                Rückruf anfordern
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Weitere Ressourcen
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Video className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Video-Tutorials</h3>
              <p className="text-gray-600 mb-4">
                Über 50 Video-Anleitungen zu allen Funktionen
              </p>
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Zu den Videos →
              </a>
            </Card>

            <Card className="p-6">
              <Book className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Benutzerhandbuch</h3>
              <p className="text-gray-600 mb-4">
                Vollständige Dokumentation als PDF zum Download
              </p>
              <a href="#" className="text-blue-600 hover:underline font-medium">
                PDF herunterladen →
              </a>
            </Card>

            <Card className="p-6">
              <FileText className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">FAQ</h3>
              <p className="text-gray-600 mb-4">
                Antworten auf häufig gestellte Fragen
              </p>
              <a
                href="/faq"
                className="text-blue-600 hover:underline font-medium"
              >
                Zur FAQ →
              </a>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Nicht gefunden, wonach Sie suchen?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Kontaktieren Sie uns direkt – wir helfen Ihnen gerne weiter!
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Support kontaktieren
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Demo buchen
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
