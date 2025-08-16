// Export all tables and their interfaces
export * from "./users";
export * from "./companies";
export * from "./employees";
export * from "./modules";
export * from "./employeeModules";

// Import all tables for easy access
import {
  users,
  getUserById,
  getUserByEmail,
  getUsersByCompanyId,
  getUsersByRole,
} from "./users";
import {
  companies,
  getCompanyById,
  getCompaniesByOwnerId,
  getAllCompanies,
} from "./companies";
import {
  employees,
  getEmployeeById,
  getEmployeeByUserId,
  getEmployeesByCompanyId,
  getActiveEmployeesByCompanyId,
} from "./employees";
import {
  modules,
  getModuleById,
  getModuleByCode,
  getActiveModules,
  getAllModules,
} from "./modules";
import {
  employeeModules,
  getEmployeeModulesByEmployeeId,
  hasModuleAccess,
  canWriteModule,
  canDeleteModule,
} from "./employeeModules";

// Database simulation object - acts like a simple ORM
export const db = {
  // Tables
  users,
  companies,
  employees,
  modules,
  employeeModules,

  // User operations
  user: {
    findById: getUserById,
    findByEmail: getUserByEmail,
    findByCompanyId: getUsersByCompanyId,
    findByRole: getUsersByRole,
  },

  // Company operations
  company: {
    findById: getCompanyById,
    findByOwnerId: getCompaniesByOwnerId,
    findAll: getAllCompanies,
  },

  // Employee operations
  employee: {
    findById: getEmployeeById,
    findByUserId: getEmployeeByUserId,
    findByCompanyId: getEmployeesByCompanyId,
    findActiveByCompanyId: getActiveEmployeesByCompanyId,
  },

  // Module operations
  module: {
    findById: getModuleById,
    findByCode: getModuleByCode,
    findActive: getActiveModules,
    findAll: getAllModules,
  },

  // Employee-Module permission operations
  employeeModule: {
    findByEmployeeId: getEmployeeModulesByEmployeeId,
    hasAccess: hasModuleAccess,
    canWrite: canWriteModule,
    canDelete: canDeleteModule,
  },
};

// Statistics helpers - similar to database aggregation functions
export const getStatistics = () => ({
  totalCompanies: companies.length,
  activeCompanies: companies.filter((c) => c.status === "active").length,
  totalUsers: users.length,
  totalEmployees: employees.length,
  totalRevenue: companies
    .filter((c) => c.paymentStatus === "paid")
    .reduce((sum, c) => sum + 1000000, 0), // Assuming 1M per company subscription
});

// Helper to get full employee data with user info and modules
export const getFullEmployeeData = (employeeId: string) => {
  const employee = getEmployeeById(employeeId);
  if (!employee) return null;

  const user = getUserById(employee.userId);
  const employeeModulesList = getEmployeeModulesByEmployeeId(employeeId);
  const modulesList = employeeModulesList
    .map((em) => getModuleByCode(em.moduleCode))
    .filter(Boolean);

  return {
    ...employee,
    user,
    modules: modulesList,
    permissions: employeeModulesList,
  };
};

// Helper to get full company data with owner and employees
export const getFullCompanyData = (companyId: string) => {
  const company = getCompanyById(companyId);
  if (!company) return null;

  const owner = getUserById(company.ownerId);
  const employeesList = getEmployeesByCompanyId(companyId);
  const employeesWithUserData = employeesList.map((emp) => {
    const user = getUserById(emp.userId);
    return { ...emp, user };
  });

  return {
    ...company,
    owner,
    employees: employeesWithUserData,
    actualEmployeeCount: employeesList.length,
  };
};
