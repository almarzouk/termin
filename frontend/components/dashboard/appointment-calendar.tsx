"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const appointments = [
  { date: 3, type: "appointment" },
  { date: 8, type: "meeting" },
  { date: 10, type: "operation" },
  { date: 15, type: "appointment" },
  { date: 18, type: "meeting" },
  { date: 22, type: "operation" },
  { date: 25, type: "appointment" },
  { date: 28, type: "meeting" },
];

export default function AppointmentCalendar() {
  const [currentMonth, setCurrentMonth] = useState("Juli 2026");
  const [activeTab, setActiveTab] = useState("Monatlich");

  const getDaysInMonth = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i);
    }
    return days;
  };

  const getAppointmentColor = (date: number) => {
    const appointment = appointments.find((a) => a.date === date);
    if (!appointment) return null;

    switch (appointment.type) {
      case "appointment":
        return "bg-purple-100 text-purple-600";
      case "meeting":
        return "bg-orange-100 text-orange-600";
      case "operation":
        return "bg-blue-100 text-blue-600";
      default:
        return null;
    }
  };

  const tabs = ["Heute", "Wöchentlich", "Monatlich", "Jährlich"];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Terminkalender</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700">
            {currentMonth}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {[...Array(2)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}

        {getDaysInMonth().map((day) => {
          const color = getAppointmentColor(day);
          const isToday = day === 15;

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                color
                  ? color
                  : isToday
                  ? "bg-blue-600 text-white font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded bg-purple-100 mr-2"></div>
          <span className="text-gray-600">Termin</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded bg-orange-100 mr-2"></div>
          <span className="text-gray-600">Besprechung</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded bg-blue-100 mr-2"></div>
          <span className="text-gray-600">Operation</span>
        </div>
      </div>
    </Card>
  );
}
