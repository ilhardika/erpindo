"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AdvancedDataTable,
  createAdvancedColumns,
} from "@/components/ui/advanced-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
  const [deleteCompanyId, setDeleteCompanyId] = React.useState<string | null>(
    null
  );

  // Define columns for companies table
  const { column, customColumn } = createAdvancedColumns<CompanyTable>();

  const companiesColumns = [
    column("name", "Nama Perusahaan", {
      render: (company) => <span className="font-medium">{company.name}</span>,
    }),
    column("email", "Email", {
      render: (company) => <span className="text-sm">{company.email}</span>,
    }),
    column("businessType", "Jenis Bisnis", {
      render: (company) => (
        <span className="text-sm text-muted-foreground">
          {company.businessType}
        </span>
      ),
    }),
    column("subscriptionPlan", "Paket", {
      render: (company) => (
        <Badge variant="outline" className="capitalize">
          {company.subscriptionPlan}
        </Badge>
      ),
    }),
    column("employeeCount", "Karyawan", {
      render: (company) => (
        <div className="text-center font-medium">{company.employeeCount}</div>
      ),
    }),
    column("registrationDate", "Terdaftar", {
      render: (company) => (
        <span className="text-sm">
          {new Date(company.registrationDate).toLocaleDateString("id-ID")}
        </span>
      ),
    }),
    column("status", "Status", {
      render: (company) => (
        <div className="flex flex-col gap-1">
          <Badge
            variant={company.status === "active" ? "default" : "secondary"}
          >
            {formatCompanyStatus(company.status)}
          </Badge>
          <Badge
            variant={
              company.paymentStatus === "paid" ? "default" : "destructive"
            }
            className="text-xs"
          >
            {formatPaymentStatus(company.paymentStatus)}
          </Badge>
        </div>
      ),
    }),
    customColumn(
      "actions",
      "Aksi",
      (company) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteCompanyId(company.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      {
        headerClassName: "text-right",
        className: "text-right",
        enableSorting: false,
        enableFiltering: false,
      }
    ),
  ];

  const handleDeleteCompany = () => {
    // TODO: Implement delete company logic
    console.log("Delete company:", deleteCompanyId);
    setDeleteCompanyId(null);
  };

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

        {/* Advanced DataTable */}
        <AdvancedDataTable
          title="Daftar Perusahaan"
          columns={companiesColumns}
          data={companies}
          searchPlaceholder="Cari perusahaan..."
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteCompanyId}
          onOpenChange={(open) => !open && setDeleteCompanyId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus perusahaan ini? Tindakan ini
                tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteCompanyId(null)}
              >
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteCompany}>
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
