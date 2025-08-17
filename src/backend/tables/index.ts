// Export all tables and their interfaces
export * from "./users";
export * from "./companies";
export * from "./employees";
export * from "./modules";
export * from "./products";
export * from "./customers";
export * from "./transactions";
export * from "./vehicles";
export * from "./inventory";
export * from "./attendance";
export * from "./subscriptionPlans";

// Import reorganized data for easy access
import { users } from "./users";
import { companies } from "./companies";
import { employees } from "./employees";
import { modules } from "./modules";
import { products } from "./products";
import { customers, suppliers } from "./customers";
import { subscriptionPlans } from "./subscriptionPlans";
import { transactions, transactionItems, payments } from "./transactions";
import { vehicles, vehicleServices, vehicleUsages } from "./vehicles";
import { attendance, shifts, leaves, payroll } from "./attendance";
import { inventory, stockMovements, stockAdjustments } from "./inventory";

// Re-export consolidated data access
export const getAllTables = () => ({
  // Core user and company data
  companies,
  users,
  employees,
  subscriptionPlans,

  // Business data
  products,
  customers,
  suppliers,

  // Transaction data
  transactions,
  transactionItems,
  payments,

  // Vehicle data
  vehicles,
  vehicleServices,
  vehicleUsages,

  // HR/Attendance data
  attendance,
  shifts,
  leaves,
  payroll,

  // Inventory data
  inventory,
  stockMovements,
  stockAdjustments,

  // System data
  modules,
});

// Commonly used queries (shortcuts)
export const commonQueries = {
  // Get company with its subscription plan
  getCompanyWithPlan: (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return null;

    const plan = subscriptionPlans.find(
      (p) => p.id === company.subscriptionPlanId
    );
    return { ...company, subscriptionPlan: plan };
  },

  // Get employee with user data
  getEmployeeWithUser: (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return null;

    const user = users.find((u) => u.id === employee.userId);
    return { ...employee, user };
  },

  // Get company employees with user data
  getCompanyEmployees: (companyId: string) => {
    const companyEmployees = employees.filter((e) => e.companyId === companyId);

    return companyEmployees
      .map((employee) => {
        const user = users.find((u) => u.id === employee.userId);
        return { ...employee, user };
      })
      .filter((emp) => emp.user);
  },

  // Get products by company
  getCompanyProducts: (companyId: string) => {
    return products.filter((p) => p.companyId === companyId && p.isActive);
  },

  // Get customers by company
  getCompanyCustomers: (companyId: string) => {
    return customers.filter((c) => c.companyId === companyId && c.isActive);
  },
};
