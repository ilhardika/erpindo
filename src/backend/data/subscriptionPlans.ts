import { SubscriptionPlan } from "../tables/subscriptionPlans";

// Subscription Plans data - all available plans
export const subscriptionPlansData: SubscriptionPlan[] = [
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
];
