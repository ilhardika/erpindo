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

// Additional helper functions for plan management
export const getCompaniesByPlan = (planId: string) => {
  return companies.filter((company) => company.subscriptionPlanId === planId);
};

export const getCompaniesWithLimitIssues = () => {
  const { getPlanById } = require("./subscriptionPlans");

  return companies
    .map((company) => {
      const plan = getPlanById(company.subscriptionPlanId);
      if (!plan) return null;

      // Check if company is approaching or exceeding limits
      const employeeRatio = company.employeeCount / plan.maxEmployees;
      const transactionRatio =
        company.currentTransactionsThisMonth /
        plan.limitations.maxTransactionsPerMonth;
      const storageRatio =
        company.currentStorageUsedGB / plan.limitations.maxStorageGB;

      const hasIssues =
        employeeRatio > 0.9 || transactionRatio > 0.9 || storageRatio > 0.9;

      if (!hasIssues) return null;

      return {
        companyId: company.id,
        companyName: company.name,
        planName: plan.name,
        limits: {
          employees: {
            current: company.employeeCount,
            limit: plan.maxEmployees,
            limitText:
              plan.maxEmployees === -1
                ? "Unlimited"
                : plan.maxEmployees.toString(),
            withinLimit: employeeRatio <= 1,
          },
          transactions: {
            current: company.currentTransactionsThisMonth,
            limit: plan.limitations.maxTransactionsPerMonth,
            limitText:
              plan.limitations.maxTransactionsPerMonth === -1
                ? "Unlimited"
                : plan.limitations.maxTransactionsPerMonth.toString(),
            withinLimit: transactionRatio <= 1,
          },
          storage: {
            current: company.currentStorageUsedGB,
            limit: plan.limitations.maxStorageGB,
            limitText:
              plan.limitations.maxStorageGB === -1
                ? "Unlimited"
                : `${plan.limitations.maxStorageGB} GB`,
            withinLimit: storageRatio <= 1,
          },
        },
      };
    })
    .filter((result) => result !== null);
};

export const getSubscriptionPlanStats = () => {
  const stats = getSubscriptionStats();
  const { getPlanById } = require("./subscriptionPlans");

  // Convert stats object to array format expected by UI
  const planIds = ["plan-basic", "plan-premium", "plan-enterprise"];

  return planIds.map((planId) => {
    const plan = getPlanById(planId);
    const planCompanies = companies.filter(
      (c) => c.subscriptionPlanId === planId
    );
    const monthlyRevenue = planCompanies
      .filter((c) => c.paymentStatus === PaymentStatus.PAID)
      .reduce((total, company) => total + company.monthlyFee, 0);

    return {
      planId,
      planName: plan?.name || planId,
      totalCompanies: planCompanies.length,
      activeCompanies: planCompanies.filter(
        (c) => c.status === CompanyStatus.ACTIVE
      ).length,
      monthlyRevenue,
      yearlyProjection: monthlyRevenue * 12,
      averageEmployeesPerCompany:
        planCompanies.length > 0
          ? Math.round(
              planCompanies.reduce((sum, c) => sum + c.employeeCount, 0) /
                planCompanies.length
            )
          : 0,
      planPrice: plan?.monthlyPrice || 0,
      billingCycle: "monthly",
      isActive: true,
    };
  });
};

// New function with UI-compatible format for company limits
export const getCompanyLimitsForUI = (companyId: string) => {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  const { getPlanById } = require("./subscriptionPlans");
  const plan = getPlanById(company.subscriptionPlanId);

  if (!plan)
    return {
      limits: {
        employees: {
          current: 0,
          limit: 0,
          limitText: "No plan",
          withinLimit: false,
        },
        transactions: {
          current: 0,
          limit: 0,
          limitText: "No plan",
          withinLimit: false,
        },
        storage: {
          current: 0,
          limit: 0,
          limitText: "No plan",
          withinLimit: false,
        },
      },
    };

  return {
    limits: {
      employees: {
        current: company.employeeCount,
        limit: plan.maxEmployees,
        limitText:
          plan.maxEmployees === -1 ? "Unlimited" : plan.maxEmployees.toString(),
        withinLimit:
          company.employeeCount <= plan.maxEmployees ||
          plan.maxEmployees === -1,
      },
      transactions: {
        current: company.currentTransactionsThisMonth,
        limit: plan.limitations.maxTransactionsPerMonth,
        limitText:
          plan.limitations.maxTransactionsPerMonth === -1
            ? "Unlimited"
            : plan.limitations.maxTransactionsPerMonth.toString(),
        withinLimit:
          company.currentTransactionsThisMonth <=
            plan.limitations.maxTransactionsPerMonth ||
          plan.limitations.maxTransactionsPerMonth === -1,
      },
      storage: {
        current: company.currentStorageUsedGB,
        limit: plan.limitations.maxStorageGB,
        limitText:
          plan.limitations.maxStorageGB === -1
            ? "Unlimited"
            : `${plan.limitations.maxStorageGB} GB`,
        withinLimit:
          company.currentStorageUsedGB <= plan.limitations.maxStorageGB ||
          plan.limitations.maxStorageGB === -1,
      },
    },
  };
};

// Get company with subscription plan details
export const getCompanySubscriptionPlan = (companyId: string) => {
  const company = companies.find((c) => c.id === companyId);
  if (!company) return null;

  const { getPlanById } = require("./subscriptionPlans");
  const plan = getPlanById(company.subscriptionPlanId);

  return {
    ...company,
    subscriptionPlan: plan,
  };
};
