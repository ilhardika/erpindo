"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAdvancedColumns } from "@/components/ui/advanced-table";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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
  const router = useRouter();
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
    column("status", "Status", {
      render: (company) => (
        <Badge variant={company.status === "active" ? "default" : "secondary"}>
          {formatCompanyStatus(company.status)}
        </Badge>
      ),
    }),
    column("paymentStatus", "Pembayaran", {
      render: (company) => (
        <Badge
          variant={company.paymentStatus === "paid" ? "default" : "destructive"}
        >
          {formatPaymentStatus(company.paymentStatus)}
        </Badge>
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
              <DropdownMenuItem
                onClick={() => router.push(`/companies/${company.id}/edit`)}
              >
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
    setDeleteCompanyId(null);
  };

  const handleAddCompany = () => {
    router.push("/companies/create");
  };

  return (
    <>
      <ModuleLayout
        user={user}
        onLogout={onLogout}
        title="Kelola Perusahaan"
        subtitle="Kelola semua perusahaan yang terdaftar di sistem ERP"
        addButtonText="Tambah Perusahaan"
        onAddClick={handleAddCompany}
        columns={companiesColumns}
        data={companies}
        searchPlaceholder="Cari perusahaan..."
        tableTitle="Daftar Perusahaan"
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
            <Button variant="outline" onClick={() => setDeleteCompanyId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
