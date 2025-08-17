"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { User } from "@/backend/types/schema";
import { companies } from "@/backend/tables/companies";

interface EditCompanyProps {
  user: User;
  onLogout: () => void;
  companyId: string;
}

interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  subscriptionPlan: string;
  status: string;
  paymentStatus: string;
}

export function EditCompany({ user, onLogout, companyId }: EditCompanyProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    subscriptionPlan: "",
    status: "",
    paymentStatus: "",
  });

  // Helper function to map business type from data to select values
  const mapBusinessTypeToSelectValue = (businessType: string): string => {
    const mapping: { [key: string]: string } = {
      "Technology Services": "technology",
      Retail: "retail",
      "Retail Chain": "retail",
      "Electronics Retail": "retail",
      "Fashion & Apparel": "retail",
      Wholesale: "wholesale",
      "Trading & Distribution": "wholesale",
      Manufacturing: "manufacturing",
      Services: "services",
      "Automotive Sales & Service": "services",
      "Food & Beverage": "food",
      "Agriculture & Farming": "other",
      Other: "other",
    };

    // Check if exact match exists
    if (mapping[businessType]) {
      return mapping[businessType];
    }

    // Check for partial matches (case insensitive)
    const lowerBusinessType = businessType.toLowerCase();
    if (
      lowerBusinessType.includes("technology") ||
      lowerBusinessType.includes("tech")
    ) {
      return "technology";
    } else if (
      lowerBusinessType.includes("retail") ||
      lowerBusinessType.includes("fashion") ||
      lowerBusinessType.includes("electronics")
    ) {
      return "retail";
    } else if (
      lowerBusinessType.includes("wholesale") ||
      lowerBusinessType.includes("trading") ||
      lowerBusinessType.includes("distribution")
    ) {
      return "wholesale";
    } else if (lowerBusinessType.includes("manufacturing")) {
      return "manufacturing";
    } else if (
      lowerBusinessType.includes("service") ||
      lowerBusinessType.includes("automotive")
    ) {
      return "services";
    } else if (
      lowerBusinessType.includes("food") ||
      lowerBusinessType.includes("beverage")
    ) {
      return "food";
    } else {
      return "other";
    }
  };

  // Helper function to map select value back to business type for database
  const mapSelectValueToBusinessType = (selectValue: string): string => {
    const mapping: { [key: string]: string } = {
      technology: "Technology Services",
      retail: "Retail",
      wholesale: "Wholesale",
      manufacturing: "Manufacturing",
      services: "Services",
      food: "Food & Beverage",
      other: "Other",
    };
    return mapping[selectValue] || selectValue;
  };

  // Load company data when component mounts
  useEffect(() => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      console.log("Company data:", company);
      console.log("Original businessType:", company.businessType);

      const mappedBusinessType = mapBusinessTypeToSelectValue(
        company.businessType
      );
      console.log("Mapped businessType:", mappedBusinessType);

      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone || "",
        address: company.address || "",
        businessType: mappedBusinessType,
        subscriptionPlan: company.subscriptionPlanId,
        status: company.status,
        paymentStatus: company.paymentStatus,
      });
    } else {
      // Company not found, redirect back
      router.push("/companies");
    }
  }, [companyId, router]);

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        businessType: mapSelectValueToBusinessType(formData.businessType),
      };

      console.log("Updating company:", { id: companyId, ...submitData });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to companies page after successful update
      router.push("/companies");
    } catch (error) {
      console.error("Error updating company:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original data
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setFormData({
        name: company.name,
        email: company.email,
        phone: company.phone || "",
        address: company.address || "",
        businessType: mapBusinessTypeToSelectValue(company.businessType),
        subscriptionPlan: company.subscriptionPlanId,
        status: company.status,
        paymentStatus: company.paymentStatus,
      });
    }
  };

  const company = companies.find((c) => c.id === companyId);
  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Perusahaan tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">
            Perusahaan dengan ID {companyId} tidak ditemukan dalam sistem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormLayout
      user={user}
      onLogout={onLogout}
      title={`Edit ${company.name}`}
      subtitle="Edit informasi perusahaan yang terdaftar"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Update Perusahaan"
      resetButtonText="Reset Data"
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

      {/* Status Management - Superadmin only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status">Status Perusahaan</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status perusahaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Status Pembayaran</Label>
          <Select
            value={formData.paymentStatus}
            onValueChange={(value) => handleInputChange("paymentStatus", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="unpaid">Belum Dibayar</SelectItem>
              <SelectItem value="overdue">Terlambat</SelectItem>
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
    </FormLayout>
  );
}
