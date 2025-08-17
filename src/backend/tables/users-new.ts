import { UserRole } from "../types/enums";
import { usersData } from "../data/users";

export interface UserTable {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  role: UserRole;
  companyId?: string; // Foreign key to companies table
  isActive: boolean;
  phone?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

// Export users data
export const users = usersData;

// Query functions
export const query = {
  users: {
    findById: (id: string) => users.find((user) => user.id === id),
    findByEmail: (email: string) => users.find((user) => user.email === email),
    findByRole: (role: UserRole) => users.filter((user) => user.role === role),
    findByCompanyId: (companyId: string) =>
      users.filter((user) => user.companyId === companyId),
    findActiveUsers: () => users.filter((user) => user.isActive),
    findSuperadmins: () =>
      users.filter((user) => user.role === UserRole.SUPERADMIN),
    findCompanyOwners: () =>
      users.filter((user) => user.role === UserRole.COMPANY_OWNER),
    findEmployees: () =>
      users.filter((user) => user.role === UserRole.EMPLOYEE),
  },
};

// Helper functions
export const authenticateUser = (email: string, password: string) => {
  return users.find(
    (user) =>
      user.email === email && user.password === password && user.isActive
  );
};

export const getUsersByCompany = (companyId: string) => {
  return users.filter((user) => user.companyId === companyId && user.isActive);
};

export const createUser = (
  userData: Omit<UserTable, "id" | "createdAt" | "updatedAt">
) => {
  const newUser: UserTable = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<UserTable>) => {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return users[userIndex];
};

export const deleteUser = (id: string) => {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  return true;
};
