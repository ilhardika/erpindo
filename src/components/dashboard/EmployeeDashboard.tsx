"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Percent,
  UserCheck,
  DollarSign,
  Truck,
} from "lucide-react";
import { User } from "@/backend/types/schema";
import { DashboardService } from "@/backend/services/dashboard";
import { useState, useEffect } from "react";

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await DashboardService.getEmployeeDashboard(user);
      setDashboardData(data);
    };
    loadData();
  }, [user]);

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  const employee = dashboardData.employee;
  const availableModules = dashboardData.availableModules || [];

  const moduleIcons = {
    pos: ShoppingCart,
    sales: TrendingUp,
    inventory: Package,
    customers: Users,
    promotions: Percent,
    hr: UserCheck,
    finance: DollarSign,
    vehicles: Truck,
  };

  const moduleNames = {
    pos: "POS (Kasir)",
    sales: "Penjualan & Pembelian",
    inventory: "Inventori/Gudang",
    customers: "Pelanggan & Supplier",
    promotions: "Promosi",
    hr: "HR/Manajemen Karyawan",
    finance: "Keuangan",
    vehicles: "Kendaraan",
  };

  const recentActivities = [
    "Transaksi POS #001 berhasil diproses",
    "Stok produk ABC telah diperbarui",
    "Laporan penjualan harian telah dibuat",
  ];

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Karyawan</h1>
          <p className="text-muted-foreground">Selamat datang, {user.name}</p>
          {employee && (
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          )}
        </div>
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            {employee && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nama</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posisi</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departemen</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bergabung</p>
                  <p className="font-medium">
                    {new Date(employee.joinDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Modul yang Tersedia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModules.map((module) => {
                const IconComponent =
                  moduleIcons[module as keyof typeof moduleIcons];
                const moduleName =
                  moduleNames[module as keyof typeof moduleNames];

                return (
                  <Card
                    key={module}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        {IconComponent && (
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{moduleName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Akses tersedia
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="text-sm">{activity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-sm">Buka POS</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Cek Stok</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Laporan</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex-col space-y-2"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Pelanggan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
