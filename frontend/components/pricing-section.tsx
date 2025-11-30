"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Briefcase, Building2 } from "lucide-react";

export default function PricingSection() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription-plans?is_active=1&per_page=100`
      );
      const data = await response.json();

      if (data.data) {
        // Filter only monthly plans and sort by price
        const monthlyPlans = data.data
          .filter((plan: any) => plan.billing_period === "monthly")
          .sort((a: any, b: any) => a.price - b.price);
        setPlans(monthlyPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [Sparkles, Briefcase, Building2];
    return icons[index] || Briefcase;
  };

  const getPlanColor = (index: number, isPopular: boolean) => {
    if (isPopular) {
      return {
        bg: "bg-gradient-to-br from-blue-600 to-blue-700",
        card: "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl border-0",
        button: "bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold",
        iconBg: "bg-blue-500/30",
        checkColor: "text-blue-200",
      };
    }
    return {
      bg: "bg-white",
      card: "bg-white border border-gray-200 hover:shadow-xl transition-all duration-300",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      iconBg: "bg-blue-50",
      checkColor: "text-blue-600",
    };
  };

  const getFeatures = (plan: any) => {
    const features = [];

    features.push({
      text: plan.max_clinics
        ? `Bis zu ${plan.max_clinics} Kliniken`
        : "Unbegrenzte Kliniken",
    });

    features.push({
      text: plan.max_doctors
        ? `Bis zu ${plan.max_doctors} Ärzte`
        : "Unbegrenzte Ärzte",
    });

    features.push({
      text: plan.max_staff
        ? `Bis zu ${plan.max_staff} Mitarbeiter`
        : "Unbegrenztes Personal",
    });

    if (plan.max_appointments_per_month) {
      features.push({
        text: `${plan.max_appointments_per_month} Termine/Monat`,
      });
    } else {
      features.push({ text: "Unbegrenzte Termine" });
    }

    if (plan.has_email) features.push({ text: "E-Mail Benachrichtigungen" });
    if (plan.has_sms) features.push({ text: "SMS Benachrichtigungen" });
    if (plan.has_reports) features.push({ text: "Erweiterte Berichte" });
    if (plan.has_analytics) features.push({ text: "Analytics Dashboard" });
    if (plan.has_api_access) features.push({ text: "API Zugriff" });

    const supportLevel = [
      "Basis-Support",
      "Prioritäts-Support",
      "Premium-Support",
    ];
    features.push({
      text: supportLevel[plan.priority_support] || supportLevel[0],
    });

    return features;
  };

  if (loading) {
    return (
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-white to-blue-50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Preispläne
            </h2>
            <p className="text-xl text-gray-600">Laden...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Preise
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Wählen Sie Ihren perfekten Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Flexible Preise für jede Praxisgröße. Starten Sie noch heute mit
            einer kostenlosen Testversion
          </p>
        </div>

        {/* Yearly Plans Link */}
        <div className="text-center mb-12">
          <p className="text-gray-600">
            Sparen Sie bis zu 20% mit jährlicher Abrechnung.{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Jährliche Pläne ansehen →
            </a>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(index);
            const colors = getPlanColor(index, plan.is_popular);

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${colors.card} ${
                  plan.is_popular ? "md:scale-110 md:z-10" : ""
                } transition-all duration-300`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-yellow-400 text-blue-900 px-4 py-1 text-sm font-bold">
                      BELIEBT
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-6`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        plan.is_popular ? "text-white" : "text-blue-600"
                      }`}
                    />
                  </div>

                  {/* Plan Name */}
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.is_popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  {/* Description */}
                  {plan.description && (
                    <p
                      className={`text-sm mb-6 ${
                        plan.is_popular ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      {plan.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-5xl font-bold ${
                          plan.is_popular ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ${plan.price}
                      </span>
                      <span
                        className={`text-lg ${
                          plan.is_popular ? "text-blue-200" : "text-gray-600"
                        }`}
                      >
                        /Monat
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {getFeatures(plan).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={`rounded-full p-1 mt-0.5 ${
                            plan.is_popular ? "bg-blue-500/30" : "bg-blue-50"
                          }`}
                        >
                          <Check
                            className={`h-4 w-4 ${
                              plan.is_popular ? "text-white" : "text-blue-600"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            plan.is_popular ? "text-blue-50" : "text-gray-700"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button className={`w-full ${colors.button}`} size="lg">
                    JETZT STARTEN
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                150+
              </div>
              <div className="text-gray-600 font-medium">
                Registrierte Praxen
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                20+
              </div>
              <div className="text-gray-600 font-medium">Jahre Erfahrung</div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                96%
              </div>
              <div className="text-gray-600 font-medium">Zufriedene Nutzer</div>
            </div>
            <div className="p-6 rounded-xl bg-white shadow-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                265k
              </div>
              <div className="text-gray-600 font-medium">
                Erfolgreiche Termine
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
