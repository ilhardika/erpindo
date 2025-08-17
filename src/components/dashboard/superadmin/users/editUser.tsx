"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormLayout } from "@/components/layout/FormLayout";
import { User } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables";
import { users } from "@/backend/tables/users";
import { Eye, EyeOff } from "lucide-react";

interface EditUserProps {
  user: User;
  onLogout: () => void;
  userId: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  companyId: string;
  position: string;
  isActive: boolean;
}

export function EditUser({ user, onLogout, userId }: EditUserProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    companyId: "",
    position: "",
    isActive: true,
  });

  // Load user data when component mounts
  useEffect(() => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setFormData({
        name: targetUser.name,
        email: targetUser.email,
        password: "", // Don't load existing password
        confirmPassword: "",
        role: targetUser.role,
        companyId: targetUser.companyId || "none",
        position: targetUser.position || "",
        isActive: targetUser.isActive,
      });
    } else {
      // User not found, redirect back
      router.push("/users");
    }
  }, [userId, router]);

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement update user logic
      // Convert "none" back to empty string or null for database
      const submitData = {
        ...formData,
        companyId: formData.companyId === "none" ? "" : formData.companyId,
      };
      console.log("Updating user:", { id: userId, ...submitData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to users page after successful update
      router.push("/users");
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original data
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setFormData({
        name: targetUser.name,
        email: targetUser.email,
        password: "",
        confirmPassword: "",
        role: targetUser.role,
        companyId: targetUser.companyId || "none",
        position: targetUser.position || "",
        isActive: targetUser.isActive,
      });
    }
  };

  // Additional form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const randomPassword = Math.random().toString(36).slice(-8);
          setFormData((prev) => ({
            ...prev,
            password: randomPassword,
            confirmPassword: randomPassword,
          }));
        }}
      >
        Generate Password
      </Button>

      <Button
        type="button"
        variant={formData.isActive ? "destructive" : "default"}
        onClick={() => handleInputChange("isActive", !formData.isActive)}
      >
        {formData.isActive ? "Deaktivasi" : "Aktivasi"}
      </Button>
    </>
  );

  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">User tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            User dengan ID {userId} tidak ditemukan dalam sistem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormLayout
      title={`Edit ${targetUser.name}`}
      subtitle="Edit informasi user yang terdaftar"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Update User"
      resetButtonText="Reset Data"
      formActions={formActions}
      requiredRole={UserRole.SUPERADMIN}
    >
      {/* User Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap *</Label>
          <Input
            id="name"
            placeholder="Masukkan nama lengkap"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="password">Password Baru</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Kosongkan jika tidak ingin mengubah"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Kosongkan jika tidak ingin mengubah password
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi password baru"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Role and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleInputChange("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih role user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="company_owner">Pemilik Perusahaan</SelectItem>
              <SelectItem value="employee">Karyawan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyId">Perusahaan</Label>
          <Select
            value={formData.companyId}
            onValueChange={(value) => handleInputChange("companyId", value)}
            disabled={formData.role === "superadmin"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih perusahaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">- Tidak Ada -</SelectItem>
              <SelectItem value="company-1">PT. Teknologi Maju</SelectItem>
              <SelectItem value="company-2">CV. Sumber Rezeki</SelectItem>
              <SelectItem value="company-3">PT. Mitra Sejahtera</SelectItem>
            </SelectContent>
          </Select>
          {formData.role === "superadmin" && (
            <p className="text-xs text-muted-foreground">
              Super Admin tidak terikat dengan perusahaan tertentu
            </p>
          )}
        </div>
      </div>

      {/* Position and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="position">Posisi/Jabatan</Label>
          <Input
            id="position"
            placeholder="Masukkan posisi atau jabatan"
            value={formData.position}
            onChange={(e) => handleInputChange("position", e.target.value)}
            disabled={formData.role === "superadmin"}
          />
          {formData.role === "superadmin" && (
            <p className="text-xs text-muted-foreground">
              Posisi akan otomatis diatur sebagai "System Administrator"
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Status Akun</Label>
          <Select
            value={formData.isActive.toString()}
            onValueChange={(value) =>
              handleInputChange("isActive", value === "true")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status akun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormLayout>
  );
}
