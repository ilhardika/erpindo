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
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  UserPlus,
} from "lucide-react";
import { User as UserType } from "@/backend/services/auth";
import { EmployeeTable } from "@/backend/tables/employees";
import { UserTable } from "@/backend/tables/users";
import { UserRole } from "@/backend/tables/enums";
import {
  employeeService,
  employeeQuery,
  EmployeeWithUserData,
  HRService,
} from "@/backend/services/hr";
import { useState, useEffect } from "react";

interface ManageEmployeesProps {
  user: UserType;
  onLogout: () => void;
}

export function ManageEmployees({ user, onLogout }: ManageEmployeesProps) {
  const router = useRouter();
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeWithUserData[]>([]);

  // Load employees for current company with user data
  useEffect(() => {
    if (user.companyId) {
      setEmployees(
        employeeQuery.employees.findByCompanyIdWithUserData(user.companyId)
      );
    }
  }, [user.companyId]);

  // Define columns for employees table
  const { column, customColumn } =
    createAdvancedColumns<EmployeeWithUserData>();

  const employeesColumns = [
    column("name", "Nama", {
      render: (employee) => (
        <span className="font-medium">{employee.name}</span>
      ),
    }),
    column("email", "Email", {
      render: (employee) => <span className="text-sm">{employee.email}</span>,
    }),
    column("position", "Posisi", {
      render: (employee) => (
        <span className="text-sm">{employee.position}</span>
      ),
    }),
    column("department", "Departemen", {
      render: (employee) => (
        <span className="text-sm">{employee.department}</span>
      ),
    }),
    column("moduleAccess", "Modul Akses", {
      render: (employee) => (
        <div className="flex flex-wrap gap-1">
          {employee.moduleAccess.slice(0, 2).map((module, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs uppercase"
            >
              {module}
            </Badge>
          ))}
          {employee.moduleAccess.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{employee.moduleAccess.length - 2}
            </Badge>
          )}
        </div>
      ),
    }),
    column("isActive", "Status", {
      render: (employee) => (
        <Badge variant={employee.isActive ? "default" : "secondary"}>
          {employee.isActive ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    }),
    customColumn("actions", "Aksi", (employee) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/employees/${employee.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/employees/${employee.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteEmployeeId(employee.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )),
  ];

  const handleDeleteEmployee = () => {
    if (deleteEmployeeId) {
      employeeService.delete(deleteEmployeeId);
      // Refresh employee list
      if (user.companyId) {
        setEmployees(
          employeeQuery.employees.findByCompanyIdWithUserData(user.companyId)
        );
      }
      setDeleteEmployeeId(null);
    }
  };

  const handleAddEmployee = () => {
    router.push("/employees/create");
  };

  // Find employee to delete for confirmation dialog
  const employeeToDelete = deleteEmployeeId
    ? employees.find((emp) => emp.id === deleteEmployeeId)
    : null;

  return (
    <>
      <ModuleLayout
        title="Kelola Karyawan"
        subtitle="Kelola karyawan perusahaan dan pengaturan akses modul"
        addButtonText="Tambah Karyawan"
        onAddClick={handleAddEmployee}
        data={employees}
        columns={employeesColumns}
        searchPlaceholder="Cari karyawan..."
        tableTitle="Daftar Karyawan"
        requiredRole={UserRole.COMPANY_OWNER}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteEmployeeId}
        onOpenChange={(open) => !open && setDeleteEmployeeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Karyawan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus karyawan{" "}
              <strong>{employeeToDelete?.name}</strong>?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Peringatan: Karyawan akan dinonaktifkan dan kehilangan akses ke
                semua modul. Data karyawan akan tetap tersimpan untuk keperluan
                audit.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEmployeeId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Hapus Karyawan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
