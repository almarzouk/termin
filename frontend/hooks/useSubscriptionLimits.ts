import { useEffect, useState } from "react";

interface LimitCheck {
  allowed: boolean;
  message: string;
  current: number;
  limit: number | null;
}

interface SubscriptionFeatures {
  sms: boolean;
  email: boolean;
  reports: boolean;
  analytics: boolean;
  api_access: boolean;
  priority_support: number;
}

interface SubscriptionLimits {
  clinics: LimitCheck;
  doctors: LimitCheck;
  staff: LimitCheck;
  appointments: LimitCheck;
  features: SubscriptionFeatures;
}

export function useSubscriptionLimits() {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Check user role - patients don't need subscription limits
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const userRole = user.roles?.[0] || null;

        // If user is a patient/customer, skip fetching limits
        if (userRole === "customer" || userRole === "patient") {
          setLimits({
            clinics: { allowed: true, message: "", current: 0, limit: null },
            doctors: { allowed: true, message: "", current: 0, limit: null },
            staff: { allowed: true, message: "", current: 0, limit: null },
            appointments: {
              allowed: true,
              message: "",
              current: 0,
              limit: null,
            },
            features: {
              sms: true,
              email: true,
              reports: true,
              analytics: true,
              api_access: true,
              priority_support: 0,
            },
          });
          setLoading(false);
          return;
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/limits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Abonnementgrenzen");
      }

      const data = await response.json();
      setLimits(data.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
      console.error("Error fetching subscription limits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const canCreateClinic = (): boolean => {
    return limits?.clinics.allowed ?? false;
  };

  const canCreateDoctor = (): boolean => {
    return limits?.doctors.allowed ?? false;
  };

  const canCreateStaff = (): boolean => {
    return limits?.staff.allowed ?? false;
  };

  const canCreateAppointment = (): boolean => {
    // Default to true if limits not loaded yet (for patients)
    return limits?.appointments.allowed ?? true;
  };

  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return limits?.features[feature] ?? false;
  };

  const getLimitMessage = (
    type: "clinics" | "doctors" | "staff" | "appointments"
  ): string => {
    return limits?.[type].message ?? "";
  };

  const getUsagePercentage = (
    type: "clinics" | "doctors" | "staff" | "appointments"
  ): number => {
    const limit = limits?.[type];
    if (!limit || limit.limit === null) return 0;
    return Math.round((limit.current / limit.limit) * 100);
  };

  return {
    limits,
    loading,
    error,
    canCreateClinic,
    canCreateDoctor,
    canCreateStaff,
    canCreateAppointment,
    hasFeature,
    getLimitMessage,
    getUsagePercentage,
    refetch: fetchLimits,
  };
}
