import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "Allgemein",
      questions: [
        {
          q: "Was ist MeinTermin?",
          a: "MeinTermin ist eine moderne Online-Terminverwaltungssoftware für Arztpraxen, Kliniken und Therapeuten. Sie ermöglicht eine einfache Online-Buchung für Patienten und automatisiert viele administrative Aufgaben.",
        },
        {
          q: "Wie viel kostet MeinTermin?",
          a: "Wir bieten verschiedene Preispläne ab 49,99€/Monat an. Alle Pläne können 14 Tage kostenlos getestet werden. Weitere Informationen finden Sie auf unserer Preisseite.",
        },
        {
          q: "Ist eine Kreditkarte für die Testversion erforderlich?",
          a: "Nein, Sie können MeinTermin 14 Tage lang völlig kostenlos und ohne Angabe von Zahlungsdaten testen.",
        },
      ],
    },
    {
      category: "Funktionen",
      questions: [
        {
          q: "Können Patienten online Termine buchen?",
          a: "Ja, Patienten können rund um die Uhr online Termine buchen, ändern oder absagen. Das System zeigt automatisch nur verfügbare Zeitslots an.",
        },
        {
          q: "Werden automatische Erinnerungen versendet?",
          a: "Ja, das System versendet automatisch SMS und E-Mail-Erinnerungen an Patienten. Dies reduziert No-Shows um bis zu 80%.",
        },
        {
          q: "Ist eine mobile App verfügbar?",
          a: "Ja, MeinTermin ist vollständig responsive und funktioniert auf allen Geräten. Zudem gibt es native Apps für iOS und Android.",
        },
      ],
    },
    {
      category: "Sicherheit & Datenschutz",
      questions: [
        {
          q: "Ist MeinTermin DSGVO-konform?",
          a: "Ja, MeinTermin erfüllt alle Anforderungen der DSGVO. Alle Daten werden in Deutschland gespeichert und mit modernsten Sicherheitsstandards geschützt.",
        },
        {
          q: "Wo werden meine Daten gespeichert?",
          a: "Alle Daten werden ausschließlich in zertifizierten Rechenzentren in Deutschland gespeichert.",
        },
        {
          q: "Wie sicher sind meine Patientendaten?",
          a: "Wir verwenden Bank-Level-Verschlüsselung (SSL/TLS), regelmäßige Backups und strenge Zugriffkontrollen. Ihre Daten sind bei uns sicher.",
        },
      ],
    },
    {
      category: "Support & Integration",
      questions: [
        {
          q: "Welchen Support bieten Sie an?",
          a: "Wir bieten E-Mail-Support, Live-Chat und Telefon-Support an. Je nach Plan erhalten Sie auch prioritären Support.",
        },
        {
          q: "Gibt es eine Einrichtungshilfe?",
          a: "Ja, wir unterstützen Sie beim Onboarding und der Einrichtung. Bei größeren Plänen ist auch ein persönlicher Onboarding-Call enthalten.",
        },
        {
          q: "Kann ich von einem anderen System wechseln?",
          a: "Ja, wir unterstützen Sie beim Import Ihrer bestehenden Daten. Kontaktieren Sie uns für Details zur Migration.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        icon={HelpCircle}
        title="Häufig gestellte Fragen"
        description="Finden Sie Antworten auf die häufigsten Fragen zu MeinTermin"
        breadcrumbs={[
          { label: "Startseite", href: "/" },
          { label: "FAQ", href: "/faq" },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {faqs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <Card
                      key={faqIndex}
                      className="p-6 hover:shadow-lg transition"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <Card className="mt-16 p-10 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Nicht die richtige Antwort gefunden?
              </h3>
              <p className="text-gray-600 mb-6">
                Unser Support-Team hilft Ihnen gerne weiter
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Kontakt aufnehmen
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition border border-blue-200"
                >
                  Live Chat starten
                </a>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
