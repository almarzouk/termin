"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      console.log("✅ User already logged in, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // مسح أي tokens قديمة
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      const response = await api.auth.login(email, password);

      if (response.token && response.user) {
        // حفظ الـ token والمستخدم
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        console.log("✅ Login successful:", {
          token: response.token.substring(0, 20) + "...",
          user: response.user.name,
          email: response.user.email,
          roles: response.user.roles,
        });

        // Redirect all users to /dashboard
        // The dashboard will show different content based on user role
        console.log(`🔀 Redirecting to /dashboard`);
        router.push("/dashboard");
      } else {
        setError("Ungültige Anmeldedaten");
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error);
      setError(
        error.message ||
          "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-xl border border-blue-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            Willkommen zurück
          </h1>
          <p className="text-gray-600">Melden Sie sich bei Ihrem Konto an</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-Mail-Adresse
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Passwort
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Angemeldet bleiben</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Passwort vergessen?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-medium py-6 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Wird angemeldet...
              </>
            ) : (
              "Anmelden"
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 text-center mb-3">
            🔐 Test-Konten:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Super Admin */}
            <div className="bg-red-50 p-2 rounded text-xs border border-red-200">
              <p className="font-semibold text-red-900">Super Admin</p>
              <p className="text-red-700">admin@system.de / Admin@123</p>
            </div>

            {/* Clinic Owner */}
            <div className="bg-purple-50 p-2 rounded text-xs border border-purple-200">
              <p className="font-semibold text-purple-900">Clinic Owner</p>
              <p className="text-purple-700">owner@klinik.de / Owner@123</p>
            </div>

            {/* Manager */}
            <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
              <p className="font-semibold text-blue-900">Manager</p>
              <p className="text-blue-700">manager@klinik.de / Manager@123</p>
            </div>

            {/* Doctor */}
            <div className="bg-green-50 p-2 rounded text-xs border border-green-200">
              <p className="font-semibold text-green-900">Arzt</p>
              <p className="text-green-700">doctor1@klinik.de / Doctor@123</p>
            </div>

            {/* Nurse */}
            <div className="bg-yellow-50 p-2 rounded text-xs border border-yellow-200">
              <p className="font-semibold text-yellow-900">Krankenschwester</p>
              <p className="text-yellow-700">nurse1@klinik.de / Nurse@123</p>
            </div>

            {/* Receptionist */}
            <div className="bg-orange-50 p-2 rounded text-xs border border-orange-200">
              <p className="font-semibold text-orange-900">Rezeption</p>
              <p className="text-orange-700">
                reception@klinik.de / Reception@123
              </p>
            </div>

            {/* Patient */}
            <div className="bg-gray-50 p-2 rounded text-xs border border-gray-200">
              <p className="font-semibold text-gray-900">Patient</p>
              <p className="text-gray-700">patient1@test.de / Patient@123</p>
            </div>

            {/* Demo */}
            <div className="bg-sky-50 p-2 rounded text-xs border border-sky-200">
              <p className="font-semibold text-sky-900">Demo-Konto</p>
              <p className="text-sky-700">demo@test.de / Demo@123</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            📄 Alle Zugangsdaten: USERS_CREDENTIALS.md
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Oder</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full border-2 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Mit Google anmelden
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Noch kein Konto? </span>
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Jetzt registrieren
          </Link>
        </div>
      </Card>
    </div>
  );
}
