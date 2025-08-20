"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { POSShiftManagement } from "@/components/dashboard/employee/pos/shift";
import { UserRole } from "@/backend/tables/enums";

export default function POSShiftPage() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <DashboardLayout requiredRole={UserRole.EMPLOYEE}>
      <POSShiftManagement onBack={handleBack} />
    </DashboardLayout>
  );
}
