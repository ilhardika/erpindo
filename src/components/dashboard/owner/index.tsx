"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building, Users, Settings, UserPlus } from "lucide-react";
import { User } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables/enums";
import { DashboardService } from "@/backend/services/dashboard";
import { ManageEmployees } from "./employees";
import { useState, useEffect } from "react";

interface CompanyOwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CompanyOwnerDashboard({
  user,
  onLogout,
}: CompanyOwnerDashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard");
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

  // Render different pages based on navigation
  if (currentPage === "employees") {
    return <ManageEmployees user={user} onLogout={onLogout} />;
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
    <DashboardLayout requiredRole={UserRole.COMPANY_OWNER}>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Departemen</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(employees.map((e) => e.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                departemen berbeda
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Karyawan</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kelola karyawan dan atur email/password login mereka
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total karyawan terdaftar:</span>
                <Badge variant="default">{employees.length} orang</Badge>
              </div>
              <Button
                className="w-full"
                onClick={() => setCurrentPage("employees")}
              >
                <Users className="mr-2 h-4 w-4" />
                Kelola Karyawan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tindakan yang sering dilakukan
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setCurrentPage("employees")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Karyawan Baru
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan Modul
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Employee Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Karyawan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.slice(0, 5).map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge
                      variant={employee.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {employee.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
