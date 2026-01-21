"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Zap,
  Building2,
  Users,
  Calendar,
  Mail,
  MessageSquare,
  BarChart3,
  Shield,
  ArrowLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  billing_period: string;
  max_clinics: number;
  max_doctors: number;
  max_staff: number;
  max_appointments_per_month: number;
  has_sms: boolean;
  has_email: boolean;
  has_reports: boolean;
  has_analytics: boolean;
  has_api_access: boolean;
  priority_support: number;
  is_popular: boolean;
  is_active: boolean;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/subscription-plans"
      );
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: number) => {
    setPendingPlanId(planId);
    setShowConfirmDialog(true);
  };

  const confirmUpgrade = async () => {
    if (!pendingPlanId) return;

    try {
      setUpgrading(true);
      setSelectedPlan(pendingPlanId);
      setShowConfirmDialog(false);

      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/subscriptions/upgrade",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan_id: pendingPlanId }),
        }
      );

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Fehler beim Aktualisieren des Plans");
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error upgrading plan:", error);
      setErrorMessage("Fehler beim Aktualisieren des Plans");
      setShowErrorDialog(true);
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
      setPendingPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return <Shield className="h-8 w-8" />;
      case "professional":
        return <Zap className="h-8 w-8" />;
      case "enterprise":
        return <Star className="h-8 w-8" />;
      default:
        return <Building2 className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "basic":
        return "from-gray-500 to-gray-600";
      case "professional":
        return "from-blue-500 to-blue-600";
      case "enterprise":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/admin/my-subscription"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Mein Abonnement
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wählen Sie Ihren Plan
          </h1>
          <p className="text-xl text-gray-600">
            Aktualisieren Sie Ihr Abonnement und profitieren Sie von mehr
            Funktionen
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans
            .filter((plan) => plan.is_active)
            .map((plan) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plan.is_popular
                    ? "ring-2 ring-blue-500 transform scale-105"
                    : "hover:scale-105"
                }`}
              >
                {/* Popular Badge */}
                {plan.is_popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
                      Beliebt
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div
                  className={`bg-gradient-to-r ${getPlanColor(
                    plan.name
                  )} text-white p-8`}
                >
                  <div className="flex items-center justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-center text-white/90 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="text-center">
                    <span className="text-5xl font-bold">€{plan.price}</span>
                    <span className="text-white/80 ml-2">/ Monat</span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.max_clinics === -1
                          ? "Unbegrenzte"
                          : plan.max_clinics}{" "}
                        Klinik{plan.max_clinics !== 1 ? "en" : ""}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Bis zu {plan.max_doctors} Ärzte
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        Bis zu {plan.max_staff} Mitarbeiter
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.max_appointments_per_month === -1
                          ? "Unbegrenzte"
                          : plan.max_appointments_per_month}{" "}
                        Termine pro Monat
                      </span>
                    </li>
                    {plan.has_email && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          E-Mail-Erinnerungen
                        </span>
                      </li>
                    )}
                    {plan.has_sms && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">SMS-Erinnerungen</span>
                      </li>
                    )}
                    {plan.has_reports && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Erweiterte Berichte
                        </span>
                      </li>
                    )}
                    {plan.has_analytics && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Analytics & Insights
                        </span>
                      </li>
                    )}
                    {plan.has_api_access && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">API-Zugang</span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.priority_support === 0
                          ? "Standard Support"
                          : plan.priority_support === 1
                          ? "Prioritäts-Support"
                          : "24/7 Premium Support"}
                      </span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={upgrading && selectedPlan === plan.id}
                    className={`w-full ${
                      plan.is_popular
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        : "bg-gray-800 hover:bg-gray-900"
                    } text-white`}
                  >
                    {upgrading && selectedPlan === plan.id
                      ? "Wird aktualisiert..."
                      : "Plan wählen"}
                  </Button>
                </div>
              </Card>
            ))}
        </div>

        {/* Additional Info */}
        <Card className="p-8 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Haben Sie Fragen?
            </h3>
            <p className="text-gray-600 mb-4">
              Unser Support-Team hilft Ihnen gerne bei der Auswahl des richtigen
              Plans
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:support@mein-termin.de"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                support@mein-termin.de
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="tel:+493012345678"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                +49 30 12345678
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan wechseln bestätigen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich zu diesem Plan wechseln? Die Änderung wird
              sofort wirksam und Ihre Abrechnung wird entsprechend angepasst.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpgrade}>
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erfolg!</AlertDialogTitle>
            <AlertDialogDescription>
              Ihr Plan wurde erfolgreich aktualisiert. Sie werden nun zu Ihrem
              Abonnement weitergeleitet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                window.location.href = "/admin/my-subscription";
              }}
            >
              Weiter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fehler</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
