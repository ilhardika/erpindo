"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building, Users, Settings } from "lucide-react";
import { User } from "@/backend/types/schema";
import { DashboardService } from "@/backend/services/dashboard";
import { useState, useEffect } from "react";

interface CompanyOwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CompanyOwnerDashboard({
  user,
  onLogout,
}: CompanyOwnerDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user.companyId) {
        const data = await DashboardService.getCompanyOwnerDashboard(
          user.companyId
        );
        setDashboardData(data);
      }
    };
    loadData();
  }, [user]);

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  const employees = dashboardData.employees;
  const company = dashboardData.company;
  const activeEmployees = employees.filter((e) => e.isActive).length;

  const moduleStats = {
    pos: 2,
    sales: 1,
    inventory: 2,
    purchasing: 1,
    hr: 0,
    finance: 0,
  };

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Pemilik Perusahaan</h1>
          <p className="text-muted-foreground">Selamat datang, {user.name}</p>
          {company && (
            <p className="text-sm text-muted-foreground">{company.name}</p>
          )}
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Karyawan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeEmployees} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modul Aktif</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Semua modul tersedia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status Perusahaan
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktif</div>
              <p className="text-xs text-muted-foreground">Pembayaran lunas</p>
            </CardContent>
          </Card>
        </div>

        {/* Module Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Penggunaan Modul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">POS</span>
                  <Badge variant="default">{moduleStats.pos} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Penjualan</span>
                  <Badge variant="default">{moduleStats.sales} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inventori</span>
                  <Badge variant="default">
                    {moduleStats.inventory} pengguna
                  </Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pembelian</span>
                  <Badge variant="default">
                    {moduleStats.purchasing} pengguna
                  </Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HR</span>
                  <Badge variant="secondary">{moduleStats.hr} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Keuangan</span>
                  <Badge variant="secondary">
                    {moduleStats.finance} pengguna
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <CardTitle>Kelola Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.modules.map((module) => (
                        <Badge
                          key={module}
                          variant="outline"
                          className="text-xs"
                        >
                          {module}
                        </Badge>
                      ))}
                    </div>
                    <Badge
                      variant={employee.isActive ? "default" : "secondary"}
                    >
                      {employee.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button>Tambah Karyawan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
