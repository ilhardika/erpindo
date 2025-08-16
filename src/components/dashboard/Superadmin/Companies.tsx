"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, createColumns } from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Plus,
  Building,
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { User } from "@/backend/types/schema";
import { companies, CompanyTable } from "@/backend/tables/companies";
import {
  formatCompanyStatus,
  formatPaymentStatus,
} from "@/backend/utils/formatters";

interface ManageCompaniesProps {
  user: User;
  onLogout: () => void;
}

export function ManageCompanies({ user, onLogout }: ManageCompaniesProps) {
  // Define columns for companies table
  const { column, customColumn } = createColumns<CompanyTable>();

  const companiesColumns = [
    column("name", "Nama Perusahaan", {
      render: (company) => (
        <div className="space-y-1">
          <span className="font-medium text-foreground">{company.name}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building className="h-3 w-3" />
            {company.businessType}
          </div>
        </div>
      ),
      className: "min-w-[200px]",
    }),
    column("email", "Kontak", {
      render: (company) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {company.email}
          </div>
          {company.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {company.phone}
            </div>
          )}
        </div>
      ),
      className: "min-w-[200px]",
    }),
    column("subscriptionPlan", "Paket", {
      render: (company) => (
        <div className="space-y-1">
          <Badge variant="outline" className="capitalize">
            {company.subscriptionPlan}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Rp {company.monthlyFee.toLocaleString("id-ID")}/bulan
          </div>
        </div>
      ),
    }),
    customColumn("employeeCount", "Karyawan", (company) => (
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{company.employeeCount}</span>
        </div>
        <p className="text-xs text-muted-foreground">karyawan</p>
      </div>
    )),
    customColumn("registrationDate", "Terdaftar", (company) => (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">
            {new Date(company.registrationDate).toLocaleDateString("id-ID")}
          </span>
        </div>
      </div>
    )),
    customColumn("status", "Status", (company) => (
      <div className="space-y-1">
        <Badge variant={company.status === "active" ? "default" : "secondary"}>
          {formatCompanyStatus(company.status)}
        </Badge>
        <Badge
          variant={company.paymentStatus === "paid" ? "default" : "destructive"}
          className="text-xs"
        >
          {formatPaymentStatus(company.paymentStatus)}
        </Badge>
      </div>
    )),
    customColumn(
      "actions",
      "Aksi",
      (company) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            Detail
          </Button>
        </div>
      ),
      {
        headerClassName: "text-right",
        className: "text-right min-w-[120px]",
      }
    ),
  ];

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Kelola Perusahaan</h1>
            <p className="text-muted-foreground">
              Kelola semua perusahaan yang terdaftar di sistem ERP
            </p>
          </div>
          <Button className="flex items-center gap-2 w-fit">
            <Plus className="h-4 w-4" />
            Tambah Perusahaan
          </Button>
        </div>

        {/* Companies DataTable in Card */}
        <DataTable
          title="Daftar Perusahaan"
          columns={companiesColumns}
          data={companies}
          actions={
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{companies.length} perusahaan terdaftar</span>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
