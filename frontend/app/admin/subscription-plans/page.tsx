"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, Power } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function SubscriptionPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [billingPeriodFilter, setBillingPeriodFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    price: "",
    billing_period: "monthly",
    max_clinics: "",
    max_doctors: "",
    max_staff: "",
    max_appointments_per_month: "",
    has_sms: false,
    has_email: true,
    has_reports: false,
    has_analytics: false,
    has_api_access: false,
    priority_support: "0",
    is_popular: false,
    is_active: true,
    sort_order: "0",
  });

  useEffect(() => {
    fetchPlans();
  }, [searchQuery, billingPeriodFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;
      if (billingPeriodFilter !== "all")
        params.billing_period = billingPeriodFilter;

      const response = await api.admin.subscriptionPlans.getAll(params);
      setPlans(response.data || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Laden der Abonnementpläne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        max_clinics: formData.max_clinics
          ? parseInt(formData.max_clinics)
          : null,
        max_doctors: formData.max_doctors
          ? parseInt(formData.max_doctors)
          : null,
        max_staff: formData.max_staff ? parseInt(formData.max_staff) : null,
        max_appointments_per_month: formData.max_appointments_per_month
          ? parseInt(formData.max_appointments_per_month)
          : null,
        priority_support: parseInt(formData.priority_support),
        sort_order: parseInt(formData.sort_order),
      };

      if (editingPlan) {
        await api.admin.subscriptionPlans.update(editingPlan.id, data);
        toast({
          title: "Erfolg",
          description: "Abonnementplan erfolgreich aktualisiert",
        });
      } else {
        await api.admin.subscriptionPlans.create(data);
        toast({
          title: "Erfolg",
          description: "Abonnementplan erfolgreich erstellt",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || "",
      name_ar: plan.name_ar || "",
      description: plan.description || "",
      description_ar: plan.description_ar || "",
      price: plan.price?.toString() || "",
      billing_period: plan.billing_period || "monthly",
      max_clinics: plan.max_clinics?.toString() || "",
      max_doctors: plan.max_doctors?.toString() || "",
      max_staff: plan.max_staff?.toString() || "",
      max_appointments_per_month:
        plan.max_appointments_per_month?.toString() || "",
      has_sms: plan.has_sms || false,
      has_email: plan.has_email !== false,
      has_reports: plan.has_reports || false,
      has_analytics: plan.has_analytics || false,
      has_api_access: plan.has_api_access || false,
      priority_support: plan.priority_support?.toString() || "0",
      is_popular: plan.is_popular || false,
      is_active: plan.is_active !== false,
      sort_order: plan.sort_order?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Plan löschen möchten?")) {
      return;
    }

    try {
      await api.admin.subscriptionPlans.delete(id);
      toast({
        title: "Erfolg",
        description: "Abonnementplan erfolgreich gelöscht",
      });
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen des Plans",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.admin.subscriptionPlans.toggleStatus(id);
      toast({
        title: "Erfolg",
        description: "Status erfolgreich aktualisiert",
      });
      fetchPlans();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      price: "",
      billing_period: "monthly",
      max_clinics: "",
      max_doctors: "",
      max_staff: "",
      max_appointments_per_month: "",
      has_sms: false,
      has_email: true,
      has_reports: false,
      has_analytics: false,
      has_api_access: false,
      priority_support: "0",
      is_popular: false,
      is_active: true,
      sort_order: "0",
    });
  };

  const getBillingPeriodLabel = (period: string) => {
    switch (period) {
      case "monthly":
        return "Monatlich";
      case "yearly":
        return "Jährlich";
      case "lifetime":
        return "Lebenslang";
      default:
        return period;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Abonnementpläne</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihre Preispläne und Funktionen
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Plan
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={billingPeriodFilter}
            onValueChange={setBillingPeriodFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Abrechnungszeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Zeiträume</SelectItem>
              <SelectItem value="monthly">Monatlich</SelectItem>
              <SelectItem value="yearly">Jährlich</SelectItem>
              <SelectItem value="lifetime">Lebenslang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Plans Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead>Funktionen</TableHead>
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
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Keine Abonnementpläne gefunden
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      {plan.name_ar && (
                        <div className="text-sm text-gray-500">
                          {plan.name_ar}
                        </div>
                      )}
                      {plan.is_popular && (
                        <Badge variant="secondary" className="mt-1">
                          Beliebt
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${plan.price}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getBillingPeriodLabel(plan.billing_period)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {plan.has_sms && (
                        <Badge variant="secondary" className="text-xs">
                          SMS
                        </Badge>
                      )}
                      {plan.has_email && (
                        <Badge variant="secondary" className="text-xs">
                          Email
                        </Badge>
                      )}
                      {plan.has_reports && (
                        <Badge variant="secondary" className="text-xs">
                          Berichte
                        </Badge>
                      )}
                      {plan.has_analytics && (
                        <Badge variant="secondary" className="text-xs">
                          Analytics
                        </Badge>
                      )}
                      {plan.has_api_access && (
                        <Badge variant="secondary" className="text-xs">
                          API
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.is_active ? (
                      <Badge className="bg-green-500">Aktiv</Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(plan.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Plan bearbeiten" : "Neuer Plan"}
            </DialogTitle>
            <DialogDescription>
              Erstellen oder bearbeiten Sie einen Abonnementplan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name (Deutsch)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_ar">Name (Arabisch)</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Beschreibung (Deutsch)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description_ar">Beschreibung (Arabisch)</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ar: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preis ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="billing_period">Abrechnungszeitraum</Label>
                <Select
                  value={formData.billing_period}
                  onValueChange={(value) =>
                    setFormData({ ...formData, billing_period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                    <SelectItem value="lifetime">Lebenslang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="max_clinics">Max Kliniken</Label>
                <Input
                  id="max_clinics"
                  type="number"
                  placeholder="Unbegrenzt"
                  value={formData.max_clinics}
                  onChange={(e) =>
                    setFormData({ ...formData, max_clinics: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_doctors">Max Ärzte</Label>
                <Input
                  id="max_doctors"
                  type="number"
                  placeholder="Unbegrenzt"
                  value={formData.max_doctors}
                  onChange={(e) =>
                    setFormData({ ...formData, max_doctors: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_staff">Max Personal</Label>
                <Input
                  id="max_staff"
                  type="number"
                  placeholder="Unbegrenzt"
                  value={formData.max_staff}
                  onChange={(e) =>
                    setFormData({ ...formData, max_staff: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_appointments_per_month">
                  Max Termine/Monat
                </Label>
                <Input
                  id="max_appointments_per_month"
                  type="number"
                  placeholder="Unbegrenzt"
                  value={formData.max_appointments_per_month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_appointments_per_month: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label>Funktionen</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_sms" className="cursor-pointer">
                    SMS Benachrichtigungen
                  </Label>
                  <Switch
                    id="has_sms"
                    checked={formData.has_sms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_sms: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_email" className="cursor-pointer">
                    E-Mail Benachrichtigungen
                  </Label>
                  <Switch
                    id="has_email"
                    checked={formData.has_email}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_email: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_reports" className="cursor-pointer">
                    Erweiterte Berichte
                  </Label>
                  <Switch
                    id="has_reports"
                    checked={formData.has_reports}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_reports: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_analytics" className="cursor-pointer">
                    Analytics Dashboard
                  </Label>
                  <Switch
                    id="has_analytics"
                    checked={formData.has_analytics}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_analytics: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_api_access" className="cursor-pointer">
                    API Zugriff
                  </Label>
                  <Switch
                    id="has_api_access"
                    checked={formData.has_api_access}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_api_access: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <Label htmlFor="priority_support">Prioritätssupport</Label>
                <Select
                  value={formData.priority_support}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority_support: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Basis</SelectItem>
                    <SelectItem value="1">Priorität</SelectItem>
                    <SelectItem value="2">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sort_order">Sortierreihenfolge</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_popular" className="cursor-pointer">
                    Als Beliebt markieren
                  </Label>
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_popular: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Aktiv
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                {editingPlan ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
