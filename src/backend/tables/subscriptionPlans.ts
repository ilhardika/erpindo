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

// Subscription Plans table - manages all available plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan-basic",
    name: "basic",
    displayName: "Basic Plan",
    description: "Perfect for small businesses just getting started",
    price: 500000, // IDR 500,000
    billingCycle: "monthly",
    isActive: true,
    maxEmployees: 5,
    features: ["pos", "customers", "inventory"],
    limitations: {
      maxTransactionsPerMonth: 1000,
      maxStorageGB: 5,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "plan-premium",
    name: "premium",
    displayName: "Premium Plan",
    description: "Advanced features for growing businesses",
    price: 2500000, // IDR 2,500,000
    billingCycle: "monthly",
    isActive: true,
    maxEmployees: 25,
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    limitations: {
      maxTransactionsPerMonth: 10000,
      maxStorageGB: 50,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "plan-enterprise",
    name: "enterprise",
    displayName: "Enterprise Plan",
    description:
      "Complete solution for large organizations with unlimited access",
    price: 5000000, // IDR 5,000,000
    billingCycle: "monthly",
    isActive: true,
    maxEmployees: -1, // Unlimited
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
    limitations: {
      maxTransactionsPerMonth: -1, // Unlimited
      maxStorageGB: -1, // Unlimited
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "plan-basic-yearly",
    name: "basic",
    displayName: "Basic Plan (Yearly)",
    description: "Perfect for small businesses - Save 20% with yearly billing",
    price: 4800000, // IDR 4,800,000 (20% discount from 6,000,000)
    billingCycle: "yearly",
    isActive: true,
    maxEmployees: 5,
    features: ["pos", "customers", "inventory"],
    limitations: {
      maxTransactionsPerMonth: 1000,
      maxStorageGB: 5,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "plan-premium-yearly",
    name: "premium",
    displayName: "Premium Plan (Yearly)",
    description: "Advanced features for growing businesses - Save 20% yearly",
    price: 24000000, // IDR 24,000,000 (20% discount from 30,000,000)
    billingCycle: "yearly",
    isActive: true,
    maxEmployees: 25,
    features: ["pos", "sales", "inventory", "customers", "hr", "finance"],
    limitations: {
      maxTransactionsPerMonth: 10000,
      maxStorageGB: 50,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

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
export const formatLimitation = (value: number): string => {
  if (value === -1) return "Unlimited";
  return value.toLocaleString();
};

// Helper function to check if plan has feature
export const planHasFeature = (
  plan: SubscriptionPlan,
  feature: string
): boolean => {
  return plan.features.includes(feature);
};
