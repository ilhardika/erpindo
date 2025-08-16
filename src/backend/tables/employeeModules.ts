export interface EmployeeModuleTable {
  id: string;
  employeeId: string; // Foreign key to employees table
  moduleCode: string; // Foreign key to modules table (using code for simplicity)
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  assignedAt: string;
  assignedBy: string; // userId who assigned this module
  createdAt: string;
  updatedAt: string;
}

// Employee-Module junction table - many-to-many relationship
// This table defines which modules each employee can access and their permissions
export const employeeModules: EmployeeModuleTable[] = [
  // Jane Smith (emp-1) - Kasir
  {
    id: "emp-mod-1",
    employeeId: "emp-1",
    moduleCode: "pos",
    canRead: true,
    canWrite: true,
    canDelete: false,
    assignedAt: "2024-03-01T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "emp-mod-2",
    employeeId: "emp-1",
    moduleCode: "sales",
    canRead: true,
    canWrite: true,
    canDelete: false,
    assignedAt: "2024-03-01T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },

  // Ahmad Rahman (emp-2) - Staff Gudang
  {
    id: "emp-mod-3",
    employeeId: "emp-2",
    moduleCode: "inventory",
    canRead: true,
    canWrite: true,
    canDelete: true,
    assignedAt: "2024-03-15T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "emp-mod-4",
    employeeId: "emp-2",
    moduleCode: "sales",
    canRead: true,
    canWrite: false,
    canDelete: false,
    assignedAt: "2024-03-15T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },

  // Dewi Sartika (emp-3) - Supervisor Penjualan
  {
    id: "emp-mod-5",
    employeeId: "emp-3",
    moduleCode: "sales",
    canRead: true,
    canWrite: true,
    canDelete: true,
    assignedAt: "2024-02-20T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "emp-mod-6",
    employeeId: "emp-3",
    moduleCode: "customers",
    canRead: true,
    canWrite: true,
    canDelete: false,
    assignedAt: "2024-02-20T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "emp-mod-7",
    employeeId: "emp-3",
    moduleCode: "promotions",
    canRead: true,
    canWrite: true,
    canDelete: false,
    assignedAt: "2024-02-20T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },

  // Rudi Hartono (emp-4) - Staff Keuangan (inactive)
  {
    id: "emp-mod-8",
    employeeId: "emp-4",
    moduleCode: "finance",
    canRead: true,
    canWrite: true,
    canDelete: false,
    assignedAt: "2024-01-10T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },

  // Lisa Permata (emp-5) - HR Specialist
  {
    id: "emp-mod-9",
    employeeId: "emp-5",
    moduleCode: "hr",
    canRead: true,
    canWrite: true,
    canDelete: true,
    assignedAt: "2024-04-01T00:00:00.000Z",
    assignedBy: "user-owner-1",
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: "2024-04-01T00:00:00.000Z",
  },
];

// Helper functions to simulate database operations
export const getEmployeeModulesByEmployeeId = (
  employeeId: string
): EmployeeModuleTable[] => {
  return employeeModules.filter((em) => em.employeeId === employeeId);
};

export const getEmployeeModulesByModuleCode = (
  moduleCode: string
): EmployeeModuleTable[] => {
  return employeeModules.filter((em) => em.moduleCode === moduleCode);
};

export const getEmployeeModulePermission = (
  employeeId: string,
  moduleCode: string
): EmployeeModuleTable | undefined => {
  return employeeModules.find(
    (em) => em.employeeId === employeeId && em.moduleCode === moduleCode
  );
};

export const hasModuleAccess = (
  employeeId: string,
  moduleCode: string
): boolean => {
  const permission = getEmployeeModulePermission(employeeId, moduleCode);
  return permission !== undefined;
};

export const canWriteModule = (
  employeeId: string,
  moduleCode: string
): boolean => {
  const permission = getEmployeeModulePermission(employeeId, moduleCode);
  return permission?.canWrite ?? false;
};

export const canDeleteModule = (
  employeeId: string,
  moduleCode: string
): boolean => {
  const permission = getEmployeeModulePermission(employeeId, moduleCode);
  return permission?.canDelete ?? false;
};
