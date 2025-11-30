"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const [message, setMessage] = useState(
    "Die Website befindet sich im Wartungsmodus."
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaintenanceMessage();
  }, []);

  const fetchMaintenanceMessage = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/maintenance/status`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.data?.message) {
          setMessage(data.data.message);
        }
      }
    } catch (error) {
      console.error("Failed to fetch maintenance message:", error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="bg-yellow-100 p-6 rounded-full">
              <AlertTriangle className="h-16 w-16 text-yellow-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Wartungsmodus
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-600 mb-8">{message}</p>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Was bedeutet das?
                </h3>
                <p className="text-sm text-blue-800">
                  Wir führen derzeit wichtige Wartungsarbeiten durch, um Ihnen
                  ein besseres Erlebnis zu bieten. Die Website wird in Kürze
                  wieder verfügbar sein.
                </p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Was können Sie tun?
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  ⏰ <strong>Warten Sie kurz</strong> und versuchen Sie es in
                  einigen Minuten erneut
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  📧 <strong>Kontaktieren Sie uns</strong> bei dringenden
                  Anliegen
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Wird aktualisiert..." : "Erneut versuchen"}
          </Button>

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-8">
            Vielen Dank für Ihre Geduld und Ihr Verständnis
          </p>
        </div>
      </div>
    </div>
  );
}
