"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AdvancedDataTable,
  AdvancedColumn,
} from "@/components/ui/advanced-table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus } from "lucide-react";
import { User } from "@/backend/types/schema";

interface ModuleLayoutProps<T> {
  user: User;
  onLogout: () => void;
  title: string;
  subtitle: string;
  addButtonText: string;
  onAddClick?: () => void;
  showAddButton?: boolean;
  columns: AdvancedColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  tableTitle?: string;
  children?: React.ReactNode; // For custom content above or below table
  headerActions?: React.ReactNode; // For additional actions in header
  tableActions?: React.ReactNode; // For actions above the table
}

export function ModuleLayout<T extends Record<string, any>>({
  user,
  onLogout,
  title,
  subtitle,
  addButtonText,
  onAddClick,
  showAddButton = true,
  columns,
  data,
  searchPlaceholder = "Cari...",
  tableTitle,
  children,
  headerActions,
  tableActions,
}: ModuleLayoutProps<T>) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            {showAddButton && (
              <Button
                onClick={onAddClick}
                className="flex items-center gap-2 w-fit"
              >
                <Plus className="h-4 w-4" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>

        {/* Custom Content (if provided) */}
        {children && <div className="space-y-4">{children}</div>}

        {/* Table Actions (if provided) */}
        {tableActions && (
          <div className="flex items-center justify-between">
            {tableActions}
          </div>
        )}

        {/* Advanced DataTable */}
        <AdvancedDataTable
          title={tableTitle}
          columns={columns}
          data={data}
          searchPlaceholder={searchPlaceholder}
        />
      </div>
    </DashboardLayout>
  );
}

// Export helper for common use cases
export interface QuickModuleProps<T> {
  user: User;
  onLogout: () => void;
  title: string;
  subtitle: string;
  addButtonText: string;
  columns: AdvancedColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  onAddClick?: () => void;
}

// Quick setup function for standard modules
export function createQuickModule<T extends Record<string, any>>(
  props: QuickModuleProps<T>
) {
  return (
    <ModuleLayout
      user={props.user}
      onLogout={props.onLogout}
      title={props.title}
      subtitle={props.subtitle}
      addButtonText={props.addButtonText}
      columns={props.columns}
      data={props.data}
      searchPlaceholder={
        props.searchPlaceholder || `Cari ${props.title.toLowerCase()}...`
      }
      onAddClick={props.onAddClick}
    />
  );
}
