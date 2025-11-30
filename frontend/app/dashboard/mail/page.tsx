"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Mail,
  Inbox,
  Send,
  Trash2,
  Star,
  Paperclip,
  Clock,
} from "lucide-react";

const emails = [
  {
    id: 1,
    from: "Dr. Anna Schmidt",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anna",
    subject: "Patientenbericht - Emma Becker",
    preview: "Sehr geehrte Kollegin, anbei finden Sie den aktuellen Bericht...",
    time: "10:30",
    read: false,
    starred: true,
    hasAttachment: true,
  },
  {
    id: 2,
    from: "Michael Müller",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    subject: "Terminänderung Neurologie",
    preview: "Bitte beachten Sie die geänderten Sprechzeiten für morgen...",
    time: "09:15",
    read: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: 3,
    from: "Sarah Weber",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    subject: "Impfplan Aktualisierung",
    preview: "Neue Richtlinien für Kinderimpfungen wurden veröffentlicht...",
    time: "Gestern",
    read: false,
    starred: false,
    hasAttachment: true,
  },
  {
    id: 4,
    from: "Verwaltung",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    subject: "Gehaltsabrechnung November",
    preview: "Ihre Gehaltsabrechnung für November ist verfügbar...",
    time: "22.11",
    read: true,
    starred: false,
    hasAttachment: true,
  },
  {
    id: 5,
    from: "Thomas Wagner",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    subject: "Notfallprotokoll Update",
    preview:
      "Das neue Notfallprotokoll wurde genehmigt und ist ab sofort gültig...",
    time: "21.11",
    read: true,
    starred: true,
    hasAttachment: false,
  },
];

export default function MailPage() {
  const [activeTab, setActiveTab] = useState("Posteingang");
  const tabs = ["Posteingang", "Gesendet", "Entwürfe", "Papierkorb"];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Post</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre E-Mails</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Mail className="h-5 w-5 mr-2" />
          Neue E-Mail
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="E-Mails durchsuchen..." className="pl-10" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-4 lg:col-span-1">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {tab === "Posteingang" && <Inbox className="h-5 w-5" />}
                  {tab === "Gesendet" && <Send className="h-5 w-5" />}
                  {tab === "Entwürfe" && <Clock className="h-5 w-5" />}
                  {tab === "Papierkorb" && <Trash2 className="h-5 w-5" />}
                  <span className="font-medium">{tab}</span>
                </div>
                {tab === "Posteingang" && (
                  <Badge className="bg-red-500 text-white">2</Badge>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Email List */}
        <Card className="lg:col-span-3">
          <div className="divide-y divide-gray-100">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !email.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={email.avatar} />
                    <AvatarFallback>{email.from[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-medium text-gray-900 ${
                          !email.read ? "font-semibold" : ""
                        }`}
                      >
                        {email.from}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {email.starred && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {email.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-1">
                      <h4
                        className={`text-sm text-gray-900 truncate ${
                          !email.read ? "font-semibold" : ""
                        }`}
                      >
                        {email.subject}
                      </h4>
                      {email.hasAttachment && (
                        <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 truncate">
                      {email.preview}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
