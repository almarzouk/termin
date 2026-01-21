"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  ArrowUpCircle,
  Trash2,
  FileText,
} from "lucide-react";

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  payment_status: string;
  amount: string;
  features: string[];
}

interface Invoice {
  id: number;
  invoice_number: string;
  amount: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
  download_url: string;
}

export default function MySubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchInvoices();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/subscriptions/my-subscription",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/subscriptions/invoices",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleUpgrade = () => {
    // Navigate to public subscription plans page (not admin)
    window.location.href = "/subscription-plans";
  };

  const handleCancel = async () => {
    if (!confirm("Möchten Sie Ihr Abonnement wirklich kündigen?")) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/subscriptions/cancel",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Abonnement erfolgreich gekündigt");
        fetchSubscription();
      } else {
        const data = await response.json();
        alert(data.message || "Fehler beim Kündigen des Abonnements");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Fehler beim Kündigen des Abonnements");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/subscriptions/invoices/${invoiceId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Fehler beim Herunterladen der Rechnung");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      active: { label: "Aktiv", variant: "default" },
      expired: { label: "Abgelaufen", variant: "destructive" },
      pending: { label: "Ausstehend", variant: "secondary" },
      cancelled: { label: "Gekündigt", variant: "outline" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary",
    };
    return (
      <Badge variant={config.variant as any} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      paid: { label: "Bezahlt", color: "text-green-600" },
      pending: { label: "Ausstehend", color: "text-yellow-600" },
      failed: { label: "Fehlgeschlagen", color: "text-red-600" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "text-gray-600",
    };
    return (
      <span className={`font-semibold ${config.color}`}>{config.label}</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-500">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Kein aktives Abonnement
          </h2>
          <p className="text-gray-600 mb-6">
            Sie haben derzeit kein aktives Abonnement. Wählen Sie einen Plan, um
            zu beginnen.
          </p>
          <Button
            onClick={handleUpgrade}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowUpCircle className="h-5 w-5 mr-2" />
            Plan auswählen
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mein Abonnement</h1>
        <p className="text-gray-500">
          Verwalten Sie Ihr Abonnement und Rechnungen
        </p>
      </div>

      {/* Current Subscription Card */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {subscription.plan_name}
            </h2>
            <div className="flex items-center gap-3">
              {getStatusBadge(subscription.status)}
              {getPaymentStatusBadge(subscription.payment_status)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              €{subscription.amount}
            </div>
            <div className="text-sm text-gray-500">pro Monat</div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <div className="text-sm text-gray-500">Startdatum</div>
              <div className="font-semibold">
                {new Date(subscription.started_at).toLocaleDateString("de-DE")}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <div className="text-sm text-gray-500">Ablaufdatum</div>
              <div className="font-semibold">
                {new Date(subscription.expires_at).toLocaleDateString("de-DE")}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <div className="text-sm text-gray-500">
                Automatische Verlängerung
              </div>
              <div className="font-semibold">
                {subscription.auto_renew ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Aktiviert
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Deaktiviert
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        {subscription.features && subscription.features.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Enthaltene Funktionen:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpgrade}
            disabled={actionLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowUpCircle className="h-5 w-5 mr-2" />
            Plan aktualisieren
          </Button>

          {subscription.status === "active" && (
            <Button
              onClick={handleCancel}
              disabled={actionLoading}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Abonnement kündigen
            </Button>
          )}
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Rechnungen</h2>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Keine Rechnungen verfügbar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Rechnungsnummer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Ausstellungsdatum
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Betrag
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(invoice.issued_at).toLocaleDateString("de-DE")}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      €{invoice.amount}
                    </td>
                    <td className="py-3 px-4">
                      {getPaymentStatusBadge(invoice.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
