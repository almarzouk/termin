"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Search,
  Calendar,
  Clock,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function NotificationsManagementPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notifications");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    channel: "email",
    target: "all",
    scheduled_at: "",
  });

  const notificationTypes = [
    { value: "info", label: "Information", color: "bg-blue-100 text-blue-800" },
    { value: "success", label: "Erfolg", color: "bg-green-100 text-green-800" },
    {
      value: "warning",
      label: "Warnung",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "error", label: "Fehler", color: "bg-red-100 text-red-800" },
  ];

  const channels = [
    { value: "email", label: "E-Mail", icon: Mail },
    { value: "sms", label: "SMS", icon: MessageSquare },
    { value: "push", label: "Push", icon: Smartphone },
    { value: "all", label: "Alle", icon: Bell },
  ];

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.admin.notifications.getAll();
      const notificationsData = response.data?.data || response.data || [];
      setNotifications(
        Array.isArray(notificationsData) ? notificationsData : []
      );
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Benachrichtigungen konnten nicht geladen werden",
        variant: "destructive",
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.admin.notifications.getTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "❌ Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.admin.notifications.send(newNotification);
      toast({
        title: "✅ Erfolg",
        description: "Benachrichtigung erfolgreich gesendet",
        variant: "success",
      });
      setShowCreateDialog(false);
      setNewNotification({
        title: "",
        message: "",
        type: "info",
        channel: "email",
        target: "all",
        scheduled_at: "",
      });
      fetchNotifications();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Benachrichtigung konnte nicht gesendet werden",
        variant: "destructive",
      });
    }
  };

  const getChannelIcon = (channel: string) => {
    const ch = channels.find((c) => c.value === channel);
    return ch ? ch.icon : Bell;
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Benachrichtigungsverwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Senden und verwalten Sie Systembenachrichtigungen
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Benachrichtigung senden
        </Button>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === "notifications"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Benachrichtigungen
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === "templates"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Edit className="h-4 w-4 inline mr-2" />
            Vorlagen
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === "settings"
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Einstellungen
          </button>
        </div>
      </Card>

      {/* Notifications List */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Lädt Benachrichtigungen...</p>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Keine Benachrichtigungen
              </h3>
              <p className="text-gray-600">
                Erstellen Sie Ihre erste Benachrichtigung
              </p>
            </Card>
          ) : (
            notifications.map((notif) => {
              const Icon = getChannelIcon(notif.channel);
              const typeColor =
                notificationTypes.find((t) => t.value === notif.type)?.color ||
                "bg-gray-100 text-gray-800";
              return (
                <Card key={notif.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notif.title}
                          </h3>
                          <Badge className={typeColor}>{notif.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {notif.target === "all"
                              ? "Alle Benutzer"
                              : notif.target}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(notif.created_at).toLocaleString("de-DE")}
                          </span>
                          {notif.scheduled_at && (
                            <Badge variant="outline">Geplant</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === "templates" && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Benachrichtigungsvorlagen
          </h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Settings */}
      {activeTab === "settings" && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Benachrichtigungseinstellungen
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label>E-Mail-Benachrichtigungen aktivieren</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label>SMS-Benachrichtigungen aktivieren</Label>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label>Push-Benachrichtigungen aktivieren</Label>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      )}

      {/* Create Notification Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Neue Benachrichtigung
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      title: e.target.value,
                    })
                  }
                  placeholder="Benachrichtigungstitel"
                />
              </div>
              <div>
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Ihre Nachricht..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <select
                    id="type"
                    value={newNotification.type}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="channel">Kanal</Label>
                  <select
                    id="channel"
                    value={newNotification.channel}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        channel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {channels.map((ch) => (
                      <option key={ch.value} value={ch.value}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="scheduled">Geplant für (optional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={newNotification.scheduled_at}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      scheduled_at: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleSendNotification}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {newNotification.scheduled_at ? "Planen" : "Senden"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
