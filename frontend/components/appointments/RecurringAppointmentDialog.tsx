"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Repeat } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface RecurringAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinics?: any[];
  patients?: any[];
  services?: any[];
}

type RecurringPattern = "daily" | "weekly" | "monthly" | "yearly";
type EndType = "date" | "count";

const DAYS_OF_WEEK = [
  { value: 0, label: "So" },
  { value: 1, label: "Mo" },
  { value: 2, label: "Di" },
  { value: 3, label: "Mi" },
  { value: 4, label: "Do" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
];

export default function RecurringAppointmentDialog({
  isOpen,
  onClose,
  onSuccess,
  clinics = [],
  patients = [],
  services = [],
}: RecurringAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pattern, setPattern] = useState<RecurringPattern>("weekly");
  const [interval, setInterval] = useState(1);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday by default
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [endType, setEndType] = useState<EndType>("count");
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [occurrenceCount, setOccurrenceCount] = useState(10);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [previewOccurrences, setPreviewOccurrences] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    clinic_id: "",
    patient_id: "",
    service_id: "",
    staff_id: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [
    isOpen,
    pattern,
    interval,
    selectedDays,
    dayOfMonth,
    endType,
    endDate,
    occurrenceCount,
    startDate,
  ]);

  const generatePreview = () => {
    const preview: string[] = [];
    let currentDate = new Date(startDate);
    const maxPreview = 5;
    let count = 0;

    const maxIterations = endType === "count" ? occurrenceCount : 100;

    for (let i = 0; i < maxIterations && preview.length < maxPreview; i++) {
      if (i > 0) {
        switch (pattern) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + interval);
            break;
          case "weekly":
            if (selectedDays.length > 0) {
              // Find next selected day
              let daysToAdd = 1;
              let nextDay = (currentDate.getDay() + daysToAdd) % 7;

              while (!selectedDays.includes(nextDay)) {
                daysToAdd++;
                nextDay = (currentDate.getDay() + daysToAdd) % 7;
                if (daysToAdd > 7) break;
              }

              currentDate.setDate(currentDate.getDate() + daysToAdd);
            } else {
              currentDate.setDate(currentDate.getDate() + 7 * interval);
            }
            break;
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + interval);
            if (dayOfMonth) currentDate.setDate(dayOfMonth);
            break;
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + interval);
            break;
        }
      }

      if (endType === "date" && endDate && currentDate > endDate) break;

      preview.push(format(currentDate, "PPP", { locale: de }));
      count++;
    }

    setPreviewOccurrences(preview);
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async () => {
    if (!formData.clinic_id || !formData.patient_id || !formData.service_id) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const startDateTime = new Date(startDate);
      const [hours, minutes] = startTime.split(":");
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const data = {
        clinic_id: parseInt(formData.clinic_id),
        patient_id: parseInt(formData.patient_id),
        service_id: parseInt(formData.service_id),
        staff_id: formData.staff_id ? parseInt(formData.staff_id) : undefined,
        start_time: format(startDateTime, "yyyy-MM-dd HH:mm:ss"),
        recurring_pattern: pattern,
        recurring_interval: interval,
        recurring_days: pattern === "weekly" ? selectedDays : undefined,
        recurring_day_of_month: pattern === "monthly" ? dayOfMonth : undefined,
        recurring_end_date:
          endType === "date" && endDate
            ? format(endDate, "yyyy-MM-dd")
            : undefined,
        recurring_count: endType === "count" ? occurrenceCount : undefined,
        notes: formData.notes,
      };

      await api.appointments.createRecurring(data);

      toast({
        title: "Erfolg",
        description: "Wiederkehrende Termine wurden erstellt",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Termine konnten nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clinic_id: "",
      patient_id: "",
      service_id: "",
      staff_id: "",
      notes: "",
    });
    setPattern("weekly");
    setInterval(1);
    setSelectedDays([1]);
    setDayOfMonth(1);
    setEndType("count");
    setEndDate(undefined);
    setOccurrenceCount(10);
    setStartDate(new Date());
    setStartTime("09:00");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Wiederkehrende Termine erstellen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Klinik *</Label>
              <Select
                value={formData.clinic_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, clinic_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Klinik" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id.toString()}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, patient_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Patienten" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service *</Label>
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Startzeit *</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">
              Wiederholungsmuster
            </Label>

            <RadioGroup
              value={pattern}
              onValueChange={(value) => setPattern(value as RecurringPattern)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">
                  Täglich
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">
                  Wöchentlich
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">
                  Monatlich
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly" className="cursor-pointer">
                  Jährlich
                </Label>
              </div>
            </RadioGroup>

            {/* Interval */}
            <div className="flex items-center gap-2">
              <Label>Alle</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Label>
                {pattern === "daily" && "Tag(e)"}
                {pattern === "weekly" && "Woche(n)"}
                {pattern === "monthly" && "Monat(e)"}
                {pattern === "yearly" && "Jahr(e)"}
              </Label>
            </div>

            {/* Weekly: Days of week */}
            {pattern === "weekly" && (
              <div className="space-y-2">
                <Label>An folgenden Tagen:</Label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                      />
                      <Label
                        htmlFor={`day-${day.value}`}
                        className="cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly: Day of month */}
            {pattern === "monthly" && (
              <div className="flex items-center gap-2">
                <Label>Am Tag:</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Label>des Monats</Label>
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: de })
                    ) : (
                      <span>Datum wählen</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Condition */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Endet</Label>

              <RadioGroup
                value={endType}
                onValueChange={(value) => setEndType(value as EndType)}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date" id="end-date" />
                    <Label htmlFor="end-date" className="cursor-pointer">
                      Am
                    </Label>
                  </div>
                  {endType === "date" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal ml-6"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP", { locale: de })
                          ) : (
                            <span>Enddatum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="count" id="end-count" />
                    <Label htmlFor="end-count" className="cursor-pointer">
                      Nach
                    </Label>
                  </div>
                  {endType === "count" && (
                    <div className="flex items-center gap-2 ml-6">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={occurrenceCount}
                        onChange={(e) =>
                          setOccurrenceCount(parseInt(e.target.value) || 1)
                        }
                        className="w-24"
                      />
                      <Label>Termin(en)</Label>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-base font-semibold">
              Vorschau (erste {previewOccurrences.length} Termine)
            </Label>
            <div className="bg-gray-50 p-4 rounded-lg space-y-1">
              {previewOccurrences.map((date, index) => (
                <div key={index} className="text-sm text-gray-700">
                  {index + 1}. {date} um {startTime} Uhr
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notizen</Label>
            <Input
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Zusätzliche Informationen..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Wird erstellt..." : "Termine erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
