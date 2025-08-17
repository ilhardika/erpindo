import { UserTable } from "../tables/users";
import { UserRole } from "../tables/enums";

// Users data - contains all system users (superadmin, owners, employees)
export const usersData: UserTable[] = [
  // Superadmin
  {
    id: "user-superadmin-1",
    email: "superadmin@erpindo.com",
    password: "super123",
    name: "Super Administrator",
    role: UserRole.SUPERADMIN,
    phone: "+62 21 1111 0000",
    position: "System Administrator",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },

  // Company Owners
  {
    id: "user-owner-1",
    email: "owner@teknologimaju.com",
    password: "owner123",
    name: "John Doe",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-1",
    phone: "+62 21 1234 5678",
    position: "CEO",
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "user-owner-2",
    email: "owner@dagangsukses.com",
    password: "owner123",
    name: "Jane Smith",
    role: UserRole.COMPANY_OWNER,
    companyId: "company-2",
    phone: "+62 31 9876 5432",
    position: "Managing Director",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },

  // Employees (sample data - there would be many more in a real system)
  {
    id: "user-employee-1",
    email: "kasir@teknologimaju.com",
    password: "emp123",
    name: "Ahmad Rahman",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 812 3456 789",
    position: "Kasir",
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-03-01T00:00:00.000Z",
  },
  {
    id: "user-employee-2",
    email: "gudang@teknologimaju.com",
    password: "emp123",
    name: "Siti Nurhaliza",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 813 5678 901",
    position: "Staff Gudang",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-03-15T00:00:00.000Z",
  },
  {
    id: "user-employee-3",
    email: "supervisor@teknologimaju.com",
    password: "emp123",
    name: "Budi Santoso",
    role: UserRole.EMPLOYEE,
    companyId: "company-1",
    phone: "+62 814 7890 123",
    position: "Supervisor Penjualan",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-02-20T00:00:00.000Z",
  },
];
