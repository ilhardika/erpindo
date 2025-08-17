"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { User } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "./DashboardLayout";

interface ViewLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  editButtonText?: string;
  deleteButtonText?: string;
  editButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  deleteButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  headerActions?: React.ReactNode;
  requiredRole?: UserRole; // Optional role requirement
}

export function ViewLayout({
  title,
  subtitle,
  onBack,
  onEdit,
  onDelete,
  children,
  editButtonText = "Edit",
  deleteButtonText = "Delete",
  editButtonVariant = "default",
  deleteButtonVariant = "destructive",
  headerActions,
  requiredRole,
}: ViewLayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.push("/dashboard");
        return;
      }
    }
  }, [user, isLoading, router, requiredRole]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User not found
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Role access denied
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }
  return (
    <DashboardLayout requiredRole={requiredRole}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button, Title, Subtitle, and Action Buttons */}
        <div className="space-y-4">
          {/* Back Button - Above Title */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Title and Subtitle */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          </div>

          {/* Action Buttons - Below Subtitle */}
          <div className="flex flex-col items-start gap-3 w-full">
            <div className="flex flex-wrap items-center gap-3 w-full sm:flex-1 min-w-0">
              {headerActions}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant={editButtonVariant}
                onClick={onEdit}
                className="w-full sm:w-auto flex-1 sm:flex-none min-w-[80px]"
              >
                <Edit className="h-4 mr-2" />
                {editButtonText}
              </Button>

              <Button
                type="button"
                variant={deleteButtonVariant}
                onClick={onDelete}
                className="w-full sm:w-auto flex-1 sm:flex-none min-w-[80px]"
              >
                <Trash2 className="h-4 mr-2" />
                {deleteButtonText}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Card - No Footer */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Detail Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dynamic View Content */}
            <div className="space-y-4">{children}</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
