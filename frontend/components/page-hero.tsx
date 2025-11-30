import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageHeroProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  breadcrumbs?: { label: string; href: string }[];
  ctaText?: string;
  ctaHref?: string;
}

export default function PageHero({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  ctaText,
  ctaHref,
}: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-8">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-gray-400">/</span>}
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        )}

        <div className="max-w-4xl">
          {/* Icon */}
          {Icon && (
            <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-6">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">{description}</p>

          {/* CTA */}
          {ctaText && ctaHref && (
            <Link href={ctaHref}>
              <Button size="lg" className="text-lg px-8">
                {ctaText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
