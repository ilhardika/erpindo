"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EditEmployee } from "@/components/dashboard/owner/employees/editEmployee";

export default function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ProtectedRoute allowedRoles={["company_owner"]}>
      <EditEmployee employeeId={params.id} />
    </ProtectedRoute>
  );
}
