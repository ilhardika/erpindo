import { UserRole, AuthStatus, CompanyStatus, PaymentStatus } from './enums';

// Authentication and user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
}

// Company types
export interface Company {
  id: string;
  name: string;
  owner: string;
  email: string;
  status: CompanyStatus;
  paymentStatus: PaymentStatus;
  employeeCount: number;
  registrationDate: string;
  lastPaymentDate?: string;
  subscriptionEndDate?: string;
}

// Employee types
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  modules: string[];
  isActive: boolean;
  joinDate: string;
  companyId: string;
}

// Dashboard props
export interface DashboardProps {
  user: User;
}

export interface SuperadminDashboardData {
  companies: Company[];
  totalRevenue: number;
  activeCompanies: number;
  totalUsers: number;
}

export interface CompanyOwnerDashboardData {
  company: Company;
  employees: Employee[];
  moduleUsage: Record<string, number>;
  recentActivities: string[];
}

export interface EmployeeDashboardData {
  employee: Employee;
  availableModules: string[];
  recentTasks: string[];
  notifications: string[];
}