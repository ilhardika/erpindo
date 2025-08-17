"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ViewLayout } from "@/components/layout/ViewLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserRole } from "@/backend/tables/enums";
import {
  employeeQuery,
  employeeService,
  EmployeeWithUserData,
} from "@/backend/services/hr";
import { ModuleService } from "@/backend/services/hr";
import { useAuth } from "@/contexts/AuthContext";
import { EmployeeTable } from "@/backend/tables/employees";
import { UserTable } from "@/backend/tables/users";

interface ViewEmployeeProps {
  employeeId: string;
}

export function ViewEmployee({ employeeId }: ViewEmployeeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<EmployeeWithUserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      // Get all employees with user data and find the specific one
      const employeesWithUserData =
        employeeQuery.employees.findByCompanyIdWithUserData(user.companyId);
      const foundEmployee = employeesWithUserData.find(
        (emp) => emp.id === employeeId
      );

      if (foundEmployee) {
        setEmployee(foundEmployee);
      } else {
        // Employee not found or not in same company
        router.push("/employees");
      }
    }
  }, [employeeId, user?.companyId, router]);

  const handleBack = () => {
    router.push("/employees");
  };

  const handleEdit = () => {
    router.push(`/employees/${employeeId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (employee) {
      employeeService.delete(employee.id);
      setShowDeleteDialog(false);
      router.push("/employees");
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  // Get employee modules
  const employeeModules = ModuleService.getEmployeeModules(employee.id);

  return (
    <>
      <ViewLayout
        title={`Detail Karyawan: ${employee.name}`}
        subtitle="Informasi lengkap karyawan dan akses modul"
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editButtonText="Edit Karyawan"
        deleteButtonText="Hapus Karyawan"
        requiredRole={UserRole.COMPANY_OWNER}
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Nama Lengkap
                  </h4>
                  <p className="text-lg font-semibold">{employee.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h4>
                  <p className="text-lg">{employee.email}</p>
                </div>
                {employee.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Nomor Telepon
                    </h4>
                    <p className="text-lg">{employee.phone}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Posisi
                  </h4>
                  <p className="text-lg">{employee.position}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Departemen
                  </h4>
                  <p className="text-lg capitalize">{employee.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Tanggal Bergabung
                  </h4>
                  <p className="text-lg">
                    {new Date(employee.joinDate).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h4>
                  <Badge
                    variant={employee.isActive ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {employee.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
                {employee.salary && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Gaji
                    </h4>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(employee.salary)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Akun Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pengaturan akun dan kredensial login karyawan
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Email Login
                  </h4>
                  <p className="text-lg font-mono bg-muted px-3 py-2 rounded">
                    {employee.email}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Status Akun
                  </h4>
                  <Badge
                    variant={employee.userIsActive ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {employee.userIsActive ? "Akun Aktif" : "Akun Diblokir"}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleEdit}>
                  Ubah Email & Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Module Access */}
          <Card>
            <CardHeader>
              <CardTitle>Akses Modul</CardTitle>
              <p className="text-sm text-muted-foreground">
                Modul yang dapat diakses oleh karyawan ini
              </p>
            </CardHeader>
            <CardContent>
              {employeeModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeeModules.map((module) => (
                    <div key={module.code} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{module.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {module.code.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Karyawan ini belum memiliki akses ke modul apapun.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push(`/employees/${employeeId}/edit`)}
                  >
                    Atur Akses Modul
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Aktivitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-muted-foreground">
                    Kehadiran Bulan Ini
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-muted-foreground">
                    Transaksi Selesai
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {employeeModules.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Modul Aktif
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ViewLayout>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Karyawan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus karyawan{" "}
              <strong>{employee.name}</strong>?
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
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus Karyawan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
