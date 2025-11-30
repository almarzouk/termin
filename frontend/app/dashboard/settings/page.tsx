"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Database,
  Clock,
  User,
  Building2,
  Calendar,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Allgemein");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "VitalHealth",
    siteDescription: "Krankenhaus-Management-System",
    timeZone: "Europe/Berlin",
    language: "Deutsch",
    dateFormat: "DD.MM.YYYY",
    currency: "EUR",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    paymentAlerts: true,
    systemAlerts: true,

    // Appearance Settings
    theme: "light",
    primaryColor: "#2563eb",
    accentColor: "#0ea5e9",
    fontSize: "medium",
    sidebarCollapsed: false,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: "",

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@vitalhealth.de",
    smtpPassword: "",

    // Appointment Settings
    appointmentDuration: 30,
    bookingAdvance: 7,
    cancellationPeriod: 24,
    maxAppointmentsPerDay: 10,

    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptInsurance: true,
    taxRate: 19,
    invoicePrefix: "INV",

    // Database Settings
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API (for admin settings)
      // For now, use localStorage as fallback
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Fehler beim Laden der Einstellungen");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: "Allgemein", icon: Settings },
    { name: "Benachrichtigungen", icon: Bell },
    { name: "Erscheinungsbild", icon: Palette },
    { name: "Sicherheit", icon: Shield },
    { name: "E-Mail", icon: Mail },
    { name: "Termine", icon: Calendar },
    { name: "Zahlung", icon: CreditCard },
    { name: "Datenbank", icon: Database },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // TODO: Save to API when admin settings endpoint is ready
      // await api.settings.update(settings);
      
      localStorage.setItem("appSettings", JSON.stringify(settings));

      toast({
        title: "✅ Gespeichert",
        description: "Einstellungen wurden erfolgreich gespeichert",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description: err.message || "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("appSettings");

    toast({
      title: "✅ Zurückgesetzt",
      description:
        "Alle Einstellungen wurden auf die Standardwerte zurückgesetzt",
      variant: "success",
    });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Einstellungen
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Systemeinstellungen
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}
            <RefreshCw className="h-5 w-5 mr-2" />
            Zurücksetzen
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
          >
            <Save className="h-5 w-5 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card className="p-4 lg:col-span-1 h-fit">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.name
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Allgemein */}
          {activeTab === "Allgemein" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Allgemeine Einstellungen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Website-Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) =>
                      setSettings({ ...settings, siteName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sprache
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                  >
                    <option>Deutsch</option>
                    <option>English</option>
                    <option>Français</option>
                    <option>العربية</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Beschreibung
                  </label>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        siteDescription: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Zeitzone
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.timeZone}
                    onChange={(e) =>
                      setSettings({ ...settings, timeZone: e.target.value })
                    }
                  >
                    <option>Europe/Berlin</option>
                    <option>Europe/London</option>
                    <option>America/New_York</option>
                    <option>Asia/Dubai</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Datumsformat
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.dateFormat}
                    onChange={(e) =>
                      setSettings({ ...settings, dateFormat: e.target.value })
                    }
                  >
                    <option>DD.MM.YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Währung
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                  >
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>AED</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Benachrichtigungen */}
          {activeTab === "Benachrichtigungen" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Benachrichtigungseinstellungen
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "emailNotifications",
                    label: "E-Mail-Benachrichtigungen",
                    icon: Mail,
                  },
                  {
                    key: "smsNotifications",
                    label: "SMS-Benachrichtigungen",
                    icon: Smartphone,
                  },
                  {
                    key: "pushNotifications",
                    label: "Push-Benachrichtigungen",
                    icon: Bell,
                  },
                  {
                    key: "appointmentReminders",
                    label: "Terminerinnerungen",
                    icon: Calendar,
                  },
                  {
                    key: "paymentAlerts",
                    label: "Zahlungswarnungen",
                    icon: CreditCard,
                  },
                  {
                    key: "systemAlerts",
                    label: "Systemwarnungen",
                    icon: Settings,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        {item.label}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings[item.key as keyof typeof settings] as boolean
                        }
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Erscheinungsbild */}
          {activeTab === "Erscheinungsbild" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Erscheinungsbild
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Thema
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings({ ...settings, theme: e.target.value })
                    }
                  >
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="auto">Automatisch</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Schriftgröße
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings({ ...settings, fontSize: e.target.value })
                    }
                  >
                    <option value="small">Klein</option>
                    <option value="medium">Mittel</option>
                    <option value="large">Groß</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Primärfarbe
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Akzentfarbe
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          accentColor: e.target.value,
                        })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          accentColor: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Sicherheit */}
          {activeTab === "Sicherheit" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sicherheitseinstellungen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Zwei-Faktor-Authentifizierung
                      </p>
                      <p className="text-sm text-gray-500">
                        Zusätzliche Sicherheitsebene
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          twoFactorAuth: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Sitzungs-Timeout (Minuten)
                    </label>
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Passwort-Ablauf (Tage)
                    </label>
                    <Input
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          passwordExpiry: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Max. Anmeldeversuche
                    </label>
                    <Input
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          loginAttempts: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      IP-Whitelist
                    </label>
                    <Input
                      placeholder="192.168.1.1, 192.168.1.2"
                      value={settings.ipWhitelist}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ipWhitelist: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* E-Mail */}
          {activeTab === "E-Mail" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                E-Mail-Einstellungen (SMTP)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    SMTP-Host
                  </label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpHost: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    SMTP-Port
                  </label>
                  <Input
                    value={settings.smtpPort}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpPort: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    SMTP-Benutzer
                  </label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) =>
                      setSettings({ ...settings, smtpUser: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    SMTP-Passwort
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={settings.smtpPassword}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtpPassword: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button variant="outline">
                    <Mail className="h-5 w-5 mr-2" />
                    Test-E-Mail senden
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Termine */}
          {activeTab === "Termine" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Termineinstellungen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Termindauer (Minuten)
                  </label>
                  <Input
                    type="number"
                    value={settings.appointmentDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointmentDuration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Buchung im Voraus (Tage)
                  </label>
                  <Input
                    type="number"
                    value={settings.bookingAdvance}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bookingAdvance: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Stornierungsfrist (Stunden)
                  </label>
                  <Input
                    type="number"
                    value={settings.cancellationPeriod}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cancellationPeriod: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Max. Termine pro Tag
                  </label>
                  <Input
                    type="number"
                    value={settings.maxAppointmentsPerDay}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxAppointmentsPerDay: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Zahlung */}
          {activeTab === "Zahlung" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Zahlungseinstellungen
              </h3>
              <div className="space-y-4 mb-4">
                {[
                  { key: "acceptCash", label: "Barzahlung akzeptieren" },
                  { key: "acceptCard", label: "Kartenzahlung akzeptieren" },
                  { key: "acceptInsurance", label: "Versicherung akzeptieren" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings[item.key as keyof typeof settings] as boolean
                        }
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Steuersatz (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        taxRate: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rechnungspräfix
                  </label>
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        invoicePrefix: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Datenbank */}
          {activeTab === "Datenbank" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Datenbankeinstellungen
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Automatisches Backup
                      </p>
                      <p className="text-sm text-gray-500">
                        Tägliche Sicherung aktivieren
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          autoBackup: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Backup-Häufigkeit
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={settings.backupFrequency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backupFrequency: e.target.value,
                        })
                      }
                    >
                      <option value="hourly">Stündlich</option>
                      <option value="daily">Täglich</option>
                      <option value="weekly">Wöchentlich</option>
                      <option value="monthly">Monatlich</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Aufbewahrung (Tage)
                    </label>
                    <Input
                      type="number"
                      value={settings.backupRetention}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backupRetention: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <Button variant="outline">
                    <Database className="h-5 w-5 mr-2" />
                    Jetzt sichern
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Wiederherstellen
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
