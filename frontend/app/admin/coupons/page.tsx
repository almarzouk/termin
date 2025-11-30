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
import { Plus, Edit, Trash2, Search, Power, Zap, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_amount: "",
    min_purchase_amount: "",
    max_uses: "",
    max_uses_per_user: "1",
    valid_from: "",
    valid_until: "",
    applicable_plans: [] as number[],
    is_active: true,
  });

  const [generateData, setGenerateData] = useState({
    count: "10",
    prefix: "",
    discount_type: "percentage",
    discount_value: "10",
    max_uses_per_user: "1",
    valid_from: "",
    valid_until: "",
  });

  useEffect(() => {
    fetchCoupons();
    fetchPlans();
    fetchStats();
  }, [searchQuery, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params: any = { per_page: 100 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.admin.coupons.getAll(params);
      setCoupons(response.data || []);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Laden der Gutscheine",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.admin.subscriptionPlans.getAll({
        per_page: 100,
      });
      setPlans(response.data || []);
    } catch (error: any) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.admin.coupons.getStats();
      setStats(response.data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        max_discount_amount: formData.max_discount_amount
          ? parseFloat(formData.max_discount_amount)
          : null,
        min_purchase_amount: formData.min_purchase_amount
          ? parseFloat(formData.min_purchase_amount)
          : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        max_uses_per_user: parseInt(formData.max_uses_per_user),
        applicable_plans:
          formData.applicable_plans.length > 0
            ? formData.applicable_plans
            : null,
      };

      if (editingCoupon) {
        await api.admin.coupons.update(editingCoupon.id, data);
        toast({
          title: "Erfolg",
          description: "Gutschein erfolgreich aktualisiert",
        });
      } else {
        await api.admin.coupons.create(data);
        toast({
          title: "Erfolg",
          description: "Gutschein erfolgreich erstellt",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        count: parseInt(generateData.count),
        prefix: generateData.prefix || undefined,
        discount_type: generateData.discount_type,
        discount_value: parseFloat(generateData.discount_value),
        max_uses_per_user: parseInt(generateData.max_uses_per_user),
        valid_from: generateData.valid_from || undefined,
        valid_until: generateData.valid_until || undefined,
      };

      await api.admin.coupons.generate(data);
      toast({
        title: "Erfolg",
        description: `${generateData.count} Gutscheine erfolgreich generiert`,
      });

      setIsGenerateDialogOpen(false);
      setGenerateData({
        count: "10",
        prefix: "",
        discount_type: "percentage",
        discount_value: "10",
        max_uses_per_user: "1",
        valid_from: "",
        valid_until: "",
      });
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: coupon.discount_value?.toString() || "",
      max_discount_amount: coupon.max_discount_amount?.toString() || "",
      min_purchase_amount: coupon.min_purchase_amount?.toString() || "",
      max_uses: coupon.max_uses?.toString() || "",
      max_uses_per_user: coupon.max_uses_per_user?.toString() || "1",
      valid_from: coupon.valid_from
        ? new Date(coupon.valid_from).toISOString().split("T")[0]
        : "",
      valid_until: coupon.valid_until
        ? new Date(coupon.valid_until).toISOString().split("T")[0]
        : "",
      applicable_plans: coupon.applicable_plans || [],
      is_active: coupon.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm("Sind Sie sicher, dass Sie diesen Gutschein löschen möchten?")
    ) {
      return;
    }

    try {
      await api.admin.coupons.delete(id);
      toast({
        title: "Erfolg",
        description: "Gutschein erfolgreich gelöscht",
      });
      fetchCoupons();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Löschen des Gutscheins",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.admin.coupons.toggleStatus(id);
      toast({
        title: "Erfolg",
        description: "Status erfolgreich aktualisiert",
      });
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Aktualisieren des Status",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Kopiert",
      description: `Gutscheincode "${code}" wurde kopiert`,
    });
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      max_discount_amount: "",
      min_purchase_amount: "",
      max_uses: "",
      max_uses_per_user: "1",
      valid_from: "",
      valid_until: "",
      applicable_plans: [],
      is_active: true,
    });
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gutscheine</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Rabattcodes und Sonderangebote
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsGenerateDialogOpen(true)}
          >
            <Zap className="h-4 w-4 mr-2" />
            Generieren
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Gutschein
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamt</div>
            <div className="text-2xl font-bold">{stats.total_coupons}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Aktiv</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.active_coupons}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Abgelaufen</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.expired_coupons}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">Gesamt Rabatt</div>
            <div className="text-2xl font-bold">
              ${stats.total_discount_given}
            </div>
          </Card>
        </div>
      )}

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Coupons Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Rabatt</TableHead>
              <TableHead>Verwendung</TableHead>
              <TableHead>Gültigkeit</TableHead>
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
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Keine Gutscheine gefunden
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {coupon.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {coupon.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === "percentage" ? (
                      <Badge variant="secondary">
                        {coupon.discount_value}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        ${coupon.discount_value}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {coupon.times_used} / {coupon.max_uses || "∞"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Max {coupon.max_uses_per_user} pro Benutzer
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.valid_until ? (
                      <div className="text-sm">
                        <div>
                          Bis:{" "}
                          {new Date(coupon.valid_until).toLocaleDateString(
                            "de-DE"
                          )}
                        </div>
                        {isExpired(coupon.valid_until) && (
                          <Badge variant="destructive" className="mt-1">
                            Abgelaufen
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Kein Ablaufdatum</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.is_active && !isExpired(coupon.valid_until) ? (
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
                        onClick={() => handleToggleStatus(coupon.id)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Gutschein bearbeiten" : "Neuer Gutschein"}
            </DialogTitle>
            <DialogDescription>
              Erstellen oder bearbeiten Sie einen Rabattgutschein
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Gutscheincode</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SAVE20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_type">Rabatttyp</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Prozentual</SelectItem>
                    <SelectItem value="fixed">Fester Betrag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Beschreibung des Gutscheins..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_value">
                  Rabattwert{" "}
                  {formData.discount_type === "percentage" ? "(%)" : "($)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  required
                />
              </div>
              {formData.discount_type === "percentage" && (
                <div>
                  <Label htmlFor="max_discount_amount">
                    Max Rabattbetrag ($)
                  </Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    step="0.01"
                    placeholder="Unbegrenzt"
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_purchase_amount">Min. Kaufbetrag ($)</Label>
                <Input
                  id="min_purchase_amount"
                  type="number"
                  step="0.01"
                  placeholder="Keine Mindestgrenze"
                  value={formData.min_purchase_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_purchase_amount: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_uses">Max. Verwendungen</Label>
                <Input
                  id="max_uses"
                  type="number"
                  placeholder="Unbegrenzt"
                  value={formData.max_uses}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_uses_per_user">Max. pro Benutzer</Label>
                <Input
                  id="max_uses_per_user"
                  type="number"
                  value={formData.max_uses_per_user}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_uses_per_user: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">Gültig ab</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="valid_until">Gültig bis</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_until: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Anwendbare Pläne (leer = alle)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`plan-${plan.id}`}
                      checked={formData.applicable_plans.includes(plan.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            applicable_plans: [
                              ...formData.applicable_plans,
                              plan.id,
                            ],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            applicable_plans: formData.applicable_plans.filter(
                              (id) => id !== plan.id
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Label
                      htmlFor={`plan-${plan.id}`}
                      className="cursor-pointer"
                    >
                      {plan.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Label htmlFor="is_active" className="cursor-pointer">
                Gutschein aktivieren
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
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
                {editingCoupon ? "Aktualisieren" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gutscheine generieren</DialogTitle>
            <DialogDescription>
              Erstellen Sie mehrere Gutscheine automatisch
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Label htmlFor="count">Anzahl</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={generateData.count}
                onChange={(e) =>
                  setGenerateData({ ...generateData, count: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="prefix">Präfix (optional)</Label>
              <Input
                id="prefix"
                value={generateData.prefix}
                onChange={(e) =>
                  setGenerateData({
                    ...generateData,
                    prefix: e.target.value.toUpperCase(),
                  })
                }
                placeholder="SALE"
              />
            </div>

            <div>
              <Label htmlFor="gen_discount_type">Rabatttyp</Label>
              <Select
                value={generateData.discount_type}
                onValueChange={(value) =>
                  setGenerateData({ ...generateData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Prozentual</SelectItem>
                  <SelectItem value="fixed">Fester Betrag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gen_discount_value">Rabattwert</Label>
              <Input
                id="gen_discount_value"
                type="number"
                step="0.01"
                value={generateData.discount_value}
                onChange={(e) =>
                  setGenerateData({
                    ...generateData,
                    discount_value: e.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="gen_max_uses_per_user">Max. pro Benutzer</Label>
              <Input
                id="gen_max_uses_per_user"
                type="number"
                value={generateData.max_uses_per_user}
                onChange={(e) =>
                  setGenerateData({
                    ...generateData,
                    max_uses_per_user: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gen_valid_from">Gültig ab</Label>
                <Input
                  id="gen_valid_from"
                  type="date"
                  value={generateData.valid_from}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      valid_from: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="gen_valid_until">Gültig bis</Label>
                <Input
                  id="gen_valid_until"
                  type="date"
                  value={generateData.valid_until}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      valid_until: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Generieren</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
