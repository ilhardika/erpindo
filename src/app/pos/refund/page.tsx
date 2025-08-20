"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { POSRefund } from "@/components/dashboard/employee/pos/refund";
import { UserRole } from "@/backend/tables/enums";
import { useState } from "react";

export default function RefundPage() {
  const [currentView, setCurrentView] = useState("refund");

  const handleBack = () => {
    setCurrentView("pos-menu");
  };

  if (currentView === "refund") {
    return (
      <DashboardLayout requiredRole={UserRole.EMPLOYEE}>
        <POSRefund onBack={handleBack} />
      </DashboardLayout>
    );
  }

  return null;
}
