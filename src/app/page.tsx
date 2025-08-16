"use client";

import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SuperadminDashboard } from "@/components/dashboard/Superadmin/Dashboard";
import { CompanyOwnerDashboard } from "@/components/dashboard/Owner/OwnerDashboard";
import { EmployeeDashboard } from "@/components/dashboard/Employee/Dashboard";
import { User } from "@/backend/types/schema";
import { UserRole } from "@/backend/types/enums";

export default function ERPLoginSystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Show appropriate dashboard based on user role
  if (currentUser) {
    switch (currentUser.role) {
      case UserRole.SUPERADMIN:
        return (
          <SuperadminDashboard user={currentUser} onLogout={handleLogout} />
        );
      case UserRole.COMPANY_OWNER:
        return (
          <CompanyOwnerDashboard user={currentUser} onLogout={handleLogout} />
        );
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    }
  }

  // Show login form if no user is logged in
  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
