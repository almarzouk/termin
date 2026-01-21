"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Define route permissions
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Patient routes
  "/patient": ["customer"],
  
  // Dashboard routes
  "/dashboard": ["customer", "doctor", "nurse", "receptionist", "pharmacist", "lab_technician", "clinic_owner", "clinic_manager", "manager", "super_admin"],
  "/dashboard/appointment": ["customer", "doctor", "nurse", "receptionist", "clinic_owner", "clinic_manager", "super_admin"],
  "/dashboard/schedule": ["doctor", "nurse", "receptionist", "pharmacist", "lab_technician", "clinic_owner", "clinic_manager", "super_admin"],
  "/dashboard/clinic": ["doctor", "nurse", "receptionist", "pharmacist", "lab_technician", "clinic_owner", "clinic_manager", "super_admin"],
  "/dashboard/patients": ["doctor", "nurse", "receptionist", "clinic_owner", "clinic_manager", "super_admin"],
  "/dashboard/report": ["clinic_owner", "clinic_manager", "manager", "super_admin"],
  "/dashboard/payment": ["clinic_owner", "clinic_manager", "manager", "receptionist", "super_admin"],
  "/dashboard/mail": ["customer", "doctor", "nurse", "receptionist", "clinic_owner", "clinic_manager", "super_admin"],
  "/dashboard/account": ["customer", "doctor", "nurse", "receptionist", "clinic_owner", "clinic_manager", "super_admin"],

  // Admin routes
  "/admin": ["super_admin", "clinic_owner"],
  "/admin/dashboard": ["super_admin", "clinic_owner"],
  "/admin/clinics": ["super_admin", "clinic_owner"],
  "/admin/branches": ["super_admin", "clinic_owner"],
  "/admin/users": ["super_admin"],
  "/admin/doctors": ["super_admin", "clinic_owner"],
  "/admin/patients": ["super_admin", "clinic_owner", "receptionist"],
  "/admin/nurses": ["super_admin", "clinic_owner"],
  "/admin/receptionists": ["super_admin", "clinic_owner"],
  "/admin/services": ["super_admin", "clinic_owner"],
  "/admin/reviews": ["super_admin", "clinic_owner"],
  "/admin/my-subscription": ["clinic_owner"],
  "/admin/activity-logs": ["super_admin"],
  "/admin/permissions": ["super_admin"],
  "/admin/backups": ["super_admin"],
  "/admin/system-settings": ["super_admin"],
  "/admin/reports": ["super_admin", "clinic_owner"],
  "/admin/notifications": ["super_admin", "clinic_owner"],
  "/admin/maintenance": ["super_admin"],
  "/admin/subscription-plans": ["super_admin"],
  "/admin/coupons": ["super_admin"],
  "/admin/subscriptions": ["super_admin"],
};

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthorization();
  }, [pathname]);

  const checkAuthorization = () => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push(`/login?redirect=${pathname}`);
      setIsAuthorized(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      const userRole = user.roles?.[0] || null;

      if (!userRole) {
        router.push("/login");
        setIsAuthorized(false);
        return;
      }

      // Get required roles for current path
      let allowedRoles = requiredRoles;
      
      if (!allowedRoles) {
        // Find matching route pattern
        for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
          if (pathname.startsWith(route)) {
            allowedRoles = roles;
            break;
          }
        }
      }

      // If no specific roles required, allow access
      if (!allowedRoles || allowedRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }

      // Check if user has required role
      if (allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        // Redirect based on user role
        if (userRole === "customer") {
          router.push("/dashboard");
        } else if (userRole === "super_admin" || userRole === "clinic_owner") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Error checking authorization:", error);
      router.push("/login");
      setIsAuthorized(false);
    }
  };

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Hook to check if user has specific role
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserRole(parsedUser.roles?.[0] || null);
    }
    setLoading(false);
  }, []);

  const hasRole = (roles: string | string[]) => {
    if (!userRole) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userRole);
  };

  const hasAnyRole = (roles: string[]) => {
    if (!userRole) return false;
    return roles.includes(userRole);
  };

  return { user, userRole, loading, hasRole, hasAnyRole };
}
