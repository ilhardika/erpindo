import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SuperadminDashboard from '../components/dashboard/SuperadminDashboard';
import CompanyOwnerDashboard from '../components/dashboard/CompanyOwnerDashboard';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import { useAuth } from '../components/auth/AuthProvider';
import { UserRole } from '../backend/enums';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.SUPERADMIN:
        return <SuperadminDashboard />;
      case UserRole.COMPANY_OWNER:
        return <CompanyOwnerDashboard />;
      case UserRole.EMPLOYEE:
        return <EmployeeDashboard user={user} />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <DashboardHeader user={user} onLogout={logout} />
        {renderDashboard()}
      </div>
    </div>
  );
};

export default DashboardPage;