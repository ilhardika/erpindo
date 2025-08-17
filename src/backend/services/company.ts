import { companies, CompanyTable } from "../tables/companies";
import {
  subscriptionPlans,
  SubscriptionPlan,
} from "../tables/subscriptionPlans";
import { CompanyStatus, PaymentStatus } from "../types/enums";

/**
 * Company Service - handles all company and subscription related business logic
 */

// =============================================================================
// BASIC QUERIES
// =============================================================================

export const companyQuery = {
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

// =============================================================================
// COMPANY STATISTICS
// =============================================================================

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

// =============================================================================
// SUBSCRIPTION INTEGRATION FUNCTIONS
// =============================================================================

export const checkCompanyWithinLimits = (companyId: string) => {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  const plan = subscriptionPlans.find(
    (p) => p.id === company.subscriptionPlanId
  );
  if (!plan) return null;

  const transactionsWarning =
    plan.limitations.maxTransactionsPerMonth !== -1 &&
    company.currentTransactionsThisMonth /
      plan.limitations.maxTransactionsPerMonth >
      0.8;

  const storageWarning =
    plan.limitations.maxStorageGB !== -1 &&
    company.currentStorageUsedGB / plan.limitations.maxStorageGB > 0.8;

  const employeeWarning =
    plan.maxEmployees !== -1 && company.employeeCount / plan.maxEmployees > 0.8;

  return {
    companyId,
    companyName: company.name,
    planName: plan.displayName,
    limits: {
      transactions: {
        current: company.currentTransactionsThisMonth,
        max: plan.limitations.maxTransactionsPerMonth,
        isUnlimited: plan.limitations.maxTransactionsPerMonth === -1,
        warningThreshold: transactionsWarning,
        percentage:
          plan.limitations.maxTransactionsPerMonth !== -1
            ? (company.currentTransactionsThisMonth /
                plan.limitations.maxTransactionsPerMonth) *
              100
            : 0,
      },
      storage: {
        current: company.currentStorageUsedGB,
        max: plan.limitations.maxStorageGB,
        isUnlimited: plan.limitations.maxStorageGB === -1,
        warningThreshold: storageWarning,
        percentage:
          plan.limitations.maxStorageGB !== -1
            ? (company.currentStorageUsedGB / plan.limitations.maxStorageGB) *
              100
            : 0,
      },
      employees: {
        current: company.employeeCount,
        max: plan.maxEmployees,
        isUnlimited: plan.maxEmployees === -1,
        warningThreshold: employeeWarning,
        percentage:
          plan.maxEmployees !== -1
            ? (company.employeeCount / plan.maxEmployees) * 100
            : 0,
      },
    },
    hasWarnings: transactionsWarning || storageWarning || employeeWarning,
  };
};

export const getCompaniesWithLimitIssues = (threshold = 0.8) => {
  return companies
    .map((company) => checkCompanyWithinLimits(company.id))
    .filter((result) => result?.hasWarnings);
};

export const getCompaniesUsingPlan = (planId: string) => {
  return companies.filter((company) => company.subscriptionPlanId === planId);
};

export const getRevenueByPlan = () => {
  const paidCompanies = companies.filter(
    (c) => c.paymentStatus === PaymentStatus.PAID
  );

  return {
    basic: paidCompanies
      .filter((c) => c.subscriptionPlanId === "plan-basic")
      .reduce((total, c) => total + c.monthlyFee, 0),
    premium: paidCompanies
      .filter((c) => c.subscriptionPlanId === "plan-premium")
      .reduce((total, c) => total + c.monthlyFee, 0),
    enterprise: paidCompanies
      .filter((c) => c.subscriptionPlanId === "plan-enterprise")
      .reduce((total, c) => total + c.monthlyFee, 0),
  };
};

export const getPlanUsageStats = (planId: string) => {
  const plan = subscriptionPlans.find((p) => p.id === planId);
  if (!plan) return null;

  const companiesUsingPlan = getCompaniesUsingPlan(planId);
  const activeCompanies = companiesUsingPlan.filter(
    (c) => c.status === CompanyStatus.ACTIVE
  );
  const paidCompanies = companiesUsingPlan.filter(
    (c) => c.paymentStatus === PaymentStatus.PAID
  );

  const revenue = paidCompanies.reduce((total, c) => total + c.monthlyFee, 0);

  const companiesWithIssues = companiesUsingPlan
    .map((c) => checkCompanyWithinLimits(c.id))
    .filter((result) => result?.hasWarnings);

  return {
    planId,
    planName: plan.displayName,
    totalCompanies: companiesUsingPlan.length,
    activeCompanies: activeCompanies.length,
    paidCompanies: paidCompanies.length,
    monthlyRevenue: revenue,
    yearlyRevenue: revenue * 12,
    companiesWithLimitIssues: companiesWithIssues.length,
    averageEmployeesPerCompany:
      companiesUsingPlan.length > 0
        ? companiesUsingPlan.reduce((total, c) => total + c.employeeCount, 0) /
          companiesUsingPlan.length
        : 0,
    companies: companiesUsingPlan.map((company) => ({
      id: company.id,
      name: company.name,
      status: company.status,
      paymentStatus: company.paymentStatus,
      employeeCount: company.employeeCount,
      businessType: company.businessType,
      registrationDate: company.registrationDate,
      limitStatus: checkCompanyWithinLimits(company.id),
    })),
  };
};

// =============================================================================
// COMPANY MANAGEMENT FUNCTIONS
// =============================================================================

export const createCompany = (
  companyData: Omit<CompanyTable, "id" | "createdAt" | "updatedAt">
) => {
  // In a real app, this would create a new company in the database
  const newCompany: CompanyTable = {
    ...companyData,
    id: `company-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  companies.push(newCompany);
  return newCompany;
};

export const updateCompany = (id: string, updates: Partial<CompanyTable>) => {
  const companyIndex = companies.findIndex((c) => c.id === id);
  if (companyIndex === -1) return null;

  companies[companyIndex] = {
    ...companies[companyIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return companies[companyIndex];
};

export const deleteCompany = (id: string) => {
  const companyIndex = companies.findIndex((c) => c.id === id);
  if (companyIndex === -1) return false;

  companies.splice(companyIndex, 1);
  return true;
};
