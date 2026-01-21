import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route access control based on roles
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Public routes (no authentication required)
  "/": [],
  "/login": [],
  "/register": [],
  "/help": [],
  "/api-docs": [],
  "/subscription-plans": [],
  "/benefits": [],
  "/therapeuten": [],
  "/tierarzt": [],
  "/zahnarzt": [],
  "/clinics": [],
  "/maintenance": [],

  // Patient routes (customer role)
  "/patient": ["customer"],
  "/dashboard/appointment": [
    "customer",
    "doctor",
    "nurse",
    "receptionist",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],
  "/dashboard/account": [
    "customer",
    "doctor",
    "nurse",
    "receptionist",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],
  "/dashboard/mail": [
    "customer",
    "doctor",
    "nurse",
    "receptionist",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],

  // Staff routes (doctors, nurses, etc.)
  "/dashboard/schedule": [
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab_technician",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],
  "/dashboard/clinic": [
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab_technician",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],
  "/dashboard/patients": [
    "doctor",
    "nurse",
    "receptionist",
    "clinic_owner",
    "clinic_manager",
    "super_admin",
  ],

  // Manager/Admin routes
  "/dashboard/report": [
    "clinic_owner",
    "clinic_manager",
    "manager",
    "super_admin",
  ],
  "/dashboard/payment": [
    "clinic_owner",
    "clinic_manager",
    "manager",
    "receptionist",
    "super_admin",
  ],

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if it's a public route (login, register, home, etc.)
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/help" ||
    pathname === "/api-docs" ||
    pathname === "/subscription-plans" ||
    pathname.startsWith("/benefits") ||
    pathname.startsWith("/therapeuten") ||
    pathname.startsWith("/tierarzt") ||
    pathname.startsWith("/zahnarzt") ||
    pathname.startsWith("/clinics") ||
    pathname === "/maintenance";

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, we can't check localStorage in middleware
  // So we'll let the request proceed and let AuthGuard handle it on the client side
  // The middleware in Next.js can't access localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
