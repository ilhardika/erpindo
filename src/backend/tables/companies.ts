import { CompanyStatus, PaymentStatus } from "../types/enums";

export interface CompanyTable {
  id: string;
  name: string;
  ownerId: string; // Foreign key to users table
  email: string; // Company contact email
  status: CompanyStatus;
  paymentStatus: PaymentStatus;
  employeeCount: number; // This could be calculated from employees table
  registrationDate: string;
  lastPaymentDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Companies table - contains all registered companies
export const companies: CompanyTable[] = [
  {
    id: "company-1",
    name: "PT. Teknologi Maju",
    ownerId: "user-owner-1",
    email: "owner@company1.com",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 5, // Will be calculated from employees table
    registrationDate: "2024-01-15T00:00:00.000Z",
    lastPaymentDate: "2024-12-01T00:00:00.000Z",
    subscriptionEndDate: "2025-01-01T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "company-2",
    name: "CV. Dagang Sukses",
    ownerId: "user-owner-2",
    email: "owner@company2.com",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.UNPAID,
    employeeCount: 0,
    registrationDate: "2024-02-20T00:00:00.000Z",
    lastPaymentDate: "2024-11-01T00:00:00.000Z",
    subscriptionEndDate: "2024-12-20T00:00:00.000Z",
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-11-01T00:00:00.000Z",
  },
  {
    id: "company-3",
    name: "PT. Retail Nusantara",
    ownerId: "user-owner-3",
    email: "owner@company3.com",
    status: CompanyStatus.SUSPENDED,
    paymentStatus: PaymentStatus.OVERDUE,
    employeeCount: 0,
    registrationDate: "2024-03-10T00:00:00.000Z",
    lastPaymentDate: "2024-09-15T00:00:00.000Z",
    subscriptionEndDate: "2024-10-15T00:00:00.000Z",
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-09-15T00:00:00.000Z",
  },
  {
    id: "company-4",
    name: "CV. Mandiri Jaya",
    ownerId: "user-owner-4",
    email: "owner@company4.com",
    status: CompanyStatus.INACTIVE,
    paymentStatus: PaymentStatus.UNPAID,
    employeeCount: 0,
    registrationDate: "2024-04-05T00:00:00.000Z",
    subscriptionEndDate: "2024-11-05T00:00:00.000Z",
    createdAt: "2024-04-05T00:00:00.000Z",
    updatedAt: "2024-04-05T00:00:00.000Z",
  },
];

// Helper functions to simulate database operations
export const getCompanyById = (id: string): CompanyTable | undefined => {
  return companies.find((company) => company.id === id);
};

export const getCompaniesByOwnerId = (ownerId: string): CompanyTable[] => {
  return companies.filter((company) => company.ownerId === ownerId);
};

export const getCompaniesByStatus = (status: CompanyStatus): CompanyTable[] => {
  return companies.filter((company) => company.status === status);
};

export const getCompaniesByPaymentStatus = (
  paymentStatus: PaymentStatus
): CompanyTable[] => {
  return companies.filter((company) => company.paymentStatus === paymentStatus);
};

export const getAllCompanies = (): CompanyTable[] => {
  return companies;
};
