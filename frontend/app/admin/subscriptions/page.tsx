"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [searchQuery, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.admin.subscriptions.getAll(params);
      setSubscriptions(response.data || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Laden der Abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.admin.subscriptions.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await api.admin.subscriptions.cancel(
        selectedSubscription.id,
        cancellationReason || undefined
      );
      toast({
        title: "Erfolg",
        description: "Abonnement erfolgreich gekündigt",
      });
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
      setCancellationReason("");
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Kündigen des Abonnements",
        variant: "destructive",
      });
    }
  };

  const handleRenewSubscription = async (id: number) => {
    if (
      !confirm(
        "Sind Sie sicher, dass Sie dieses Abonnement verlängern möchten?"
      )
    ) {
      return;
    }

    try {
      await api.admin.subscriptions.renew(id);
      toast({
        title: "Erfolg",
        description: "Abonnement erfolgreich verlängert",
      });
      fetchSubscriptions();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Verlängern des Abonnements",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktiv</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Ausstehend</Badge>;
      case "expired":
        return <Badge variant="destructive">Abgelaufen</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-gray-600 mt-1">
            Übersicht aller aktiven und vergangenen Abonnements
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamt</div>
            <div className="text-2xl font-bold">
              {stats.total_subscriptions}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Aktiv</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_subscriptions}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gekündigt</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled_subscriptions}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamtumsatz</div>
            <div className="text-2xl font-bold">${stats.total_revenue}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Suchen nach Benutzer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
              <SelectItem value="cancelled">Gekündigt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benutzer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Laden...
                </TableCell>
              </TableRow>
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Keine Abonnements gefunden
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {subscription.user?.name || "Unbekannt"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.user?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {subscription.plan?.name || "Gelöschter Plan"}
                      </div>
                      {subscription.coupon && (
                        <Badge variant="secondary" className="mt-1">
                          Gutschein: {subscription.coupon.code}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        ${subscription.final_price}
                      </div>
                      {subscription.discount_amount > 0 && (
                        <div className="text-sm text-gray-500">
                          <span className="line-through">
                            ${subscription.original_price}
                          </span>
                          <span className="text-green-600 ml-1">
                            -${subscription.discount_amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {subscription.starts_at && (
                        <div>
                          Von:{" "}
                          {new Date(subscription.starts_at).toLocaleDateString(
                            "de-DE"
                          )}
                        </div>
                      )}
                      {subscription.ends_at && (
                        <div>
                          Bis:{" "}
                          {new Date(subscription.ends_at).toLocaleDateString(
                            "de-DE"
                          )}
                        </div>
                      )}
                      {!subscription.ends_at && (
                        <div className="text-gray-500">Lebenslang</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {subscription.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setCancelDialogOpen(true);
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Kündigen
                        </Button>
                      )}
                      {(subscription.status === "expired" ||
                        subscription.status === "active") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRenewSubscription(subscription.id)
                          }
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Verlängern
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonnement kündigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie dieses Abonnement kündigen möchten?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Kündigungsgrund (optional)</Label>
              <Textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Geben Sie einen Grund für die Kündigung an..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setSelectedSubscription(null);
                setCancellationReason("");
              }}
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Abonnement kündigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
