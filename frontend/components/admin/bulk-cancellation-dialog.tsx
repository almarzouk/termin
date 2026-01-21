"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface BulkCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: number;
  doctors: Array<{
    id: number;
    user: {
      name: string;
    };
    specialty: string;
  }>;
  onSuccess?: () => void;
}

interface PreviewData {
  total_appointments: number;
  appointments_by_date: Record<string, any[]>;
  potentially_available_doctors: any[];
  estimated_success_rate: number;
}

export function BulkCancellationDialog({
  open,
  onOpenChange,
  clinicId,
  doctors,
  onSuccess,
}: BulkCancellationDialogProps) {
  const [step, setStep] = useState<"form" | "preview" | "confirm">("form");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState<string>("");
  const [reasonDetails, setReasonDetails] = useState("");

  const resetForm = () => {
    setStep("form");
    setSelectedDoctor("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setReasonDetails("");
    setPreviewData(null);
  };

  const handlePreview = async () => {
    if (!selectedDoctor || !startDate || !endDate) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.admin.bulkCancellation.preview({
        staff_id: parseInt(selectedDoctor),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      });

      if (response.success && response.data) {
        setPreviewData(response.data);
        setStep("preview");
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Vorschau fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !startDate || !endDate || !reason) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const createResponse = await api.admin.bulkCancellation.create({
        clinic_id: clinicId,
        staff_id: parseInt(selectedDoctor),
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        reason: reason as any,
        reason_details: reasonDetails || undefined,
      });

      if (createResponse.success && createResponse.data) {
        // Execute the operation immediately
        const executeResponse = await api.admin.bulkCancellation.execute(
          createResponse.data.id
        );

        if (executeResponse.success) {
          toast({
            title: "Erfolg",
            description: `Massenabsage erfolgreich! ${
              previewData?.total_appointments || 0
            } Termine wurden bearbeitet.`,
          });
          resetForm();
          onOpenChange(false);
          onSuccess?.();
        }
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Massenabsage fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctorData = doctors.find(
    (d) => d.id.toString() === selectedDoctor
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Massen-Terminabsage & Neuzuweisung
          </DialogTitle>
          <DialogDescription>
            Alle Termine eines Arztes für einen bestimmten Zeitraum absagen und
            automatisch neu zuweisen
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Form */}
        {step === "form" && (
          <div className="space-y-4 py-4">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor">Arzt/Ärztin *</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Arzt auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.user.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Startdatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP", { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Enddatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP", { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={de}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Grund *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Grund auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick_leave">Krankheit</SelectItem>
                  <SelectItem value="emergency">Notfall</SelectItem>
                  <SelectItem value="vacation">Urlaub</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason Details */}
            <div className="space-y-2">
              <Label htmlFor="reasonDetails">
                Zusätzliche Informationen (optional)
              </Label>
              <Textarea
                id="reasonDetails"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Weitere Details zum Grund..."
                rows={3}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Nach der Vorschau werden alle betroffenen Termine automatisch an
                verfügbare Ärzte mit derselben Fachrichtung neu zugewiesen.
                Patienten werden per E-Mail benachrichtigt und müssen den neuen
                Termin bestätigen.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && previewData && (
          <div className="space-y-4 py-4">
            <Alert
              variant={
                previewData.estimated_success_rate > 70
                  ? "default"
                  : "destructive"
              }
            >
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Vorschau der Massenabsage:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>
                    • Betroffene Termine: {previewData.total_appointments}
                  </li>
                  <li>
                    • Verfügbare Ärzte:{" "}
                    {previewData.potentially_available_doctors.length}
                  </li>
                  <li>
                    • Geschätzte Erfolgsquote:{" "}
                    {previewData.estimated_success_rate}%
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Appointments by Date */}
            <div className="space-y-3">
              <h3 className="font-semibold">Betroffene Termine:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {Object.entries(previewData.appointments_by_date).map(
                  ([date, appointments]) => (
                    <div
                      key={date}
                      className="border rounded-lg p-3 bg-muted/30"
                    >
                      <div className="font-medium mb-2">
                        {format(new Date(date), "PPP", { locale: de })} -{" "}
                        <Badge variant="secondary">
                          {appointments.length} Termine
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        {appointments.map((apt: any) => (
                          <div
                            key={apt.id}
                            className="flex justify-between items-center"
                          >
                            <span>{apt.patient_name}</span>
                            <span className="text-muted-foreground">
                              {format(new Date(apt.start_time), "HH:mm")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Available Doctors */}
            {previewData.potentially_available_doctors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Verfügbare Ärzte:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {previewData.potentially_available_doctors.map(
                    (doctor: any) => (
                      <div
                        key={doctor.id}
                        className="border rounded p-2 text-sm"
                      >
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {doctor.specialty} • Auslastung:{" "}
                          {doctor.current_workload} Termine
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Wichtig:</strong> Diese Aktion kann nicht rückgängig
                gemacht werden. Alle Patienten werden per E-Mail benachrichtigt
                und müssen den neuen Termin bestätigen.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {step === "form" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Abbrechen
              </Button>
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? "Lädt..." : "Vorschau anzeigen"}
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>
                Zurück
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Wird ausgeführt..." : "Massenabsage durchführen"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
