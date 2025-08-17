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
  subscriptionPlanId: string; // Foreign key to subscriptionPlans table
  monthlyFee: number; // Calculated from subscription plan price
  registrationDate: string;
  lastPaymentDate?: string;
  subscriptionEndDate?: string;
  subscriptionStartDate?: string;
  billingCycle: "monthly" | "yearly"; // From subscription plan
  features: string[]; // enabled features from subscription plan
  // Usage tracking for limitations
  currentTransactionsThisMonth: number;
  currentStorageUsedGB: number;
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
    subscriptionPlanId: "plan-premium",
    monthlyFee: 2500000,
    billingCycle: "monthly",
    registrationDate: "2024-01-15T00:00:00.000Z",
    lastPaymentDate: "2024-12-01T00:00:00.000Z",
    subscriptionStartDate: "2024-01-15T00:00:00.000Z",
    subscriptionEndDate: "2025-01-15T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    currentTransactionsThisMonth: 450,
    currentStorageUsedGB: 12,
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
    subscriptionPlanId: "plan-basic",
    monthlyFee: 500000,
    billingCycle: "monthly",
    registrationDate: "2024-02-20T00:00:00.000Z",
    lastPaymentDate: "2024-12-15T00:00:00.000Z",
    subscriptionStartDate: "2024-02-20T00:00:00.000Z",
    subscriptionEndDate: "2025-02-20T00:00:00.000Z",
    features: ["pos", "customers", "inventory"],
    currentTransactionsThisMonth: 180,
    currentStorageUsedGB: 2,
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
    subscriptionPlanId: "plan-premium",
    monthlyFee: 2500000,
    billingCycle: "monthly",
    registrationDate: "2024-03-10T00:00:00.000Z",
    lastPaymentDate: "2024-09-15T00:00:00.000Z",
    subscriptionStartDate: "2024-03-10T00:00:00.000Z",
    subscriptionEndDate: "2024-10-15T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "promotions"],
    currentTransactionsThisMonth: 850,
    currentStorageUsedGB: 28,
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
    subscriptionPlanId: "plan-basic",
    monthlyFee: 500000,
    billingCycle: "monthly",
    registrationDate: "2024-04-05T00:00:00.000Z",
    lastPaymentDate: "2024-11-05T00:00:00.000Z",
    subscriptionStartDate: "2024-04-05T00:00:00.000Z",
    subscriptionEndDate: "2025-04-05T00:00:00.000Z",
    features: ["pos", "customers", "inventory"],
    currentTransactionsThisMonth: 90,
    currentStorageUsedGB: 1,
    createdAt: "2024-04-05T00:00:00.000Z",
    updatedAt: "2024-11-05T00:00:00.000Z",
  },
  {
    id: "company-5",
    name: "PT. Global Enterprise Solutions",
    ownerId: "user-owner-5",
    email: "owner@globalenterprises.com",
    phone: "+62 21 8765 4321",
    address: "Jl. Thamrin No. 999, Jakarta Pusat",
    businessType: "IT Consulting",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 45,
    subscriptionPlanId: "plan-enterprise",
    monthlyFee: 5000000,
    billingCycle: "monthly",
    registrationDate: "2024-05-12T00:00:00.000Z",
    lastPaymentDate: "2024-12-10T00:00:00.000Z",
    subscriptionStartDate: "2024-05-12T00:00:00.000Z",
    subscriptionEndDate: "2025-05-12T00:00:00.000Z",
    features: [
      "pos",
      "sales",
      "inventory",
      "customers",
      "hr",
      "finance",
      "promotions",
      "vehicles",
      "salesman",
    ],
    currentTransactionsThisMonth: 2500,
    currentStorageUsedGB: 120,
    createdAt: "2024-05-12T00:00:00.000Z",
    updatedAt: "2024-12-10T00:00:00.000Z",
  },
  {
    id: "company-6",
    name: "CV. Fashion Boutique Cantik",
    ownerId: "user-owner-6",
    email: "owner@fashioncantik.com",
    phone: "+62 31 5555 7777",
    address: "Jl. Pemuda No. 88, Surabaya",
    businessType: "Fashion Retail",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 12,
    subscriptionPlanId: "plan-premium",
    monthlyFee: 2500000,
    billingCycle: "monthly",
    registrationDate: "2024-06-18T00:00:00.000Z",
    lastPaymentDate: "2024-12-18T00:00:00.000Z",
    subscriptionStartDate: "2024-06-18T00:00:00.000Z",
    subscriptionEndDate: "2025-06-18T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    currentTransactionsThisMonth: 680,
    currentStorageUsedGB: 15,
    createdAt: "2024-06-18T00:00:00.000Z",
    updatedAt: "2024-12-18T00:00:00.000Z",
  },
  {
    id: "company-7",
    name: "UD. Warung Makan Sederhana",
    ownerId: "user-owner-7",
    email: "owner@warungsederhana.com",
    phone: "+62 274 1111 2222",
    address: "Jl. Kaliurang No. 45, Yogyakarta",
    businessType: "Food & Beverage",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 4,
    subscriptionPlanId: "plan-basic",
    monthlyFee: 500000,
    billingCycle: "monthly",
    registrationDate: "2024-07-25T00:00:00.000Z",
    lastPaymentDate: "2024-12-25T00:00:00.000Z",
    subscriptionStartDate: "2024-07-25T00:00:00.000Z",
    subscriptionEndDate: "2025-07-25T00:00:00.000Z",
    features: ["pos", "customers", "inventory"],
    currentTransactionsThisMonth: 320,
    currentStorageUsedGB: 1,
    createdAt: "2024-07-25T00:00:00.000Z",
    updatedAt: "2024-12-25T00:00:00.000Z",
  },
  {
    id: "company-8",
    name: "PT. Manufaktur Industri Prima",
    ownerId: "user-owner-8",
    email: "owner@manufakturprima.com",
    phone: "+62 22 9999 8888",
    address: "Jl. Industri No. 567, Bandung",
    businessType: "Manufacturing",
    status: CompanyStatus.ACTIVE,
    paymentStatus: PaymentStatus.PAID,
    employeeCount: 25,
    subscriptionPlanId: "plan-premium",
    monthlyFee: 2500000,
    billingCycle: "monthly",
    registrationDate: "2024-08-03T00:00:00.000Z",
    lastPaymentDate: "2024-12-03T00:00:00.000Z",
    subscriptionStartDate: "2024-08-03T00:00:00.000Z",
    subscriptionEndDate: "2025-08-03T00:00:00.000Z",
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    currentTransactionsThisMonth: 1200,
    currentStorageUsedGB: 35,
    createdAt: "2024-08-03T00:00:00.000Z",
    updatedAt: "2024-12-03T00:00:00.000Z",
  },
];

// Query functions
export const query = {
  companies: {
    findById: (id: string) => companies.find((company) => company.id === id),
    findByOwnerId: (ownerId: string) =>
      companies.find((company) => company.ownerId === ownerId),
    findByStatus: (status: CompanyStatus) =>
      companies.filter((company) => company.status === status),
    findByPaymentStatus: (paymentStatus: PaymentStatus) =>
      companies.filter((company) => company.paymentStatus === paymentStatus),
    findBySubscriptionPlan: (planId: string) =>
      companies.filter((company) => company.subscriptionPlanId === planId),
    findActiveCompanies: () =>
      companies.filter((company) => company.status === CompanyStatus.ACTIVE),
    findOverdueCompanies: () =>
      companies.filter(
        (company) => company.paymentStatus === PaymentStatus.OVERDUE
      ),
  },
};

// Helper functions
export const getCompanyStats = () => {
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(
    (c) => c.status === CompanyStatus.ACTIVE
  ).length;
  const suspendedCompanies = companies.filter(
    (c) => c.status === CompanyStatus.SUSPENDED
  ).length;
  const overdueCompanies = companies.filter(
    (c) => c.paymentStatus === PaymentStatus.OVERDUE
  ).length;

  return {
    total: totalCompanies,
    active: activeCompanies,
    suspended: suspendedCompanies,
    overdue: overdueCompanies,
    paidUp: companies.filter((c) => c.paymentStatus === PaymentStatus.PAID)
      .length,
  };
};

export const getSubscriptionStats = () => {
  return {
    basic: companies.filter((c) => c.subscriptionPlanId === "plan-basic")
      .length,
    premium: companies.filter((c) => c.subscriptionPlanId === "plan-premium")
      .length,
    enterprise: companies.filter(
      (c) => c.subscriptionPlanId === "plan-enterprise"
    ).length,
  };
};

export const getTotalRevenue = () => {
  return companies
    .filter((c) => c.paymentStatus === PaymentStatus.PAID)
    .reduce((total, company) => total + company.monthlyFee, 0);
};

// Helper function to check if company exceeds plan limits
export const checkCompanyLimits = (companyId: string) => {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  // This would integrate with subscriptionPlans table
  return {
    companyId,
    employeeLimit: company.employeeCount, // Compare with plan.maxEmployees
    transactionLimit: company.currentTransactionsThisMonth, // Compare with plan.limitations.maxTransactionsPerMonth
    storageLimit: company.currentStorageUsedGB, // Compare with plan.limitations.maxStorageGB
  };
};

// Helper function to get companies approaching limits
export const getCompaniesApproachingLimits = (threshold = 0.8) => {
  // This would need integration with subscriptionPlans to check actual limits
  return companies.filter((company) => {
    // Placeholder logic - would check against actual plan limits
    return (
      company.currentTransactionsThisMonth > 800 ||
      company.currentStorageUsedGB > 40
    );
  });
};
