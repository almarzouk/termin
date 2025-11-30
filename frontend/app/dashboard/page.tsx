"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import PatientChart from "@/components/dashboard/patient-chart";
import AppointmentCalendar from "@/components/dashboard/appointment-calendar";
import DoctorsList from "@/components/dashboard/doctors-list";
import PatientsList from "@/components/dashboard/patients-list";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Mail,
  Settings,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Get user role
      const role =
        Array.isArray(parsedUser.roles) && parsedUser.roles.length > 0
          ? parsedUser.roles[0]
          : null;
      setUserRole(role);

      console.log("👤 Dashboard - User:", parsedUser.name);
      console.log("🔑 Dashboard - Role:", role);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Helper functions to check user role permissions
  const isAdmin = () =>
    ["super_admin", "clinic_owner", "clinic_manager", "manager"].includes(
      userRole || ""
    );
  const isDoctor = () => userRole === "doctor";
  const isPatient = () => ["patient", "customer"].includes(userRole || "");
  const isStaff = () =>
    ["nurse", "receptionist", "pharmacist", "lab_technician"].includes(
      userRole || ""
    );

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    if (isAdmin()) return "Verwalten Sie Ihre Klinik effizient";
    if (isDoctor()) return "Überblick über Ihre Patienten und Termine";
    if (isPatient()) return "Verwalten Sie Ihre Gesundheit";
    if (isStaff()) return "Unterstützen Sie den täglichen Betrieb";
    return "Willkommen in Ihrer Telegesundheits-App!";
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
              {/* Home Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="relative hidden sm:flex"
                title="Zur Startseite"
              >
                <Home className="h-5 w-5" />
              </Button>

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
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

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

        {/* Dashboard Content */}
        <main className="p-4 lg:p-8">
          {/* Welcome Message */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Hallo, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1 text-sm lg:text-base">
              {getWelcomeMessage()}
            </p>
            {/* Role Badge */}
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {userRole === "super_admin" && "🔐 Super Admin"}
                {userRole === "clinic_owner" && "🏥 Klinikbesitzer"}
                {userRole === "clinic_manager" && "👔 Klinikmanager"}
                {userRole === "manager" && "👔 Manager"}
                {userRole === "doctor" && "👨‍⚕️ Arzt"}
                {userRole === "nurse" && "👩‍⚕️ Krankenschwester"}
                {userRole === "receptionist" && "📋 Rezeptionist"}
                {userRole === "pharmacist" && "💊 Apotheker"}
                {userRole === "lab_technician" && "🔬 Labortechniker"}
                {(userRole === "patient" || userRole === "customer") &&
                  "🏥 Patient"}
                {!userRole && "👤 Benutzer"}
              </span>
            </div>
          </div>

          {/* Stats Cards - Show for all users */}
          <StatsCards />

          {/* Charts and Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Patient Overview Chart - Hide for patients */}
            {!isPatient() && (
              <div className="lg:col-span-2">
                <PatientChart />
              </div>
            )}

            {/* Calendar - Show for everyone */}
            <div className={isPatient() ? "lg:col-span-3" : ""}>
              <AppointmentCalendar />
            </div>
          </div>

          {/* Doctors and Patients Lists - Only for Admin and Staff */}
          {(isAdmin() || isStaff()) && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <DoctorsList />
              <PatientsList />
            </div>
          )}

          {/* Doctor-specific content */}
          {isDoctor() && (
            <div className="mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PatientsList />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
