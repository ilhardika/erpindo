"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { User } from "@/backend/types/schema";
import { DashboardLayout } from "./DashboardLayout";

interface FormLayoutProps {
  user: User;
  onLogout: () => void;
  title: string;
  subtitle: string;
  onBack: () => void;
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  saveButtonText?: string;
  resetButtonText?: string;
  saveButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  resetButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  formActions?: React.ReactNode; // Optional additional actions in footer
}

export function FormLayout({
  user,
  onLogout,
  title,
  subtitle,
  onBack,
  onSave,
  onReset,
  children,
  isLoading = false,
  saveButtonText = "Simpan",
  resetButtonText = "Reset",
  saveButtonVariant = "default",
  resetButtonVariant = "outline",
  formActions,
}: FormLayoutProps) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button, Title, and Subtitle */}
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
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Form Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dynamic Form Content */}
            <div className="space-y-4">{children}</div>

            {/* Footer with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t">
              <div className="flex flex-wrap items-center gap-3 order-2 sm:order-1">
                {formActions}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 order-1 sm:order-2">
                <Button
                  type="button"
                  variant={resetButtonVariant}
                  onClick={onReset}
                  disabled={isLoading}
                  className="min-w-[80px] w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {resetButtonText}
                </Button>

                <Button
                  type="submit"
                  variant={saveButtonVariant}
                  onClick={onSave}
                  disabled={isLoading}
                  className="min-w-[100px] w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {saveButtonText}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
