"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Power, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function MaintenanceModePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.admin.maintenance.getStatus();
      setMaintenanceMode(response.data.enabled);
      setMessage(response.data.message || "");
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Status konnte nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);

      if (maintenanceMode) {
        await api.admin.maintenance.disable();
        toast({
          title: "✅ Wartungsmodus deaktiviert",
          description: "Die Website ist jetzt für alle Benutzer zugänglich",
          variant: "success",
        });
      } else {
        await api.admin.maintenance.enable(message);
        toast({
          title: "⚠️ Wartungsmodus aktiviert",
          description: "Die Website ist jetzt nur für Admins zugänglich",
          variant: "default",
        });
      }

      fetchStatus();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: error.message || "Aktion fehlgeschlagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wartungsmodus</h1>
        <p className="text-gray-600 mt-1">
          Website vorübergehend deaktivieren für Wartungsarbeiten
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {maintenanceMode ? (
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            ) : (
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {maintenanceMode ? "Wartungsmodus Aktiv" : "Website Aktiv"}
              </h3>
              <p className="text-gray-600 mt-1">
                {maintenanceMode
                  ? "Die Website ist derzeit im Wartungsmodus"
                  : "Die Website ist für alle Benutzer zugänglich"}
              </p>
            </div>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={() => handleToggle()}
            disabled={loading}
          />
        </div>

        {/* Message Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Wartungsnachricht (Optional)
            </label>
            <Input
              placeholder="z.B. Wir führen derzeit Wartungsarbeiten durch..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={maintenanceMode}
            />
            <p className="text-sm text-gray-500 mt-1">
              Diese Nachricht wird den Benutzern angezeigt
            </p>
          </div>

          {maintenanceMode && message && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Aktuelle Nachricht:</strong> {message}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Warning Card */}
      {maintenanceMode && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">
                Wichtiger Hinweis
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Nur Super Admins können auf die Website zugreifen</li>
                <li>• Alle anderen Benutzer sehen die Wartungsnachricht</li>
                <li>• API-Anfragen werden mit 503 Status zurückgegeben</li>
                <li>
                  • Deaktivieren Sie den Modus, wenn die Wartung abgeschlossen
                  ist
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">ℹ️ Informationen</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Zweck:</strong> Der Wartungsmodus ermöglicht es Ihnen,
            Updates oder Reparaturen durchzuführen, ohne dass Benutzer die
            Website nutzen können.
          </p>
          <p>
            <strong>Admin-Zugriff:</strong> Als Super Admin können Sie trotz
            aktiviertem Wartungsmodus auf alle Funktionen zugreifen.
          </p>
          <p>
            <strong>Empfehlung:</strong> Aktivieren Sie den Wartungsmodus
            außerhalb der Hauptgeschäftszeiten, um Störungen zu minimieren.
          </p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={handleToggle}
          disabled={loading}
          variant={maintenanceMode ? "default" : "destructive"}
          className="w-full sm:w-auto"
        >
          <Power className="h-4 w-4 mr-2" />
          {loading
            ? "Bitte warten..."
            : maintenanceMode
            ? "Wartungsmodus Deaktivieren"
            : "Wartungsmodus Aktivieren"}
        </Button>
      </div>
    </div>
  );
}
