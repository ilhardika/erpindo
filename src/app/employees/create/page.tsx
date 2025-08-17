"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreateEmployee } from "@/components/dashboard/owner/employees/createEmployee";

export default function CreateEmployeePage() {
  return (
    <ProtectedRoute allowedRoles={["company_owner"]}>
      <CreateEmployee />
    </ProtectedRoute>
  );
}
