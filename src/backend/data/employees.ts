import { EmployeeTable } from "../tables/employees";

// Employees data - HR & Job-specific information only
// All employees must have corresponding User record for authentication
export const employeesData: EmployeeTable[] = [
  // Company 1 employees
  {
    id: "emp-1",
    userId: "user-employee-1",
    companyId: "company-1",
    employeeNumber: "TM-EMP-001",
    position: "Kasir",
    department: "Operations",
    moduleAccess: ["pos", "customers"],
    joinDate: "2024-03-01",
    salary: 4000000,
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "emp-2",
    userId: "user-employee-2",
    companyId: "company-1",
    employeeNumber: "TM-EMP-002",
    position: "Staff Gudang",
    department: "Warehouse",
    moduleAccess: ["inventory", "products"],
    joinDate: "2024-03-15",
    salary: 4500000,
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "emp-3",
    userId: "user-employee-3",
    companyId: "company-1",
    employeeNumber: "TM-EMP-003",
    position: "Supervisor Penjualan",
    department: "Sales",
    moduleAccess: ["pos", "sales", "customers", "inventory"],
    joinDate: "2024-02-20",
    salary: 6000000,
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "emp-4",
    userId: "user-employee-4",
    companyId: "company-1",
    employeeNumber: "TM-EMP-004",
    position: "Staff Keuangan",
    department: "Finance",
    moduleAccess: ["finance"],
    joinDate: "2024-01-10",
    salary: 5500000,
    isActive: false, // Employee non-aktif, tapi account masih ada
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },

  // Company 2 employees
  {
    id: "emp-5",
    userId: "user-employee-5",
    companyId: "company-2",
    employeeNumber: "DS-EMP-001",
    position: "Kasir",
    department: "Operations",
    moduleAccess: ["pos", "sales"],
    joinDate: "2024-02-25",
    salary: 3800000,
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-02-25T00:00:00.000Z",
  },
];
