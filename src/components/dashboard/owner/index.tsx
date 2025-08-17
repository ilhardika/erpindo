"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building, Users, Settings } from "lucide-react";
import { User } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables/enums";
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
      </div>
    </DashboardLayout>
  );
}
