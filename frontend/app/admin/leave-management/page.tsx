"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, Users, Plane } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { DoctorAvailabilityCalendar } from "@/components/admin/doctor-availability-calendar";
import { LeaveBalanceSettings } from "@/components/admin/leave-balance-settings";

interface Doctor {
  id: number;
  user_id: number;
  clinic_id: number;
  user: {
    name: string;
    email: string;
  };
  clinic: {
    name: string;
  };
  specialty?: string;
  annual_leave_balance: number;
}

export default function LeaveManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.admin.staff.getAll({ role: "doctor" });

      if (response?.data) {
        // Check if data is paginated or direct array
        const doctorsData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Laden der Ärzte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Urlaub & Verfügbarkeit
          </h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie Urlaubstage und Verfügbarkeit für alle Mitarbeiter
          </p>
        </div>
        <Plane className="h-10 w-10 text-blue-600" />
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Kalender & Abwesenheit
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Urlaubstage-Einstellungen
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Verfügbarkeitskalender
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Sehen Sie die Verfügbarkeit der Ärzte und erstellen Sie
                Abwesenheitsperioden
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Wird geladen...
              </div>
            ) : (
              <DoctorAvailabilityCalendar doctors={doctors} />
            )}
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Urlaubstage verwalten
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Legen Sie die jährlichen Urlaubstage für jeden Mitarbeiter fest
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Wird geladen...
              </div>
            ) : (
              <LeaveBalanceSettings doctors={doctors} onUpdate={fetchDoctors} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
