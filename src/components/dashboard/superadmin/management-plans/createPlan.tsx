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
  maxTransactionsPerMonth: number;
  maxStorageGB: number;
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
    maxEmployees: 1,
    features: [],
    maxTransactionsPerMonth: 100,
    maxStorageGB: 1,
    isActive: true,
  });

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
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
      const newPlan = {
        id: `plan-${Date.now()}`,
        ...formData,
        limitations: {
          maxTransactionsPerMonth: formData.maxTransactionsPerMonth,
          maxStorageGB: formData.maxStorageGB,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating plan:", newPlan);
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      maxEmployees: 1,
      features: [],
      maxTransactionsPerMonth: 100,
      maxStorageGB: 1,
      isActive: true,
    });
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
        features: prev.features.filter((code) => code !== moduleCode),
      }));
    }
  };

  return (
    <FormLayout
      user={user}
      onLogout={onLogout}
      title="Buat Plan Baru"
      subtitle="Buat paket langganan baru untuk perusahaan"
      onSave={handleSave}
      onReset={handleReset}
      onBack={handleBack}
      isLoading={isLoading}
    >
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Plan</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Masukkan nama plan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Display</Label>
            <Input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              placeholder="Masukkan nama display"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Jelaskan tentang plan ini..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga (IDR)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ""}
              onChange={(e) =>
                handleInputChange("price", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCycle">Siklus Penagihan</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(value) =>
                handleInputChange("billingCycle", value as "monthly" | "yearly")
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
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Batasan</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxEmployees">Max Karyawan</Label>
            <Input
              id="maxEmployees"
              type="number"
              value={formData.maxEmployees}
              onChange={(e) =>
                handleInputChange("maxEmployees", parseInt(e.target.value) || 1)
              }
              placeholder="Jumlah karyawan"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Masukkan -1 untuk unlimited
            </p>
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
                  parseInt(e.target.value) || 1
                )
              }
              placeholder="Jumlah transaksi"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Masukkan -1 untuk unlimited
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStorageGB">Max Storage (GB)</Label>
            <Input
              id="maxStorageGB"
              type="number"
              value={formData.maxStorageGB}
              onChange={(e) =>
                handleInputChange("maxStorageGB", parseInt(e.target.value) || 1)
              }
              placeholder="Storage GB"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Masukkan -1 untuk unlimited
            </p>
          </div>
        </div>
      </div>

      {/* Features Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Fitur</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules
            .filter((module) => module.isActive)
            .map((module) => (
              <div
                key={module.code}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={formData.features.includes(module.code)}
                  onChange={(e) =>
                    handleFeatureToggle(module.code, e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <div>
                  <Label className="text-sm font-medium cursor-pointer">
                    {module.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {formData.features.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Fitur yang dipilih ({formData.features.length}):</strong>{" "}
              {formData.features
                .map((code) => {
                  const module = modules.find((m) => m.code === code);
                  return module?.name;
                })
                .join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Status</h3>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange("isActive", e.target.checked)}
            className="w-4 h-4"
          />
          <Label>Plan aktif</Label>
        </div>
      </div>
    </FormLayout>
  );
}
