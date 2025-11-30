import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Stethoscope,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function ArztpraxenPage() {
  const features = [
    {
      icon: Calendar,
      title: "Online-Terminbuchung",
      description:
        "Patienten können rund um die Uhr Termine online buchen, ändern oder absagen.",
    },
    {
      icon: Users,
      title: "Patientenverwaltung",
      description:
        "Zentrale Verwaltung aller Patientendaten mit Krankengeschichte und Dokumenten.",
    },
    {
      icon: Clock,
      title: "Automatische Erinnerungen",
      description:
        "SMS und E-Mail-Erinnerungen reduzieren No-Shows um bis zu 80%.",
    },
    {
      icon: BarChart3,
      title: "Berichte & Analysen",
      description:
        "Detaillierte Einblicke in Praxisauslastung, Umsätze und Trends.",
    },
    {
      icon: Shield,
      title: "DSGVO-konform",
      description:
        "Höchste Sicherheitsstandards für sensible Gesundheitsdaten.",
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Zugriff von überall - Desktop, Tablet oder Smartphone.",
    },
  ];

  const benefits = [
    "Zeitersparnis von bis zu 10 Stunden pro Woche",
    "Reduzierung von No-Shows um 80%",
    "Verbesserung der Patientenzufriedenheit",
    "Optimierte Praxisauslastung",
    "Digitale Patientenakten",
    "Automatisierte Arbeitsabläufe",
  ];

  const testimonial = {
    quote:
      "MeinTermin hat unsere Praxis revolutioniert. Die Zeitersparnis ist enorm und unsere Patienten lieben die Online-Buchung!",
    author: "Dr. med. Schmidt",
    role: "Hausarztpraxis, München",
    rating: 5,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        icon={Stethoscope}
        title="Terminverwaltung für Arztpraxen"
        description="Optimieren Sie Ihre Praxis mit intelligenter Online-Terminplanung. Sparen Sie Zeit, reduzieren Sie No-Shows und verbessern Sie die Patientenzufriedenheit."
        breadcrumbs={[
          { label: "Startseite", href: "/" },
          { label: "Lösungen", href: "/#" },
          { label: "Arztpraxen", href: "/praxis" },
        ]}
        ctaText="Jetzt 14 Tage kostenlos testen"
        ctaHref="/register"
      />

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Alles was Ihre Praxis braucht
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Eine vollständige Lösung für moderne Arztpraxen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Warum Ärzte MeinTermin wählen
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Über 500 Arztpraxen in Deutschland vertrauen bereits auf unsere
                Lösung.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link href="/register">
                  <Button size="lg" className="text-lg">
                    Kostenlos starten
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-8 text-center bg-blue-50 border-blue-100">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  500+
                </div>
                <div className="text-gray-700 font-medium">Praxen</div>
              </Card>
              <Card className="p-8 text-center bg-green-50 border-green-100">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  80%
                </div>
                <div className="text-gray-700 font-medium">
                  Weniger No-Shows
                </div>
              </Card>
              <Card className="p-8 text-center bg-purple-50 border-purple-100">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  10h
                </div>
                <div className="text-gray-700 font-medium">
                  Zeitersparnis/Woche
                </div>
              </Card>
              <Card className="p-8 text-center bg-orange-50 border-orange-100">
                <div className="text-5xl font-bold text-orange-600 mb-2">
                  99.9%
                </div>
                <div className="text-gray-700 font-medium">Verfügbarkeit</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              {[...Array(testimonial.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-8 h-8 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl text-white font-medium mb-8">
              "{testimonial.quote}"
            </blockquote>
            <div className="text-white/90">
              <div className="font-semibold text-xl">{testimonial.author}</div>
              <div className="text-white/70">{testimonial.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Bereit zu starten?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Testen Sie MeinTermin 14 Tage kostenlos. Keine Kreditkarte
            erforderlich.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Jetzt kostenlos testen
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Demo anfragen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
