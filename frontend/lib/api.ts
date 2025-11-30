// API Configuration and Service Layer
import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 10000,
  withCredentials: false, // تعطيل cookies لاستخدام token فقط
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token added to request:", {
        url: config.url,
        token: token.substring(0, 20) + "...",
      });
    } else {
      console.warn("⚠️ No token found for request:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      console.error("🚫 401 Unauthorized - Token invalid or expired");
      // يمكن إضافة redirect للـ login هنا
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          console.log("Redirecting to login...");
          window.location.href = "/login";
        }
      }
    }

    if (error.response) {
      // Server responded with error
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        "Ein Serverfehler ist aufgetreten";
      console.error("❌ API Error:", {
        status: error.response.status,
        message,
        url: error.config?.url,
      });
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      console.error("❌ Network Error:", error.request);
      throw new Error(
        "Verbindung zum Server fehlgeschlagen. Bitte überprüfen Sie Ihre Internetverbindung."
      );
    } else {
      // Something else happened
      console.error("❌ Unknown Error:", error.message);
      throw new Error(
        error.message || "Ein unerwarteter Fehler ist aufgetreten"
      );
    }
  }
);

// API Methods
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<{ token: string; user: any }>("/auth/login", {
        email,
        password,
      }),

    register: (data: any) =>
      apiClient.post<{ token: string; user: any }>("/auth/register", data),

    logout: () => apiClient.post<{ message: string }>("/auth/logout"),

    me: () => apiClient.get<{ user: any }>("/auth/user"),

    updateProfile: (data: any) =>
      apiClient.put<{ user: any; message: string }>("/auth/profile", data),

    changePassword: (data: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => apiClient.put<{ message: string }>("/auth/password", data),
  },

  // Doctors
  doctors: {
    getAll: (params?: {
      page?: number;
      search?: string;
      specialty?: string;
    }) => {
      return apiClient.get<PaginatedResponse<any>>("/doctors", { params });
    },

    getById: (id: number) => apiClient.get<{ data: any }>(`/doctors/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/doctors", data),

    update: (id: number, data: any) =>
      apiClient.put<{ data: any; message: string }>(`/doctors/${id}`, data),

    delete: (id: number) =>
      apiClient.delete<{ message: string }>(`/doctors/${id}`),

    getSchedule: (doctorId: number, date?: string) => {
      return apiClient.get<{ data: any[] }>(`/doctors/${doctorId}/schedule`, {
        params: { date },
      });
    },
  },

  // Patients
  patients: {
    getAll: (params?: { page?: number; search?: string }) => {
      return apiClient.get<PaginatedResponse<any>>("/patients", { params });
    },

    getById: (id: number) => apiClient.get<{ data: any }>(`/patients/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/patients", data),

    update: (id: number, data: any) =>
      apiClient.put<{ data: any; message: string }>(`/patients/${id}`, data),

    delete: (id: number) =>
      apiClient.delete<{ message: string }>(`/patients/${id}`),
  },

  // Appointments
  appointments: {
    getAll: (params?: {
      page?: number;
      date?: string;
      doctor_id?: number;
      patient_id?: number;
      status?: string;
    }) => {
      return apiClient.get<PaginatedResponse<any>>("/appointments", {
        params,
      });
    },

    getById: (id: number) =>
      apiClient.get<{ data: any }>(`/appointments/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/appointments", data),

    update: (id: number, data: any) =>
      apiClient.put<{ data: any; message: string }>(
        `/appointments/${id}`,
        data
      ),

    cancel: (id: number) =>
      apiClient.post<{ message: string }>(`/appointments/${id}/cancel`),

    confirm: (id: number) =>
      apiClient.post<{ message: string }>(`/appointments/${id}/confirm`),

    delete: (id: number) =>
      apiClient.delete<{ message: string }>(`/appointments/${id}`),

    checkAvailability: (params: { doctor_id: number; date: string }) =>
      apiClient.post<{ data: any[] }>(
        "/appointments/check-availability",
        params
      ),
  },

  // Services
  services: {
    getAll: (params?: { clinic_id?: number }) => {
      // If clinic_id is provided, use clinic-specific route
      if (params?.clinic_id) {
        return apiClient.get<{ data: any[] }>(
          `/clinics/${params.clinic_id}/services`
        );
      }
      // Otherwise use admin route
      return apiClient.get<PaginatedResponse<any>>("/admin/services", {});
    },

    getById: (id: number) => apiClient.get<{ data: any }>(`/services/${id}`),
  },

  // Medical Records
  medicalRecords: {
    getAll: (params?: {
      page?: number;
      patient_id?: number;
      per_page?: number;
    }) => {
      return apiClient.get<PaginatedResponse<any>>("/medical-records", {
        params,
      });
    },

    getById: (id: number) =>
      apiClient.get<{ data: any }>(`/medical-records/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/medical-records", data),

    update: (id: number, data: any) =>
      apiClient.put<{ data: any; message: string }>(
        `/medical-records/${id}`,
        data
      ),

    delete: (id: number) =>
      apiClient.delete<{ message: string }>(`/medical-records/${id}`),
  },

  // Prescriptions
  prescriptions: {
    getAll: (params?: { page?: number; patient_id?: number }) => {
      return apiClient.get<PaginatedResponse<any>>("/prescriptions", {
        params,
      });
    },

    getActive: () => apiClient.get<{ data: any[] }>("/prescriptions/active"),

    getById: (id: number) =>
      apiClient.get<{ data: any }>(`/prescriptions/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/prescriptions", data),

    update: (id: number, data: any) =>
      apiClient.put<{ data: any; message: string }>(
        `/prescriptions/${id}`,
        data
      ),

    delete: (id: number) =>
      apiClient.delete<{ message: string }>(`/prescriptions/${id}`),
  },

  // Payments
  payments: {
    getAll: (params?: {
      page?: number;
      status?: string;
      patient_id?: number;
    }) => {
      return apiClient.get<PaginatedResponse<any>>("/payments", { params });
    },

    getById: (id: number) => apiClient.get<{ data: any }>(`/payments/${id}`),

    create: (data: any) =>
      apiClient.post<{ data: any; message: string }>("/payments", data),

    updateStatus: (id: number, status: string) =>
      apiClient.put<{ data: any; message: string }>(`/payments/${id}/status`, {
        status,
      }),
  },

  // Clinics
  clinics: {
    getById: (id: number) => apiClient.get<{ data: any }>(`/clinics/${id}`),
  },

  // Reports/Dashboard
  dashboard: {
    getStats: () => apiClient.get<{ data: any }>("/dashboard/stats"),

    getChartData: (
      type: "patients" | "revenue" | "appointments",
      period?: string
    ) =>
      apiClient.get<{ data: any }>(`/dashboard/charts/${type}`, {
        params: { period },
      }),
  },

  // Analytics
  analytics: {
    dashboard: {
      overview: () =>
        apiClient.get<{ data: any }>("/analytics/dashboard/overview"),
      kpis: () => apiClient.get<{ data: any }>("/analytics/dashboard/kpis"),
    },

    patients: {
      index: () => apiClient.get<{ data: any }>("/analytics/patients"),
      growth: () => apiClient.get<{ data: any }>("/analytics/patients/growth"),
      demographics: () =>
        apiClient.get<{ data: any }>("/analytics/patients/demographics"),
    },

    appointments: {
      index: () => apiClient.get<{ data: any }>("/analytics/appointments"),
      trends: () =>
        apiClient.get<{ data: any }>("/analytics/appointments/trends"),
    },

    revenue: {
      index: () => apiClient.get<{ data: any }>("/analytics/revenue"),
      trend: () => apiClient.get<{ data: any }>("/analytics/revenue/trend"),
    },
  },

  // HR/Staff
  staff: {
    getAll: (params?: { page?: number; department?: string }) => {
      return apiClient.get<PaginatedResponse<any>>("/staff", { params });
    },
  },

  // Beds
  beds: {
    getAll: (params?: { department?: string; status?: string }) => {
      return apiClient.get<{ data: any[] }>("/beds", { params });
    },

    updateStatus: (id: number, status: string, patient_id?: number) =>
      apiClient.put<{ data: any; message: string }>(`/beds/${id}/status`, {
        status,
        patient_id,
      }),
  },

  // Admin
  admin: {
    users: {
      getAll: (params?: { search?: string; role?: string; page?: number }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/users", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/users/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/users", data),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/users/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/users/${id}`),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/users/${id}/toggle-status`
        ),

      assignRole: (id: number, role: string) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/users/${id}/assign-role`,
          { role }
        ),
    },

    roles: {
      getAll: () => apiClient.get<{ data: any[] }>("/admin/roles"),
    },

    staff: {
      getAll: (params?: {
        search?: string;
        role?: string;
        clinic_id?: number;
        page?: number;
      }) => apiClient.get<PaginatedResponse<any>>("/admin/staff", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/staff/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/staff", data),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/staff/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/staff/${id}`),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/staff/${id}/toggle-status`
        ),
    },

    clinics: {
      getAll: (params?: { search?: string; status?: string; page?: number }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/clinics", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/clinics/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/clinics", data),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/clinics/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/clinics/${id}`),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/clinics/${id}/toggle-status`
        ),
    },

    services: {
      getAll: (params?: {
        search?: string;
        clinic_id?: number;
        page?: number;
      }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/services", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/services/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/services", data),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/services/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/services/${id}`),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/services/${id}/toggle-status`
        ),
    },

    maintenance: {
      getStatus: () =>
        apiClient.get<{
          data: { enabled: boolean; message?: string; scheduled_at?: string };
        }>("/admin/maintenance/status"),

      enable: (message?: string, scheduled_at?: string) =>
        apiClient.post<{ message: string }>("/admin/maintenance/enable", {
          message,
          scheduled_at,
        }),

      disable: () =>
        apiClient.post<{ message: string }>("/admin/maintenance/disable"),
    },

    notifications: {
      getAll: (params?: { type?: string; status?: string }) =>
        apiClient.get<{ data: any[] }>("/admin/notifications", { params }),

      getTemplates: () =>
        apiClient.get<{ data: any[] }>("/admin/notification-templates"),

      send: (data: any) =>
        apiClient.post<{ message: string }>("/admin/notifications/send", data),

      markAsRead: (id: number) =>
        apiClient.post<{ message: string }>(
          `/admin/notifications/${id}/mark-read`
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/notifications/${id}`),
    },

    activityLogs: {
      getAll: (params?: {
        user?: string;
        action?: string;
        from?: string;
        to?: string;
        page?: number;
      }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/activity-logs", {
          params,
        }),

      export: (format: "csv" | "pdf") =>
        apiClient.get(`/admin/activity-logs/export?format=${format}`, {
          responseType: "blob",
        }),
    },

    systemSettings: {
      getAll: () => apiClient.get<{ data: any }>("/admin/system-settings"),

      update: (data: any) =>
        apiClient.put<{ data: any; message: string }>(
          "/admin/system-settings",
          data
        ),
    },

    backups: {
      getAll: () => apiClient.get<{ data: any[] }>("/admin/backups"),

      getSettings: () =>
        apiClient.get<{ data: any }>("/admin/backups/settings"),

      create: (description?: string) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/backups/create",
          { description }
        ),

      updateSettings: (settings: any) =>
        apiClient.put<{ message: string }>("/admin/backups/settings", settings),

      restore: (id: number) =>
        apiClient.post<{ message: string }>(`/admin/backups/${id}/restore`),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/backups/${id}`),

      download: (id: number) =>
        apiClient.get(`/admin/backups/${id}/download`, {
          responseType: "blob",
        }),
    },

    reports: {
      getAll: () => apiClient.get<{ data: any[] }>("/admin/reports"),

      generate: (
        type: string,
        params?: { from?: string; to?: string; [key: string]: any }
      ) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/reports/generate",
          { type, ...params }
        ),

      appointments: (from: string, to: string) =>
        apiClient.get<{ data: any }>("/admin/reports/appointments", {
          params: { from, to },
        }),

      revenue: (from: string, to: string) =>
        apiClient.get<{ data: any }>("/admin/reports/revenue", {
          params: { from, to },
        }),

      patients: (from: string, to: string) =>
        apiClient.get<{ data: any }>("/admin/reports/patients", {
          params: { from, to },
        }),

      doctors: (from: string, to: string) =>
        apiClient.get<{ data: any }>("/admin/reports/doctors", {
          params: { from, to },
        }),

      services: (from: string, to: string) =>
        apiClient.get<{ data: any }>("/admin/reports/services", {
          params: { from, to },
        }),

      export: (
        typeOrId: string | number,
        format: "pdf" | "excel",
        params?: any
      ) => {
        if (typeof typeOrId === "number") {
          return apiClient.get(
            `/admin/reports/${typeOrId}/export?format=${format}`,
            {
              responseType: "blob",
            }
          );
        }
        return apiClient.get(`/admin/reports/${typeOrId}/export`, {
          params: { format, ...params },
          responseType: "blob",
        });
      },
    },

    permissions: {
      getAll: () => apiClient.get<{ data: any[] }>("/admin/permissions"),

      getRoles: () => apiClient.get<{ data: any[] }>("/admin/roles"),

      getRolePermissions: (roleId: number) =>
        apiClient.get<{ data: string[] }>(`/admin/roles/${roleId}/permissions`),

      updateRolePermissions: (roleId: number, permissions: string[]) =>
        apiClient.post<{ message: string }>(
          `/admin/roles/${roleId}/permissions`,
          { permissions }
        ),

      createRole: (role: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/roles", role),
    },

    dashboard: {
      getStats: () => apiClient.get<{ data: any }>("/admin/dashboard/stats"),

      getTopDoctors: () =>
        apiClient.get<{ data: any[] }>("/admin/dashboard/top-doctors"),
    },

    subscriptionPlans: {
      getAll: (params?: {
        search?: string;
        billing_period?: string;
        is_active?: boolean;
        per_page?: number;
      }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/subscription-plans", {
          params,
        }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/subscription-plans/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/subscription-plans",
          data
        ),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/subscription-plans/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(
          `/admin/subscription-plans/${id}`
        ),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/subscription-plans/${id}/toggle-status`
        ),
    },

    coupons: {
      getAll: (params?: {
        search?: string;
        discount_type?: string;
        is_active?: boolean;
        status?: string;
        per_page?: number;
      }) => apiClient.get<PaginatedResponse<any>>("/admin/coupons", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/coupons/${id}`),

      create: (data: any) =>
        apiClient.post<{ data: any; message: string }>("/admin/coupons", data),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/coupons/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/coupons/${id}`),

      toggleStatus: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/coupons/${id}/toggle-status`
        ),

      validate: (code: string, planId: number, userId: number) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/coupons/validate",
          {
            code,
            plan_id: planId,
            user_id: userId,
          }
        ),

      generate: (data: {
        count: number;
        prefix?: string;
        discount_type: string;
        discount_value: number;
        max_uses_per_user: number;
        valid_from?: string;
        valid_until?: string;
      }) =>
        apiClient.post<{ data: any[]; message: string }>(
          "/admin/coupons/generate",
          data
        ),

      getStats: () => apiClient.get<{ data: any }>("/admin/coupons/stats"),
    },

    subscriptions: {
      getAll: (params?: {
        search?: string;
        status?: string;
        plan_id?: number;
        per_page?: number;
      }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/subscriptions", {
          params,
        }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/subscriptions/${id}`),

      create: (data: {
        user_id: number;
        subscription_plan_id: number;
        clinic_id?: number;
        coupon_code?: string;
        auto_renew?: boolean;
      }) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/subscriptions",
          data
        ),

      cancel: (id: number, reason?: string) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/subscriptions/${id}/cancel`,
          { reason }
        ),

      renew: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/subscriptions/${id}/renew`
        ),

      getStats: () =>
        apiClient.get<{ data: any }>("/admin/subscriptions/stats"),
    },

    appointments: {
      getAll: (params?: {
        search?: string;
        status?: string;
        date?: string;
        patient_id?: number;
        doctor_id?: number;
        clinic_id?: number;
        page?: number;
        per_page?: number;
      }) =>
        apiClient.get<PaginatedResponse<any>>("/admin/appointments", {
          params,
        }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/appointments/${id}`),

      create: (data: {
        patient_id: number;
        doctor_id: number;
        clinic_id: number;
        service_id?: number;
        appointment_date: string;
        appointment_time: string;
        notes?: string;
      }) =>
        apiClient.post<{ data: any; message: string }>(
          "/admin/appointments",
          data
        ),

      update: (id: number, data: any) =>
        apiClient.put<{ data: any; message: string }>(
          `/admin/appointments/${id}`,
          data
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/appointments/${id}`),

      updateStatus: (id: number, status: string) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/appointments/${id}/status`,
          { status }
        ),

      confirm: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/appointments/${id}/confirm`
        ),

      cancel: (id: number, reason?: string) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/appointments/${id}/cancel`,
          { reason }
        ),

      complete: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/appointments/${id}/complete`
        ),

      getStats: () => apiClient.get<{ data: any }>("/admin/appointments/stats"),
    },

    reviews: {
      getAll: (params?: {
        search?: string;
        status?: string;
        rating?: number;
        clinic_id?: number;
        page?: number;
        per_page?: number;
      }) => apiClient.get<PaginatedResponse<any>>("/admin/reviews", { params }),

      getById: (id: number) =>
        apiClient.get<{ data: any }>(`/admin/reviews/${id}`),

      approve: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/reviews/${id}/approve`
        ),

      reject: (id: number) =>
        apiClient.post<{ data: any; message: string }>(
          `/admin/reviews/${id}/reject`
        ),

      delete: (id: number) =>
        apiClient.delete<{ message: string }>(`/admin/reviews/${id}`),

      getStatistics: (clinicId?: number) =>
        apiClient.get<{ data: any }>("/admin/reviews/statistics", {
          params: clinicId ? { clinic_id: clinicId } : {},
        }),
    },
  },
};

export default api;
