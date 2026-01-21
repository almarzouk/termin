"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { User, Save, RefreshCw } from "lucide-react";

interface Doctor {
  id: number;
  user: {
    name: string;
    email: string;
  };
  specialty?: string;
  annual_leave_balance: number;
}

interface LeaveBalanceSettingsProps {
  doctors: Doctor[];
  onUpdate: () => void;
}

export function LeaveBalanceSettings({
  doctors,
  onUpdate,
}: LeaveBalanceSettingsProps) {
  const [editedBalances, setEditedBalances] = useState<Record<number, number>>(
    {}
  );
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleBalanceChange = (doctorId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedBalances({
      ...editedBalances,
      [doctorId]: numValue,
    });
  };

  const handleSave = async (doctor: Doctor) => {
    const newBalance = editedBalances[doctor.id];

    if (
      newBalance === undefined ||
      newBalance === doctor.annual_leave_balance
    ) {
      toast({
        title: "Info",
        description: "Keine Änderungen vorgenommen",
      });
      return;
    }

    if (newBalance < 0 || newBalance > 365) {
      toast({
        title: "Fehler",
        description: "Urlaubstage müssen zwischen 0 und 365 liegen",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading({ ...loading, [doctor.id]: true });

      const response = await api.admin.staff.update(doctor.id, {
        annual_leave_balance: newBalance,
      });

      if (response?.data || response?.success) {
        toast({
          title: "Erfolg",
          description: `Urlaubstage für ${doctor.user.name} wurden auf ${newBalance} aktualisiert`,
        });

        // Clear edited state for this doctor
        const newEditedBalances = { ...editedBalances };
        delete newEditedBalances[doctor.id];
        setEditedBalances(newEditedBalances);

        // Refresh data
        onUpdate();
      }
    } catch (error: any) {
      console.error("Error updating leave balance:", error);
      toast({
        title: "Fehler",
        description:
          error.response?.data?.message ||
          "Fehler beim Aktualisieren der Urlaubstage",
        variant: "destructive",
      });
    } finally {
      setLoading({ ...loading, [doctor.id]: false });
    }
  };

  const handleReset = (doctor: Doctor) => {
    const newEditedBalances = { ...editedBalances };
    delete newEditedBalances[doctor.id];
    setEditedBalances(newEditedBalances);
  };

  const getCurrentBalance = (doctor: Doctor) => {
    return editedBalances[doctor.id] !== undefined
      ? editedBalances[doctor.id]
      : doctor.annual_leave_balance;
  };

  const hasChanges = (doctor: Doctor) => {
    return (
      editedBalances[doctor.id] !== undefined &&
      editedBalances[doctor.id] !== doctor.annual_leave_balance
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Arzt</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Fachgebiet</TableHead>
              <TableHead className="text-center">
                Verfügbare Urlaubstage
              </TableHead>
              <TableHead className="text-center">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  Keine Ärzte gefunden
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => {
                const currentBalance = getCurrentBalance(doctor);
                const isEdited = hasChanges(doctor);
                const isLoading = loading[doctor.id];

                return (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{doctor.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {doctor.user.email}
                    </TableCell>
                    <TableCell>
                      {doctor.specialty ? (
                        <Badge variant="outline">{doctor.specialty}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          value={currentBalance}
                          onChange={(e) =>
                            handleBalanceChange(doctor.id, e.target.value)
                          }
                          className={`w-24 text-center ${
                            isEdited
                              ? "border-blue-500 ring-1 ring-blue-500"
                              : ""
                          }`}
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-500">Tage</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(doctor)}
                          disabled={!isEdited || isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Speichern
                            </>
                          )}
                        </Button>
                        {isEdited && !isLoading && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReset(doctor)}
                          >
                            Zurücksetzen
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Hinweise:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ändern Sie die Anzahl der Urlaubstage im Eingabefeld</li>
          <li>
            • Klicken Sie auf "Speichern", um die Änderungen zu übernehmen
          </li>
          <li>
            • Urlaubstage werden automatisch bei Urlaubsbuchungen (Grund:
            Urlaub) abgezogen
          </li>
          <li>
            • Bei Krankheit, Notfall oder anderen Gründen erfolgt kein Abzug
          </li>
          <li>• Nur Werktage (Montag-Freitag) werden gezählt</li>
        </ul>
      </div>
    </div>
  );
}
