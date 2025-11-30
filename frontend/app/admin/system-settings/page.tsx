"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Mail,
  MessageSquare,
  CreditCard,
  Globe,
  Shield,
  Bell,
  Save,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General
    app_name: "VitalHealth",
    app_url: "https://vitalhealth.com",
    timezone: "Europe/Berlin",
    locale: "de",
    date_format: "d.m.Y",
    time_format: "H:i",

    // Email
    mail_driver: "smtp",
    mail_host: "",
    mail_port: "587",
    mail_username: "",
    mail_password: "",
    mail_encryption: "tls",
    mail_from_address: "",
    mail_from_name: "",

    // SMS
    sms_provider: "twilio",
    sms_api_key: "",
    sms_api_secret: "",
    sms_from_number: "",

    // Payment
    payment_gateway: "stripe",
    stripe_public_key: "",
    stripe_secret_key: "",
    paypal_client_id: "",
    paypal_secret: "",
    currency: "EUR",
    tax_rate: 19,

    // Security
    two_factor_enabled: false,
    session_lifetime: 120,
    password_expiry_days: 90,
    max_login_attempts: 5,
    ip_whitelist: "",

    // Notifications
    notification_email: true,
    notification_sms: false,
    notification_push: true,
    appointment_reminders: true,
    payment_notifications: true,
  });

  const tabs = [
    { id: "general", label: "Allgemein", icon: Settings },
    { id: "email", label: "E-Mail", icon: Mail },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "payment", label: "Zahlung", icon: CreditCard },
    { id: "security", label: "Sicherheit", icon: Shield },
    { id: "notifications", label: "Benachrichtigungen", icon: Bell },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.admin.systemSettings.getAll();
      setSettings({ ...settings, ...response.data });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Einstellungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.admin.systemSettings.update(settings);
      toast({
        title: "✅ Erfolg",
        description: "Einstellungen erfolgreich gespeichert",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Systemeinstellungen
          </h1>
          <p className="text-gray-600 mt-1">
            Konfigurieren Sie Systemparameter
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <Card className="p-4 h-fit">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3 p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Lädt Einstellungen...</p>
            </div>
          ) : (
            <>
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Allgemeine Einstellungen
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app_name">App-Name</Label>
                      <Input
                        id="app_name"
                        value={settings.app_name}
                        onChange={(e) =>
                          handleChange("app_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="app_url">App-URL</Label>
                      <Input
                        id="app_url"
                        value={settings.app_url}
                        onChange={(e) =>
                          handleChange("app_url", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Zeitzone</Label>
                      <select
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) =>
                          handleChange("timezone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Europe/Berlin">Europe/Berlin</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">
                          America/New_York
                        </option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="locale">Sprache</Label>
                      <select
                        id="locale"
                        value={settings.locale}
                        onChange={(e) => handleChange("locale", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    E-Mail-Einstellungen
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mail_host">SMTP Host</Label>
                      <Input
                        id="mail_host"
                        value={settings.mail_host}
                        onChange={(e) =>
                          handleChange("mail_host", e.target.value)
                        }
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mail_port">SMTP Port</Label>
                      <Input
                        id="mail_port"
                        value={settings.mail_port}
                        onChange={(e) =>
                          handleChange("mail_port", e.target.value)
                        }
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mail_username">SMTP Benutzername</Label>
                      <Input
                        id="mail_username"
                        value={settings.mail_username}
                        onChange={(e) =>
                          handleChange("mail_username", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mail_password">SMTP Passwort</Label>
                      <Input
                        id="mail_password"
                        type="password"
                        value={settings.mail_password}
                        onChange={(e) =>
                          handleChange("mail_password", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mail_from_address">Von E-Mail</Label>
                      <Input
                        id="mail_from_address"
                        type="email"
                        value={settings.mail_from_address}
                        onChange={(e) =>
                          handleChange("mail_from_address", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mail_from_name">Von Name</Label>
                      <Input
                        id="mail_from_name"
                        value={settings.mail_from_name}
                        onChange={(e) =>
                          handleChange("mail_from_name", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Settings */}
              {activeTab === "sms" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    SMS-Einstellungen
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="sms_provider">SMS-Anbieter</Label>
                      <select
                        id="sms_provider"
                        value={settings.sms_provider}
                        onChange={(e) =>
                          handleChange("sms_provider", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="twilio">Twilio</option>
                        <option value="nexmo">Nexmo</option>
                        <option value="aws">AWS SNS</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sms_api_key">API Key</Label>
                      <Input
                        id="sms_api_key"
                        value={settings.sms_api_key}
                        onChange={(e) =>
                          handleChange("sms_api_key", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="sms_api_secret">API Secret</Label>
                      <Input
                        id="sms_api_secret"
                        type="password"
                        value={settings.sms_api_secret}
                        onChange={(e) =>
                          handleChange("sms_api_secret", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="sms_from_number">Absendernummer</Label>
                      <Input
                        id="sms_from_number"
                        value={settings.sms_from_number}
                        onChange={(e) =>
                          handleChange("sms_from_number", e.target.value)
                        }
                        placeholder="+49123456789"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Zahlungseinstellungen
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stripe_public_key">
                        Stripe Public Key
                      </Label>
                      <Input
                        id="stripe_public_key"
                        value={settings.stripe_public_key}
                        onChange={(e) =>
                          handleChange("stripe_public_key", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe_secret_key">
                        Stripe Secret Key
                      </Label>
                      <Input
                        id="stripe_secret_key"
                        type="password"
                        value={settings.stripe_secret_key}
                        onChange={(e) =>
                          handleChange("stripe_secret_key", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Währung</Label>
                      <select
                        id="currency"
                        value={settings.currency}
                        onChange={(e) =>
                          handleChange("currency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="tax_rate">Steuersatz (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        value={settings.tax_rate}
                        onChange={(e) =>
                          handleChange("tax_rate", parseInt(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Sicherheitseinstellungen
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="two_factor">
                        Zwei-Faktor-Authentifizierung
                      </Label>
                      <Switch
                        id="two_factor"
                        checked={settings.two_factor_enabled}
                        onCheckedChange={(checked) =>
                          handleChange("two_factor_enabled", checked)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="session_lifetime">
                          Sitzungsdauer (Minuten)
                        </Label>
                        <Input
                          id="session_lifetime"
                          type="number"
                          value={settings.session_lifetime}
                          onChange={(e) =>
                            handleChange(
                              "session_lifetime",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_login">Max. Anmeldeversuche</Label>
                        <Input
                          id="max_login"
                          type="number"
                          value={settings.max_login_attempts}
                          onChange={(e) =>
                            handleChange(
                              "max_login_attempts",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="ip_whitelist">
                        IP-Whitelist (eine pro Zeile)
                      </Label>
                      <Textarea
                        id="ip_whitelist"
                        value={settings.ip_whitelist}
                        onChange={(e) =>
                          handleChange("ip_whitelist", e.target.value)
                        }
                        rows={5}
                        placeholder="192.168.1.1&#10;10.0.0.1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Benachrichtigungseinstellungen
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="notif_email">
                        E-Mail-Benachrichtigungen
                      </Label>
                      <Switch
                        id="notif_email"
                        checked={settings.notification_email}
                        onCheckedChange={(checked) =>
                          handleChange("notification_email", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="notif_sms">SMS-Benachrichtigungen</Label>
                      <Switch
                        id="notif_sms"
                        checked={settings.notification_sms}
                        onCheckedChange={(checked) =>
                          handleChange("notification_sms", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="notif_push">
                        Push-Benachrichtigungen
                      </Label>
                      <Switch
                        id="notif_push"
                        checked={settings.notification_push}
                        onCheckedChange={(checked) =>
                          handleChange("notification_push", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="appointment_reminders">
                        Terminerinnerungen
                      </Label>
                      <Switch
                        id="appointment_reminders"
                        checked={settings.appointment_reminders}
                        onCheckedChange={(checked) =>
                          handleChange("appointment_reminders", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <Label htmlFor="payment_notifications">
                        Zahlungsbenachrichtigungen
                      </Label>
                      <Switch
                        id="payment_notifications"
                        checked={settings.payment_notifications}
                        onCheckedChange={(checked) =>
                          handleChange("payment_notifications", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
