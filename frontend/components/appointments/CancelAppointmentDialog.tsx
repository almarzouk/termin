"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Euro, Clock, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface CancelAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment: {
    id: number;
    patient_name?: string;
    service_name?: string;
    start_time?: string;
    clinic_id?: number;
  } | null;
}

export default function CancelAppointmentDialog({
  isOpen,
  onClose,
  onSuccess,
  appointment,
}: CancelAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);
  const [cancellationReasons, setCancellationReasons] = useState<any[]>([]);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  useEffect(() => {
    if (isOpen && appointment?.id) {
      checkCancellationPolicy();
      loadCancellationReasons();
    }
  }, [isOpen, appointment]);

  const checkCancellationPolicy = async () => {
    if (!appointment?.id) return;

    try {
      setPolicyLoading(true);
      const response = await api.appointments.checkCancellationPolicy(
        appointment.id
      );
      setCancellationPolicy(response.data);
    } catch (error: any) {
      console.error("Error checking policy:", error);
    } finally {
      setPolicyLoading(false);
    }
  };

  const loadCancellationReasons = async () => {
    if (!appointment?.clinic_id) return;

    try {
      const response = await api.clinics.getCancellationReasons(
        appointment.clinic_id
      );
      setCancellationReasons(response.data || []);
    } catch (error) {
      console.error("Error loading reasons:", error);
    }
  };

  const handleSubmit = async () => {
    if (!appointment?.id) return;

    // Validate reason
    const reason = selectedReason === "custom" ? customReason : selectedReason;
    if (!reason) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Grund für die Stornierung an",
        variant: "destructive",
      });
      return;
    }

    // Check if late cancellation requires agreement
    if (cancellationPolicy?.is_late && !agreedToPolicy) {
      toast({
        title: "Fehler",
        description:
          "Bitte bestätigen Sie die Kenntnisnahme der Stornierungsbedingungen",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.appointments.cancel(appointment.id, reason);

      toast({
        title: "Termin storniert",
        description: response.is_late
          ? `Termin wurde storniert. Gebühr: €${response.fee}`
          : "Termin wurde erfolgreich storniert",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Termin konnte nicht storniert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedReason("");
    setCustomReason("");
    setAgreedToPolicy(false);
  };

  if (!appointment) return null;

  const canCancel = cancellationPolicy?.allowed !== false;
  const isLateCancellation = cancellationPolicy?.is_late || false;
  const cancellationFee = cancellationPolicy?.fee || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Termin stornieren
          </DialogTitle>
          <DialogDescription>
            {appointment.patient_name && (
              <div className="mt-2">
                <p className="font-medium">
                  Patient: {appointment.patient_name}
                </p>
                {appointment.service_name && (
                  <p className="text-sm text-gray-600">
                    Service: {appointment.service_name}
                  </p>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {policyLoading ? (
            <div className="text-center py-4 text-gray-500">
              Stornierungsbedingungen werden geladen...
            </div>
          ) : (
            <>
              {/* Policy Warning */}
              {!canCancel && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {cancellationPolicy?.reason ||
                      "Dieser Termin kann nicht storniert werden."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Late Cancellation Warning */}
              {canCancel && isLateCancellation && cancellationFee > 0 && (
                <Alert className="border-orange-500 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-orange-800">
                        Verspätete Stornierung
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>
                          Stornierung erfolgt zu spät (weniger als{" "}
                          {cancellationPolicy?.minimum_notice_hours || 24}{" "}
                          Stunden vorher)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Euro className="h-4 w-4" />
                        <span>Stornierungsgebühr: €{cancellationFee}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Cancellation Reason */}
              {canCancel && (
                <>
                  <div className="space-y-2">
                    <Label>Grund für die Stornierung *</Label>
                    <Select
                      value={selectedReason}
                      onValueChange={setSelectedReason}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grund auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {cancellationReasons.map((reason) => (
                          <SelectItem key={reason.id} value={reason.reason}>
                            {reason.reason}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Anderer Grund...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Reason */}
                  {selectedReason === "custom" && (
                    <div className="space-y-2">
                      <Label>Bitte beschreiben Sie den Grund</Label>
                      <Textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Grund für die Stornierung..."
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Agreement Checkbox for Late Cancellation */}
                  {isLateCancellation && cancellationFee > 0 && (
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="agree-policy"
                        checked={agreedToPolicy}
                        onCheckedChange={(checked) =>
                          setAgreedToPolicy(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="agree-policy"
                        className="text-sm cursor-pointer leading-tight"
                      >
                        Ich bestätige, dass ich die Stornierungsgebühr von €
                        {cancellationFee} zur Kenntnis genommen habe und damit
                        einverstanden bin.
                      </Label>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !canCancel || policyLoading}
          >
            {loading ? "Wird storniert..." : "Termin stornieren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
