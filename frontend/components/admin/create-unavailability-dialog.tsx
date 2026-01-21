"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Calendar, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Doctor {
  id: number;
  user: {
    name: string;
  };
}

interface CreateUnavailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: Doctor[];
  onSuccess?: () => void;
  preSelectedDoctorId?: number | null;
  preSelectedStartDate?: Date | null;
  preSelectedEndDate?: Date | null;
}

export function CreateUnavailabilityDialog({
  open,
  onOpenChange,
  doctors,
  onSuccess,
  preSelectedDoctorId,
  preSelectedStartDate,
  preSelectedEndDate,
}: CreateUnavailabilityDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: "",
    start_date: "",
    end_date: "",
    reason: "vacation",
    notes: "",
  });
  const { toast } = useToast();

  // Update form when pre-selected values change
  useEffect(() => {
    if (open) {
      setFormData({
        staff_id: preSelectedDoctorId?.toString() || "",
        start_date: preSelectedStartDate
          ? format(preSelectedStartDate, "yyyy-MM-dd")
          : "",
        end_date: preSelectedEndDate
          ? format(preSelectedEndDate, "yyyy-MM-dd")
          : "",
        reason: "vacation",
        notes: "",
      });
    }
  }, [open, preSelectedDoctorId, preSelectedStartDate, preSelectedEndDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.staff_id || !formData.start_date || !formData.end_date) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (formData.start_date > formData.end_date) {
      toast({
        title: "Fehler",
        description: "Das Startdatum muss vor dem Enddatum liegen",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.admin.staffUnavailability.create({
        staff_id: parseInt(formData.staff_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason as
          | "sick_leave"
          | "vacation"
          | "emergency"
          | "other",
        notes: formData.notes || undefined,
      });

      if (response.data.success) {
        const responseData = response.data.data;
        const leaveBalanceInfo =
          responseData.annual_leave_balance !== undefined
            ? ` Verbleibende Urlaubstage: ${responseData.annual_leave_balance}`
            : "";

        // Reset form first
        setFormData({
          staff_id: "",
          start_date: "",
          end_date: "",
          reason: "vacation",
          notes: "",
        });

        // Close dialog immediately
        onOpenChange(false);

        toast({
          title: "Erfolg",
          description: `Abwesenheitsperiode wurde erfolgreich erstellt.${leaveBalanceInfo}`,
        });

        // Call onSuccess callback to refresh the calendar
        if (onSuccess) {
          onSuccess();
        }

        // Refresh page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    } catch (error: any) {
      console.error("Error creating unavailability:", error);

      let errorMessage = "Fehler beim Erstellen der Abwesenheitsperiode";

      // Handle insufficient leave balance error
      if (error.response?.data?.error === "INSUFFICIENT_LEAVE_BALANCE") {
        const details = error.response.data.details;
        errorMessage = `Unzureichender Jahresurlaubssaldo! Benötigt: ${details.requested_days} Tage, Verfügbar: ${details.available_balance} Tage (Fehlbetrag: ${details.shortage} Tage)`;
      }
      // Handle overlapping period error
      else if (error.response?.data?.error === "OVERLAPPING_PERIOD") {
        const overlapping = error.response.data.overlapping_period;
        errorMessage = `Es existiert bereits eine ${overlapping.reason} vom ${
          overlapping.start_date.split(" ")[0]
        } bis ${
          overlapping.end_date.split(" ")[0]
        }. Bitte löschen Sie diese zuerst oder wählen Sie einen anderen Zeitraum.`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Abwesenheit / Urlaub erstellen
          </DialogTitle>
          <DialogDescription>
            Erstellen Sie eine Abwesenheitsperiode für einen Arzt. Während
            dieser Zeit können keine Termine gebucht werden.
          </DialogDescription>
          {preSelectedStartDate && preSelectedEndDate && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Ausgewählter Zeitraum:</strong>{" "}
              {format(preSelectedStartDate, "dd.MM.yyyy", { locale: de })} -{" "}
              {format(preSelectedEndDate, "dd.MM.yyyy", { locale: de })}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Selection - Only show if not pre-selected */}
          {!preSelectedDoctorId && (
            <div className="space-y-2">
              <Label htmlFor="staff_id">
                Arzt <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.staff_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, staff_id: value })
                }
              >
                <SelectTrigger id="staff_id">
                  <SelectValue placeholder="Arzt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show selected doctor name when pre-selected */}
          {preSelectedDoctorId && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Arzt:{" "}
                </span>
                <span className="text-sm text-gray-900">
                  {doctors.find((d) => d.id === preSelectedDoctorId)?.user
                    .name || "Unbekannt"}
                </span>
              </div>
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date">
              Startdatum <span className="text-red-500">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              min={format(new Date(), "yyyy-MM-dd")}
              disabled={!!preSelectedStartDate}
              required
            />
            {preSelectedStartDate && (
              <p className="text-xs text-gray-500">
                Aus Kalender ausgewählt (ändern Sie die Auswahl im Kalender, um
                das Datum zu ändern)
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end_date">
              Enddatum <span className="text-red-500">*</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              min={formData.start_date || format(new Date(), "yyyy-MM-dd")}
              disabled={!!preSelectedEndDate}
              required
            />
            {preSelectedEndDate && (
              <p className="text-xs text-gray-500">Aus Kalender ausgewählt</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Grund <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Grund auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Urlaub</SelectItem>
                <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                <SelectItem value="emergency">Notfall</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
