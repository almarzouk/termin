"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Calendar, Clock, User, X } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface UnavailabilityPeriod {
  id: number;
  staff_id: number;
  staff_name: string;
  clinic_id: number;
  clinic_name: string;
  start_date: string;
  end_date: string;
  reason: "sick_leave" | "vacation" | "emergency" | "other";
  reason_label: string;
  notes: string | null;
  is_active: boolean;
  is_upcoming: boolean;
  days_count: number;
  bulk_operation_id: number | null;
  created_at: string;
}

interface StaffUnavailabilityAlertsProps {
  clinicId?: number;
  showOnlyActive?: boolean;
  maxItems?: number;
  onUpdate?: () => void;
}

export function StaffUnavailabilityAlerts({
  clinicId,
  showOnlyActive = false,
  maxItems = 5,
  onUpdate,
}: StaffUnavailabilityAlertsProps) {
  const [periods, setPeriods] = useState<UnavailabilityPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (clinicId) {
        params.clinic_id = clinicId;
      }

      if (showOnlyActive) {
        params.status = "active";
      }

      console.log("🔍 Fetching unavailability periods with params:", params);

      const response = await api.admin.staffUnavailability.getAll(params);

      console.log("📦 Response:", response);

      if (response.data.success) {
        const allPeriods = response.data.data;
        console.log("✅ Periods found:", allPeriods.length, allPeriods);

        // Sort by priority: active first, then upcoming, then by start date
        const sorted = allPeriods.sort((a, b) => {
          if (a.is_active && !b.is_active) return -1;
          if (!a.is_active && b.is_active) return 1;
          if (a.is_upcoming && !b.is_upcoming) return -1;
          if (!a.is_upcoming && b.is_upcoming) return 1;
          return (
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
        });

        setPeriods(sorted.slice(0, maxItems));
      }
    } catch (error) {
      console.error("❌ Error fetching unavailability periods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [clinicId, showOnlyActive]);

  const handleDelete = async (id: number) => {
    try {
      const response = await api.admin.staffUnavailability.delete(id);

      if (response.data.success) {
        toast({
          title: "Erfolgreich",
          description: response.data.message,
        });

        fetchPeriods();
        onUpdate?.();
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.response?.data?.message || "Fehler beim Löschen",
        variant: "destructive",
      });
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "sick_leave":
        return "bg-red-100 text-red-800 border-red-200";
      case "vacation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "emergency":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "sick_leave":
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />;
      case "vacation":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Wird geladen...</div>
        </div>
      </Card>
    );
  }

  // Show message instead of hiding completely
  if (periods.length === 0) {
    return (
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">Keine aktuellen Abwesenheitsmeldungen</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Abwesenheitsmeldungen
      </h3>

      <div className="space-y-2">
        {periods.map((period) => (
          <Alert
            key={period.id}
            className={`${
              period.is_active
                ? "border-orange-500 bg-orange-50"
                : "border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTitle className="mb-0 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {period.staff_name}
                  </AlertTitle>

                  <Badge
                    className={getReasonColor(period.reason)}
                    variant="outline"
                  >
                    {getReasonIcon(period.reason)}
                    <span className="ml-1">{period.reason_label}</span>
                  </Badge>

                  {period.is_active && (
                    <Badge className="bg-orange-500 text-white">
                      Derzeit abwesend
                    </Badge>
                  )}

                  {period.is_upcoming && (
                    <Badge className="bg-blue-500 text-white">
                      Bevorstehend
                    </Badge>
                  )}
                </div>

                <AlertDescription className="space-y-1">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(period.start_date), "dd.MM.yyyy", {
                        locale: de,
                      })}{" "}
                      -{" "}
                      {format(parseISO(period.end_date), "dd.MM.yyyy", {
                        locale: de,
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      ({period.days_count}{" "}
                      {period.days_count === 1 ? "Tag" : "Tage"})
                    </span>
                  </div>

                  {period.notes && (
                    <div className="text-sm text-muted-foreground italic">
                      {period.notes}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {period.clinic_name}
                  </div>
                </AlertDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(period.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}
