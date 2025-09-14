/**
 * Updated Role-Based Access Control (RBAC) Configuration
 * Based on detailed ERP System (SaaS) specifications
 * Date: 2025-09-14
 */

import type { UserRole } from '../types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ModulePermission {
  id: string;
  name: string;
  icon: string;
  path: string;
  description: string;
  roles: UserRole[];
  category: 'system' | 'company' | 'erp';
  isActive?: boolean;
}

export interface RoleInfo {
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES: Record<UserRole, RoleInfo> = {
  dev: {
    name: 'Dev (System Owner)',
    description: 'System Owner/App Provider - Akses penuh sistem dan kelola semua perusahaan',
    color: 'red',
    permissions: [
      'Subscription Plan Management - Create, update, delete plans',
      'Company Management - Add/manage registered companies', 
      'Global User Management - View all registered users',
      'System Monitoring - View subscription/payment status'
    ]
  },
  owner: {
    name: 'Owner (Company Owner)', 
    description: 'Company Owner - Akses penuh untuk bisnis mereka sendiri',
    color: 'blue',
    permissions: [
      'Subscription & Billing - View/manage subscription plan',
      'Employee Management - Add/remove employee accounts', 
      'Company Data & Reporting - View company-wide reports',
      'Module Access Control - Grant feature access to employees'
    ]
  },
  staff: {
    name: 'Staff (Employee)',
    description: 'Employee - Akses terbatas sesuai permissions dari Owner',
    color: 'green', 
    permissions: [
      'Module Access - Access assigned ERP modules only',
      'No Subscription Access - Cannot manage subscription',
      'No Employee Management - Cannot manage other employees',
      'Limited Reporting - View only assigned reports'
    ]
  }
} as const;

// ============================================================================
// MODULE PERMISSIONS
// ============================================================================

export const MODULES: ModulePermission[] = [
  // ========================================================================
  // SYSTEM MANAGEMENT (Dev Only)
  // ========================================================================
  {
    id: 'subscription-plans',
    name: 'Subscription Plans',
    icon: 'CreditCard',
    path: '/admin/subscription-plans',
    description: 'Create, update, delete subscription plans with pricing and features',
    roles: ['dev'],
    category: 'system',
  },
  {
    id: 'company-management',
    name: 'Company Management',
    icon: 'Building2',
    path: '/admin/companies',
    description: 'Add/manage registered companies, activate/deactivate accounts',
    roles: ['dev'],
    category: 'system',
  },
  {
    id: 'global-users',
    name: 'Global User Management',
    icon: 'Users',
    path: '/admin/global-users',
    description: 'View all registered users (owners and staff) across companies',
    roles: ['dev'],
    category: 'system',
  },
  {
    id: 'system-monitoring',
    name: 'System Monitoring',
    icon: 'Settings',
    path: '/admin/monitoring',
    description: 'View subscription status, usage analytics, system health',
    roles: ['dev'],
    category: 'system',
  },

  // ========================================================================
  // COMPANY MANAGEMENT (Owner Only)
  // ========================================================================
  {
    id: 'subscription-billing',
    name: 'Subscription & Billing',
    icon: 'CreditCard',
    path: '/subscription',
    description: 'View/manage subscription plan, payments, and billing history',
    roles: ['owner'],
    category: 'company',
  },
  {
    id: 'employee-management',
    name: 'Employee Management',
    icon: 'UserCheck',
    path: '/employees',
    description: 'Add/remove employees, assign roles and module access',
    roles: ['owner'],
    category: 'company',
  },
  {
    id: 'company-reports',
    name: 'Company Reports',
    icon: 'FileText',
    path: '/reports/company',
    description: 'View company-wide reports (sales, inventory, finance)',
    roles: ['owner'],
    category: 'company',
  },

  // ========================================================================
  // ERP MODULES (Role-Based Access)
  // ========================================================================
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    description: 'Main dashboard with role-based content',
    roles: ['dev', 'owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'pos-cashier',
    name: 'POS (Cashier)',
    icon: 'ShoppingCart',
    path: '/pos',
    description: 'Point of Sale - Add items, apply discounts, process payments, generate invoices',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'sales-purchasing',
    name: 'Sales & Purchasing',
    icon: 'ShoppingBag',
    path: '/sales',
    description: 'Create Sales Orders, Purchase requests, Receive goods, Generate invoices',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'products-management',
    name: 'Products Management',
    icon: 'Package',
    path: '/products',
    description: 'Manage product catalog, pricing, stock levels (T036-T040)',
    roles: ['owner', 'dev', 'staff'],
    category: 'erp',
  },
  {
    id: 'inventory-warehouse',
    name: 'Inventory/Warehouse',
    icon: 'Warehouse',
    path: '/inventory',
    description: 'Manage products, stock levels, transfers, stock opname',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'customers-suppliers',
    name: 'Customers & Suppliers',
    icon: 'Users',
    path: '/customers-suppliers',
    description: 'Manage customer segmentation, supplier details, purchase history',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'promotions',
    name: 'Promotions',
    icon: 'Gift',
    path: '/promotions',
    description: 'Create tiered discounts, bundling promotions, set promotion terms',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'hr-employee',
    name: 'HR/Employee Management',
    icon: 'UsersRound',
    path: '/hr',
    description: 'Employee records, manual attendance, salary slips',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'Calculator',
    path: '/finance',
    description: 'Cash in/out transactions, journal entries, financial reports',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: 'Truck',
    path: '/vehicles',
    description: 'Manage vehicles, license plates, assign to delivery/sales tasks',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
  {
    id: 'salesman',
    name: 'Salesman',
    icon: 'UserCheck',
    path: '/salesman',
    description: 'Track commissions, view top products sold, top recurring customers',
    roles: ['owner', 'staff'],
    category: 'erp',
  },
];

// ============================================================================
// ACTION PERMISSIONS
// ============================================================================

export const ACTIONS: Record<string, UserRole[]> = {
  // ========================================================================
  // SYSTEM ACTIONS (Dev Only)
  // ========================================================================
  'system:create-subscription-plan': ['dev'],
  'system:update-subscription-plan': ['dev'],
  'system:delete-subscription-plan': ['dev'],
  'system:manage-company': ['dev'],
  'system:activate-company': ['dev'],
  'system:deactivate-company': ['dev'],
  'system:view-global-users': ['dev'],
  'system:view-system-analytics': ['dev'],

  // ========================================================================
  // COMPANY ACTIONS (Owner Only)
  // ========================================================================
  'company:view-subscription': ['owner'],
  'company:manage-subscription': ['owner'],
  'company:view-billing-history': ['owner'],
  'company:upgrade-plan': ['owner'],
  'company:downgrade-plan': ['owner'],
  'company:add-employee': ['owner'],
  'company:remove-employee': ['owner'],
  'company:assign-employee-role': ['owner'],
  'company:grant-module-access': ['owner'],
  'company:view-company-reports': ['owner'],

  // ========================================================================
  // ERP MODULE ACTIONS (Role-Based)
  // ========================================================================
  
  // POS Actions
  'pos:add-items-to-cart': ['owner', 'staff'],
  'pos:apply-discount': ['owner', 'staff'],
  'pos:process-payment': ['owner', 'staff'],
  'pos:generate-invoice': ['owner', 'staff'],
  'pos:process-refund': ['owner', 'staff'],
  'pos:open-close-shift': ['owner', 'staff'],

  // Products Management Actions (T036-T040)
  'products:view': ['owner', 'dev', 'staff'],
  'products:create': ['owner', 'dev'],
  'products:edit': ['owner', 'dev'],
  'products:delete': ['owner', 'dev'],
  'products:manage-stock': ['owner', 'dev'],

  // Sales & Purchasing Actions
  'sales:create-sales-order': ['owner', 'staff'],
  'sales:create-purchase-request': ['owner', 'staff'],
  'sales:approve-purchase': ['owner'], // Owner approval required
  'sales:receive-goods': ['owner', 'staff'],
  'sales:generate-receipt': ['owner', 'staff'],
  'sales:view-sales-analysis': ['owner', 'staff'],

  // Inventory Actions
  'inventory:manage-products': ['owner', 'staff'],
  'inventory:manage-stock-levels': ['owner', 'staff'],
  'inventory:inter-location-transfer': ['owner', 'staff'],
  'inventory:stock-opname': ['owner', 'staff'],
  'inventory:view-stock-mutation': ['owner', 'staff'],

  // Customer & Supplier Actions
  'customers:manage-segmentation': ['owner', 'staff'],
  'customers:add-edit-details': ['owner', 'staff'],
  'customers:view-purchase-history': ['owner', 'staff'],
  'suppliers:add-edit-details': ['owner', 'staff'],
  'suppliers:view-payment-history': ['owner', 'staff'],

  // Promotion Actions
  'promotions:create-discount': ['owner', 'staff'],
  'promotions:create-bundling': ['owner', 'staff'],
  'promotions:set-duration': ['owner', 'staff'],
  'promotions:manage-terms': ['owner', 'staff'],

  // HR Actions
  'hr:create-employee-record': ['owner', 'staff'],
  'hr:update-employee-record': ['owner', 'staff'],
  'hr:submit-attendance': ['owner', 'staff'],
  'hr:generate-salary-slip': ['owner', 'staff'],

  // Finance Actions
  'finance:record-cash-transaction': ['owner', 'staff'],
  'finance:create-journal-entry': ['owner', 'staff'],
  'finance:view-general-ledger': ['owner', 'staff'],
  'finance:generate-financial-reports': ['owner', 'staff'],

  // Vehicle Actions
  'vehicles:manage-vehicles': ['owner', 'staff'],
  'vehicles:assign-to-delivery': ['owner', 'staff'],
  'vehicles:assign-to-sales': ['owner', 'staff'],

  // Salesman Actions
  'salesman:track-commission': ['owner', 'staff'],
  'salesman:view-top-products': ['owner', 'staff'],
  'salesman:view-top-customers': ['owner', 'staff'],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get modules accessible by a specific role
 */
export function getModulesByRole(role: UserRole): ModulePermission[] {
  return MODULES.filter(module => 
    module.roles.includes(role) && (module.isActive !== false)
  );
}

/**
 * Get modules by category and role
 */
export function getModulesByCategory(role: UserRole, category: 'system' | 'company' | 'erp'): ModulePermission[] {
  return MODULES.filter(module => 
    module.category === category && 
    module.roles.includes(role) && 
    (module.isActive !== false)
  );
}

/**
 * Check if a role has access to a specific module
 */
export function hasModuleAccess(role: UserRole, moduleId: string): boolean {
  const module = MODULES.find(m => m.id === moduleId);
  return module ? module.roles.includes(role) : false;
}

/**
 * Check if a role has permission for a specific action
 */
export function hasActionPermission(role: UserRole, action: string): boolean {
  const allowedRoles = ACTIONS[action];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

/**
 * Get role information
 */
export function getRoleInfo(role: UserRole): RoleInfo {
  return ROLES[role];
}

/**
 * Get structured navigation for sidebar based on role
 */
export function getNavigationStructure(role: UserRole) {
  const accessibleModules = getModulesByRole(role);
  
  const structure = [
    {
      title: 'System Management',
      items: getModulesByCategory(role, 'system'),
      visible: role === 'dev'
    },
    {
      title: 'Company Management', 
      items: getModulesByCategory(role, 'company'),
      visible: role === 'owner'
    },
    {
      title: 'ERP Modules',
      items: getModulesByCategory(role, 'erp'),
      visible: true
    }
  ].filter(section => section.visible && section.items.length > 0);

  return {
    structure,
    totalModules: accessibleModules.length,
    roleInfo: getRoleInfo(role)
  };
}

// Export default configuration
export default {
  ROLES,
  MODULES,
  ACTIONS,
  getModulesByRole,
  getModulesByCategory,
  hasModuleAccess,
  hasActionPermission,
  getRoleInfo,
  getNavigationStructure
};