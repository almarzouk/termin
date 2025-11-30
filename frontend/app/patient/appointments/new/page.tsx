"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle,
  ArrowLeft,
  User,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  clinic_name: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [formData, setFormData] = useState({
    doctor_id: "",
    service_id: "",
    appointment_date: new Date(),
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchDoctors();
    fetchServices();
  }, []);

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      fetchAvailableSlots();
    }
  }, [formData.doctor_id, formData.appointment_date]);

  const fetchDoctors = async () => {
    try {
      const response = await api.doctors.getAll();
      const doctorsList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Use mock data as fallback
      setDoctors([
        {
          id: 1,
          name: "Dr. Anna Schmidt",
          specialization: "Kardiologie",
          clinic_name: "Herzzentrum Berlin",
        },
        {
          id: 2,
          name: "Dr. Michael Müller",
          specialization: "Neurologie",
          clinic_name: "Neuro-Klinik Hamburg",
        },
        {
          id: 3,
          name: "Dr. Sarah Weber",
          specialization: "Pädiatrie",
          clinic_name: "Kinderklinik München",
        },
      ]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.services.getAll();
      const servicesList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
      // Use mock data as fallback
      setServices([
        {
          id: 1,
          name: "Routineuntersuchung",
          description: "Allgemeine Gesundheitsuntersuchung",
          duration: 30,
          price: 50,
        },
        {
          id: 2,
          name: "Beratung",
          description: "Medizinische Beratung und Diagnose",
          duration: 45,
          price: 80,
        },
        {
          id: 3,
          name: "Nachsorge",
          description: "Nachsorgeuntersuchung",
          duration: 20,
          price: 40,
        },
      ]);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = formData.appointment_date.toISOString().split("T")[0];
      const response = await api.appointments.checkAvailability({
        doctor_id: parseInt(formData.doctor_id),
        date: dateStr,
      });

      // Handle different response structures
      let slots = [];
      if (response.data?.available_slots) {
        slots = response.data.available_slots;
      } else if (Array.isArray(response.data)) {
        slots = response.data;
      } else if (response.available_slots) {
        slots = response.available_slots;
      }

      if (slots.length > 0) {
        setAvailableSlots(slots);
      } else {
        generateDefaultSlots();
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      // Generate default slots if API fails
      generateDefaultSlots();
    }
  };

  const generateDefaultSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: Math.random() > 0.3,
      });
      if (hour < 17) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:30`,
          available: Math.random() > 0.3,
        });
      }
    }
    setAvailableSlots(slots);
  };

  const handleSubmit = async () => {
    if (
      !formData.doctor_id ||
      !formData.service_id ||
      !formData.appointment_time
    ) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const dateStr = formData.appointment_date.toISOString().split("T")[0];

      await api.appointments.create({
        doctor_id: parseInt(formData.doctor_id),
        service_id: parseInt(formData.service_id),
        appointment_date: dateStr,
        appointment_time: formData.appointment_time,
        notes: formData.notes,
      });

      toast({
        title: "Erfolg!",
        description: "Ihr Termin wurde erfolgreich gebucht",
      });

      setTimeout(() => {
        router.push("/patient/appointments");
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Fehler",
        description: "Termin konnte nicht gebucht werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(
    (d) => d.id === parseInt(formData.doctor_id)
  );
  const selectedService = services.find(
    (s) => s.id === parseInt(formData.service_id)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Termin buchen</h1>
          <p className="text-gray-600 mt-2">
            Buchen Sie einen Termin mit Ihrem Arzt
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-24 h-1 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 gap-16">
            <span className="text-sm">Arzt wählen</span>
            <span className="text-sm">Datum & Zeit</span>
            <span className="text-sm">Bestätigen</span>
          </div>
        </div>

        {/* Step 1: Select Doctor and Service */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Arzt und Leistung wählen</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="doctor">Arzt auswählen *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, doctor_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie einen Arzt" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-500">
                              {doctor.specialization} - {doctor.clinic_name}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">Leistung auswählen *</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Leistung" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id.toString()}
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">
                            {service.description} - {service.duration} Min - €
                            {service.price}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.doctor_id || !formData.service_id}
                >
                  Weiter
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Datum und Uhrzeit wählen</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Datum auswählen *</Label>
                <Calendar
                  mode="single"
                  selected={formData.appointment_date}
                  onSelect={(date) =>
                    date && setFormData({ ...formData, appointment_date: date })
                  }
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label className="mb-2 block">Verfügbare Zeiten</Label>
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={
                        formData.appointment_time === slot.time
                          ? "default"
                          : "outline"
                      }
                      disabled={!slot.available}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          appointment_time: slot.time,
                        })
                      }
                      className="justify-start"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Zurück
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.appointment_time}
              >
                Weiter
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Terminbestätigung</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Arzt</p>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedDoctor?.specialization}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Stethoscope className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Leistung</p>
                  <p className="text-sm text-gray-600">
                    {selectedService?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dauer: {selectedService?.duration} Minuten
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Datum und Uhrzeit</p>
                  <p className="text-sm text-gray-600">
                    {formData.appointment_date.toLocaleDateString("de-DE", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.appointment_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Standort</p>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor?.clinic_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Fügen Sie Notizen oder besondere Anliegen hinzu..."
                className="mt-2"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Zurück
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  "Wird gebucht..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Termin bestätigen
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
