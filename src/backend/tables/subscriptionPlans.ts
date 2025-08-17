export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  isActive: boolean;
  maxEmployees: number;
  maxCompanies?: number; // For superadmin plans
  features: string[]; // Module codes like "pos", "sales", etc.
  additionalFeatures: string[];
  limitations: {
    maxTransactionsPerMonth?: number;
    maxStorageGB?: number;
    maxUsers?: number;
    customIntegrations?: boolean;
    prioritySupport?: boolean;
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
    additionalFeatures: [
      "Basic POS system",
      "Customer management",
      "Basic inventory tracking",
      "Standard support",
    ],
    limitations: {
      maxTransactionsPerMonth: 1000,
      maxStorageGB: 5,
      maxUsers: 5,
      customIntegrations: false,
      prioritySupport: false,
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
    additionalFeatures: [
      "Advanced POS system",
      "Sales & purchasing management",
      "Complete inventory management",
      "HR & employee management",
      "Financial reporting",
      "Priority support",
    ],
    limitations: {
      maxTransactionsPerMonth: 10000,
      maxStorageGB: 50,
      maxUsers: 25,
      customIntegrations: true,
      prioritySupport: true,
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "plan-enterprise",
    name: "enterprise",
    displayName: "Enterprise Plan",
    description: "Complete solution for large organizations",
    price: 5000000, // IDR 5,000,000
    billingCycle: "monthly",
    isActive: true,
    maxEmployees: 100,
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
    additionalFeatures: [
      "All Premium features",
      "Advanced promotions management",
      "Vehicle fleet management",
      "Salesman performance tracking",
      "Advanced analytics & reporting",
      "24/7 premium support",
      "Custom integrations",
      "White-label options",
    ],
    limitations: {
      maxTransactionsPerMonth: 100000,
      maxStorageGB: 500,
      maxUsers: 100,
      customIntegrations: true,
      prioritySupport: true,
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
    additionalFeatures: [
      "All Basic features",
      "2 months free (yearly billing)",
      "Basic POS system",
      "Customer management",
      "Basic inventory tracking",
      "Standard support",
    ],
    limitations: {
      maxTransactionsPerMonth: 1000,
      maxStorageGB: 5,
      maxUsers: 5,
      customIntegrations: false,
      prioritySupport: false,
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
    additionalFeatures: [
      "All Premium features",
      "2 months free (yearly billing)",
      "Advanced POS system",
      "Sales & purchasing management",
      "Complete inventory management",
      "HR & employee management",
      "Financial reporting",
      "Priority support",
    ],
    limitations: {
      maxTransactionsPerMonth: 10000,
      maxStorageGB: 50,
      maxUsers: 25,
      customIntegrations: true,
      prioritySupport: true,
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
