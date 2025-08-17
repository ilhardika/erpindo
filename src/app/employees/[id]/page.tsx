"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ViewEmployee } from "@/components/dashboard/owner/employees/viewEmployee";

export default function ViewEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ProtectedRoute allowedRoles={["company_owner"]}>
      <ViewEmployee employeeId={params.id} />
    </ProtectedRoute>
  );
}
