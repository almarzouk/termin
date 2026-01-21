"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Settings, Search, Sun, Moon, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: Array<{ name: string }>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    checkAuthAndPermissions();
  }, [router, pathname]);

  const checkAuthAndPermissions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Fetch fresh user data from API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("❌ API Response not OK:", response.status);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      const data = await response.json();
      const userData = data.data || data.user || data;

      console.log("🔍 Admin Layout - Full Response:", data);
      console.log("🔍 Admin Layout - User Data:", userData);
      console.log("🔍 Admin Layout - Roles:", userData.roles);

      // Check if user has admin role
      const allowedRoles = [
        "super_admin",
        "clinic_owner",
        "clinic_manager",
        "manager",
      ];

      // Handle both formats: string[] or {name: string}[]
      let userRoles: string[] = [];
      if (Array.isArray(userData.roles)) {
        if (userData.roles.length > 0) {
          if (typeof userData.roles[0] === "string") {
            userRoles = userData.roles;
          } else if (userData.roles[0]?.name) {
            userRoles = userData.roles.map((r: any) => r.name);
          }
        }
      }

      console.log("🔍 Admin Layout - Processed Roles:", userRoles);

      const hasAccess =
        userRoles.length > 0 &&
        userRoles.some((role: string) => allowedRoles.includes(role));

      console.log("🔍 Admin Layout - Has Access:", hasAccess);

      if (!hasAccess) {
        console.error("❌ Access Denied - User roles:", userRoles);
        setShowAccessDenied(true);
        return;
      }

      setUser(userData);
      setAuthorized(true);

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Überprüfe Berechtigungen...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !authorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Access Denied Dialog */}
      <AlertDialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zugriff verweigert</AlertDialogTitle>
            <AlertDialogDescription>
              Sie haben keine Berechtigung, auf den Admin-Bereich zuzugreifen.
              Bitte kontaktieren Sie Ihren Administrator, wenn Sie glauben, dass
              dies ein Fehler ist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowAccessDenied(false);
                router.push("/dashboard");
              }}
            >
              Zum Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto w-full">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Left Section - Menu Button & Search */}
            <div className="flex items-center space-x-4 flex-1">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>

              {/* Search */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Suchen..."
                    className="pl-10 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="relative hidden sm:flex"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* Messages */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
              >
                <Mail className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 lg:space-x-3 border-l pl-2 lg:pl-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-green-600 flex items-center justify-end">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                    Online
                  </p>
                </div>
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex"
                  onClick={() => router.push("/dashboard/account")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
