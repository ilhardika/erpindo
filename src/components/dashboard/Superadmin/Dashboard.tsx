"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, createColumns } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManageCompanies } from "./Companies";
import { Building, Users, DollarSign } from "lucide-react";
import { User } from "@/backend/types/schema";
import { DashboardService } from "@/backend/services/dashboard";
import {
  formatCompanyStatus,
  formatPaymentStatus,
} from "@/backend/utils/formatters";
import { useState, useEffect } from "react";

interface SuperadminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SuperadminDashboard({
  user,
  onLogout,
}: SuperadminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "companies" | "users" | "reports"
  >("dashboard");
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await DashboardService.getSuperadminDashboard();
      setDashboardData(data);
    };
    loadData();
  }, []);

  // Handle navigation from sidebar
  const handleNavigation = (
    page: "dashboard" | "companies" | "users" | "reports"
  ) => {
    setCurrentPage(page);
  };

  // Render different pages based on current selection
  if (currentPage === "companies") {
    return <ManageCompanies user={user} onLogout={onLogout} />;
  }

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  const companies = dashboardData.companies;
  const totalCompanies = dashboardData.totalUsers;
  const activeCompanies = dashboardData.activeCompanies;
  const totalEmployees = companies.reduce((sum, c) => sum + c.employeeCount, 0);

  // Define columns for companies table
  const { column, customColumn } = createColumns<(typeof companies)[0]>();

  const companiesColumns = [
    column("name", "Nama Perusahaan", {
      render: (company) => <span className="font-medium">{company.name}</span>,
    }),
    column("owner", "Pemilik"),
    column("email", "Email"),
    customColumn("employeeCount", "Karyawan", (company) => (
      <div className="text-center">
        <span className="font-medium">{company.employeeCount}</span>
        <p className="text-xs text-muted-foreground">karyawan</p>
      </div>
    )),
    customColumn("registrationDate", "Tanggal Daftar", (company) =>
      new Date(company.registrationDate).toLocaleDateString("id-ID")
    ),
    customColumn("status", "Status", (company) => (
      <Badge variant={company.status === "active" ? "default" : "secondary"}>
        {formatCompanyStatus(company.status)}
      </Badge>
    )),
    customColumn("paymentStatus", "Pembayaran", (company) => (
      <Badge
        variant={company.paymentStatus === "paid" ? "default" : "destructive"}
      >
        {formatPaymentStatus(company.paymentStatus)}
      </Badge>
    )),
    customColumn(
      "actions",
      "Aksi",
      () => (
        <Button variant="outline" size="sm">
          Kelola
        </Button>
      ),
      {
        headerClassName: "text-right",
        className: "text-right",
      }
    ),
  ];

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      onNavigate={handleNavigation}
    >
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Superadmin</h1>
          <p className="text-muted-foreground">Selamat datang, {user.name}</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Perusahaan
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                {activeCompanies} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Karyawan
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Dari semua perusahaan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendapatan Bulanan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 15,000,000</div>
              <p className="text-xs text-muted-foreground">
                +20.1% dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
