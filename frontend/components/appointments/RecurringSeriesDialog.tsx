"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Repeat, Calendar, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface RecurringSeriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number | null;
  onDeleted?: () => void;
}

export default function RecurringSeriesDialog({
  isOpen,
  onClose,
  appointmentId,
  onDeleted,
}: RecurringSeriesDialogProps) {
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      loadSeries();
    }
  }, [isOpen, appointmentId]);

  const loadSeries = async () => {
    if (!appointmentId) return;

    try {
      setLoading(true);
      const response = await api.appointments.getRecurringSeries(appointmentId);
      setSeries(response.data);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Serie konnte nicht geladen werden",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeries = async () => {
    if (!appointmentId) return;

    if (
      !confirm(
        "Möchten Sie wirklich ALLE wiederkehrenden Termine in dieser Serie löschen?"
      )
    ) {
      return;
    }

    try {
      await api.appointments.deleteRecurringSeries(appointmentId);

      toast({
        title: "Serie gelöscht",
        description: "Alle wiederkehrenden Termine wurden gelöscht",
      });

      onDeleted?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: "Serie konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const getPatternLabel = (pattern: string) => {
    const labels: Record<string, string> = {
      daily: "Täglich",
      weekly: "Wöchentlich",
      monthly: "Monatlich",
      yearly: "Jährlich",
    };
    return labels[pattern] || pattern;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "outline" | "default" | "secondary" | "destructive";
        label: string;
      }
    > = {
      pending: { variant: "outline", label: "Ausstehend" },
      confirmed: { variant: "default", label: "Bestätigt" },
      completed: { variant: "secondary", label: "Abgeschlossen" },
      cancelled: { variant: "destructive", label: "Storniert" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8 text-gray-500">
            Serie wird geladen...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!series) return null;

  const parent = series.parent;
  const children = series.children || [];
  const totalCount = series.total_count || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Wiederkehrende Termine - Serie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Series Information */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Wiederholungsmuster:
              </span>
              <span className="text-blue-700">
                {getPatternLabel(parent.recurring_pattern)}
                {parent.recurring_interval > 1 &&
                  ` (alle ${parent.recurring_interval})`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Gesamtanzahl:</span>
                <span className="ml-2 font-medium">{totalCount} Termine</span>
              </div>
              {parent.recurring_end_date && (
                <div>
                  <span className="text-gray-600">Endet am:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(parent.recurring_end_date), "dd.MM.yyyy", {
                      locale: de,
                    })}
                  </span>
                </div>
              )}
              {parent.patient && (
                <div>
                  <span className="text-gray-600">Patient:</span>
                  <span className="ml-2 font-medium">
                    {parent.patient.name}
                  </span>
                </div>
              )}
              {parent.service && (
                <div>
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2 font-medium">
                    {parent.service.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Alert for managing series */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Hinweis zur Serienverwaltung</p>
                <p className="mt-1">
                  Änderungen an einem Termin dieser Serie betreffen nur diesen
                  einzelnen Termin. Um die gesamte Serie zu ändern oder zu
                  löschen, verwenden Sie die entsprechenden Aktionen.
                </p>
              </div>
            </div>
          </div>

          {/* List of appointments */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              Alle Termine in dieser Serie
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Uhrzeit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Parent appointment */}
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-medium">1</TableCell>
                    <TableCell>
                      {format(new Date(parent.start_time), "dd.MM.yyyy", {
                        locale: de,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(parent.start_time), "HH:mm", {
                        locale: de,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(parent.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(parent.created_at), "dd.MM.yyyy", {
                        locale: de,
                      })}
                    </TableCell>
                  </TableRow>

                  {/* Child appointments */}
                  {children.map((appointment: any, index: number) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{index + 2}</TableCell>
                      <TableCell>
                        {format(
                          new Date(appointment.start_time),
                          "dd.MM.yyyy",
                          {
                            locale: de,
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(appointment.start_time), "HH:mm", {
                          locale: de,
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(
                          new Date(appointment.created_at),
                          "dd.MM.yyyy",
                          {
                            locale: de,
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSeries}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Gesamte Serie löschen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
