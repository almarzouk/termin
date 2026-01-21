"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "./notification-dropdown";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.notifications.getUnreadCount();

      // API returns: { success: true, data: { unread_count: 13 } }
      const count = response.data?.data?.unread_count || 0;

      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  // Fetch on mount and set interval
  useEffect(() => {
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.notifications.markAllAsRead();
      if (response.data.success) {
        setUnreadCount(0);
        toast({
          title: "Erfolg",
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benachrichtigungen konnten nicht markiert werden",
      });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[400px] rounded-md border bg-popover shadow-lg z-50">
          <NotificationDropdown
            onMarkAllAsRead={handleMarkAllAsRead}
            onNotificationRead={fetchUnreadCount}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
