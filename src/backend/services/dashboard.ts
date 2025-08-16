import {
  getAllCompaniesWithStats,
  getCompanyData,
  getDashboardData,
  query,
} from "../tables";

export class DashboardService {
  // Superadmin Dashboard - All companies overview
  static getSuperadminDashboard() {
    const companiesWithStats = getAllCompaniesWithStats();

    return {
      companies: companiesWithStats.map(({ stats, ...company }) => ({
        ...company,
        employeeCount: stats.employees,
        activeEmployees: stats.activeEmployees,
        monthlyRevenue: stats.monthlyRevenue,
        totalUsers: stats.activeUsers,
      })),
      totalRevenue: companiesWithStats.reduce(
        (sum, c) => sum + c.stats.monthlyRevenue,
        0
      ),
      activeCompanies: companiesWithStats.filter((c) => c.status === "active")
        .length,
      totalUsers: companiesWithStats.reduce(
        (sum, c) => sum + c.stats.activeUsers,
        0
      ),
      totalEmployees: companiesWithStats.reduce(
        (sum, c) => sum + c.stats.employees,
        0
      ),
    };
  }

  // Company Owner Dashboard - Single company management
  static getCompanyOwnerDashboard(companyId: string) {
    const companyData = getCompanyData(companyId);
    const dashboardData = getDashboardData(companyId, "company_owner");

    if (!companyData.company) {
      throw new Error("Company not found");
    }

    // Get employee modules for the company
    const employeeModules = query.employeeModules
      ? query.employeeModules.findByCompany(companyId)
      : [];

    return {
      company: companyData.company,
      stats: dashboardData.stats,
      employees: companyData.employees,
      recentTransactions: dashboardData.recentTransactions,
      lowStockItems: dashboardData.lowStockItems,
      pendingLeaves: dashboardData.pendingLeaves,
      todayAttendance: dashboardData.todayAttendance,

      // Module usage based on employeeModules table
      moduleUsage: {
        pos: employeeModules.filter((em) => em.moduleCode === "pos").length,
        inventory: employeeModules.filter((em) => em.moduleCode === "inventory")
          .length,
        hr: employeeModules.filter((em) => em.moduleCode === "hr").length,
        sales: employeeModules.filter((em) => em.moduleCode === "sales").length,
        finance: employeeModules.filter((em) => em.moduleCode === "finance")
          .length,
      },

      recentActivities: [
        "New employee registered",
        "POS transaction completed",
        "Inventory updated",
        "Attendance marked",
      ],
    };
  }

  // Employee Dashboard - Individual employee view
  static getEmployeeDashboard(employeeId: string) {
    const dashboardData = getDashboardData("", "employee"); // Will be filtered by employee

    // Get employee modules
    const employeeModules = query.employeeModules
      ? query.employeeModules.findByEmployee(employeeId)
      : [];

    return {
      employee: {
        id: employeeId,
        name: "Sample Employee",
        position: "Staff",
        modules: employeeModules.map((em) => em.moduleCode),
      },
      availableModules: employeeModules.map((em) => em.moduleCode),
      recentTasks: [
        "Complete daily sales report",
        "Update inventory count",
        "Process customer returns",
      ],
      notifications: [
        "New product added to inventory",
        "Team meeting at 2 PM",
        "Monthly report due tomorrow",
      ],
    };
  }
}
