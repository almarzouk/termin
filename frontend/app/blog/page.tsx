import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { Card } from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "5 Tipps zur Reduzierung von No-Shows in Ihrer Praxis",
      excerpt:
        "Erfahren Sie, wie Sie mit automatischen Erinnerungen und intelligenter Terminplanung No-Shows um bis zu 80% reduzieren können.",
      date: "15. November 2025",
      category: "Best Practices",
      readTime: "5 Min",
      image: "/blog/noshow.jpg",
    },
    {
      title: "Digitale Patientenakte: Vorteile und rechtliche Grundlagen",
      excerpt:
        "Was Sie über die Einführung digitaler Patientenakten wissen müssen und wie MeinTermin Sie dabei unterstützt.",
      date: "10. November 2025",
      category: "Digitalisierung",
      readTime: "8 Min",
      image: "/blog/digital.jpg",
    },
    {
      title: "Online-Terminbuchung: Der Schlüssel zur Patientenzufriedenheit",
      excerpt:
        "Warum Online-Terminbuchung heute unverzichtbar ist und wie Sie davon profitieren können.",
      date: "5. November 2025",
      category: "Features",
      readTime: "6 Min",
      image: "/blog/booking.jpg",
    },
    {
      title: "DSGVO in der Arztpraxis: Was Sie beachten müssen",
      excerpt:
        "Ein umfassender Leitfaden zu Datenschutz und DSGVO-Compliance für medizinische Einrichtungen.",
      date: "1. November 2025",
      category: "Recht & Compliance",
      readTime: "10 Min",
      image: "/blog/dsgvo.jpg",
    },
    {
      title: "Praxismanagement Software: ROI und Zeitersparnis",
      excerpt:
        "Wie moderne Praxismanagement-Software Ihre Effizienz steigert und Kosten senkt.",
      date: "28. Oktober 2025",
      category: "Business",
      readTime: "7 Min",
      image: "/blog/roi.jpg",
    },
    {
      title: "Automatisierung in der Arztpraxis: Ein Zukunftsblick",
      excerpt:
        "Welche Prozesse Sie heute schon automatisieren können und was die Zukunft bringt.",
      date: "20. Oktober 2025",
      category: "Innovation",
      readTime: "9 Min",
      image: "/blog/future.jpg",
    },
  ];

  const categories = [
    "Alle",
    "Best Practices",
    "Digitalisierung",
    "Features",
    "Recht & Compliance",
    "Business",
    "Innovation",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <PageHero
        icon={FileText}
        title="Blog & Neuigkeiten"
        description="Bleiben Sie auf dem Laufenden mit Tipps, Best Practices und Neuigkeiten aus der Welt der Praxisverwaltung"
        breadcrumbs={[
          { label: "Startseite", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  index === 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition group cursor-pointer"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">
                      Weiterlesen →
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
              Weitere Artikel laden
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Newsletter abonnieren
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Erhalten Sie die neuesten Artikel und Updates direkt in Ihr Postfach
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition">
              Abonnieren
            </button>
          </div>
          <p className="text-white/70 text-sm mt-4">
            Kein Spam. Jederzeit abbestellbar.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
