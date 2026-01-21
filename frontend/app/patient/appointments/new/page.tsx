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

interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  clinic_name: string;
  clinic_id?: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  clinic_id?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ClinicCapacity {
  total_capacity: number;
  booked: number;
  available: number;
  utilization_percentage: number;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [capacity, setCapacity] = useState<ClinicCapacity | null>(null);

  const [formData, setFormData] = useState({
    clinic_id: "",
    service_id: "",
    appointment_date: new Date(),
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch services when clinic is selected
  useEffect(() => {
    if (formData.clinic_id) {
      fetchServices(parseInt(formData.clinic_id));
    }
  }, [formData.clinic_id]);

  useEffect(() => {
    if (formData.clinic_id && formData.appointment_date) {
      fetchAvailableSlots();
      fetchCapacity();
    }
  }, [formData.clinic_id, formData.service_id, formData.appointment_date]);

  const fetchCapacity = async () => {
    try {
      if (!formData.clinic_id) return;

      const dateStr = formData.appointment_date.toISOString().split("T")[0];
      const response = await api.appointments.getClinicCapacity({
        clinic_id: parseInt(formData.clinic_id),
        date: dateStr,
      });

      if (response.data) {
        setCapacity(response.data);
      }
    } catch (error) {
      console.error("Error fetching capacity:", error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await api.clinics.getAll();
      const clinicsList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setClinics(clinicsList);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Kliniken",
        variant: "destructive",
      });
    }
  };

  const fetchServices = async (clinicId?: number) => {
    try {
      const response = await api.services.getAll();
      let servicesList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Filter services by clinic_id if provided
      if (clinicId) {
        servicesList = servicesList.filter(
          (service: Service) => service.clinic_id === clinicId
        );
      }

      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  // Removed unused fetchServicesFallback function

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = formData.appointment_date.toISOString().split("T")[0];

      // Get clinic_id
      const clinicId = formData.clinic_id || clinics[0]?.id;

      if (!clinicId) {
        console.warn("No clinic selected");
        setAvailableSlots([]);
        return;
      }

      // Use Smart Distribution API to get available slots
      const response = await api.appointments.getAvailableSlots({
        clinic_id: parseInt(clinicId),
        date: dateStr,
        service_id: formData.service_id
          ? parseInt(formData.service_id)
          : undefined,
      });

      if (response.data?.slots && Array.isArray(response.data.slots)) {
        // Remove duplicates by using a Set for unique times
        const uniqueTimes = new Set<string>();
        response.data.slots.forEach((slot: any) => {
          uniqueTimes.add(slot.time);
        });

        // Map unique times to the format expected by the UI
        const formattedSlots = Array.from(uniqueTimes)
          .map((time) => ({
            time,
            available: true,
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        setAvailableSlots(formattedSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
      toast({
        title: "Hinweis",
        description: "Keine verfügbaren Termine für das ausgewählte Datum",
        variant: "default",
      });
    }
  };

  const handleBooking = async () => {
    if (!formData.clinic_id || !formData.appointment_time) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Klinik, ein Datum und eine Uhrzeit",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const dateStr = formData.appointment_date.toISOString().split("T")[0];

      // Get current user's patient_id
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.id) {
        toast({
          title: "Fehler",
          description: "Bitte melden Sie sich an.",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      console.log("👤 User data:", user);

      let patientId = user?.patient_id;

      // If patient_id not in localStorage, fetch from API
      if (!patientId) {
        console.warn("⚠️ patient_id not found, fetching from API...");
        try {
          const response = await api.auth.me();
          console.log("📥 API response:", response.data);
          patientId = response.data?.user?.patient_id;

          // Update localStorage with new data
          if (patientId) {
            const updatedUser = { ...user, patient_id: patientId };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            console.log("✅ Updated user data with patient_id:", patientId);
          } else {
            console.error("❌ No patient_id in API response");
          }
        } catch (error) {
          console.error("❌ Failed to fetch user data:", error);
        }
      }

      console.log("👤 Final Patient ID:", patientId);

      // If still no patient_id after API call, show error but don't redirect
      if (!patientId) {
        toast({
          title: "Fehler",
          description:
            "Kein Patientenprofil gefunden. Bitte kontaktieren Sie den Support.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Use Smart Distribution to find best doctor automatically
      let doctorId = null;

      console.log("🤖 Using Smart Distribution to find best doctor...");
      try {
        const bestDoctorResponse = await api.appointments.findBestDoctor({
          clinic_id: parseInt(formData.clinic_id),
          date: dateStr,
          time: formData.appointment_time,
          service_id: formData.service_id
            ? parseInt(formData.service_id)
            : undefined,
        });

        if (bestDoctorResponse.data?.doctor_id) {
          doctorId = bestDoctorResponse.data.doctor_id;
          console.log(
            "✅ Best doctor assigned:",
            bestDoctorResponse.data.doctor_name,
            "(ID:",
            doctorId,
            ")"
          );

          toast({
            title: "Automatische Zuweisung",
            description: `Dr. ${bestDoctorResponse.data.doctor_name} wurde automatisch zugewiesen`,
          });
        }
      } catch (error) {
        console.error("❌ Failed to find best doctor:", error);
        toast({
          title: "Fehler",
          description:
            "Kein verfügbarer Arzt für den gewählten Zeitpunkt gefunden.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!doctorId) {
        toast({
          title: "Fehler",
          description:
            "Kein verfügbarer Arzt für den gewählten Zeitpunkt gefunden.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      } // Format time as HH:mm:ss
      const timeFormatted =
        formData.appointment_time.length === 5
          ? `${formData.appointment_time}:00`
          : formData.appointment_time;

      const appointmentData: any = {
        clinic_id: parseInt(formData.clinic_id),
        patient_id: patientId,
        staff_id: doctorId,
        appointment_date: dateStr,
        start_time: timeFormatted,
        notes: formData.notes,
      };

      // Add service_id only if selected
      if (formData.service_id) {
        appointmentData.service_id = parseInt(formData.service_id);
      }

      console.log("📤 Sending appointment data:", appointmentData);
      console.log("📤 All fields present?", {
        clinic_id: !!appointmentData.clinic_id,
        patient_id: !!appointmentData.patient_id,
        service_id: !!appointmentData.service_id,
        staff_id: !!appointmentData.staff_id,
        appointment_date: !!appointmentData.appointment_date,
        start_time: !!appointmentData.start_time,
      });

      const response = await api.appointments.create(appointmentData);

      console.log("✅ Appointment created successfully:", response);

      toast({
        title: "Erfolg!",
        description: "Ihr Termin wurde erfolgreich gebucht",
      });

      // Refresh capacity and available slots after successful booking
      await fetchCapacity();
      await fetchAvailableSlots();

      setTimeout(() => {
        router.push("/patient/appointments");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Full error object:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error response:", error?.response?.data);
      console.error("❌ Error status:", error?.response?.status);
      console.error("❌ Has response?:", !!error?.response);

      let errorMessage = "Termin konnte nicht gebucht werden";

      if (error?.response?.data) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
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
            Wählen Sie eine Klinik, Datum und Uhrzeit - wir finden automatisch
            den besten verfügbaren Arzt für Sie
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
            <span className="text-sm">Klinik wählen</span>
            <span className="text-sm">Datum & Zeit</span>
            <span className="text-sm">Bestätigen</span>
          </div>
        </div>

        {/* Step 1: Select Clinic, Doctor and Service */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Klinik wählen</h2>
            <p className="text-sm text-gray-600 mb-6">
              <strong>Hinweis:</strong> Sie müssen nur die Klinik auswählen.
              Arzt und Leistung sind optional. Das System findet automatisch den
              besten verfügbaren Arzt für Ihren gewünschten Termin.
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="clinic">Klinik auswählen *</Label>
                <Select
                  value={formData.clinic_id}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      clinic_id: value,
                      service_id: "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Klinik" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{clinic.name}</p>
                            {clinic.address && (
                              <p className="text-sm text-gray-500">
                                {clinic.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">
                  Leistung auswählen{" "}
                  <span className="text-gray-400 text-sm">(Optional)</span>
                </Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service_id: value })
                  }
                  disabled={!formData.clinic_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.clinic_id
                          ? "Wählen Sie eine Leistung (optional)"
                          : "Bitte wählen Sie zuerst eine Klinik"
                      }
                    />
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
                  disabled={!formData.clinic_id}
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Verfügbare Zeiten</Label>
                  {capacity && (
                    <div className="text-sm">
                      <span className="text-gray-600">Verfügbar: </span>
                      <span
                        className={`font-bold ${
                          capacity.utilization_percentage > 80
                            ? "text-red-600"
                            : capacity.utilization_percentage > 50
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {capacity.available}/{capacity.total_capacity}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({Math.round(capacity.utilization_percentage)}% belegt)
                      </span>
                    </div>
                  )}
                </div>

                {availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Keine verfügbaren Termine für dieses Datum</p>
                    {formData.doctor_id ? (
                      <p className="text-sm mt-1">
                        Dieser Arzt hat keine verfügbaren Termine an diesem Tag
                      </p>
                    ) : (
                      <p className="text-sm mt-1">
                        Bitte wählen Sie ein anderes Datum
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={`${slot.time}-${index}`}
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
                        className={`justify-start ${
                          !slot.available
                            ? "opacity-50 cursor-not-allowed bg-gray-100"
                            : ""
                        }`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.time}
                        {!slot.available && (
                          <span className="ml-auto text-xs text-red-600">
                            Belegt
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
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
                <Stethoscope className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Leistung</p>
                  <p className="text-sm text-gray-600">
                    {selectedService?.name || "Allgemeine Konsultation"}
                  </p>
                  {selectedService && (
                    <p className="text-xs text-gray-500">
                      Dauer: {selectedService.duration} Minuten
                    </p>
                  )}
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
                  <p className="font-medium">Klinik</p>
                  <p className="text-sm text-gray-600">
                    {
                      clinics.find((c) => c.id === parseInt(formData.clinic_id))
                        ?.name
                    }
                  </p>
                  {clinics.find((c) => c.id === parseInt(formData.clinic_id))
                    ?.address && (
                    <p className="text-xs text-gray-500">
                      {
                        clinics.find(
                          (c) => c.id === parseInt(formData.clinic_id)
                        )?.address
                      }
                    </p>
                  )}
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
              <Button onClick={handleBooking} disabled={loading}>
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
