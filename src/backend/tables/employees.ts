import { employeesData } from "../data/employees";

export interface EmployeeTable {
  id: string;
  userId: string; // Foreign key to users table
  companyId: string; // Foreign key to companies table
  employeeNumber?: string; // Optional employee ID (e.g., "TM-EMP-001")
  position: string;
  department: string;
  moduleAccess: string[]; // Array of module codes that employee can access
  joinDate: string;
  salary?: number; // Optional salary information
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Export employees data
export const employees = employeesData;

// Helper functions to simulate database operations
export const getEmployeeById = (id: string): EmployeeTable | undefined => {
  return employees.find((employee) => employee.id === id);
};

export const getEmployeeByUserId = (
  userId: string
): EmployeeTable | undefined => {
  return employees.find((employee) => employee.userId === userId);
};

export const getEmployeesByCompanyId = (companyId: string): EmployeeTable[] => {
  return employees.filter((employee) => employee.companyId === companyId);
};

export const getActiveEmployeesByCompanyId = (
  companyId: string
): EmployeeTable[] => {
  return employees.filter(
    (employee) => employee.companyId === companyId && employee.isActive
  );
};

export const getEmployeesByDepartment = (
  companyId: string,
  department: string
): EmployeeTable[] => {
  return employees.filter(
    (employee) =>
      employee.companyId === companyId && employee.department === department
  );
};
