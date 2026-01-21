"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[] | Array<{ name: string }>;
}

interface UseRoleCheckOptions {
  allowedRoles: string[];
  redirectTo?: string;
  showAlert?: boolean;
}

export function useRoleCheck({
  allowedRoles,
  redirectTo = "/dashboard",
  showAlert = true,
}: UseRoleCheckOptions) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      const userData = data.data || data.user || data;
      setUser(userData);

      // Handle both formats: string[] or {name: string}[]
      let userRoles: string[] = [];
      if (Array.isArray(userData.roles)) {
        if (typeof userData.roles[0] === "string") {
          userRoles = userData.roles;
        } else if (userData.roles[0]?.name) {
          userRoles = userData.roles.map((r: any) => r.name);
        }
      }

      const hasAccess = userRoles.some((role: string) =>
        allowedRoles.includes(role)
      );

      if (!hasAccess) {
        if (showAlert) {
          alert(
            "Zugriff verweigert: Sie haben keine Berechtigung für diese Seite."
          );
        }
        router.push(redirectTo);
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Role check error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isAuthorized, isLoading };
}

export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user || !user.roles) return false;

  // Handle both formats: string[] or {name: string}[]
  let userRoles: string[] = [];
  if (Array.isArray(user.roles)) {
    if (typeof user.roles[0] === "string") {
      userRoles = user.roles as string[];
    } else if ((user.roles[0] as any)?.name) {
      userRoles = (user.roles as Array<{ name: string }>).map((r) => r.name);
    }
  }

  return userRoles.some((role) => roles.includes(role));
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, ["super_admin"]);
}

export function isClinicOwner(user: User | null): boolean {
  return hasRole(user, ["clinic_owner"]);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, [
    "super_admin",
    "clinic_owner",
    "clinic_manager",
    "manager",
  ]);
}
