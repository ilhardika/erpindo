"use client";

import React, { useState } from "react";
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
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react";
import { User } from "@/backend/types/schema";
import {
  subscriptionPlans,
  SubscriptionPlan,
  formatLimitation,
} from "@/backend/tables/subscriptionPlans";

interface ManagePlansProps {
  user: User;
  onLogout: () => void;
}

export function ManagePlans({ user, onLogout }: ManagePlansProps) {
  const router = useRouter();
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Define columns for subscription plans table
  const { column, customColumn } = createAdvancedColumns<SubscriptionPlan>();

  const plansColumns = [
    column("displayName", "Nama Plan", {
      render: (plan) => (
        <div>
          <span className="font-medium">{plan.displayName}</span>
          <div className="text-xs text-muted-foreground">
            {plan.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
          </div>
        </div>
      ),
    }),
    column("description", "Deskripsi", {
      render: (plan) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {plan.description}
        </span>
      ),
    }),
    column("price", "Harga", {
      render: (plan) => {
        const formatter = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        });
        return (
          <div>
            <span className="font-semibold">
              {formatter.format(plan.price)}
            </span>
            <div className="text-xs text-muted-foreground">
              {plan.billingCycle === "monthly" ? "/bulan" : "/tahun"}
            </div>
          </div>
        );
      },
    }),
    column("maxEmployees", "Max Karyawan", {
      render: (plan) => (
        <Badge variant="outline" className="font-mono">
          {formatLimitation(plan.maxEmployees)}
        </Badge>
      ),
    }),
    column("features", "Fitur", {
      render: (plan) => (
        <div className="flex flex-wrap gap-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs uppercase"
            >
              {feature}
            </Badge>
          ))}
          {plan.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{plan.features.length - 3}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
      enableFiltering: false,
    }),
    column("isActive", "Status", {
      render: (plan) => (
        <Badge variant={plan.isActive ? "default" : "secondary"}>
          {plan.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    }),
    customColumn(
      "actions",
      "Aksi",
      (plan) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/management-plans/${plan.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/management-plans/${plan.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeletePlanId(plan.id)}
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

  const handleCreateNew = () => {
    router.push("/management-plans/create");
  };

  const handleDeleteConfirm = async () => {
    if (deletePlanId) {
      // TODO: Implement delete logic
      console.log("Deleting plan:", deletePlanId);
      setDeletePlanId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletePlanId(null);
  };

  const planToDelete = subscriptionPlans.find((p) => p.id === deletePlanId);

  return (
    <ModuleLayout<SubscriptionPlan>
      user={user}
      onLogout={onLogout}
      title="Management Plans"
      subtitle="Kelola paket langganan dan harga untuk semua perusahaan"
      addButtonText="Buat Plan Baru"
      onAddClick={handleCreateNew}
      data={subscriptionPlans}
      columns={plansColumns}
      searchPlaceholder="Cari plan..."
      tableTitle="Daftar Subscription Plans"
    >
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus plan{" "}
              <strong>{planToDelete?.displayName}</strong>?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Peringatan: Tindakan ini akan mempengaruhi semua perusahaan yang
                menggunakan plan ini. Pastikan tidak ada perusahaan aktif yang
                menggunakan plan ini sebelum menghapus.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
