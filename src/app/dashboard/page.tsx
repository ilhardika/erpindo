"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SuperadminDashboard } from "@/components/dashboard/SuperadminDashboard";
import { CompanyOwnerDashboard } from "@/components/dashboard/Owner/Dashboard";
import { EmployeeDashboard } from "@/components/dashboard/Employee/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      {user && (
        <>
          {user.role === "superadmin" && (
            <SuperadminDashboard user={user} onLogout={logout} />
          )}
          {user.role === "company_owner" && (
            <CompanyOwnerDashboard user={user} onLogout={logout} />
          )}
          {user.role === "employee" && (
            <EmployeeDashboard user={user} onLogout={logout} />
          )}
        </>
      )}
    </ProtectedRoute>
  );
}
