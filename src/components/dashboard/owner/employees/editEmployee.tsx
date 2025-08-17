"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormLayout } from "@/components/layout/FormLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface EditEmployeeFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  position: string;
  department: string;
  salary: string;
  moduleAccess: string[];
  isActive: boolean;
}

interface EditEmployeeProps {
  employeeId: string;
}

export function EditEmployee({ employeeId }: EditEmployeeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<EmployeeWithUserData | null>(null);
  const [formData, setFormData] = useState<EditEmployeeFormData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    moduleAccess: [],
    isActive: true,
  });

  // Get available modules
  const availableModules = ModuleService.getActiveModules();

  // Load employee data on mount
  useEffect(() => {
    if (user?.companyId) {
      // Get employees with user data and find the specific one
      const employeesWithUserData =
        employeeQuery.employees.findByCompanyIdWithUserData(user.companyId);
      const foundEmployee = employeesWithUserData.find(
        (emp) => emp.id === employeeId
      );

      if (foundEmployee) {
        setEmployee(foundEmployee);

        // Set form data
        setFormData({
          name: foundEmployee.name,
          email: foundEmployee.email,
          password: "", // Leave empty for security, will be updated only if changed
          phone: foundEmployee.phone,
          position: foundEmployee.position,
          department: foundEmployee.department,
          salary: foundEmployee.salary?.toString() || "",
          moduleAccess: foundEmployee.moduleAccess,
          isActive: foundEmployee.isActive,
        });
      } else {
        // Employee not found or not in same company
        router.push("/employees");
      }
    }
  }, [employeeId, user?.companyId, router]);

  const handleInputChange = (
    field: keyof EditEmployeeFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = (moduleCode: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      moduleAccess: checked
        ? [...prev.moduleAccess, moduleCode]
        : prev.moduleAccess.filter((code) => code !== moduleCode),
    }));
  };

  const handleSave = async () => {
    if (!employee) return;

    try {
      setIsLoading(true);

      // Prepare user updates object
      const userUpdates: Partial<
        Pick<UserTable, "name" | "email" | "phone" | "isActive" | "password">
      > = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
      };

      // Only include password if it's not empty (user wants to change it)
      if (formData.password.trim() !== "") {
        userUpdates.password = formData.password;
      }

      // Use the new method to update both employee and user data
      const result = employeeService.updateWithUserData(
        employee.id,
        {
          position: formData.position,
          department: formData.department,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          moduleAccess: formData.moduleAccess,
          isActive: formData.isActive,
        },
        userUpdates
      );

      if (result.employee && result.user) {
        router.push(`/employees/${employee.id}`);
      } else {
        alert("Gagal memperbarui data karyawan");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Terjadi kesalahan saat memperbarui data karyawan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        password: "", // Reset to empty for security
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        salary: employee.salary?.toString() || "",
        moduleAccess: employee.moduleAccess,
        isActive: employee.isActive,
      });
    }
  };

  const handleBack = () => {
    router.push(`/employees/${employeeId}`);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.position.trim() !== "" &&
      formData.department.trim() !== ""
    );
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <FormLayout
      title={`Edit Karyawan: ${employee.name}`}
      subtitle="Perbarui informasi karyawan dan pengaturan akses modul"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Simpan Perubahan"
      requiredRole={UserRole.COMPANY_OWNER}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar & Akun Login</CardTitle>
            <p className="text-sm text-muted-foreground">
              Perbarui informasi dasar karyawan dan kredensial login
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Login *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@perusahaan.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email untuk login ke sistem
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password Baru (Kosongkan jika tidak diubah)
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Masukkan password baru (opsional)"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan jika tidak ingin mengubah password. Jika diisi,
                password lama akan diganti.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Masukkan nomor telepon (opsional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posisi *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                  placeholder="Misal: Kasir, Admin, Supervisor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departemen *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operasional</SelectItem>
                    <SelectItem value="sales">Penjualan</SelectItem>
                    <SelectItem value="warehouse">Gudang</SelectItem>
                    <SelectItem value="finance">Keuangan</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="logistics">Logistik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Gaji (Opsional)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  placeholder="Masukkan gaji bulanan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status Karyawan</Label>
                <Select
                  value={formData.isActive.toString()}
                  onValueChange={(value) =>
                    handleInputChange("isActive", value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Access */}
        <Card>
          <CardHeader>
            <CardTitle>Akses Modul</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pilih modul yang dapat diakses oleh karyawan ini
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModules.map((module) => (
                <div
                  key={module.code}
                  className="flex items-center space-x-2 p-3 border rounded-lg"
                >
                  <Checkbox
                    id={module.code}
                    checked={formData.moduleAccess.includes(module.code)}
                    onCheckedChange={(checked) =>
                      handleModuleToggle(module.code, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={module.code}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {module.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {formData.moduleAccess.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Modul Terpilih:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.moduleAccess.map((moduleCode) => {
                    const module = availableModules.find(
                      (m) => m.code === moduleCode
                    );
                    return (
                      <Badge key={moduleCode} variant="secondary">
                        {module?.name || moduleCode}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Validation Message */}
        {!isFormValid() && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Perhatian:</strong> Mohon lengkapi semua field yang wajib
              diisi (*)
            </p>
          </div>
        )}
      </div>
    </FormLayout>
  );
}
