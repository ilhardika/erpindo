"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ManageUsers } from "@/components/dashboard/superadmin/users";
import { useAuth } from "@/contexts/AuthContext";

// Placeholder component for restricted access
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

export default function UsersPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      {user && (
        <>
          {/* Superadmin: Manage all users */}
          {user.role === "superadmin" && (
            <ManageUsers user={user} onLogout={logout} />
          )}

          {/* Company Owner & Employee: Restricted access */}
          {(user.role === "company_owner" || user.role === "employee") && (
            <RestrictedAccess />
          )}
        </>
      )}
    </ProtectedRoute>
  );
}
