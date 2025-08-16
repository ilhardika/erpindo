// Role types for the ERP system
export const UserRole = {
  SUPERADMIN: 'superadmin',
  COMPANY_OWNER: 'company_owner', 
  EMPLOYEE: 'employee'
};

// Company status
export const CompanyStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Payment status
export const PaymentStatus = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue'
};

// ERP Module types
export const ERPModule = {
  POS: 'pos',
  SALES_PURCHASING: 'sales_purchasing',
  INVENTORY: 'inventory',
  CUSTOMERS_SUPPLIERS: 'customers_suppliers',
  PROMOTIONS: 'promotions',
  HR: 'hr',
  FINANCE: 'finance',
  VEHICLES: 'vehicles',
  SALESMAN: 'salesman'
};