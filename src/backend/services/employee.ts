import { employees, EmployeeTable } from "../tables/employees";
import { users, UserTable } from "../tables/users";
import { UserRole } from "../types/enums";

/**
 * Employee Service - handles all employee and HR related business logic
 */

// =============================================================================
// BASIC QUERIES
// =============================================================================

export const employeeQuery = {
  employees: {
    findById: (id: string) => employees.find((emp) => emp.id === id),
    findByUserId: (userId: string) =>
      employees.find((emp) => emp.userId === userId),
    findByCompanyId: (companyId: string) =>
      employees.filter((emp) => emp.companyId === companyId),
    findActiveByCompanyId: (companyId: string) =>
      employees.filter((emp) => emp.companyId === companyId && emp.isActive),
    findByDepartment: (companyId: string, department: string) =>
      employees.filter(
        (emp) => emp.companyId === companyId && emp.department === department
      ),
    findByModuleAccess: (companyId: string, module: string) =>
      employees.filter(
        (emp) =>
          emp.companyId === companyId && emp.moduleAccess.includes(module)
      ),
  },
};

// =============================================================================
// EMPLOYEE WITH USER DATA
// =============================================================================

export interface EmployeeWithUser extends EmployeeTable {
  user: UserTable;
}

export const getEmployeeWithUserData = (
  employeeId: string
): EmployeeWithUser | null => {
  const employee = employees.find((emp) => emp.id === employeeId);
  if (!employee) return null;

  const user = users.find((u) => u.id === employee.userId);
  if (!user) return null;

  return { ...employee, user };
};

export const getEmployeesWithUserDataByCompany = (
  companyId: string
): EmployeeWithUser[] => {
  const companyEmployees = employees.filter(
    (emp) => emp.companyId === companyId
  );

  return companyEmployees
    .map((employee) => {
      const user = users.find((u) => u.id === employee.userId);
      return { ...employee, user } as EmployeeWithUser;
    })
    .filter((emp) => emp.user); // Filter out employees without user data
};

// =============================================================================
// MODULE ACCESS MANAGEMENT
// =============================================================================

export const checkEmployeeModuleAccess = (
  employeeId: string,
  module: string
): boolean => {
  const employee = employees.find((emp) => emp.id === employeeId);
  return employee ? employee.moduleAccess.includes(module) : false;
};

export const grantModuleAccess = (
  employeeId: string,
  module: string
): boolean => {
  const employee = employees.find((emp) => emp.id === employeeId);
  if (!employee) return false;

  if (!employee.moduleAccess.includes(module)) {
    employee.moduleAccess.push(module);
    employee.updatedAt = new Date().toISOString();
  }
  return true;
};

export const revokeModuleAccess = (
  employeeId: string,
  module: string
): boolean => {
  const employee = employees.find((emp) => emp.id === employeeId);
  if (!employee) return false;

  const moduleIndex = employee.moduleAccess.indexOf(module);
  if (moduleIndex > -1) {
    employee.moduleAccess.splice(moduleIndex, 1);
    employee.updatedAt = new Date().toISOString();
  }
  return true;
};

export const setEmployeeModuleAccess = (
  employeeId: string,
  modules: string[]
): boolean => {
  const employee = employees.find((emp) => emp.id === employeeId);
  if (!employee) return false;

  employee.moduleAccess = modules;
  employee.updatedAt = new Date().toISOString();
  return true;
};

// =============================================================================
// EMPLOYEE STATISTICS
// =============================================================================

export const getEmployeeStats = (companyId?: string) => {
  const targetEmployees = companyId
    ? employees.filter((emp) => emp.companyId === companyId)
    : employees;

  const activeEmployees = targetEmployees.filter((emp) => emp.isActive);
  const inactiveEmployees = targetEmployees.filter((emp) => !emp.isActive);

  // Department breakdown
  const departmentStats = targetEmployees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Module access breakdown
  const moduleStats = targetEmployees.reduce((acc, emp) => {
    emp.moduleAccess.forEach((module) => {
      acc[module] = (acc[module] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    total: targetEmployees.length,
    active: activeEmployees.length,
    inactive: inactiveEmployees.length,
    byDepartment: departmentStats,
    byModuleAccess: moduleStats,
  };
};

export const getDepartmentStats = (companyId: string) => {
  const companyEmployees = employees.filter(
    (emp) => emp.companyId === companyId
  );

  return companyEmployees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        total: 0,
        active: 0,
        positions: {},
      };
    }

    acc[emp.department].total++;
    if (emp.isActive) acc[emp.department].active++;

    // Position breakdown within department
    acc[emp.department].positions[emp.position] =
      (acc[emp.department].positions[emp.position] || 0) + 1;

    return acc;
  }, {} as Record<string, { total: number; active: number; positions: Record<string, number> }>);
};

// =============================================================================
// EMPLOYEE MANAGEMENT FUNCTIONS
// =============================================================================

export const createEmployee = (
  employeeData: Omit<EmployeeTable, "id" | "createdAt" | "updatedAt">,
  userData: Omit<UserTable, "id" | "role" | "createdAt" | "updatedAt">
): { employee: EmployeeTable; user: UserTable } | null => {
  // Create user first
  const newUser: UserTable = {
    ...userData,
    id: `user-employee-${Date.now()}`,
    role: UserRole.EMPLOYEE,
    companyId: employeeData.companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create employee
  const newEmployee: EmployeeTable = {
    ...employeeData,
    id: `emp-${Date.now()}`,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to arrays
  users.push(newUser);
  employees.push(newEmployee);

  return { employee: newEmployee, user: newUser };
};

export const updateEmployee = (id: string, updates: Partial<EmployeeTable>) => {
  const employeeIndex = employees.findIndex((emp) => emp.id === id);
  if (employeeIndex === -1) return null;

  employees[employeeIndex] = {
    ...employees[employeeIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return employees[employeeIndex];
};

export const deleteEmployee = (id: string) => {
  const employeeIndex = employees.findIndex((emp) => emp.id === id);
  if (employeeIndex === -1) return false;

  const employee = employees[employeeIndex];

  // Also deactivate the user
  const userIndex = users.findIndex((u) => u.id === employee.userId);
  if (userIndex > -1) {
    users[userIndex].isActive = false;
    users[userIndex].updatedAt = new Date().toISOString();
  }

  // Remove employee
  employees.splice(employeeIndex, 1);
  return true;
};

export const deactivateEmployee = (id: string) => {
  const employee = employees.find((emp) => emp.id === id);
  if (!employee) return false;

  employee.isActive = false;
  employee.updatedAt = new Date().toISOString();

  // Also deactivate the user
  const user = users.find((u) => u.id === employee.userId);
  if (user) {
    user.isActive = false;
    user.updatedAt = new Date().toISOString();
  }

  return true;
};

export const reactivateEmployee = (id: string) => {
  const employee = employees.find((emp) => emp.id === id);
  if (!employee) return false;

  employee.isActive = true;
  employee.updatedAt = new Date().toISOString();

  // Also reactivate the user
  const user = users.find((u) => u.id === employee.userId);
  if (user) {
    user.isActive = true;
    user.updatedAt = new Date().toISOString();
  }

  return true;
};
