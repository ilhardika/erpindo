// Export all tables and their interfaces
export * from "./users";
export * from "./companies";
export * from "./employees";
export * from "./modules";
export * from "./employeeModules";
export * from "./products";
export * from "./customers";
export * from "./transactions";
export * from "./vehicles";
export * from "./inventory";
export * from "./attendance";

// Import all data for easy access
import { users } from "./users";
import { companies } from "./companies";
import { employees } from "./employees";
import { modules } from "./modules";
import { employeeModules } from "./employeeModules";
import { products } from "./products";
import { customers, suppliers } from "./customers";
import { transactions, transactionItems, payments } from "./transactions";
import { vehicles, vehicleServices, vehicleUsages } from "./vehicles";
import {
  inventory,
  stockMovements,
  stockAdjustments,
  stockAdjustmentItems,
} from "./inventory";
import { attendance, shifts, leaves, payroll } from "./attendance";

// Database-like helper for getting all data
export const getAllTables = () => ({
  companies,
  users,
  employees,
  modules,
  employeeModules,
  products,
  customers,
  suppliers,
  transactions,
  transactionItems,
  payments,
  vehicles,
  vehicleServices,
  vehicleUsages,
  inventory,
  stockMovements,
  stockAdjustments,
  stockAdjustmentItems,
  attendance,
  shifts,
  leaves,
  payroll,
});

// Helper function to get company-specific data
export const getCompanyData = (companyId: string) => {
  return {
    company: companies.find((c) => c.id === companyId),
    employees: employees.filter((e) => e.companyId === companyId),
    users: users.filter((u) => u.companyId === companyId),
    products: products.filter((p) => p.companyId === companyId),
    customers: customers.filter((c) => c.companyId === companyId),
    suppliers: suppliers.filter((s) => s.companyId === companyId),
    transactions: transactions.filter((t) => t.companyId === companyId),
    vehicles: vehicles.filter((v) => v.companyId === companyId),
    inventory: inventory.filter((i) => i.companyId === companyId),
    attendance: attendance.filter((a) => a.companyId === companyId),
    shifts: shifts.filter((s) => s.companyId === companyId),
    leaves: leaves.filter((l) => l.companyId === companyId),
    payroll: payroll.filter((p) => p.companyId === companyId),
  };
};

// Statistics helper for any company
export const getAllCompanyStatistics = (companyId: string) => {
  const data = getCompanyData(companyId);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  return {
    employees: data.employees.length,
    activeEmployees: data.employees.filter((e) => e.isActive).length,
    products: data.products.length,
    customers: data.customers.length,
    suppliers: data.suppliers.length,
    vehicles: data.vehicles.length,
    activeUsers: data.users.filter((u) => u.isActive).length,
    totalTransactions: data.transactions.length,
    inventoryItems: data.inventory.length,
    monthlyAttendance: data.attendance.filter((a) =>
      a.attendanceDate.startsWith(currentMonth)
    ).length,
    monthlyRevenue: data.transactions
      .filter(
        (t) =>
          t.transactionType === "sale" &&
          t.transactionDate.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0),
    pendingLeaves: data.leaves.filter((l) => l.status === "pending").length,
  };
};

// Helper to get all companies with basic stats
export const getAllCompaniesWithStats = () => {
  return companies.map((company) => ({
    ...company,
    stats: getAllCompanyStatistics(company.id),
  }));
};

// Authentication helper
export const authenticateUser = (email: string, password: string) => {
  const user = users.find((u) => u.email === email && u.isActive);

  if (!user) {
    return { success: false, message: "User not found or inactive" };
  }

  // In real app, you'd hash and compare password
  // For demo, we'll just check if password is provided
  if (!password) {
    return { success: false, message: "Password required" };
  }

  const company = companies.find((c) => c.id === user.companyId);
  const employee = employees.find((e) => e.userId === user.id);

  return {
    success: true,
    user: {
      ...user,
      company: company,
      employee: employee,
    },
  };
};

// Helper to simulate database queries
export const query = {
  companies: {
    findById: (id: string) => companies.find((c) => c.id === id),
    findAll: () => companies,
    findByOwnerId: (ownerId: string) =>
      companies.filter((c) => c.ownerId === ownerId),
  },

  users: {
    findById: (id: string) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findByCompany: (companyId: string) =>
      users.filter((u) => u.companyId === companyId),
    findByRole: (role: string) => users.filter((u) => u.role === role),
    findActive: (companyId?: string) => {
      const activeUsers = users.filter((u) => u.isActive);
      return companyId
        ? activeUsers.filter((u) => u.companyId === companyId)
        : activeUsers;
    },
  },

  employees: {
    findById: (id: string) => employees.find((e) => e.id === id),
    findByCompany: (companyId: string) =>
      employees.filter((e) => e.companyId === companyId),
    findActive: (companyId: string) =>
      employees.filter((e) => e.companyId === companyId && e.isActive),
    findByUserId: (userId: string) =>
      employees.find((e) => e.userId === userId),
  },

  products: {
    findById: (id: string) => products.find((p) => p.id === id),
    findByCompany: (companyId: string) =>
      products.filter((p) => p.companyId === companyId),
    findBySKU: (companyId: string, sku: string) =>
      products.find((p) => p.companyId === companyId && p.sku === sku),
    findByCategory: (companyId: string, category: string) =>
      products.filter(
        (p) => p.companyId === companyId && p.category === category
      ),
  },

  transactions: {
    findById: (id: string) => transactions.find((t) => t.id === id),
    findByCompany: (companyId: string) =>
      transactions.filter((t) => t.companyId === companyId),
    findByType: (companyId: string, type: string) =>
      transactions.filter(
        (t) => t.companyId === companyId && t.transactionType === type
      ),
    findByCustomer: (customerId: string) =>
      transactions.filter((t) => t.customerId === customerId),
    findByDateRange: (companyId: string, startDate: string, endDate: string) =>
      transactions.filter(
        (t) =>
          t.companyId === companyId &&
          t.transactionDate >= startDate &&
          t.transactionDate <= endDate
      ),
    findRecent: (companyId: string, limit: number = 10) =>
      transactions
        .filter((t) => t.companyId === companyId)
        .sort(
          (a, b) =>
            new Date(b.transactionDate).getTime() -
            new Date(a.transactionDate).getTime()
        )
        .slice(0, limit),
  },

  inventory: {
    findByCompany: (companyId: string) =>
      inventory.filter((i) => i.companyId === companyId),
    findByProduct: (companyId: string, productId: string) =>
      inventory.find(
        (i) => i.companyId === companyId && i.productId === productId
      ),
    findLowStock: (companyId: string) =>
      inventory.filter(
        (i) => i.companyId === companyId && i.availableStock <= i.reorderPoint
      ),
    findOutOfStock: (companyId: string) =>
      inventory.filter(
        (i) => i.companyId === companyId && i.availableStock <= 0
      ),
  },

  attendance: {
    findByEmployee: (employeeId: string, month?: string) => {
      let result = attendance.filter((a) => a.employeeId === employeeId);
      if (month) {
        result = result.filter((a) => a.attendanceDate.startsWith(month));
      }
      return result.sort((a, b) =>
        b.attendanceDate.localeCompare(a.attendanceDate)
      );
    },
    findByCompany: (companyId: string, date?: string) => {
      let result = attendance.filter((a) => a.companyId === companyId);
      if (date) {
        result = result.filter((a) => a.attendanceDate === date);
      }
      return result;
    },
    findByStatus: (companyId: string, status: string) =>
      attendance.filter(
        (a) => a.companyId === companyId && a.status === status
      ),
  },
};

// Dashboard data helper
export const getDashboardData = (companyId: string, userRole: string) => {
  const data = getCompanyData(companyId);
  const stats = getAllCompanyStatistics(companyId);
  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const dashboardData = {
    company: data.company,
    stats,

    // Recent data
    recentTransactions: query.transactions.findRecent(companyId, 5),
    todayAttendance: query.attendance.findByCompany(companyId, currentDate),
    lowStockItems: query.inventory.findLowStock(companyId).slice(0, 5),
    pendingLeaves: data.leaves.filter((l) => l.status === "pending"),

    // Monthly summaries
    monthlyRevenue: data.transactions
      .filter(
        (t) =>
          t.transactionType === "sale" &&
          t.transactionDate.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0),
    monthlyExpenses: data.transactions
      .filter(
        (t) =>
          t.transactionType === "purchase" &&
          t.transactionDate.startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + t.totalAmount, 0),

    // Alerts
    alerts: [
      ...query.inventory.findOutOfStock(companyId).map((inv) => ({
        type: "warning",
        message: `Product ${
          products.find((p) => p.id === inv.productId)?.name
        } is out of stock`,
      })),
      ...data.leaves
        .filter((l) => l.status === "pending")
        .map((leave) => {
          const employee = employees.find((e) => e.id === leave.employeeId);
          const user = employee
            ? users.find((u) => u.id === employee.userId)
            : null;
          const employeeName = user ? user.name : "Unknown Employee";

          return {
            type: "info",
            message: `Leave request pending approval from ${employeeName}`,
          };
        }),
    ],
  };

  // Role-specific data
  if (userRole === "superadmin") {
    return {
      ...dashboardData,
      allCompanies: getAllCompaniesWithStats(),
      systemStats: {
        totalCompanies: companies.length,
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.isActive).length,
      },
    };
  }

  return dashboardData;
};

export default {
  getAllTables,
  getCompanyData,
  getAllCompanyStatistics,
  getAllCompaniesWithStats,
  authenticateUser,
  getDashboardData,
  query,
};
