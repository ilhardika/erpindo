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
import { Checkbox } from "@/components/ui/checkbox";
import { FormLayout } from "@/components/layout/FormLayout";
import { User } from "@/backend/types/schema";
import { modules } from "@/backend/tables/modules";

interface CreatePlanProps {
  user: User;
  onLogout: () => void;
}

interface PlanFormData {
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly" | "";
  maxEmployees: number;
  features: string[];
  additionalFeatures: string[];
  // Limitations
  maxTransactionsPerMonth: number;
  maxStorageGB: number;
  maxUsers: number;
  customIntegrations: boolean;
  prioritySupport: boolean;
  isActive: boolean;
}

export function CreatePlan({ user, onLogout }: CreatePlanProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    displayName: "",
    description: "",
    price: 0,
    billingCycle: "",
    maxEmployees: 5,
    features: [],
    additionalFeatures: [],
    maxTransactionsPerMonth: 1000,
    maxStorageGB: 5,
    maxUsers: 5,
    customIntegrations: false,
    prioritySupport: false,
    isActive: true,
  });

  const [additionalFeatureInput, setAdditionalFeatureInput] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert("Nama plan harus diisi!");
      return;
    }
    if (!formData.displayName.trim()) {
      alert("Nama display harus diisi!");
      return;
    }
    if (!formData.billingCycle) {
      alert("Siklus penagihan harus dipilih!");
      return;
    }
    if (formData.price <= 0) {
      alert("Harga harus lebih dari 0!");
      return;
    }
    if (formData.features.length === 0) {
      alert("Setidaknya pilih satu fitur!");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement create plan logic
      const newPlan = {
        id: `plan-${Date.now()}`,
        ...formData,
        limitations: {
          maxTransactionsPerMonth: formData.maxTransactionsPerMonth,
          maxStorageGB: formData.maxStorageGB,
          maxUsers: formData.maxUsers,
          customIntegrations: formData.customIntegrations,
          prioritySupport: formData.prioritySupport,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating plan:", newPlan);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to management plans page after successful creation
      router.push("/management-plans");
    } catch (error) {
      console.error("Error creating plan:", error);
      alert("Terjadi kesalahan saat membuat plan!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      price: 0,
      billingCycle: "",
      maxEmployees: 5,
      features: [],
      additionalFeatures: [],
      maxTransactionsPerMonth: 1000,
      maxStorageGB: 5,
      maxUsers: 5,
      customIntegrations: false,
      prioritySupport: false,
      isActive: true,
    });
    setAdditionalFeatureInput("");
  };

  const handleInputChange = (field: keyof PlanFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (moduleCode: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, moduleCode],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        features: prev.features.filter((f) => f !== moduleCode),
      }));
    }
  };

  const handleAddAdditionalFeature = () => {
    if (additionalFeatureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        additionalFeatures: [
          ...prev.additionalFeatures,
          additionalFeatureInput.trim(),
        ],
      }));
      setAdditionalFeatureInput("");
    }
  };

  const handleRemoveAdditionalFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalFeatures: prev.additionalFeatures.filter((_, i) => i !== index),
    }));
  };

  return (
    <FormLayout
      user={user}
      onLogout={onLogout}
      title="Buat Plan Baru"
      subtitle="Buat paket langganan baru untuk perusahaan"
      onBack={handleBack}
      onSave={handleSave}
      onReset={handleReset}
      isLoading={isLoading}
      saveButtonText="Simpan Plan"
      resetButtonText="Reset Form"
    >
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Informasi Dasar</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Plan (Internal) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="basic, premium, enterprise"
            />
            <p className="text-xs text-muted-foreground">
              Nama internal untuk sistem (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Display *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              placeholder="Basic Plan, Premium Plan"
            />
            <p className="text-xs text-muted-foreground">
              Nama yang ditampilkan kepada pengguna
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Deskripsi singkat tentang plan ini..."
            rows={3}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Harga & Penagihan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Harga (IDR) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseInt(e.target.value) || 0)
              }
              placeholder="500000"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Siklus Penagihan *</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(value) =>
                handleInputChange("billingCycle", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih siklus penagihan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Batasan & Kapasitas</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxEmployees">Max Karyawan</Label>
            <Input
              id="maxEmployees"
              type="number"
              value={formData.maxEmployees}
              onChange={(e) =>
                handleInputChange("maxEmployees", parseInt(e.target.value) || 5)
              }
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTransactionsPerMonth">Max Transaksi/Bulan</Label>
            <Input
              id="maxTransactionsPerMonth"
              type="number"
              value={formData.maxTransactionsPerMonth}
              onChange={(e) =>
                handleInputChange(
                  "maxTransactionsPerMonth",
                  parseInt(e.target.value) || 1000
                )
              }
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStorageGB">Storage (GB)</Label>
            <Input
              id="maxStorageGB"
              type="number"
              value={formData.maxStorageGB}
              onChange={(e) =>
                handleInputChange("maxStorageGB", parseInt(e.target.value) || 5)
              }
              min="1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="customIntegrations"
              checked={formData.customIntegrations}
              onCheckedChange={(checked) =>
                handleInputChange("customIntegrations", checked)
              }
            />
            <Label htmlFor="customIntegrations">Custom Integrations</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="prioritySupport"
              checked={formData.prioritySupport}
              onCheckedChange={(checked) =>
                handleInputChange("prioritySupport", checked)
              }
            />
            <Label htmlFor="prioritySupport">Priority Support</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Plan Aktif</Label>
          </div>
        </div>
      </div>

      {/* Features Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Fitur ERP yang Disertakan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules
            .filter((m) => m.isActive)
            .map((module) => (
              <div
                key={module.id}
                className="flex items-center space-x-2 p-3 border rounded-lg"
              >
                <Checkbox
                  id={module.code}
                  checked={formData.features.includes(module.code)}
                  onCheckedChange={(checked) =>
                    handleFeatureToggle(module.code, !!checked)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor={module.code} className="font-medium">
                    {module.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Additional Features */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Fitur Tambahan</h3>

        <div className="flex gap-2">
          <Input
            value={additionalFeatureInput}
            onChange={(e) => setAdditionalFeatureInput(e.target.value)}
            placeholder="Tambahkan fitur tambahan..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddAdditionalFeature();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddAdditionalFeature}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            Tambah
          </button>
        </div>

        {formData.additionalFeatures.length > 0 && (
          <div className="space-y-2">
            <Label>Fitur yang Ditambahkan:</Label>
            <div className="space-y-2">
              {formData.additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalFeature(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormLayout>
  );
}
