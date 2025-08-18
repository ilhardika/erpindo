"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { POSTransaction } from "@/components/dashboard/employee/pos/transaksi";
import { UserRole } from "@/backend/tables/enums";

export default function POSTransactionPage() {
  return (
    <DashboardLayout requiredRole={UserRole.EMPLOYEE}>
      <POSTransaction />
    </DashboardLayout>
  );
}
