"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FormLayout } from "@/components/layout/FormLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { employeeService } from "@/backend/services/hr";
import { ModuleService } from "@/backend/services/hr";
import { useAuth } from "@/contexts/AuthContext";
import { User as AuthUser } from "@/backend/services/auth";

interface CreateEmployeeFormData {
  name: string;
  email: string;
  password: string;
  position: string;
  department: string;
  salary: string;
  moduleAccess: string[];
}

export function CreateEmployee() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeFormData>({
    name: "",
    email: "",
    password: "",
    position: "",
    department: "",
    salary: "",
    moduleAccess: [],
  });

  // Get available modules
  const availableModules = ModuleService.getActiveModules();

  const handleInputChange = (
    field: keyof CreateEmployeeFormData,
    value: string
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
    try {
      setIsLoading(true);

      if (!user?.companyId) {
        alert("Error: Company ID tidak ditemukan");
        return;
      }

      // First create user account
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: "employee" as UserRole,
        companyId: user.companyId,
        position: formData.position,
        isActive: true,
        phone: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generate user ID
      const userId = `user-${Date.now()}`;
      const newUser = { ...userData, id: userId };

      // Add user to users array (simplified for mock backend)
      // In real app, this would be an API call
      const { users } = await import("@/backend/tables/users");
      users.push(newUser);

      // Then create employee record
      const employeeData = {
        userId: userId,
        companyId: user.companyId,
        position: formData.position,
        department: formData.department,
        moduleAccess: formData.moduleAccess,
        joinDate: new Date().toISOString().split("T")[0],
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        isActive: true,
      };

      const newEmployee = employeeService.create(employeeData);

      if (newEmployee) {
        router.push("/employees");
      } else {
        alert("Gagal membuat karyawan");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Terjadi kesalahan saat membuat karyawan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      position: "",
      department: "",
      salary: "",
      moduleAccess: [],
    });
  };

  const handleBack = () => {
    router.push("/employees");
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.password.trim() !== "" &&
      formData.position.trim() !== "" &&
      formData.department.trim() !== ""
    );
  };

  return (
    <FormLayout
      title="Tambah Karyawan Baru"
      subtitle="Buat akun karyawan baru dan atur akses modul"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Buat Karyawan"
      requiredRole={UserRole.COMPANY_OWNER}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
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
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Masukkan password"
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
