"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserCog,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ArrowUpCircle,
} from "lucide-react";
import Link from "next/link";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export default function SubscriptionLimitsCard() {
  const {
    limits,
    loading,
    getUsagePercentage,
    canCreateClinic,
    canCreateDoctor,
    canCreateStaff,
    canCreateAppointment,
  } = useSubscriptionLimits();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!limits) {
    return null;
  }

  const limitItems = [
    {
      icon: Building2,
      label: "Kliniken",
      current: limits.clinics.current,
      limit: limits.clinics.limit,
      allowed: canCreateClinic(),
      color: "blue",
    },
    {
      icon: Users,
      label: "Ärzte",
      current: limits.doctors.current,
      limit: limits.doctors.limit,
      allowed: canCreateDoctor(),
      color: "green",
    },
    {
      icon: UserCog,
      label: "Mitarbeiter",
      current: limits.staff.current,
      limit: limits.staff.limit,
      allowed: canCreateStaff(),
      color: "purple",
    },
    {
      icon: Calendar,
      label: "Termine/Monat",
      current: limits.appointments.current,
      limit: limits.appointments.limit,
      allowed: canCreateAppointment(),
      color: "orange",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Abonnementgrenzen
        </h3>
        <Link href="/subscription-plans">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Upgrade
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {limitItems.map((item, index) => {
          const Icon = item.icon;
          const percentage = getUsagePercentage(
            item.label === "Kliniken"
              ? "clinics"
              : item.label === "Ärzte"
              ? "doctors"
              : item.label === "Mitarbeiter"
              ? "staff"
              : "appointments"
          );
          const isNearLimit = percentage >= 80;
          const isAtLimit = !item.allowed;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 text-${item.color}-600`} />
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {item.current} / {item.limit === null ? "∞" : item.limit}
                  </span>
                  {isAtLimit ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : isNearLimit ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              {item.limit !== null && (
                <div className="relative">
                  <Progress
                    value={percentage}
                    className={`h-2 ${
                      isAtLimit
                        ? "bg-red-100"
                        : isNearLimit
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  />
                </div>
              )}

              {isAtLimit && (
                <p className="text-xs text-red-600">
                  Limit erreicht. Bitte upgraden Sie Ihren Plan.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Features */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Verfügbare Funktionen
        </h4>
        <div className="flex flex-wrap gap-2">
          {limits.features.sms && (
            <Badge variant="secondary" className="text-xs">
              SMS
            </Badge>
          )}
          {limits.features.email && (
            <Badge variant="secondary" className="text-xs">
              E-Mail
            </Badge>
          )}
          {limits.features.reports && (
            <Badge variant="secondary" className="text-xs">
              Berichte
            </Badge>
          )}
          {limits.features.analytics && (
            <Badge variant="secondary" className="text-xs">
              Analytics
            </Badge>
          )}
          {limits.features.api_access && (
            <Badge variant="secondary" className="text-xs">
              API Zugang
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
