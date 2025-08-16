"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmployeeDashboard } from "@/components/dashboard/Employee/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["employee"]}>
      {user && <EmployeeDashboard user={user} onLogout={logout} />}
    </ProtectedRoute>
  );
}
