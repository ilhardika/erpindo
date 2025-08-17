import { companies, CompanyTable } from "./companies";
import {
  subscriptionPlans,
  SubscriptionPlan,
  formatLimitation,
} from "./subscriptionPlans";
import { CompanyStatus } from "../types/enums";

// Integration functions between companies and subscription plans

// Get subscription plan details for a company
export const getCompanySubscriptionPlan = (
  companyId: string
): SubscriptionPlan | null => {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  return (
    subscriptionPlans.find((plan) => plan.id === company.subscriptionPlanId) ||
    null
  );
};

// Get all companies using a specific subscription plan
export const getCompaniesByPlan = (planId: string): CompanyTable[] => {
  return companies.filter((company) => company.subscriptionPlanId === planId);
};

// Check if company is within plan limits
export const checkCompanyWithinLimits = (companyId: string) => {
  const company = companies.find((c) => c.id === companyId);
  const plan = company
    ? subscriptionPlans.find((p) => p.id === company.subscriptionPlanId)
    : null;

  if (!company || !plan) {
    return null;
  }

  const employeeCheck =
    plan.maxEmployees === -1 || company.employeeCount <= plan.maxEmployees;
  const transactionCheck =
    plan.limitations.maxTransactionsPerMonth === -1 ||
    company.currentTransactionsThisMonth <=
      plan.limitations.maxTransactionsPerMonth;
  const storageCheck =
    plan.limitations.maxStorageGB === -1 ||
    company.currentStorageUsedGB <= plan.limitations.maxStorageGB;

  return {
    companyId,
    companyName: company.name,
    planName: plan.displayName,
    withinLimits: employeeCheck && transactionCheck && storageCheck,
    limits: {
      employees: {
        current: company.employeeCount,
        limit: plan.maxEmployees,
        withinLimit: employeeCheck,
        limitText: formatLimitation(plan.maxEmployees),
      },
      transactions: {
        current: company.currentTransactionsThisMonth,
        limit: plan.limitations.maxTransactionsPerMonth,
        withinLimit: transactionCheck,
        limitText: formatLimitation(plan.limitations.maxTransactionsPerMonth),
      },
      storage: {
        current: company.currentStorageUsedGB,
        limit: plan.limitations.maxStorageGB,
        withinLimit: storageCheck,
        limitText: formatLimitation(plan.limitations.maxStorageGB) + " GB",
      },
    },
  };
};

// Get companies that are approaching or exceeding limits
export const getCompaniesWithLimitIssues = (warningThreshold = 0.8) => {
  return companies
    .map((company) => {
      const limitCheck = checkCompanyWithinLimits(company.id);
      if (!limitCheck) return null;

      const isApproachingLimits =
        !limitCheck.limits.employees.withinLimit ||
        !limitCheck.limits.transactions.withinLimit ||
        !limitCheck.limits.storage.withinLimit ||
        (limitCheck.limits.employees.limit !== -1 &&
          company.employeeCount / limitCheck.limits.employees.limit >=
            warningThreshold) ||
        (limitCheck.limits.transactions.limit !== -1 &&
          company.currentTransactionsThisMonth /
            limitCheck.limits.transactions.limit >=
            warningThreshold) ||
        (limitCheck.limits.storage.limit !== -1 &&
          company.currentStorageUsedGB / limitCheck.limits.storage.limit >=
            warningThreshold);

      return isApproachingLimits ? limitCheck : null;
    })
    .filter(Boolean);
};

// Calculate total revenue by subscription plan
export const getRevenueByPlan = () => {
  const revenueByPlan: {
    [planId: string]: { planName: string; revenue: number; companies: number };
  } = {};

  companies.forEach((company) => {
    const plan = subscriptionPlans.find(
      (p) => p.id === company.subscriptionPlanId
    );
    if (!plan) return;

    if (!revenueByPlan[plan.id]) {
      revenueByPlan[plan.id] = {
        planName: plan.displayName,
        revenue: 0,
        companies: 0,
      };
    }

    revenueByPlan[plan.id].revenue += company.monthlyFee;
    revenueByPlan[plan.id].companies += 1;
  });

  return revenueByPlan;
};

// Get subscription plan usage statistics
export const getSubscriptionPlanStats = () => {
  return subscriptionPlans.map((plan) => {
    const companiesUsingPlan = companies.filter(
      (c) => c.subscriptionPlanId === plan.id
    );
    const activeCompanies = companiesUsingPlan.filter(
      (c) => c.status === CompanyStatus.ACTIVE
    );
    const totalRevenue = companiesUsingPlan.reduce(
      (sum, c) => sum + c.monthlyFee,
      0
    );

    return {
      planId: plan.id,
      planName: plan.displayName,
      planPrice: plan.price,
      billingCycle: plan.billingCycle,
      totalCompanies: companiesUsingPlan.length,
      activeCompanies: activeCompanies.length,
      monthlyRevenue: totalRevenue,
      yearlyProjection: totalRevenue * 12,
      isActive: plan.isActive,
    };
  });
};

// Helper to update company subscription plan
export const updateCompanySubscriptionPlan = (
  companyId: string,
  newPlanId: string
) => {
  const company = companies.find((c) => c.id === companyId);
  const newPlan = subscriptionPlans.find((p) => p.id === newPlanId);

  if (!company || !newPlan) {
    return { success: false, message: "Company or plan not found" };
  }

  // Update company with new plan details
  company.subscriptionPlanId = newPlanId;
  company.monthlyFee = newPlan.price;
  company.billingCycle = newPlan.billingCycle;
  company.features = [...newPlan.features];
  company.updatedAt = new Date().toISOString();

  return {
    success: true,
    message: "Subscription plan updated successfully",
    company: company,
  };
};

// Helper to check if company has specific feature
export const companyHasFeature = (
  companyId: string,
  featureCode: string
): boolean => {
  const company = companies.find((c) => c.id === companyId);
  return company ? company.features.includes(featureCode) : false;
};

// Get companies that need plan upgrades (approaching limits)
export const getCompaniesNeedingUpgrade = () => {
  return getCompaniesWithLimitIssues(0.9).filter(
    (limitCheck) => limitCheck && !limitCheck.withinLimits
  );
};
