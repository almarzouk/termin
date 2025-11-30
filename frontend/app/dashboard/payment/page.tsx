"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function PaymentPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.payments.getAll({
        page: currentPage,
      });

      if (response.data) {
        setPayments(response.data);
        setTotalPages(response.last_page || 1);
      } else {
        setPayments(getDummyPayments());
      }
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Fehler beim Laden der Zahlungen");
      setPayments(getDummyPayments());
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const paymentToUpdate = payments.find((p) => p.id === id);

    try {
      await api.payments.updateStatus(id, status);

      toast({
        title: "✅ Status aktualisiert",
        description: `Zahlungsstatus ${
          paymentToUpdate?.invoice ? "für " + paymentToUpdate.invoice : ""
        } wurde erfolgreich aktualisiert`,
        variant: "success",
      });

      fetchPayments();
    } catch (err: any) {
      toast({
        title: "❌ Fehler",
        description:
          err.message || "Der Zahlungsstatus konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const getDummyPayments = () => [
    {
      id: 1,
      patient: "Emma Becker",
      invoice: "INV-2025-001",
      amount: "€450.00",
      date: "20.11.2025",
      method: "Kreditkarte",
      status: "Bezahlt",
      service: "Kardiologie Konsultation",
    },
    {
      id: 2,
      patient: "Felix Schneider",
      invoice: "INV-2025-002",
      amount: "€890.00",
      date: "21.11.2025",
      method: "Überweisung",
      status: "Ausstehend",
      service: "MRT-Scan",
    },
    {
      id: 3,
      patient: "Sophie Meyer",
      invoice: "INV-2025-003",
      amount: "€120.00",
      date: "22.11.2025",
      method: "Bar",
      status: "Bezahlt",
      service: "Impfung",
    },
    {
      id: 4,
      patient: "Lukas Richter",
      invoice: "INV-2025-004",
      amount: "€650.00",
      date: "23.11.2025",
      method: "Kreditkarte",
      status: "Bezahlt",
      service: "Physiotherapie",
    },
    {
      id: 5,
      patient: "Hannah Koch",
      invoice: "INV-2025-005",
      amount: "€320.00",
      date: "24.11.2025",
      method: "Überweisung",
      status: "Storniert",
      service: "Hautuntersuchung",
    },
    {
      id: 6,
      patient: "Noah Bauer",
      invoice: "INV-2025-006",
      amount: "€1,250.00",
      date: "25.11.2025",
      method: "Versicherung",
      status: "Ausstehend",
      service: "Chirurgie",
    },
  ];

  const parseAmount = (amount: string | number) => {
    if (typeof amount === "number") return amount;
    return parseFloat(amount.toString().replace(/[€,.]/g, "")) / 100;
  };

  const totalAmount = payments.reduce(
    (sum, p) => sum + parseAmount(p.amount),
    0
  );
  const paidAmount = payments
    .filter((p) => p.status === "Bezahlt" || p.status === "paid")
    .reduce((sum, p) => sum + parseAmount(p.amount), 0);
  const pendingAmount = payments
    .filter((p) => p.status === "Ausstehend" || p.status === "pending")
    .reduce((sum, p) => sum + parseAmount(p.amount), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bezahlt":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Ausstehend":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "Storniert":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bezahlt":
        return "bg-green-100 text-green-700";
      case "Ausstehend":
        return "bg-orange-100 text-orange-700";
      case "Storniert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Zahlungen
          </h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Transaktionen</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Neue Rechnung
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Zahlung suchen..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">
                €{(totalAmount / 100).toFixed(2)}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bezahlt</p>
              <p className="text-2xl font-bold text-green-600">
                €{(paidAmount / 100).toFixed(2)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-2xl font-bold text-orange-600">
                €{(pendingAmount / 100).toFixed(2)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transaktionen</p>
              <p className="text-2xl font-bold text-blue-600">
                {payments.length}
              </p>
            </div>
            <svg
              className="h-8 w-8 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Rechnungsnr.
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Patient
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Service
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Betrag
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Datum
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Methode
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">
                  Aktion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm text-gray-900">
                      {payment.invoice}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {payment.patient}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {payment.service}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      {payment.amount}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {payment.date}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="outline">{payment.method}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
