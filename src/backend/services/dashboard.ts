import {
  getCompanyStats,
  getSubscriptionStats,
  getTotalRevenue,
  getAllTables,
} from "../tables";
import { HRService } from "./hr";
import { BusinessService } from "./business";

export class DashboardService {
  // Superadmin Dashboard - All companies overview
  static getSuperadminDashboard() {
    const tables = getAllTables();
    const companyStats = getCompanyStats();
    const subscriptionStats = getSubscriptionStats();
    const totalRevenue = getTotalRevenue();

    const companiesWithStats = tables.companies.map((company) => {
      const employees = tables.employees.filter(
        (e) => e.companyId === company.id
      );
      const activeEmployees = employees.filter((e) => e.isActive).length;
      const users = tables.users.filter((u) => u.companyId === company.id);
      const activeUsers = users.filter((u) => u.isActive).length;

      return {
        ...company,
        employeeCount: employees.length,
        activeEmployees,
        monthlyRevenue: company.monthlyFee,
        totalUsers: activeUsers,
      };
    });

    return {
      companies: companiesWithStats,
      stats: {
        totalRevenue: totalRevenue,
        totalCompanies: companyStats.total,
        activeCompanies: companyStats.active,
        totalActiveUsers: companiesWithStats.reduce(
          (sum, c) => sum + c.totalUsers,
          0
        ),
        totalEmployees: companiesWithStats.reduce(
          (sum, c) => sum + c.employeeCount,
          0
        ),
        subscriptionBreakdown: subscriptionStats,
      },
    };
  }

  // Company Owner Dashboard - Single company management
  static getCompanyOwnerDashboard(companyId: string) {
    const tables = getAllTables();
    const company = tables.companies.find((c) => c.id === companyId);

    if (!company) {
      throw new Error(`Company not found: ${companyId}`);
    }

    // Get employees with user data using HR service
    const employeesWithUserData =
      HRService.queries.employees.findByCompanyIdWithUserData(companyId);
    const activeEmployees = employeesWithUserData.filter((e) => e.isActive);

    // Get business data
    const products = tables.products.filter((p) => p.companyId === companyId);
    const customers = tables.customers.filter((c) => c.companyId === companyId);

    // Get today's attendance
    const todayAttendance = tables.attendance.filter(
      (a) =>
        a.companyId === companyId &&
        a.attendanceDate === new Date().toISOString().split("T")[0]
    );

    // Get recent transactions
    const recentTransactions = tables.transactions
      .filter((t) => t.companyId === companyId)
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )
      .slice(0, 10);

    // Get low stock items
    const lowStockItems = tables.inventory.filter(
      (i) => i.companyId === companyId && i.currentStock <= i.minimumStock
    );

    return {
      company,
      stats: {
        totalEmployees: employeesWithUserData.length,
        activeEmployees: activeEmployees.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        todayAttendance: todayAttendance.length,
        pendingLeaves:
          tables.leaves?.filter(
            (l) => l.companyId === companyId && l.status === "pending"
          ).length || 0,
      },
      employees: employeesWithUserData, // Now includes user data with login access info
      recentTransactions,
      lowStockItems: lowStockItems.slice(0, 10),
      todayAttendance,
    };
  }

  // Employee Dashboard - Personal view
  static getEmployeeDashboard(employeeId: string) {
    const tables = getAllTables();
    const employee = tables.employees.find((e) => e.id === employeeId);

    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    const company = tables.companies.find((c) => c.id === employee.companyId);

    // Get employee's module access via HR service
    const employeeModules = HRService.modules.getEmployeeModules(employeeId);

    // Get employee's attendance
    const myAttendance = tables.attendance.filter(
      (a) => a.employeeId === employeeId
    );
    const thisMonthAttendance = myAttendance.filter(
      (a) => new Date(a.attendanceDate).getMonth() === new Date().getMonth()
    );

    // Get employee's leaves
    const myLeaves =
      tables.leaves?.filter((l) => l.employeeId === employeeId) || [];
    const pendingLeaves = myLeaves.filter((l) => l.status === "pending");

    return {
      employee,
      company,
      modules: employeeModules,
      attendance: {
        thisMonth: thisMonthAttendance.length,
        totalDays: new Date().getDate(),
        lastCheckIn: myAttendance.sort(
          (a, b) =>
            new Date(b.checkIn || b.attendanceDate).getTime() -
            new Date(a.checkIn || a.attendanceDate).getTime()
        )[0],
      },
      leaves: {
        total: myLeaves.length,
        pending: pendingLeaves.length,
        approved: myLeaves.filter((l) => l.status === "approved").length,
      },
      tasks: {
        pending: 0, // Could be extended with task management
        completed: 0,
      },
    };
  }
}
