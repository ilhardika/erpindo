"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ManageEmployees } from "@/components/dashboard/owner/employees";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeesPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["company_owner"]}>
      {user && <ManageEmployees user={user} onLogout={logout} />}
    </ProtectedRoute>
  );
}
