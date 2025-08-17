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
import { MoreHorizontal, Eye, Edit, Trash2, Shield, User } from "lucide-react";
import { User as UserType } from "@/backend/types/schema";
import { users, UserTable } from "@/backend/tables/users";

interface ManageUsersProps {
  user: UserType;
  onLogout: () => void;
}

export function ManageUsers({ user, onLogout }: ManageUsersProps) {
  const router = useRouter();
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);

  // Define columns for users table
  const { column, customColumn } = createAdvancedColumns<UserTable>();

  const usersColumns = [
    column("name", "Nama", {
      render: (user) => <span className="font-medium">{user.name}</span>,
    }),
    column("email", "Email", {
      render: (user) => <span className="text-sm">{user.email}</span>,
    }),
    column("role", "Role", {
      render: (user) => (
        <Badge
          variant={
            user.role === "superadmin"
              ? "destructive"
              : user.role === "company_owner"
              ? "default"
              : "secondary"
          }
        >
          {user.role === "superadmin"
            ? "Super Admin"
            : user.role === "company_owner"
            ? "Pemilik Perusahaan"
            : "Karyawan"}
        </Badge>
      ),
    }),
    column("companyId", "Perusahaan", {
      render: (user) => (
        <span className="text-sm">
          {user.companyId ? `Company ${user.companyId}` : "-"}
        </span>
      ),
    }),
    column("position", "Posisi", {
      render: (user) => <span className="text-sm">{user.position || "-"}</span>,
    }),
    column("isActive", "Status", {
      render: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    }),
    customColumn(
      "actions",
      "Aksi",
      (user) => (
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
                onClick={() => setDeleteUserId(user.id)}
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

  const handleDeleteUser = () => {
    // TODO: Implement delete user logic
    setDeleteUserId(null);
  };

  const handleAddUser = () => {
    router.push("/users/create");
  };

  return (
    <>
      <ModuleLayout
        user={user}
        onLogout={onLogout}
        title="Kelola Pengguna"
        subtitle="Kelola semua pengguna yang terdaftar di sistem ERP"
        addButtonText="Tambah Pengguna"
        onAddClick={handleAddUser}
        columns={usersColumns}
        data={users}
        searchPlaceholder="Cari pengguna..."
        tableTitle="Daftar Pengguna"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
