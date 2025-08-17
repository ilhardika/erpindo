"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { User } from "@/backend/types/schema";
import { DashboardLayout } from "./DashboardLayout";

interface ViewLayoutProps {
  user: User;
  onLogout: () => void;
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
  headerActions?: React.ReactNode; // Optional additional actions in header
}

export function ViewLayout({
  user,
  onLogout,
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
}: ViewLayoutProps) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {headerActions}
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
              <Button
                type="button"
                variant={editButtonVariant}
                onClick={onEdit}
                className="min-w-[80px] w-full xs:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editButtonText}
              </Button>

              <Button
                type="button"
                variant={deleteButtonVariant}
                onClick={onDelete}
                className="min-w-[80px] w-full xs:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
