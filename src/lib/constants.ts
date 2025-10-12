// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ERPindo'
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

// User Roles
export const USER_ROLES = {
  DEV: 'dev',
  OWNER: 'owner',
  STAFF: 'staff',
} as const

// Module Categories
export const MODULE_CATEGORIES = {
  SYSTEM: 'system',
  COMPANY: 'company',
  ERP: 'erp',
} as const

// Route Paths
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',

  // Dashboard
  DASHBOARD: '/dashboard',

  // System (Dev only)
  SYSTEM: {
    BASE: '/dashboard/system',
    SUBSCRIPTION_PLANS: '/dashboard/system/subscription-plans',
    COMPANIES: '/dashboard/system/companies',
    GLOBAL_USERS: '/dashboard/system/global-users',
    MONITORING: '/dashboard/system/monitoring',
  },

  // Company (Owner only)
  COMPANY: {
    BASE: '/dashboard/company',
    BILLING: '/dashboard/company/billing',
    EMPLOYEES: '/dashboard/company/employees',
    REPORTS: '/dashboard/company/reports',
  },

  // ERP (Staff)
  ERP: {
    BASE: '/dashboard/erp',
    DASHBOARD: '/dashboard/erp/dashboard',
    POS: '/dashboard/erp/pos',
    SALES: '/dashboard/erp/sales',
    INVENTORY: '/dashboard/erp/inventory',
    CONTACTS: '/dashboard/erp/contacts',
    PROMOTIONS: '/dashboard/erp/promotions',
    HR: '/dashboard/erp/hr',
    FINANCE: '/dashboard/erp/finance',
    VEHICLES: '/dashboard/erp/vehicles',
    SALESMAN: '/dashboard/erp/salesman',
  },
} as const

// Default Modules Data
export const DEFAULT_MODULES = [
  // System modules (dev only)
  {
    name: 'Subscription Plan Management',
    slug: 'subscription-plans',
    category: 'system',
    icon: 'CreditCard',
    route_path: '/dashboard/system/subscription-plans',
    sort_order: 1,
  },
  {
    name: 'Company Management',
    slug: 'companies',
    category: 'system',
    icon: 'Building2',
    route_path: '/dashboard/system/companies',
    sort_order: 2,
  },
  {
    name: 'Global User Management',
    slug: 'global-users',
    category: 'system',
    icon: 'Users',
    route_path: '/dashboard/system/global-users',
    sort_order: 3,
  },
  {
    name: 'System Monitoring',
    slug: 'monitoring',
    category: 'system',
    icon: 'Activity',
    route_path: '/dashboard/system/monitoring',
    sort_order: 4,
  },

  // Company modules (owner only)
  {
    name: 'Subscription & Billing',
    slug: 'billing',
    category: 'company',
    icon: 'Receipt',
    route_path: '/dashboard/company/billing',
    sort_order: 1,
  },
  {
    name: 'Employee Management',
    slug: 'employees',
    category: 'company',
    icon: 'UserPlus',
    route_path: '/dashboard/company/employees',
    sort_order: 2,
  },
  {
    name: 'Company Data & Reporting',
    slug: 'reports',
    category: 'company',
    icon: 'BarChart3',
    route_path: '/dashboard/company/reports',
    sort_order: 3,
  },

  // ERP modules (staff)
  {
    name: 'Dashboard',
    slug: 'dashboard',
    category: 'erp',
    icon: 'LayoutDashboard',
    route_path: '/dashboard/erp/dashboard',
    sort_order: 1,
  },
  {
    name: 'POS (Cashier)',
    slug: 'pos',
    category: 'erp',
    icon: 'ShoppingCart',
    route_path: '/dashboard/erp/pos',
    sort_order: 2,
  },
  {
    name: 'Sales & Purchasing',
    slug: 'sales',
    category: 'erp',
    icon: 'TrendingUp',
    route_path: '/dashboard/erp/sales',
    sort_order: 3,
  },
  {
    name: 'Inventory/Warehouse',
    slug: 'inventory',
    category: 'erp',
    icon: 'Package',
    route_path: '/dashboard/erp/inventory',
    sort_order: 4,
  },
  {
    name: 'Customers & Suppliers',
    slug: 'contacts',
    category: 'erp',
    icon: 'Users2',
    route_path: '/dashboard/erp/contacts',
    sort_order: 5,
  },
  {
    name: 'Promotions',
    slug: 'promotions',
    category: 'erp',
    icon: 'Tag',
    route_path: '/dashboard/erp/promotions',
    sort_order: 6,
  },
  {
    name: 'HR/Employee Management',
    slug: 'hr',
    category: 'erp',
    icon: 'UserCheck',
    route_path: '/dashboard/erp/hr',
    sort_order: 7,
  },
  {
    name: 'Finance',
    slug: 'finance',
    category: 'erp',
    icon: 'DollarSign',
    route_path: '/dashboard/erp/finance',
    sort_order: 8,
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    category: 'erp',
    icon: 'Truck',
    route_path: '/dashboard/erp/vehicles',
    sort_order: 9,
  },
  {
    name: 'Salesman',
    slug: 'salesman',
    category: 'erp',
    icon: 'UserCog',
    route_path: '/dashboard/erp/salesman',
    sort_order: 10,
  },
] as const
