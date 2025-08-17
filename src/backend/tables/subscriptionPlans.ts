import { subscriptionPlansData } from "../data/subscriptionPlans";

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  isActive: boolean;
  maxEmployees: number; // -1 = unlimited
  maxCompanies?: number; // For superadmin plans
  features: string[]; // Module codes like "pos", "sales", etc.
  limitations: {
    maxTransactionsPerMonth: number; // -1 = unlimited
    maxStorageGB: number; // -1 = unlimited
  };
  createdAt: string;
  updatedAt: string;
}

// Export subscription plans data
export const subscriptionPlans = subscriptionPlansData;

// Helper functions
export const getActivePlans = () =>
  subscriptionPlans.filter((plan) => plan.isActive);

export const getPlanById = (id: string) =>
  subscriptionPlans.find((plan) => plan.id === id);

export const getPlansByBillingCycle = (cycle: "monthly" | "yearly") =>
  subscriptionPlans.filter((plan) => plan.billingCycle === cycle);

export const getPlansByFeature = (feature: string) =>
  subscriptionPlans.filter((plan) => plan.features.includes(feature));

// Helper function to format limitations display
export const formatLimitation = (value: number, unit?: string): string => {
  if (value === -1) return "Unlimited";
  return unit ? `${value} ${unit}` : value.toLocaleString();
};

// Helper function to check if plan has feature
export const planHasFeature = (
  plan: SubscriptionPlan,
  feature: string
): boolean => {
  return plan.features.includes(feature);
};
