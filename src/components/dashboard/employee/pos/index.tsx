"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Clock,
  RefreshCw,
  Calculator,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import { POSTransaction } from "./transaksi";
import { POSShiftManagement } from "./shift";
import { POSRefund } from "./refund";

export function POS() {
  const [currentView, setCurrentView] = useState<
    "menu" | "transaction" | "shift" | "refund"
  >("menu");

  const handleBack = () => {
    setCurrentView("menu");
  };

  if (currentView === "transaction") {
    return <POSTransaction onBack={handleBack} />;
  }

  if (currentView === "shift") {
    return <POSShiftManagement onBack={handleBack} />;
  }

  if (currentView === "refund") {
    return <POSRefund onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Point of Sale (POS)</h1>
        <p className="text-muted-foreground">
          Kelola transaksi penjualan, shift kasir, dan operasional toko
        </p>
      </div>

      {/* Main POS Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setCurrentView("transaction")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div>Transaksi Penjualan</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Proses penjualan dan checkout
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kelola produk, keranjang belanja, dan proses pembayaran pelanggan
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => setCurrentView("transaction")}
            >
              Mulai Transaksi
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setCurrentView("shift")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div>Manajemen Shift</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Buka/tutup shift kasir
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kelola shift kasir harian, buka kas, tutup kas, dan laporan shift
            </p>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setCurrentView("shift")}
            >
              Kelola Shift
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setCurrentView("refund")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div>Refund & Retur</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Pengembalian barang/uang
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Proses pengembalian barang, refund pembayaran, dan approval retur
            </p>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setCurrentView("refund")}
            >
              Kelola Refund
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calculator className="h-4 w-4" />
              <span className="text-sm font-medium">Transaksi Hari Ini</span>
            </div>
            <div className="text-lg font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total Penjualan</span>
            </div>
            <div className="text-lg font-bold">Rp 0</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Pelanggan</span>
            </div>
            <div className="text-lg font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Produk Terjual</span>
            </div>
            <div className="text-lg font-bold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
