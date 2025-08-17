"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ManageCompanies } from "@/components/dashboard/superadmin/companies";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

// Placeholder component for company profile (owner view)
function CompanyProfile({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p>Company owner view - manage your company profile and settings</p>
        <p>Role: {user.role}</p>
        <p>Company: {user.companyName || "My Company"}</p>
      </div>
    </DashboardLayout>
  );
}

// Placeholder component for employee restricted access
function RestrictedAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      {user && (
        <>
          {/* Superadmin: Manage all companies */}
          {user.role === "superadmin" && (
            <ManageCompanies user={user} onLogout={logout} />
          )}

          {/* Company Owner: Manage own company profile */}
          {user.role === "company_owner" && (
            <CompanyProfile user={user} onLogout={logout} />
          )}

          {/* Employee: Restricted access */}
          {user.role === "employee" && <RestrictedAccess />}
        </>
      )}
    </ProtectedRoute>
  );
}
