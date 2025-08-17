"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, createColumns } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ManageCompanies } from "./Superadmin/Companies";
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
    "dashboard" | "companies" | "subscriptions" | "usage"
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
    page: "dashboard" | "companies" | "subscriptions" | "usage"
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
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard Superadmin</h1>
          <p className="text-muted-foreground">
            Kelola semua perusahaan yang terdaftar dalam sistem
          </p>
        </div>

        {/* Stats Cards - Focus on Company Management */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Perusahaan
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Perusahaan terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Perusahaan Aktif
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompanies || 0}</div>
              <p className="text-xs text-muted-foreground">Sedang beroperasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pembayaran Lunas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies?.filter((c) => c.paymentStatus === "paid").length ||
                  0}
              </div>
              <p className="text-xs text-muted-foreground">
                Subscription aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payment
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {companies?.filter((c) => c.paymentStatus === "unpaid")
                  .length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Perlu tindakan</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for Company Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tindakan Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Building className="mr-2 h-4 w-4" />
                Tambah Perusahaan Baru
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Kelola Akses Login
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Verifikasi Pembayaran
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Perusahaan Pending</span>
                <Badge variant="destructive">
                  {companies?.filter((c) => c.paymentStatus === "unpaid")
                    .length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Account Disabled</span>
                <Badge variant="secondary">
                  {companies?.filter((c) => c.status === "inactive").length ||
                    0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Subscription Expires Soon</span>
                <Badge variant="outline">0</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Companies Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Perusahaan Terdaftar</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Daftar semua perusahaan yang terdaftar dalam sistem
                </p>
              </div>
              <Button>Lihat Semua</Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={companiesColumns} data={companies || []} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
