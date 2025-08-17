"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ViewLayout } from "@/components/layout/ViewLayout";
import { User } from "@/backend/types/schema";
import { modules } from "@/backend/tables/modules";
import {
  subscriptionPlans,
  SubscriptionPlan,
  formatLimitation,
} from "@/backend/tables/subscriptionPlans";
import { PlanUsageStats } from "./planUsageStats";
import {
  Calendar,
  CreditCard,
  Users,
  Database,
  Activity,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface ViewPlanProps {
  user: User;
  onLogout: () => void;
  planId: string;
}

export function ViewPlan({ user, onLogout, planId }: ViewPlanProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load plan data
    const foundPlan = subscriptionPlans.find((p) => p.id === planId);
    setPlan(foundPlan || null);
    setIsLoading(false);
  }, [planId]);

  const handleEdit = () => {
    router.push(`/management-plans/${planId}/edit`);
  };

  const handleDelete = () => {
    if (
      confirm(`Apakah Anda yakin ingin menghapus plan "${plan?.displayName}"?`)
    ) {
      console.log("Deleting plan:", planId);
      // TODO: Implement delete logic
      router.push("/management-plans");
    }
  };

  const handleBack = () => {
    router.push("/management-plans");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plan Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-4">
          Plan dengan ID "{planId}" tidak ditemukan.
        </p>
        <button
          onClick={() => router.push("/management-plans")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali ke Management Plans
        </button>
      </div>
    );
  }

  return (
    <ViewLayout
      user={user}
      onLogout={onLogout}
      title="Detail Plan"
      subtitle={plan.displayName}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBack={handleBack}
    >
      <div className="space-y-6">
        {/* Status dan Info Umum */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informasi Umum
                </CardTitle>
                <CardDescription>Detail dasar paket langganan</CardDescription>
              </div>
              <Badge
                variant={plan.isActive ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {plan.isActive ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {plan.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama Plan
                </label>
                <p className="text-lg font-semibold">{plan.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama Display
                </label>
                <p className="text-lg font-semibold">{plan.displayName}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Deskripsi
              </label>
              <p className="text-gray-900">{plan.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Dibuat
                </label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(plan.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Terakhir Diupdate
                </label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(plan.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informasi Harga
            </CardTitle>
            <CardDescription>Detail harga dan siklus penagihan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(plan.price)}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {plan.billingCycle === "monthly" ? "/bulan" : "/tahun"}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Siklus Penagihan
                    </label>
                    <p className="text-lg">
                      {plan.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}
                    </p>
                  </div>
                  {plan.billingCycle === "yearly" && (
                    <div className="text-sm text-green-600">
                      ✓ Hemat dengan penagihan tahunan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Batasan Plan
            </CardTitle>
            <CardDescription>Limit penggunaan untuk plan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatLimitation(plan.maxEmployees)}
                </div>
                <div className="text-sm text-gray-500">Karyawan</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatLimitation(plan.limitations.maxTransactionsPerMonth)}
                </div>
                <div className="text-sm text-gray-500">Transaksi/Bulan</div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <Database className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatLimitation(plan.limitations.maxStorageGB)} GB
                </div>
                <div className="text-sm text-gray-500">Storage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Fitur yang Disertakan
            </CardTitle>
            <CardDescription>
              Modul dan fitur yang tersedia dalam plan ini (
              {plan.features.length} fitur)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.features.map((featureCode) => {
                const module = modules.find((m) => m.code === featureCode);
                return module ? (
                  <div
                    key={featureCode}
                    className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50 border-green-200"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-900">
                        {module.name}
                      </div>
                      <div className="text-sm text-green-700">
                        {module.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={featureCode}
                    className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50 border-gray-200"
                  >
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-600">
                        {featureCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        Modul tidak ditemukan
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {plan.features.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <XCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Tidak ada fitur yang dipilih untuk plan ini</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistik Plan
            </CardTitle>
            <CardDescription>
              Informasi penggunaan dan statistik plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">0</div>
                <div className="text-xs text-blue-600">Perusahaan Aktif</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {plan.features.length}
                </div>
                <div className="text-xs text-green-600">Fitur Tersedia</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(plan.price * 12)}
                </div>
                <div className="text-xs text-purple-600">Revenue/Tahun</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {plan.isActive ? "Aktif" : "Nonaktif"}
                </div>
                <div className="text-xs text-orange-600">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Usage Stats */}
        <PlanUsageStats planId={plan.id} />
      </div>
    </ViewLayout>
  );
}
