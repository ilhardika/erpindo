import { CompanyStatus, PaymentStatus } from "./enums";
import { companiesData } from "../data/companies";

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

// Export companies data
export const companies = companiesData;

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
