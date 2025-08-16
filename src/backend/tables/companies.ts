import { CompanyStatus, PaymentStatus } from "../types/enums";

export interface CompanyTable {
  id: string;
  name: string;
  ownerId: string; // Foreign key to users table
  email: string; // Company contact email
  phone?: string;
  address?: string;
  businessType: string; // retail, manufacturing, service, etc.
  status: CompanyStatus;
  paymentStatus: PaymentStatus;
  employeeCount: number; // This could be calculated from employees table
  subscriptionPlan: "basic" | "premium" | "enterprise";
  monthlyFee: number;
  registrationDate: string;
  lastPaymentDate?: string;
  subscriptionEndDate?: string;
  features: string[]; // enabled features
  createdAt: string;
  updatedAt: string;
}

// Companies table - contains all registered companies
export const companies: CompanyTable[] = [
  {
    id: "company-1",
    name: "PT. Teknologi Maju",
    ownerId: "user-owner-1",
    email: "owner@teknologimaju.com",
    phone: "+62 21 1234 5678",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    businessType: "Technology Services",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 15,
    subscriptionPlan: "premium",
    monthlyFee: 2500000,
    registrationDate: "2024-01-15T00:00:00.000Z",
    lastPaymentDate: "2024-12-01T00:00:00.000Z",
    subscriptionEndDate: "2025-01-15T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "company-2",
    name: "CV. Dagang Sukses Mandiri",
    ownerId: "user-owner-2",
    email: "owner@dagangsukses.com",
    phone: "+62 31 9876 5432",
    address: "Jl. Raya Darmo No. 456, Surabaya",
    businessType: "Trading & Distribution",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 8,
    subscriptionPlan: "basic",
    monthlyFee: 1500000,
    registrationDate: "2024-02-20T00:00:00.000Z",
    lastPaymentDate: "2024-12-15T00:00:00.000Z",
    subscriptionEndDate: "2025-02-20T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers"],
    createdAt: "2024-02-20T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "company-3",
    name: "PT. Retail Nusantara",
    ownerId: "user-owner-3",
    email: "owner@retailnusantara.com",
    phone: "+62 22 2468 1357",
    address: "Jl. Asia Afrika No. 789, Bandung",
    businessType: "Retail Chain",
    status: CompanyStatus.SUSPENDED,
    paymentStatus: PaymentStatus.OVERDUE,
    employeeCount: 12,
    subscriptionPlan: "premium",
    monthlyFee: 2500000,
    registrationDate: "2024-03-10T00:00:00.000Z",
    lastPaymentDate: "2024-09-15T00:00:00.000Z",
    subscriptionEndDate: "2024-10-15T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "promotions"],
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2024-09-15T00:00:00.000Z",
  },
  {
    id: "company-4",
    name: "CV. Mandiri Jaya Elektronik",
    ownerId: "user-owner-4",
    email: "owner@mandirijaya.com",
    phone: "+62 274 3691 2580",
    address: "Jl. Malioboro No. 321, Yogyakarta",
    businessType: "Electronics Retail",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.UNPAID,
    employeeCount: 6,
    subscriptionPlan: "basic",
    monthlyFee: 1500000,
    registrationDate: "2024-04-05T00:00:00.000Z",
    lastPaymentDate: "2024-11-05T00:00:00.000Z",
    subscriptionEndDate: "2025-04-05T00:00:00.000Z",
    features: ["pos", "sales", "inventory"],
    createdAt: "2024-04-05T00:00:00.000Z",
    updatedAt: "2024-11-05T00:00:00.000Z",
  },
  {
    id: "company-5",
    name: "PT. Berkah Food & Beverage",
    ownerId: "user-owner-5",
    email: "owner@berkahfnb.com",
    phone: "+62 21 7531 9642",
    address: "Jl. Kemang Raya No. 654, Jakarta Selatan",
    businessType: "Food & Beverage",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 22,
    subscriptionPlan: "enterprise",
    monthlyFee: 5000000,
    registrationDate: "2024-05-12T00:00:00.000Z",
    lastPaymentDate: "2024-12-01T00:00:00.000Z",
    subscriptionEndDate: "2025-05-12T00:00:00.000Z",
    features: [
      "pos",
      "sales",
      "inventory",
      "customers",
      "promotions",
      "hr",
      "finance",
      "vehicles",
    ],
    createdAt: "2024-05-12T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "company-6",
    name: "CV. Cahaya Motor",
    ownerId: "user-owner-6",
    email: "owner@cahayamotor.com",
    phone: "+62 31 8520 7410",
    address: "Jl. Ahmad Yani No. 987, Surabaya",
    businessType: "Automotive Sales & Service",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 10,
    subscriptionPlan: "premium",
    monthlyFee: 2500000,
    registrationDate: "2024-06-18T00:00:00.000Z",
    lastPaymentDate: "2024-12-18T00:00:00.000Z",
    subscriptionEndDate: "2025-06-18T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "vehicles", "finance"],
    createdAt: "2024-06-18T00:00:00.000Z",
    updatedAt: "2024-12-18T00:00:00.000Z",
  },
  {
    id: "company-7",
    name: "PT. Fashion Trend Indonesia",
    ownerId: "user-owner-7",
    email: "owner@fashiontrend.com",
    phone: "+62 21 4567 8901",
    address: "Jl. Thamrin No. 111, Jakarta Pusat",
    businessType: "Fashion & Apparel",
    status: CompanyStatus.INACTIVE,
    paymentStatus: PaymentStatus.UNPAID,
    employeeCount: 4,
    subscriptionPlan: "basic",
    monthlyFee: 1500000,
    registrationDate: "2024-07-22T00:00:00.000Z",
    lastPaymentDate: "2024-10-22T00:00:00.000Z",
    subscriptionEndDate: "2024-11-22T00:00:00.000Z",
    features: ["pos", "sales", "inventory"],
    createdAt: "2024-07-22T00:00:00.000Z",
    updatedAt: "2024-10-22T00:00:00.000Z",
  },
  {
    id: "company-8",
    name: "CV. Agro Makmur Sejahtera",
    ownerId: "user-owner-8",
    email: "owner@agromakmur.com",
    phone: "+62 341 9876 5432",
    address: "Jl. Ijen No. 222, Malang",
    businessType: "Agriculture & Farming",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 18,
    subscriptionPlan: "premium",
    monthlyFee: 2500000,
    registrationDate: "2024-08-30T00:00:00.000Z",
    lastPaymentDate: "2024-11-30T00:00:00.000Z",
    subscriptionEndDate: "2025-08-30T00:00:00.000Z",
    features: ["sales", "inventory", "customers", "finance", "vehicles"],
    createdAt: "2024-08-30T00:00:00.000Z",
    updatedAt: "2024-11-30T00:00:00.000Z",
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

export const getCompaniesByBusinessType = (
  businessType: string
): CompanyTable[] => {
  return companies.filter((company) =>
    company.businessType.toLowerCase().includes(businessType.toLowerCase())
  );
};

export const getCompaniesBySubscriptionPlan = (
  plan: string
): CompanyTable[] => {
  return companies.filter((company) => company.subscriptionPlan === plan);
};

export const getAllCompanies = (): CompanyTable[] => {
  return companies;
};

// Statistics helpers
export const getCompanyStatistics = () => ({
  totalCompanies: companies.length,
  activeCompanies: companies.filter((c) => c.status === CompanyStatus.ACTIVE)
    .length,
  suspendedCompanies: companies.filter(
    (c) => c.status === CompanyStatus.SUSPENDED
  ).length,
  inactiveCompanies: companies.filter(
    (c) => c.status === CompanyStatus.INACTIVE
  ).length,
  paidCompanies: companies.filter((c) => c.paymentStatus === PaymentStatus.PAID)
    .length,
  unpaidCompanies: companies.filter(
    (c) => c.paymentStatus === PaymentStatus.UNPAID
  ).length,
  overdueCompanies: companies.filter(
    (c) => c.paymentStatus === PaymentStatus.OVERDUE
  ).length,
  totalMonthlyRevenue: companies
    .filter((c) => c.paymentStatus === PaymentStatus.PAID)
    .reduce((sum, c) => sum + c.monthlyFee, 0),
  totalEmployees: companies.reduce((sum, c) => sum + c.employeeCount, 0),
  businessTypes: [...new Set(companies.map((c) => c.businessType))],
  subscriptionPlans: {
    basic: companies.filter((c) => c.subscriptionPlan === "basic").length,
    premium: companies.filter((c) => c.subscriptionPlan === "premium").length,
    enterprise: companies.filter((c) => c.subscriptionPlan === "enterprise")
      .length,
  },
});
