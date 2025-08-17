"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

// Superadmin Reports Component
function SuperadminReports({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics across all companies and users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Companies
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">143</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">
                +5.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Usage
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                +2.4% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Company Owner Reports Component
function CompanyOwnerReports({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Company Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your company performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Employee Performance
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Average productivity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                5 completed this month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Employee Reports Component
function EmployeeReports({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-muted-foreground">
            Your personal performance and task analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasks Completed
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReportsPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      {user && (
        <>
          {/* Superadmin: System-wide reports */}
          {user.role === "superadmin" && (
            <SuperadminReports user={user} onLogout={logout} />
          )}

          {/* Company Owner: Company-specific reports */}
          {user.role === "company_owner" && (
            <CompanyOwnerReports user={user} onLogout={logout} />
          )}

          {/* Employee: Personal reports */}
          {user.role === "employee" && (
            <EmployeeReports user={user} onLogout={logout} />
          )}
        </>
      )}
    </ProtectedRoute>
  );
}
