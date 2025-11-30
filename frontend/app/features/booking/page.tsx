import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, Bell, Users } from "lucide-react";
import Link from "next/link";

export default function BookingFeaturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        icon={Calendar}
        title="Online-Terminbuchung"
        description="Ermöglichen Sie Ihren Patienten, Termine rund um die Uhr online zu buchen. Einfach, schnell und sicher."
        breadcrumbs={[
          { label: "Startseite", href: "/" },
          { label: "Funktionen", href: "/#" },
          { label: "Online-Buchung", href: "/features/booking" },
        ]}
        ctaText="Jetzt testen"
        ctaHref="/register"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                24/7 Terminbuchung für Ihre Patienten
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Ihre Patienten können jederzeit online Termine buchen, ändern
                oder absagen - ganz ohne Anruf.
              </p>
              <ul className="space-y-4">
                {[
                  "Buchung rund um die Uhr möglich",
                  "Automatische Terminbestätigung",
                  "Echtzeit-Verfügbarkeit",
                  "Mobile-optimiert",
                  "Mehrsprachig",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="text-lg text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-8 bg-gray-50">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-center mb-6">
                  <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Termin buchen
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <button
                        key={day}
                        className="p-3 bg-gray-100 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["09:00", "10:00", "11:00"].map((time) => (
                      <button
                        key={time}
                        className="w-full p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                      >
                        {time} Uhr - Verfügbar
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            Vorteile der Online-Buchung
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Zeitersparnis",
                desc: "Keine Telefonate mehr zur Terminvergabe",
              },
              {
                icon: Bell,
                title: "Automatische Erinnerungen",
                desc: "Reduzieren Sie No-Shows um bis zu 80%",
              },
              {
                icon: Users,
                title: "Bessere Auslastung",
                desc: "Optimale Nutzung Ihrer Kapazitäten",
              },
            ].map((item, i) => (
              <Card key={i} className="p-8">
                <item.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Bereit für Online-Buchungen?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Starten Sie noch heute mit der kostenlosen Testversion
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Jetzt kostenlos testen
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
