"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWeekend,
  isBefore,
  startOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { CreateUnavailabilityDialog } from "./create-unavailability-dialog";

interface Doctor {
  id: number;
  user: {
    name: string;
  };
  clinic_id: number;
}

interface UnavailabilityPeriod {
  id: number;
  staff_id: number;
  staff_name: string;
  annual_leave_balance?: number;
  start_date: string;
  end_date: string;
  reason: string;
  reason_label: string;
  notes: string | null;
}

interface DoctorAvailabilityCalendarProps {
  doctors: Doctor[];
  clinicId?: number;
}

export function DoctorAvailabilityCalendar({
  doctors,
  clinicId,
}: DoctorAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<number | "all">("all");
  const [unavailabilityPeriods, setUnavailabilityPeriods] = useState<
    UnavailabilityPeriod[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDoctorForAbsence, setSelectedDoctorForAbsence] = useState<
    number | null
  >(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnavailabilityPeriods();
  }, [clinicId]);

  const fetchUnavailabilityPeriods = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (clinicId) {
        params.clinic_id = clinicId;
      }

      const response = await api.admin.staffUnavailability.getAll(params);

      if (response && response.success) {
        setUnavailabilityPeriods(response.data || []);
      } else {
        setUnavailabilityPeriods([]);
      }
    } catch (error) {
      console.error("Error fetching unavailability:", error);
      setUnavailabilityPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date, doctorId: number) => {
    if (!selectionMode) return;

    const today = startOfDay(new Date());
    const clickedDate = startOfDay(date);

    // Don't allow selecting past dates or weekends
    if (isBefore(clickedDate, today) || isWeekend(date)) {
      return;
    }

    // Check if date is already unavailable
    if (isDateUnavailable(date, doctorId)) {
      toast({
        title: "Datum nicht verfügbar",
        description: "Dieser Tag ist bereits als nicht verfügbar markiert",
        variant: "destructive",
      });
      return;
    }

    // Toggle date selection
    const isSelected = selectedDates.some((d) => isSameDay(d, date));
    if (isSelected) {
      setSelectedDates(selectedDates.filter((d) => !isSameDay(d, date)));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const startSelection = (doctorId: number) => {
    setSelectionMode(true);
    setSelectedDoctorForAbsence(doctorId);
    setSelectedDates([]);
    toast({
      title: "Auswahlmodus aktiviert",
      description:
        "Klicken Sie auf die Tage, um eine Abwesenheitsperiode zu erstellen",
    });
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedDoctorForAbsence(null);
    setSelectedDates([]);
  };

  const confirmSelection = () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Keine Tage ausgewählt",
        description: "Bitte wählen Sie mindestens einen Tag aus",
        variant: "destructive",
      });
      return;
    }

    // Sort dates to get start and end
    const sortedDates = [...selectedDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    setShowCreateDialog(true);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const isDateUnavailable = (date: Date, doctorId: number) => {
    const dateStr = format(date, "yyyy-MM-dd");

    const isUnavailable = unavailabilityPeriods.some((period) => {
      if (period.staff_id !== doctorId) return false;

      // Compare date strings directly to avoid timezone issues
      const startDate = period.start_date.split("T")[0]; // Get YYYY-MM-DD part
      const endDate = period.end_date.split("T")[0];

      const inRange = dateStr >= startDate && dateStr <= endDate;
      return inRange;
    });

    return isUnavailable;
  };

  const getUnavailabilityReason = (date: Date, doctorId: number) => {
    const dateStr = format(date, "yyyy-MM-dd");

    const period = unavailabilityPeriods.find((p) => {
      if (p.staff_id !== doctorId) return false;

      // Compare date strings directly to avoid timezone issues
      const startDate = p.start_date.split("T")[0];
      const endDate = p.end_date.split("T")[0];

      return dateStr >= startDate && dateStr <= endDate;
    });

    return period;
  };

  const getDayStatus = (date: Date, doctorId: number) => {
    const today = startOfDay(new Date());
    const currentDate = startOfDay(date);

    // Check unavailability FIRST (before past dates check)
    const unavailable = isDateUnavailable(date, doctorId);
    if (unavailable) {
      const period = getUnavailabilityReason(date, doctorId);
      return {
        label: period?.reason_label || "Nicht verfügbar",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: AlertCircle,
        period,
      };
    }

    // Past dates
    if (isBefore(currentDate, today)) {
      return {
        label: "Vergangen",
        color: "bg-gray-100 text-gray-400",
        icon: null,
      };
    }

    // Weekends
    if (isWeekend(date)) {
      return {
        label: "Wochenende",
        color: "bg-gray-200 text-gray-500",
        icon: XCircle,
      };
    }

    // Available
    return {
      label: "Verfügbar",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    };
  };

  const filteredDoctors =
    selectedDoctor === "all"
      ? doctors
      : doctors.filter((d) => d.id === selectedDoctor);

  const monthYear = format(currentMonth, "MMMM yyyy", { locale: de });

  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const days = getDaysInMonth();

  // Get first day of month to calculate offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0

  return (
    <>
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verfügbarkeitskalender
                </h2>
                <p className="text-sm text-gray-600">
                  Zeigt die Verfügbarkeit der Ärzte pro Tag
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Doctor Filter */}
              <Select
                value={selectedDoctor.toString()}
                onValueChange={(value) =>
                  setSelectedDoctor(value === "all" ? "all" : parseInt(value))
                }
                disabled={selectionMode}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Arzt auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Ärzte</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[150px] text-center font-semibold">
                  {monthYear}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Heute
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Verfügbar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Nicht verfügbar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Wochenende</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Vergangen</span>
              </div>
              {selectionMode && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                  <span>Ausgewählt</span>
                </div>
              )}
            </div>

            {/* Selection Mode Controls */}
            {selectionMode && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {selectedDates.length} Tag(e) ausgewählt
                </Badge>
                <Button size="sm" variant="outline" onClick={cancelSelection}>
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  onClick={confirmSelection}
                  disabled={selectedDates.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Weiter
                </Button>
              </div>
            )}
          </div>

          {/* Calendar per Doctor */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Wird geladen...
            </div>
          ) : (
            <div className="space-y-6">
              {filteredDoctors.map((doctor) => {
                // Get the annual leave balance from the last period for this doctor
                const doctorPeriods = unavailabilityPeriods.filter(
                  (p) => p.staff_id === doctor.id
                );
                const annualLeaveBalance =
                  doctorPeriods.length > 0 &&
                  doctorPeriods[0].annual_leave_balance !== undefined
                    ? doctorPeriods[0].annual_leave_balance
                    : 30;

                return (
                  <div key={doctor.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {doctor.user.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                annualLeaveBalance > 10
                                  ? "default"
                                  : annualLeaveBalance > 5
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {annualLeaveBalance} Urlaubstage verfügbar
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!selectionMode && selectedDoctor === "all" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startSelection(doctor.id)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Abwesenheit erstellen
                        </Button>
                      )}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Week day headers */}
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-600 py-2"
                        >
                          {day}
                        </div>
                      ))}

                      {/* Empty cells for offset */}
                      {Array.from({ length: offset }).map((_, i) => (
                        <div
                          key={`offset-${i}`}
                          className="aspect-square"
                        ></div>
                      ))}

                      {/* Days */}
                      {days.map((day) => {
                        const status = getDayStatus(day, doctor.id);
                        const isToday = isSameDay(day, new Date());
                        const isSelected =
                          selectionMode &&
                          selectedDoctorForAbsence === doctor.id &&
                          selectedDates.some((d) => isSameDay(d, day));
                        const isSelectable =
                          selectionMode &&
                          selectedDoctorForAbsence === doctor.id &&
                          !isBefore(startOfDay(day), startOfDay(new Date())) &&
                          !isWeekend(day) &&
                          !isDateUnavailable(day, doctor.id);

                        return (
                          <div
                            key={day.toISOString()}
                            onClick={() =>
                              isSelectable && handleDateClick(day, doctor.id)
                            }
                            className={`aspect-square border rounded-lg p-2 transition-all ${
                              isSelectable
                                ? "cursor-pointer hover:shadow-lg hover:scale-105"
                                : ""
                            } ${
                              isSelected
                                ? "bg-blue-100 border-2 border-blue-500 ring-2 ring-blue-300"
                                : status.color
                            } ${
                              isToday && !isSelected
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            title={isSelected ? "Ausgewählt" : status.label}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="text-sm font-semibold">
                                {format(day, "d")}
                              </div>
                              {isSelected ? (
                                <CheckCircle className="h-3 w-3 mt-1 text-blue-600" />
                              ) : (
                                status.icon && (
                                  <status.icon className="h-3 w-3 mt-1" />
                                )
                              )}
                              {status.period && !isSelected && (
                                <div className="text-[10px] mt-1 text-center leading-tight">
                                  {status.period.reason_label}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Create Unavailability Dialog */}
      <CreateUnavailabilityDialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            // Reset selection when dialog closes
            cancelSelection();
          }
        }}
        doctors={doctors}
        onSuccess={() => {
          fetchUnavailabilityPeriods();
          cancelSelection();
        }}
        preSelectedDoctorId={selectedDoctorForAbsence}
        preSelectedStartDate={
          selectedDates.length > 0
            ? [...selectedDates].sort((a, b) => a.getTime() - b.getTime())[0]
            : null
        }
        preSelectedEndDate={
          selectedDates.length > 0
            ? [...selectedDates].sort((a, b) => a.getTime() - b.getTime())[
                selectedDates.length - 1
              ]
            : null
        }
      />
    </>
  );
}
