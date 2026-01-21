"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Check,
  CheckCheck,
  X,
  Bell,
  Calendar,
  CreditCard,
  Settings,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  action_url: string | null;
  action_text: string | null;
  created_at: string;
  time_ago: string;
}

interface NotificationDropdownProps {
  onMarkAllAsRead: () => void;
  onNotificationRead: () => void;
  onClose: () => void;
}

export function NotificationDropdown({
  onMarkAllAsRead,
  onNotificationRead,
  onClose,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("Fetching notifications...");
      const response = await api.notifications.getRecent();
      console.log("Full API response:", response);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data.data);

      // Handle response - the data might be directly in response.data.data or response.data
      if (response.data.success) {
        const notificationsData = response.data.data || [];
        console.log("Setting notifications:", notificationsData);
        setNotifications(notificationsData);
      } else if (Array.isArray(response.data)) {
        // Sometimes the data might be directly in response.data
        console.log("Setting notifications from direct array:", response.data);
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Set loading to false even on error so UI shows
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await api.notifications.markAsRead(id);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.notifications.delete(id);
      if (response.data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({
          title: "Gelöscht",
          description: "Benachrichtigung wurde gelöscht",
        });
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benachrichtigung konnte nicht gelöscht werden",
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "admin":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Benachrichtigungen</h3>
          {notifications.filter((n) => !n.is_read).length > 0 && (
            <Badge variant="destructive">
              {notifications.filter((n) => !n.is_read).length}
            </Badge>
          )}
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="h-8 text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Alle gelesen
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Lädt...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">Keine Benachrichtigungen</p>
            <p className="text-xs text-muted-foreground">
              Sie sind auf dem neuesten Stand
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative p-4 transition-colors hover:bg-muted/50",
                  !notification.is_read && "bg-blue-50/50"
                )}
              >
                {/* Priority indicator */}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    getPriorityColor(notification.priority)
                  )}
                />

                <div className="flex gap-3 pl-2">
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      !notification.is_read
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getIcon(notification.category)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          {
                            addSuffix: true,
                            locale: de,
                          }
                        )}
                      </p>
                      {notification.action_url && (
                        <>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <Link
                            href={notification.action_url}
                            onClick={onClose}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {notification.action_text || "Ansehen"}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Als gelesen markieren"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                      title="Löschen"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Link href="/admin/notifications" onClick={onClose}>
              <Button variant="ghost" className="w-full text-xs">
                Alle Benachrichtigungen anzeigen
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
