"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UserCircle,
  Users,
  Calendar,
  ClipboardList,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Stethoscope,
  CreditCard,
  Mail,
  Package,
  HelpCircle,
  X,
  Shield,
  Building,
  UserCog,
  Wrench,
  Activity,
  Lock,
  Database,
  FileText,
  Cog,
  Star,
  Plane,
} from "lucide-react";
import { Bell, Heart, Receipt, Tags, MapPin } from "lucide-react";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: UserCircle,
    label: "Ihr Konto",
    href: "/dashboard/account",
  },
];

const patientMenuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Calendar,
    label: "Meine Termine",
    href: "/patient/appointments",
  },
  {
    icon: UserCircle,
    label: "Ihr Konto",
    href: "/dashboard/account",
  },
  {
    icon: Mail,
    label: "Nachrichten",
    href: "/dashboard/mail",
  },
];

const applications = [
  {
    icon: Calendar,
    label: "Terminplan",
    href: "/dashboard/schedule",
    roles: [
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "lab_technician",
      "super_admin",
      "clinic_owner",
      "clinic_manager",
      "manager",
    ],
  },
  {
    icon: Building2,
    label: "Meine Klinik",
    href: "/dashboard/clinic",
    roles: [
      "doctor",
      "nurse",
      "receptionist",
      "pharmacist",
      "lab_technician",
      "super_admin",
      "clinic_owner",
      "clinic_manager",
      "manager",
    ],
  },
  {
    icon: Users,
    label: "Patienten",
    href: "/dashboard/patients",
    roles: [
      "doctor",
      "nurse",
      "receptionist",
      "super_admin",
      "clinic_owner",
      "clinic_manager",
      "manager",
    ],
  },
  {
    icon: BarChart3,
    label: "Berichte",
    href: "/dashboard/report",
    roles: ["super_admin", "clinic_owner", "clinic_manager", "manager"], // Only admins
  },
  {
    icon: CreditCard,
    label: "Zahlungen",
    href: "/dashboard/payment",
    roles: [
      "super_admin",
      "clinic_owner",
      "clinic_manager",
      "manager",
      "receptionist",
    ], // Admins and receptionist
  },
  {
    icon: Mail,
    label: "Nachrichten",
    href: "/dashboard/mail",
    roles: [], // Available to all
  },
];

const admin = [
  {
    icon: Building,
    label: "Kliniken",
    href: "/admin/clinics",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: MapPin,
    label: "Filialen",
    href: "/admin/branches",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: UserCog,
    label: "Alle Benutzer",
    href: "/admin/users",
    roles: ["super_admin"],
  },
  {
    icon: Stethoscope,
    label: "Ärzte",
    href: "/admin/doctors",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Users,
    label: "Patienten",
    href: "/admin/patients",
    roles: ["super_admin", "clinic_owner", "receptionist"],
  },
  {
    icon: Heart,
    label: "Krankenpfleger",
    href: "/admin/nurses",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Users,
    label: "Rezeptionisten",
    href: "/admin/receptionists",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Stethoscope,
    label: "Dienste",
    href: "/admin/services",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Calendar,
    label: "Terminverwaltung",
    href: "/admin/appointments",
    roles: ["super_admin", "clinic_owner", "clinic_manager"],
  },
  {
    icon: Plane,
    label: "Urlaub & Verfügbarkeit",
    href: "/admin/leave-management",
    roles: ["super_admin", "clinic_owner", "clinic_manager"],
  },
  {
    icon: Bell,
    label: "Meine Benachrichtigungen",
    href: "/admin/my-notifications",
    roles: [
      "super_admin",
      "clinic_owner",
      "clinic_manager",
      "doctor",
      "nurse",
      "receptionist",
    ],
  },
  {
    icon: Star,
    label: "Bewertungen",
    href: "/admin/reviews",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: CreditCard,
    label: "Mein Abonnement",
    href: "/admin/my-subscription",
    roles: ["clinic_owner"],
  },
  {
    icon: Activity,
    label: "Aktivitätsprotokolle",
    href: "/admin/activity-logs",
    roles: ["super_admin"],
  },
  {
    icon: Lock,
    label: "Berechtigungen",
    href: "/admin/permissions",
    roles: ["super_admin"],
  },
  {
    icon: Database,
    label: "Backups",
    href: "/admin/backups",
    roles: ["super_admin"],
  },
  {
    icon: Cog,
    label: "Systemeinstellungen",
    href: "/admin/system-settings",
    roles: ["super_admin"],
  },
  {
    icon: FileText,
    label: "Berichte",
    href: "/admin/reports",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Bell,
    label: "Benachrichtigungen",
    href: "/admin/notifications",
    roles: ["super_admin", "clinic_owner"],
  },
  {
    icon: Wrench,
    label: "Wartungsmodus",
    href: "/admin/maintenance",
    roles: ["super_admin"],
  },
  {
    icon: Receipt,
    label: "Abonnementpläne",
    href: "/admin/subscription-plans",
    roles: ["super_admin"],
  },
  {
    icon: Tags,
    label: "Gutscheine",
    href: "/admin/coupons",
    roles: ["super_admin"],
  },
  {
    icon: CreditCard,
    label: "Abonnements",
    href: "/admin/subscriptions",
    roles: ["super_admin"],
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("📦 User data from localStorage:", userData);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log("👤 Parsed user:", user);

        // roles is an array of strings, not objects
        const role =
          Array.isArray(user.roles) && user.roles.length > 0
            ? user.roles[0]
            : null;

        console.log("🔑 User role:", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Filter admin items based on user role
  const visibleAdminItems = admin.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles || item.roles.length === 0) return true;
    // If user has no role, hide restricted items
    if (!userRole) return false;
    // Show if user's role is in the allowed roles
    return item.roles.includes(userRole);
  });

  // Filter application items based on user role
  const visibleApplications = applications.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles || item.roles.length === 0) return true;
    // If user has no role, hide restricted items
    if (!userRole) return false;
    // Show if user's role is in the allowed roles
    return item.roles.includes(userRole);
  });

  console.log("🎯 Current user role:", userRole);
  console.log("📋 Total admin items:", admin.length);
  console.log("✅ Visible admin items:", visibleAdminItems.length);
  console.log(
    "👁️ Visible items:",
    visibleAdminItems.map((i) => i.label)
  );
  console.log("📱 Visible applications:", visibleApplications.length);

  // Determine dashboard href based on user role
  const getDashboardHref = () => {
    if (userRole === "super_admin" || userRole === "clinic_owner") {
      return "/admin/dashboard";
    }
    return "/dashboard";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">VitalHealth</span>
          </div>
          {/* Close Button for Mobile */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Menu */}
        <div>
          <div className="space-y-1">
            {(userRole === "patient" ? patientMenuItems : menuItems).map(
              (item) => {
                const href =
                  item.label === "Dashboard" ? getDashboardHref() : item.href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive(href)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              }
            )}
          </div>
        </div>

        {/* Applications */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            ANWENDUNGEN
          </h3>
          <div className="space-y-1">
            {visibleApplications.map((item) => (
              <div key={item.href}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() =>
                        setExpandedItem(
                          expandedItem === item.label ? null : item.label
                        )
                      }
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedItem === item.label ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedItem === item.label && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 text-sm rounded-lg ${
                              isActive(subItem.href)
                                ? "text-blue-600 bg-blue-50 font-semibold"
                                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Admin */}
        {visibleAdminItems.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider px-3 mb-2">
              <Shield className="h-3 w-3 inline mr-1" />
              ADMIN
            </h3>
            <div className="space-y-1">
              {visibleAdminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition border-l-2 ${
                    isActive(item.href)
                      ? "bg-red-50 text-red-600 font-semibold border-red-600"
                      : "text-gray-700 hover:bg-red-50 hover:text-red-600 border-transparent hover:border-red-600"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
