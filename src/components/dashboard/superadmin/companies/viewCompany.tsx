"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ViewLayout } from "@/components/layout/ViewLayout";
import { User } from "@/backend/types/schema";
import { companies } from "@/backend/tables/companies";
import { Badge } from "@/components/ui/badge";

interface ViewCompanyProps {
  user: User;
  onLogout: () => void;
  companyId: string;
}

export function ViewCompany({ user, onLogout, companyId }: ViewCompanyProps) {
  const router = useRouter();

  // Get company data
  const company = companies.find((c) => c.id === companyId);

  if (!company) {
    // Company not found, redirect back
    router.push("/companies");
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/companies/${companyId}/edit`);
  };

  const handleDelete = () => {
    if (
      confirm(`Apakah Anda yakin ingin menghapus perusahaan "${company.name}"?`)
    ) {
      // TODO: Implement delete logic
      console.log("Deleting company:", companyId);
      alert("Fungsi delete belum diimplementasikan");
      // After successful delete:
      // router.push("/companies");
    }
  };

  // Helper function to format status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Aktif", variant: "default" as const },
      inactive: { label: "Tidak Aktif", variant: "secondary" as const },
      suspended: { label: "Ditangguhkan", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper function to format payment status badge
  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusConfig = {
      paid: { label: "Lunas", variant: "default" as const },
      pending: { label: "Pending", variant: "secondary" as const },
      overdue: { label: "Terlambat", variant: "destructive" as const },
    };

    const config = statusConfig[paymentStatus as keyof typeof statusConfig] || {
      label: paymentStatus,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ViewLayout
      user={user}
      onLogout={onLogout}
      title={company.name}
      subtitle="Detail informasi perusahaan yang terdaftar"
      onBack={handleBack}
      onEdit={handleEdit}
      onDelete={handleDelete}
    >
      {/* Company Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nama Perusahaan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.name}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Perusahaan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.email}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nomor Telepon
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.phone || "-"}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Jenis Bisnis
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.businessType}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Alamat</label>
        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border min-h-[60px]">
          {company.address || "-"}
        </p>
      </div>

      {/* Subscription and Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Paket Langganan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border capitalize">
            {company.subscriptionPlan}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Biaya Bulanan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {formatCurrency(company.monthlyFee)}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Status Perusahaan
          </label>
          <div className="bg-gray-50 p-2 rounded border">
            {getStatusBadge(company.status)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Status Pembayaran
          </label>
          <div className="bg-gray-50 p-2 rounded border">
            {getPaymentStatusBadge(company.paymentStatus)}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Jumlah Karyawan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.employeeCount} orang
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tanggal Registrasi
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {formatDate(company.registrationDate)}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Berakhir Langganan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {company.subscriptionEndDate
              ? formatDate(company.subscriptionEndDate)
              : "-"}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Fitur yang Diaktifkan
        </label>
        <div className="bg-gray-50 p-2 rounded border">
          <div className="flex flex-wrap gap-2">
            {company.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Last Payment Info */}
      {company.lastPaymentDate && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tanggal Pembayaran Terakhir
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {formatDate(company.lastPaymentDate)}
          </p>
        </div>
      )}
    </ViewLayout>
  );
}
