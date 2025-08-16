import { UserRole, CompanyStatus, PaymentStatus, ERPModule } from './enums.js';

// Mock authentication data
export const mockAuth = {
  superadmin: {
    id: 1,
    email: 'admin@erpindo.com',
    password: 'admin123',
    role: UserRole.SUPERADMIN,
    name: 'Super Administrator'
  },
  companyOwner: {
    id: 2,
    email: 'owner@company1.com', 
    password: 'owner123',
    role: UserRole.COMPANY_OWNER,
    name: 'John Doe',
    companyId: 1
  },
  employee: {
    id: 3,
    email: 'employee@company1.com',
    password: 'emp123', 
    role: UserRole.EMPLOYEE,
    name: 'Jane Smith',
    companyId: 1,
    permissions: [ERPModule.POS, ERPModule.INVENTORY]
  }
};


// Mock companies data for superadmin
export const mockCompanies = [
  {
    id: 1,
    name: 'PT Maju Jaya',
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    registrationDate: '2024-01-15',
    monthlyRevenue: 15000000,
    employeeCount: 25
  },
  {
    id: 2, 
    name: 'CV Berkah Sejahtera',
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PENDING,
    registrationDate: '2024-02-20',
    monthlyRevenue: 8500000,
    employeeCount: 12
  },
  {
    id: 3,
    name: 'UD Sumber Rezeki',
    status: CompanyStatus.INACTIVE,
    paymentStatus: PaymentStatus.OVERDUE,
    registrationDate: '2023-12-10',
    monthlyRevenue: 0,
    employeeCount: 8
  }
];


// Mock dashboard stats
export const mockSuperadminStats = {
  totalCompanies: 15,
  activeCompanies: 12,
  pendingPayments: 3,
  monthlyRevenue: 125000000
};

export const mockCompanyOwnerStats = {
  totalEmployees: 25,
  activeModules: 7,
  todaySales: 2500000,
  lowStock: 5
};

export const mockEmployeeStats = {
  todaySales: 850000,
  transactionCount: 23,
  averageTransaction: 36956,
  topProduct: 'Laptop ASUS'
};