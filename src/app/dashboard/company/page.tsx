"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CompanyOwnerDashboard } from "@/components/dashboard/Owner/OwnerDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function CompanyDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["company_owner"]}>
      {user && <CompanyOwnerDashboard user={user} onLogout={logout} />}
    </ProtectedRoute>
  );
}
