import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Calendar,
} from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Telefon",
      details: "+49 (0) 123 456 789",
      subtext: "Mo-Fr 9:00-18:00 Uhr",
    },
    {
      icon: Mail,
      title: "E-Mail",
      details: "info@meintermin.de",
      subtext: "Wir antworten innerhalb von 24h",
    },
    {
      icon: MapPin,
      title: "Adresse",
      details: "Musterstraße 123",
      subtext: "10115 Berlin, Deutschland",
    },
    {
      icon: Clock,
      title: "Öffnungszeiten",
      details: "Mo-Fr: 9:00-18:00",
      subtext: "Sa-So: Geschlossen",
    },
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description:
        "Chatten Sie direkt mit unserem Support-Team. Durchschnittliche Antwortzeit: 2 Minuten",
      action: "Chat starten",
      color: "blue",
    },
    {
      icon: Calendar,
      title: "Demo buchen",
      description:
        "Vereinbaren Sie einen persönlichen Demo-Termin mit unserem Team",
      action: "Termin vereinbaren",
      color: "purple",
    },
    {
      icon: Mail,
      title: "E-Mail Support",
      description:
        "Senden Sie uns eine E-Mail und wir melden uns innerhalb von 24 Stunden",
      action: "E-Mail senden",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        icon={MessageSquare}
        title="Kontaktieren Sie uns"
        description="Haben Sie Fragen? Unser Team ist für Sie da. Kontaktieren Sie uns per Telefon, E-Mail oder Chat."
        breadcrumbs={[
          { label: "Startseite", href: "/" },
          { label: "Kontakt", href: "/contact" },
        ]}
      />

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Senden Sie uns eine Nachricht
                </h2>
                <p className="text-gray-600">
                  Füllen Sie das Formular aus und wir melden uns
                  schnellstmöglich bei Ihnen.
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Vorname *
                    </label>
                    <Input
                      id="firstName"
                      placeholder="Max"
                      required
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nachname *
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Mustermann"
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    E-Mail *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="max@beispiel.de"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telefon
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+49 123 456789"
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Betreff *
                  </label>
                  <Input
                    id="subject"
                    placeholder="Wie können wir Ihnen helfen?"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nachricht *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Ihre Nachricht..."
                    rows={6}
                    required
                    className="resize-none"
                  />
                </div>

                <Button size="lg" className="w-full text-lg">
                  <Send className="mr-2 h-5 w-5" />
                  Nachricht senden
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  * Pflichtfelder
                </p>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Kontaktinformationen
                </h2>
                <p className="text-gray-600">
                  Erreichen Sie uns über verschiedene Kanäle
                </p>
              </div>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <info.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {info.title}
                        </h3>
                        <p className="text-lg text-gray-900">{info.details}</p>
                        <p className="text-sm text-gray-500">{info.subtext}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map placeholder */}
              <Card className="p-4 bg-gray-100 h-64 rounded-xl overflow-hidden">
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Karte wird geladen...</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Weitere Kontaktmöglichkeiten
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wählen Sie den für Sie passenden Kontaktweg
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-xl transition"
              >
                <div
                  className={`bg-${option.color}-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                  <option.icon className={`h-8 w-8 text-${option.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {option.title}
                </h3>
                <p className="text-gray-600 mb-6">{option.description}</p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Häufig gestellte Fragen
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Vielleicht finden Sie Ihre Antwort bereits in unseren FAQs
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Zu den FAQs
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
