"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/table";
import {
  Clock,
  Play,
  Square,
  Calendar,
  DollarSign,
  TrendingUp,
  History,
  CheckCircle,
  AlertCircle,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import { POSService } from "@/backend/services/pos";
import { POSShift } from "@/backend/tables/posShifts";
import { useAuth } from "@/contexts/AuthContext";

// Helper function for currency formatting
const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

interface POSShiftManagementProps {
  onBack: () => void;
}

export function POSShiftManagement({ onBack }: POSShiftManagementProps) {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState<POSShift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<POSShift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [openingCash, setOpeningCash] = useState(0);
  const [closingCash, setClosingCash] = useState(0);

  useEffect(() => {
    if (user?.id && user?.companyId) {
      loadShiftData();
    }
  }, [user]);

  const loadShiftData = async () => {
    if (!user?.id || !user?.companyId) return;

    setIsLoading(true);
    try {
      const current = await POSService.getCurrentShift(user.id, user.companyId);
      const history = await POSService.getShiftHistory(user.id, user.companyId);

      setCurrentShift(current);
      setShiftHistory(history);
    } catch (error) {
      console.error("Error loading shift data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenShift = async () => {
    if (!user?.id || !user?.companyId || openingCash <= 0) return;

    setIsLoading(true);
    try {
      const newShift = await POSService.openShift(
        user.id,
        user.companyId,
        openingCash
      );

      setCurrentShift(newShift);
      setShowOpenForm(false);
      setOpeningCash(0);
      await loadShiftData();

      alert("Shift berhasil dibuka!");
    } catch (error) {
      console.error("Error opening shift:", error);
      alert(error instanceof Error ? error.message : "Gagal membuka shift");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!currentShift || closingCash < 0) return;

    setIsLoading(true);
    try {
      await POSService.closeShift(currentShift.id, closingCash);

      setCurrentShift(null);
      setShowCloseForm(false);
      setClosingCash(0);
      await loadShiftData();

      alert("Shift berhasil ditutup!");
    } catch (error) {
      console.error("Error closing shift:", error);
      alert(error instanceof Error ? error.message : "Gagal menutup shift");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: "shiftDate",
      header: "Tanggal",
      render: (shift: POSShift) => (
        <div className="font-medium">
          {new Date(shift.shiftDate).toLocaleDateString("id-ID")}
        </div>
      ),
    },
    {
      key: "time",
      header: "Waktu",
      render: (shift: POSShift) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3 text-muted-foreground" />
            {shift.openTime}
          </div>
          {shift.closeTime && (
            <div className="flex items-center gap-1 mt-1">
              <Square className="h-3 w-3 text-muted-foreground" />
              {shift.closeTime}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "cash",
      header: "Kas",
      render: (shift: POSShift) => (
        <div className="text-sm">
          <div className="text-muted-foreground">
            Buka: {formatCurrency(shift.openingCash)}
          </div>
          {shift.closingCash !== undefined && (
            <div className="text-muted-foreground">
              Tutup: {formatCurrency(shift.closingCash)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "totalSales",
      header: "Total Penjualan",
      render: (shift: POSShift) => (
        <div className="font-medium text-primary">
          {formatCurrency(shift.totalSales)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (shift: POSShift) => (
        <Badge variant={shift.status === "open" ? "default" : "secondary"}>
          {shift.status === "open" ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Buka
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Tutup
            </div>
          )}
        </Badge>
      ),
    },
  ];

  const getCurrentShiftSummary = () => {
    if (!currentShift) return null;

    const duration = currentShift.openTime
      ? `Sejak ${currentShift.openTime}`
      : "Baru dibuka";

    return {
      openingCash: currentShift.openingCash,
      totalSales: currentShift.totalSales,
      duration,
    };
  };

  const shiftSummary = getCurrentShiftSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manajemen Shift</h1>
            <p className="text-muted-foreground">Kelola shift kasir harian</p>
          </div>
        </div>
      </div>

      {/* Current Shift Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Shift Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentShift ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary">
                  <Clock className="h-3 w-3 mr-1" />
                  Shift Aktif
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {shiftSummary?.duration}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Kas Awal</span>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(currentShift.openingCash)}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Penjualan</span>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(currentShift.totalSales)}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Banknote className="h-4 w-4" />
                    <span className="text-sm font-medium">Estimasi Kas</span>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(
                      currentShift.openingCash + currentShift.totalSales
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowCloseForm(true)}
                className="w-full"
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Tutup Shift
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground mb-4">
                Tidak ada shift yang sedang aktif
              </div>
              <Button onClick={() => setShowOpenForm(true)}>
                <Play className="h-4 w-4 mr-2" />
                Buka Shift Baru
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Shift Form */}
      {showOpenForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Buka Shift Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Kas Awal (Rp)
              </label>
              <Input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(Number(e.target.value))}
                placeholder="Masukkan jumlah kas awal..."
                min="0"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleOpenShift}
                disabled={isLoading || openingCash <= 0}
                className="flex-1"
              >
                {isLoading ? "Membuka..." : "Buka Shift"}
              </Button>
              <Button
                onClick={() => setShowOpenForm(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close Shift Form */}
      {showCloseForm && currentShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Tutup Shift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Ringkasan Shift</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kas Awal:</span>
                  <div className="font-medium">
                    {formatCurrency(currentShift.openingCash)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Total Penjualan:
                  </span>
                  <div className="font-medium">
                    {formatCurrency(currentShift.totalSales)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Waktu Buka:</span>
                  <div className="font-medium">{currentShift.openTime}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimasi Kas:</span>
                  <div className="font-medium">
                    {formatCurrency(
                      currentShift.openingCash + currentShift.totalSales
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Kas Akhir (Rp)
              </label>
              <Input
                type="number"
                value={closingCash}
                onChange={(e) => setClosingCash(Number(e.target.value))}
                placeholder="Masukkan jumlah kas akhir..."
                min="0"
              />
              {closingCash > 0 && (
                <div className="mt-2 p-2 bg-muted/30 rounded text-sm">
                  <div className="flex justify-between">
                    <span>Selisih:</span>
                    <span
                      className={
                        closingCash -
                          (currentShift.openingCash +
                            currentShift.totalSales) >=
                        0
                          ? "font-medium"
                          : "text-destructive font-medium"
                      }
                    >
                      {formatCurrency(
                        closingCash -
                          (currentShift.openingCash + currentShift.totalSales)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCloseShift}
                disabled={isLoading || closingCash < 0}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? "Menutup..." : "Tutup Shift"}
              </Button>
              <Button
                onClick={() => setShowCloseForm(false)}
                variant="outline"
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Riwayat Shift
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shiftHistory.length > 0 ? (
            <DataTable data={shiftHistory} columns={columns} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada riwayat shift
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
