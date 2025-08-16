import { UserRole } from "../types/enums";

export interface UserTable {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  role: UserRole;
  companyId?: string; // Foreign key to companies table
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Users table - contains all system users (superadmin, owners, employees)
export const users: UserTable[] = [
  {
    id: "user-superadmin-1",
    email: "superadmin@erpindo.com",
    password: "super123",
    name: "Super Administrator",
    role: UserRole.SUPERADMIN,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "user-owner-1",
    email: "owner@company1.com",
    password: "owner123",
    name: "John Doe",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "user-owner-2",
    email: "owner@company2.com",
    password: "owner123",
    name: "Maria Santos",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-2",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "user-owner-3",
    email: "owner@company3.com",
    password: "owner123",
    name: "Budi Santoso",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-3",
    isActive: false,
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-03-10T00:00:00.000Z",
  },
  {
    id: "user-owner-4",
    email: "owner@company4.com",
    password: "owner123",
    name: "Siti Nurhaliza",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-4",
    isActive: false,
    createdAt: "2024-04-05T00:00:00.000Z",
    updatedAt: "2024-04-05T00:00:00.000Z",
  },
  {
    id: "user-employee-1",
    email: "employee@company1.com",
    password: "emp123",
    name: "Jane Smith",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "user-employee-2",
    email: "ahmad@company1.com",
    password: "emp123",
    name: "Ahmad Rahman",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "user-employee-3",
    email: "dewi@company1.com",
    password: "emp123",
    name: "Dewi Sartika",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "user-employee-4",
    email: "rudi@company1.com",
    password: "emp123",
    name: "Rudi Hartono",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    isActive: false,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: "user-employee-5",
    email: "lisa@company1.com",
    password: "emp123",
    name: "Lisa Permata",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    isActive: true,
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: "2024-04-01T00:00:00.000Z",
  },
];

// Helper functions to simulate database operations
export const getUserById = (id: string): UserTable | undefined => {
  return users.find((user) => user.id === id);
};

export const getUserByEmail = (email: string): UserTable | undefined => {
  return users.find((user) => user.email === email);
};

export const getUsersByCompanyId = (companyId: string): UserTable[] => {
  return users.filter((user) => user.companyId === companyId);
};

export const getUsersByRole = (role: UserRole): UserTable[] => {
  return users.filter((user) => user.role === role);
};
