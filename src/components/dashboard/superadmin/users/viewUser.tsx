"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ViewLayout } from "@/components/layout/ViewLayout";
import { User } from "@/backend/services/auth";
import { users } from "@/backend/tables/users";
import { Badge } from "@/components/ui/badge";

interface ViewUserProps {
  user: User;
  onLogout: () => void;
  userId: string;
}

export function ViewUser({ user, onLogout, userId }: ViewUserProps) {
  const router = useRouter();

  // Get user data
  const targetUser = users.find((u) => u.id === userId);

  if (!targetUser) {
    // User not found, redirect back
    router.push("/users");
    return null;
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/users/${userId}/edit`);
  };

  const handleDelete = () => {
    if (
      confirm(
        `Apakah Anda yakin ingin menghapus pengguna "${targetUser.name}"?`
      )
    ) {
      // TODO: Implement delete logic
      console.log("Deleting user:", userId);
      alert("Fungsi delete belum diimplementasikan");
      // After successful delete:
      // router.push("/users");
    }
  };

  // Helper function to format role badge
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: { label: "Super Admin", variant: "default" as const },
      company_owner: { label: "Company Owner", variant: "secondary" as const },
      employee: { label: "Employee", variant: "outline" as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper function to format status badge
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Aktif" : "Tidak Aktif"}
      </Badge>
    );
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
      title={targetUser.name}
      subtitle="Detail informasi pengguna yang terdaftar"
      onBack={handleBack}
      onEdit={handleEdit}
      onDelete={handleDelete}
      requiredRole="superadmin"
    >
      {/* User Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Nama Lengkap
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {targetUser.name}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {targetUser.email}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Role/Jabatan
          </label>
          <div className="bg-gray-50 p-2 rounded border">
            {getRoleBadge(targetUser.role)}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <div className="bg-gray-50 p-2 rounded border">
            {getStatusBadge(targetUser.isActive)}
          </div>
        </div>
      </div>

      {/* Company Information (if applicable) */}
      {targetUser.companyId && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Perusahaan
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {targetUser.companyId}
          </p>
        </div>
      )}

      {/* Position (if applicable) */}
      {targetUser.position && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Posisi</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {targetUser.position}
          </p>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tanggal Dibuat
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {formatDate(targetUser.createdAt)}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Terakhir Diubah
          </label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
            {formatDate(targetUser.updatedAt)}
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">User ID</label>
        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border font-mono">
          {targetUser.id}
        </p>
      </div>

      {/* Role-specific Information */}
      {targetUser.role === "superadmin" && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Informasi Super Admin
          </h4>
          <p className="text-sm text-blue-700">
            Pengguna ini memiliki akses penuh ke semua fitur sistem dan dapat
            mengelola seluruh perusahaan.
          </p>
        </div>
      )}

      {targetUser.role === "company_owner" && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-900 mb-2">
            Informasi Pemilik Perusahaan
          </h4>
          <p className="text-sm text-green-700">
            Pengguna ini adalah pemilik perusahaan dan memiliki akses penuh
            terhadap data perusahaannya.
          </p>
        </div>
      )}

      {targetUser.role === "employee" && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Informasi Karyawan
          </h4>
          <p className="text-sm text-gray-700">
            Pengguna ini adalah karyawan dengan akses terbatas sesuai dengan
            peran dan tanggung jawabnya.
          </p>
        </div>
      )}
    </ViewLayout>
  );
}
