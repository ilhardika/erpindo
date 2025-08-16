"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperadminDashboard } from "@/components/dashboard/SuperadminDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function SuperadminDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      {user && <SuperadminDashboard user={user} onLogout={logout} />}
    </ProtectedRoute>
  );
}
