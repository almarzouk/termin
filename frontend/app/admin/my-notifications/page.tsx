"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  Bell,
  Calendar,
  CreditCard,
  Settings,
  AlertCircle,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  user_id: number;
  clinic_id: number | null;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  action_url: string | null;
  action_text: string | null;
  created_at: string;
  updated_at: string;
  time_ago: string;
}

export default function MyNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 20,
      };

      if (filter !== "all") {
        params.is_read = filter === "read";
      }

      if (categoryFilter !== "all") {
        params.category = categoryFilter;
      }

      if (priorityFilter !== "all") {
        params.priority = priorityFilter;
      }

      const response = await api.notifications.getAll(params);
      if (response.data.success) {
        setNotifications(response.data.data.data);
        setCurrentPage(response.data.data.current_page);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benachrichtigungen konnten nicht geladen werden",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, categoryFilter, priorityFilter, currentPage]);

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await api.notifications.markAsRead(id);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        toast({
          title: "Erfolg",
          description: "Als gelesen markiert",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Markieren",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.notifications.markAllAsRead();
      if (response.data.success) {
        fetchNotifications();
        toast({
          title: "Erfolg",
          description: response.data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Markieren aller Benachrichtigungen",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.notifications.delete(id);
      if (response.data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({
          title: "Erfolg",
          description: "Benachrichtigung gelöscht",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Löschen",
      });
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const response = await api.notifications.deleteAllRead();
      if (response.data.success) {
        fetchNotifications();
        toast({
          title: "Erfolg",
          description: `${response.data.count} Benachrichtigungen gelöscht`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Fehler beim Löschen",
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "appointment":
        return <Calendar className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      case "system":
        return <Settings className="h-5 w-5" />;
      case "admin":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50/50";
      case "high":
        return "border-l-orange-500 bg-orange-50/50";
      case "medium":
        return "border-l-blue-500 bg-blue-50/50";
      case "low":
        return "border-l-gray-500 bg-gray-50/50";
      default:
        return "border-l-gray-500 bg-gray-50/50";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meine Benachrichtigungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Benachrichtigungen
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Alle als gelesen markieren
            </Button>
          )}
          <Button variant="outline" onClick={handleDeleteAllRead}>
            <Trash2 className="mr-2 h-4 w-4" />
            Gelesene löschen
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">
                Alle ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Ungelesen
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Gelesen</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="appointment">Termine</SelectItem>
              <SelectItem value="payment">Zahlungen</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Prioritäten</SelectItem>
              <SelectItem value="urgent">Dringend</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Keine Benachrichtigungen</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "Sie haben keine ungelesenen Benachrichtigungen"
                : "Sie haben noch keine Benachrichtigungen erhalten"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "p-4 border-l-4 transition-all hover:shadow-md",
                getPriorityColor(notification.priority),
                !notification.is_read && "ring-2 ring-blue-500/20"
              )}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    !notification.is_read
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {getIcon(notification.category)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                              locale: de,
                            }
                          )}
                        </span>
                        {notification.action_url && (
                          <>
                            <span>•</span>
                            <Link
                              href={notification.action_url}
                              className="font-medium text-primary hover:underline"
                            >
                              {notification.action_text || "Ansehen"}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Als gelesen
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Zurück
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm">
              Seite {currentPage} von {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
