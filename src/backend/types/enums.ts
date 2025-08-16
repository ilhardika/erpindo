// User roles for the ERP system
export enum UserRole {
  SUPERADMIN = 'superadmin',
  COMPANY_OWNER = 'company_owner',
  EMPLOYEE = 'employee'
}

// Authentication status
export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Company status for superadmin view
export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Payment status for companies
export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue'
}