export interface EmployeeTable {
  id: string;
  userId: string; // Foreign key to users table
  companyId: string; // Foreign key to companies table
  position: string;
  department: string;
  joinDate: string;
  salary?: number; // Optional salary information
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Employees table - contains employee-specific information
// Note: Basic user info (name, email) comes from users table via userId
export const employees: EmployeeTable[] = [
  {
    id: "emp-1",
    userId: "user-employee-1",
    companyId: "company-1",
    position: "Kasir",
    department: "Penjualan",
    joinDate: "2024-03-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "emp-2",
    userId: "user-employee-2",
    companyId: "company-1",
    position: "Staff Gudang",
    department: "Operasional",
    joinDate: "2024-03-15T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "emp-3",
    userId: "user-employee-3",
    companyId: "company-1",
    position: "Supervisor Penjualan",
    department: "Penjualan",
    joinDate: "2024-02-20T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "emp-4",
    userId: "user-employee-4",
    companyId: "company-1",
    position: "Staff Keuangan",
    department: "Keuangan",
    joinDate: "2024-01-10T00:00:00.000Z",
    isActive: false,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "emp-5",
    userId: "user-employee-5",
    companyId: "company-1",
    position: "HR Specialist",
    department: "SDM",
    joinDate: "2024-04-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: "2024-04-01T00:00:00.000Z",
  },
];

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
