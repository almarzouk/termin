"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function MaintenanceCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check for admin routes and maintenance page
    if (
      pathname.startsWith("/admin") ||
      pathname === "/maintenance" ||
      pathname.startsWith("/login")
    ) {
      setIsChecking(false);
      return;
    }

    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/maintenance/status`,
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data?.enabled === true) {
            router.push("/maintenance");
            return;
          }
        }
      } catch (error) {
        console.error("Maintenance check failed:", error);
      }
      setIsChecking(false);
    };

    checkMaintenanceMode();
  }, [pathname, router]);

  if (
    isChecking &&
    !pathname.startsWith("/admin") &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/login")
  ) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  return null;
}
