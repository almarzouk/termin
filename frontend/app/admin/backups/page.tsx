"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  Download,
  Upload,
  Trash2,
  Clock,
  HardDrive,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Play,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BackupManagementPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [settings, setSettings] = useState({
    auto_backup: true,
    backup_frequency: "daily",
    retention_days: 30,
    backup_location: "local",
    backup_time: "02:00",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    backupId: null as number | null,
    backupName: "",
  });
  const [restoreDialog, setRestoreDialog] = useState({
    open: false,
    backupId: null as number | null,
    backupName: "",
  });

  useEffect(() => {
    fetchBackups();
    fetchSettings();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.admin.backups.getAll();
      setBackups(response.data || []);
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Backups konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.admin.backups.getSettings();
      setSettings(response.data || settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await api.admin.backups.create();
      toast({
        title: "✅ Erfolg",
        description: "Backup wurde erfolgreich erstellt",
        variant: "success",
      });
      fetchBackups();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Backup konnte nicht erstellt werden",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (id: number, filename: string) => {
    try {
      toast({
        title: "📥 Download gestartet",
        description: `${filename} wird heruntergeladen...`,
        variant: "default",
      });

      const response = await api.admin.backups.download(id);

      // Create blob from response
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Download erfolgreich",
        description: `${filename} wurde heruntergeladen`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Backup konnte nicht heruntergeladen werden",
        variant: "destructive",
      });
    }
  };

  const handleRestoreBackup = async () => {
    try {
      await api.admin.backups.restore(restoreDialog.backupId!);
      toast({
        title: "✅ Erfolg",
        description: `${restoreDialog.backupName} wurde erfolgreich wiederhergestellt`,
        variant: "success",
      });
      setRestoreDialog({ open: false, backupId: null, backupName: "" });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Backup konnte nicht wiederhergestellt werden",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBackup = async () => {
    try {
      await api.admin.backups.delete(deleteDialog.backupId!);
      toast({
        title: "✅ Gelöscht",
        description: `${deleteDialog.backupName} wurde erfolgreich gelöscht`,
        variant: "success",
      });
      setDeleteDialog({ open: false, backupId: null, backupName: "" });
      fetchBackups();
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Backup konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.admin.backups.updateSettings(settings);
      toast({
        title: "✅ Erfolg",
        description: "Einstellungen erfolgreich gespeichert",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "❌ Fehler",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Backup-Verwaltung
          </h1>
          <p className="text-gray-600 mt-1">
            Sichern und wiederherstellen Sie Ihre Daten
          </p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Database className="h-4 w-4 mr-2" />
          {creating ? "Wird erstellt..." : "Backup erstellen"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gesamt Backups</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {backups.length}
              </h3>
            </div>
            <Database className="h-10 w-10 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gesamtgröße</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  backups.reduce((acc, b) => acc + (b.size || 0), 0)
                )}
              </h3>
            </div>
            <HardDrive className="h-10 w-10 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Letztes Backup</p>
              <h3 className="text-lg font-bold text-gray-900">
                {backups[0]
                  ? new Date(backups[0].created_at).toLocaleDateString("de-DE")
                  : "N/A"}
              </h3>
            </div>
            <Clock className="h-10 w-10 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Auto-Backup</p>
              <h3 className="text-lg font-bold text-gray-900">
                {settings.auto_backup ? "Aktiviert" : "Deaktiviert"}
              </h3>
            </div>
            {settings.auto_backup ? (
              <CheckCircle className="h-10 w-10 text-green-500" />
            ) : (
              <AlertCircle className="h-10 w-10 text-yellow-500" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Backup-Einstellungen
          </h3>
          <div className="space-y-4">
            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto_backup">Automatisches Backup</Label>
              <Switch
                id="auto_backup"
                checked={settings.auto_backup}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auto_backup: checked })
                }
              />
            </div>

            {/* Frequency */}
            <div>
              <Label htmlFor="frequency">Häufigkeit</Label>
              <select
                id="frequency"
                value={settings.backup_frequency}
                onChange={(e) =>
                  setSettings({ ...settings, backup_frequency: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Stündlich</option>
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
              </select>
            </div>

            {/* Backup Time */}
            <div>
              <Label htmlFor="backup_time">Backup-Zeit</Label>
              <Input
                id="backup_time"
                type="time"
                value={settings.backup_time}
                onChange={(e) =>
                  setSettings({ ...settings, backup_time: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Retention */}
            <div>
              <Label htmlFor="retention">Aufbewahrung (Tage)</Label>
              <Input
                id="retention"
                type="number"
                value={settings.retention_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    retention_days: parseInt(e.target.value),
                  })
                }
                min="1"
                max="365"
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Speicherort</Label>
              <select
                id="location"
                value={settings.backup_location}
                onChange={(e) =>
                  setSettings({ ...settings, backup_location: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">Lokal</option>
                <option value="cloud">Cloud</option>
                <option value="both">Beides</option>
              </select>
            </div>

            <Button
              onClick={handleSaveSettings}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Einstellungen speichern
            </Button>
          </div>
        </Card>

        {/* Backup List */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Backup-Verlauf
          </h3>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Lädt Backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Keine Backups gefunden
              </h4>
              <p className="text-gray-600">Erstellen Sie Ihr erstes Backup</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-gray-900">
                          {backup.filename}
                        </h4>
                        <Badge
                          className={
                            backup.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {backup.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {formatFileSize(backup.size || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(backup.created_at).toLocaleString("de-DE")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadBackup(backup.id, backup.filename)
                        }
                        title="Backup herunterladen"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setRestoreDialog({
                            open: true,
                            backupId: backup.id,
                            backupName: backup.filename,
                          })
                        }
                        title="Backup wiederherstellen"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            backupId: backup.id,
                            backupName: backup.filename,
                          })
                        }
                        title="Backup löschen"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open &&
          setDeleteDialog({ open: false, backupId: null, backupName: "" })
        }
        onConfirm={handleDeleteBackup}
        title="Backup löschen?"
        description={`Möchten Sie ${deleteDialog.backupName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        variant="destructive"
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={restoreDialog.open}
        onOpenChange={(open) =>
          !open &&
          setRestoreDialog({ open: false, backupId: null, backupName: "" })
        }
        onConfirm={handleRestoreBackup}
        title="Backup wiederherstellen?"
        description={`⚠️ WARNUNG: Das Wiederherstellen von ${restoreDialog.backupName} wird ALLE aktuellen Daten überschreiben! Sind Sie sicher, dass Sie fortfahren möchten?`}
        confirmText="Wiederherstellen"
        cancelText="Abbrechen"
        variant="destructive"
      />
    </div>
  );
}
