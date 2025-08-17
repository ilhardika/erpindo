"use client";

import React, { useState } from "react";
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
import { User } from "@/backend/types/schema";
import { Eye, EyeOff } from "lucide-react";

interface CreateUserProps {
  user: User;
  onLogout: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  companyId: string;
  position: string;
}

export function CreateUser({ user, onLogout }: CreateUserProps) {
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
  });

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement save user logic
      console.log("Saving user:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to users page after successful save
      router.push("/users");
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      companyId: "",
      position: "",
    });
  };

  // Additional form actions
  const formActions = (
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
  );

  return (
    <FormLayout
      user={user}
      onLogout={onLogout}
      title="Tambah User Baru"
      subtitle="Tambahkan user baru ke dalam sistem"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Simpan User"
      resetButtonText="Reset Form"
      formActions={formActions}
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
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Konfirmasi password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              required
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

      {/* Position */}
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
    </FormLayout>
  );
}
