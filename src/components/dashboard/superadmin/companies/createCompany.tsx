"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormLayout } from "@/components/layout/FormLayout";
import { User } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables";

interface CreateCompanyProps {
  user: User;
  onLogout: () => void;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  subscriptionPlan: string;
  description: string;
  website: string;
}

export function CreateCompany({ user, onLogout }: CreateCompanyProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    subscriptionPlan: "",
    description: "",
    website: "",
  });

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save company logic
      console.log("Saving company:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to companies page after successful save
      router.push("/companies");
    } catch (error) {
      console.error("Error saving company:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      businessType: "",
      subscriptionPlan: "",
      description: "",
      website: "",
    });
  };

  return (
    <FormLayout
      title="Tambah Perusahaan Baru"
      subtitle="Tambahkan perusahaan baru ke dalam sistem"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Simpan Perusahaan"
      resetButtonText="Reset Form"
      requiredRole={UserRole.SUPERADMIN}
    >
      {/* Company Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Perusahaan *</Label>
          <Input
            id="name"
            placeholder="Masukkan nama perusahaan"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Perusahaan *</Label>
          <Input
            id="email"
            type="email"
            placeholder="company@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            placeholder="(021) 123-4567"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="https://www.company.com"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
          />
        </div>
      </div>

      {/* Business Type and Subscription */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="businessType">Jenis Bisnis *</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => handleInputChange("businessType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis bisnis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="food">Food & Beverage</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscriptionPlan">Paket Langganan *</Label>
          <Select
            value={formData.subscriptionPlan}
            onValueChange={(value) =>
              handleInputChange("subscriptionPlan", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih paket langganan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Alamat Perusahaan</Label>
        <Textarea
          id="address"
          placeholder="Masukkan alamat lengkap perusahaan"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          rows={3}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi Perusahaan</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi singkat tentang perusahaan"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={4}
        />
      </div>
    </FormLayout>
  );
}
