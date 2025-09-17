/**
 * Database Type Definitions for ERP System
 * Auto-generated from Supabase migrations
 * Based on: 001_initial_system_setup.sql, 002_business_entities.sql, 003_sales_transactions.sql
 * Date: 2025-09-14
 */

// ============================================================================
// BASE TYPES & UTILITIES
// ============================================================================

export type UUID = string;
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Decimal = number; // PostgreSQL DECIMAL maps to number in TypeScript

// Common enums based on CHECK constraints
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type UserRole = 'dev' | 'owner' | 'staff';
export type CustomerType = 'regular' | 'vip' | 'wholesale';
export type EmploymentStatus = 'active' | 'inactive' | 'terminated';
export type OrderStatus = 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check';
export type MovementType = 'in' | 'out' | 'adjustment' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'inactive';
export type PromotionType = 'percentage' | 'fixed_amount' | 'buy_x_get_y';

// Base entity interface for audit fields
export interface BaseEntity {
  id: UUID;
  created_at: string;
  updated_at: string;
  created_by?: UUID | null;
}

// Multi-tenant entity interface
export interface TenantEntity extends BaseEntity {
  company_id: UUID;
}

// ============================================================================
// MAIN DATABASE INTERFACE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      // System Tables
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: SubscriptionPlanInsert;
        Update: SubscriptionPlanUpdate;
      };
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      
      // Business Entity Tables
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      suppliers: {
        Row: Supplier;
        Insert: SupplierInsert;
        Update: SupplierUpdate;
      };
      employees: {
        Row: Employee;
        Insert: EmployeeInsert;
        Update: EmployeeUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      product_categories: {
        Row: ProductCategory;
        Insert: ProductCategoryInsert;
        Update: ProductCategoryUpdate;
      };
      
      // Transaction Tables
      sales_orders: {
        Row: SalesOrder;
        Insert: SalesOrderInsert;
        Update: SalesOrderUpdate;
      };
      sales_order_items: {
        Row: SalesOrderItem;
        Insert: SalesOrderItemInsert;
        Update: SalesOrderItemUpdate;
      };
      invoices: {
        Row: Invoice;
        Insert: InvoiceInsert;
        Update: InvoiceUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      stock_movements: {
        Row: StockMovement;
        Insert: StockMovementInsert;
        Update: StockMovementUpdate;
      };
      
      // Additional Feature Tables (for future migrations)
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      promotions: {
        Row: Promotion;
        Insert: PromotionInsert;
        Update: PromotionUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ============================================================================
// ENTITY INTERFACES - SYSTEM TABLES
// ============================================================================

export interface SubscriptionPlan extends BaseEntity {
  name: string;
  description: string | null;
  price: Decimal;
  billing_cycle: BillingCycle;
  features: Json;
  max_users: number | null;
  max_companies: number | null;
  is_active: boolean;
}

export interface SubscriptionPlanInsert {
  id?: UUID;
  name: string;
  description?: string | null;
  price: Decimal;
  billing_cycle: BillingCycle;
  features?: Json;
  max_users?: number | null;
  max_companies?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlanUpdate {
  id?: UUID;
  name?: string;
  description?: string | null;
  price?: Decimal;
  billing_cycle?: BillingCycle;
  features?: Json;
  max_users?: number | null;
  max_companies?: number | null;
  is_active?: boolean;
  updated_at?: string;
}

export interface Company extends BaseEntity {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  business_type: string | null;
  logo_url: string | null;
  subscription_plan_id: UUID | null;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  next_payment_date: string | null;
  is_active: boolean;
}

export interface CompanyInsert {
  id?: UUID;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  business_type?: string | null;
  logo_url?: string | null;
  subscription_plan_id?: UUID | null;
  subscription_status?: SubscriptionStatus;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  next_payment_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface CompanyUpdate {
  id?: UUID;
  name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  business_type?: string | null;
  logo_url?: string | null;
  subscription_plan_id?: UUID | null;
  subscription_status?: SubscriptionStatus;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  next_payment_date?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  company_id: UUID | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  position: string | null;
  permissions: Json;
  is_active: boolean;
  last_login: string | null;
}

export interface UserInsert {
  id: UUID; // Required as it references auth.users(id)
  email: string;
  role: UserRole;
  company_id?: UUID | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  position?: string | null;
  permissions?: Json;
  is_active?: boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface UserUpdate {
  email?: string;
  role?: UserRole;
  company_id?: UUID | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  position?: string | null;
  permissions?: Json;
  is_active?: boolean;
  last_login?: string | null;
  updated_at?: string;
}

// ============================================================================
// ENTITY INTERFACES - BUSINESS TABLES
// ============================================================================

export interface Customer extends TenantEntity {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: CustomerType;
  tax_number: string | null;
  credit_limit: Decimal;
  payment_terms: number; // Days
  is_active: boolean;
}

export interface CustomerInsert {
  id?: UUID;
  company_id: UUID;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customer_type?: CustomerType;
  tax_number?: string | null;
  credit_limit?: Decimal;
  payment_terms?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface CustomerUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  customer_type?: CustomerType;
  tax_number?: string | null;
  credit_limit?: Decimal;
  payment_terms?: number;
  is_active?: boolean;
  updated_at?: string;
}

export interface Supplier extends TenantEntity {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  tax_number: string | null;
  payment_terms: number; // Days
  is_active: boolean;
}

export interface SupplierInsert {
  id?: UUID;
  company_id: UUID;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contact_person?: string | null;
  tax_number?: string | null;
  payment_terms?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface SupplierUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contact_person?: string | null;
  tax_number?: string | null;
  payment_terms?: number;
  is_active?: boolean;
  updated_at?: string;
}

export interface Employee extends TenantEntity {
  user_id: UUID | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null; // DATE
  salary: Decimal | null;
  employment_status: EmploymentStatus;
  is_active: boolean;
}

export interface EmployeeInsert {
  id?: UUID;
  company_id: UUID;
  user_id?: UUID | null;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  position?: string | null;
  department?: string | null;
  hire_date?: string | null;
  salary?: Decimal | null;
  employment_status?: EmploymentStatus;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface EmployeeUpdate {
  user_id?: UUID | null;
  employee_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  position?: string | null;
  department?: string | null;
  hire_date?: string | null;
  salary?: Decimal | null;
  employment_status?: EmploymentStatus;
  is_active?: boolean;
  updated_at?: string;
}

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export interface ProductCategory extends BaseEntity {
  name: string;
  description: string | null;
  color: string | null; // Hex color for UI
  user_id: UUID;
  tenant_id: UUID | null;
  is_active: boolean;
}

export interface ProductCategoryInsert {
  id?: UUID;
  name: string;
  description?: string | null;
  color?: string | null;
  user_id: UUID;
  tenant_id?: UUID | null;
  is_active?: boolean;
  created_by?: UUID | null;
}

export interface ProductCategoryUpdate {
  name?: string;
  description?: string | null;
  color?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Product extends TenantEntity {
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category: string | null; // Legacy field - deprecated
  category_id: UUID | null; // New category reference
  brand: string | null;
  unit_of_measure: string;
  cost_price: Decimal;
  selling_price: Decimal;
  stock_quantity: number;
  minimum_stock: number;
  maximum_stock: number | null;
  location: string | null; // Warehouse location
  is_active: boolean;
}

export interface ProductInsert {
  id?: UUID;
  company_id: UUID;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  category?: string | null; // Legacy field - deprecated
  category_id?: UUID | null; // New category reference
  brand?: string | null;
  unit_of_measure?: string;
  cost_price?: Decimal;
  selling_price?: Decimal;
  stock_quantity?: number;
  minimum_stock?: number;
  maximum_stock?: number | null;
  location?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface ProductUpdate {
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  category?: string | null; // Legacy field - deprecated
  category_id?: UUID | null; // New category reference
  brand?: string | null;
  unit_of_measure?: string;
  cost_price?: Decimal;
  selling_price?: Decimal;
  stock_quantity?: number;
  minimum_stock?: number;
  maximum_stock?: number | null;
  location?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

// ============================================================================
// ENTITY INTERFACES - TRANSACTION TABLES
// ============================================================================

export interface SalesOrder extends TenantEntity {
  order_number: string;
  customer_id: UUID | null;
  salesperson_id: UUID | null;
  order_date: string;
  due_date: string | null;
  status: OrderStatus;
  subtotal: Decimal;
  tax_amount: Decimal;
  discount_amount: Decimal;
  total_amount: Decimal;
  payment_status: PaymentStatus;
  notes: string | null;
}

export interface SalesOrderInsert {
  id?: UUID;
  company_id: UUID;
  order_number: string;
  customer_id?: UUID | null;
  salesperson_id?: UUID | null;
  order_date?: string;
  due_date?: string | null;
  status?: OrderStatus;
  subtotal?: Decimal;
  tax_amount?: Decimal;
  discount_amount?: Decimal;
  total_amount?: Decimal;
  payment_status?: PaymentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface SalesOrderUpdate {
  order_number?: string;
  customer_id?: UUID | null;
  salesperson_id?: UUID | null;
  order_date?: string;
  due_date?: string | null;
  status?: OrderStatus;
  subtotal?: Decimal;
  tax_amount?: Decimal;
  discount_amount?: Decimal;
  total_amount?: Decimal;
  payment_status?: PaymentStatus;
  notes?: string | null;
  updated_at?: string;
}

export interface SalesOrderItem {
  id: UUID;
  company_id: UUID;
  sales_order_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price: Decimal;
  discount_percent: Decimal;
  discount_amount: Decimal;
  line_total: Decimal;
  created_at: string;
}

export interface SalesOrderItemInsert {
  id?: UUID;
  company_id: UUID;
  sales_order_id: UUID;
  product_id: UUID;
  quantity: number;
  unit_price: Decimal;
  discount_percent?: Decimal;
  discount_amount?: Decimal;
  line_total: Decimal;
  created_at?: string;
}

export interface SalesOrderItemUpdate {
  quantity?: number;
  unit_price?: Decimal;
  discount_percent?: Decimal;
  discount_amount?: Decimal;
  line_total?: Decimal;
}

export interface Invoice extends TenantEntity {
  invoice_number: string;
  sales_order_id: UUID | null;
  customer_id: UUID | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: Decimal;
  tax_amount: Decimal;
  discount_amount: Decimal;
  total_amount: Decimal;
  paid_amount: Decimal;
  payment_status: PaymentStatus;
  notes: string | null;
}

export interface InvoiceInsert {
  id?: UUID;
  company_id: UUID;
  invoice_number: string;
  sales_order_id?: UUID | null;
  customer_id?: UUID | null;
  invoice_date?: string;
  due_date?: string | null;
  subtotal?: Decimal;
  tax_amount?: Decimal;
  discount_amount?: Decimal;
  total_amount?: Decimal;
  paid_amount?: Decimal;
  payment_status?: PaymentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface InvoiceUpdate {
  invoice_number?: string;
  sales_order_id?: UUID | null;
  customer_id?: UUID | null;
  invoice_date?: string;
  due_date?: string | null;
  subtotal?: Decimal;
  tax_amount?: Decimal;
  discount_amount?: Decimal;
  total_amount?: Decimal;
  paid_amount?: Decimal;
  payment_status?: PaymentStatus;
  notes?: string | null;
  updated_at?: string;
}

export interface Transaction {
  id: UUID;
  company_id: UUID;
  transaction_number: string;
  transaction_date: string;
  transaction_type: TransactionType;
  category: string | null;
  description: string;
  amount: Decimal;
  payment_method: PaymentMethod | null;
  reference_type: string | null;
  reference_id: UUID | null;
  account_from: string | null;
  account_to: string | null;
  status: TransactionStatus;
  created_at: string;
  created_by: UUID | null;
}

export interface TransactionInsert {
  id?: UUID;
  company_id: UUID;
  transaction_number: string;
  transaction_date?: string;
  transaction_type: TransactionType;
  category?: string | null;
  description: string;
  amount: Decimal;
  payment_method?: PaymentMethod | null;
  reference_type?: string | null;
  reference_id?: UUID | null;
  account_from?: string | null;
  account_to?: string | null;
  status?: TransactionStatus;
  created_at?: string;
  created_by?: UUID | null;
}

export interface TransactionUpdate {
  transaction_number?: string;
  transaction_date?: string;
  transaction_type?: TransactionType;
  category?: string | null;
  description?: string;
  amount?: Decimal;
  payment_method?: PaymentMethod | null;
  reference_type?: string | null;
  reference_id?: UUID | null;
  account_from?: string | null;
  account_to?: string | null;
  status?: TransactionStatus;
}

export interface StockMovement {
  id: UUID;
  company_id: UUID;
  product_id: UUID;
  movement_type: MovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: UUID | null;
  notes: string | null;
  created_at: string;
  created_by: UUID | null;
}

export interface StockMovementInsert {
  id?: UUID;
  company_id: UUID;
  product_id: UUID;
  movement_type: MovementType;
  quantity: number;
  reference_type?: string | null;
  reference_id?: UUID | null;
  notes?: string | null;
  created_at?: string;
  created_by?: UUID | null;
}

export interface StockMovementUpdate {
  movement_type?: MovementType;
  quantity?: number;
  reference_type?: string | null;
  reference_id?: UUID | null;
  notes?: string | null;
}

// ============================================================================
// ENTITY INTERFACES - ADDITIONAL FEATURES (Future Migrations)
// ============================================================================

export interface Vehicle extends TenantEntity {
  license_plate: string;
  vehicle_type: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  capacity: string | null;
  driver_id: UUID | null;
  status: VehicleStatus;
  is_active: boolean;
}

export interface VehicleInsert {
  id?: UUID;
  company_id: UUID;
  license_plate: string;
  vehicle_type?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  capacity?: string | null;
  driver_id?: UUID | null;
  status?: VehicleStatus;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface VehicleUpdate {
  license_plate?: string;
  vehicle_type?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  capacity?: string | null;
  driver_id?: UUID | null;
  status?: VehicleStatus;
  is_active?: boolean;
  updated_at?: string;
}

export interface Promotion extends TenantEntity {
  name: string;
  description: string | null;
  promotion_type: PromotionType;
  discount_value: Decimal | null;
  min_purchase_amount: Decimal | null;
  start_date: string;
  end_date: string;
  applicable_products: Json | null; // Product IDs or categories
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

export interface PromotionInsert {
  id?: UUID;
  company_id: UUID;
  name: string;
  description?: string | null;
  promotion_type: PromotionType;
  discount_value?: Decimal | null;
  min_purchase_amount?: Decimal | null;
  start_date: string;
  end_date: string;
  applicable_products?: Json | null;
  max_uses?: number | null;
  current_uses?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: UUID | null;
}

export interface PromotionUpdate {
  name?: string;
  description?: string | null;
  promotion_type?: PromotionType;
  discount_value?: Decimal | null;
  min_purchase_amount?: Decimal | null;
  start_date?: string;
  end_date?: string;
  applicable_products?: Json | null;
  max_uses?: number | null;
  current_uses?: number;
  is_active?: boolean;
  updated_at?: string;
}

// ============================================================================
// UTILITY TYPES & HELPERS
// ============================================================================

// Database operation result types
export type DatabaseResult<T> = {
  data: T | null;
  error: Error | null;
};

export type DatabaseListResult<T> = {
  data: T[] | null;
  error: Error | null;
  count?: number;
};

// Common query filters
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {
  [key: string]: any;
}

// Table type helpers
export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Entity relationships (for joins and includes)
export interface CustomerWithTransactions extends Customer {
  sales_orders?: SalesOrder[];
  invoices?: Invoice[];
}

export interface ProductWithMovements extends Product {
  stock_movements?: StockMovement[];
}

export interface SalesOrderWithItems extends SalesOrder {
  sales_order_items?: SalesOrderItem[];
  customer?: Customer;
  salesperson?: Employee;
}

export interface InvoiceWithOrder extends Invoice {
  sales_order?: SalesOrder;
  customer?: Customer;
}

export interface EmployeeWithUser extends Employee {
  user?: User;
}

export interface CompanyWithPlan extends Company {
  subscription_plan?: SubscriptionPlan;
}

// Dashboard statistics types
export interface DashboardStats {
  total_customers: number;
  total_products: number;
  total_sales_orders: number;
  total_revenue: Decimal;
  pending_invoices: number;
  low_stock_products: number;
}

export interface SalesAnalytics {
  daily_sales: { date: string; amount: Decimal }[];
  monthly_sales: { month: string; amount: Decimal }[];
  top_products: { product_id: UUID; product_name: string; quantity_sold: number }[];
  top_customers: { customer_id: UUID; customer_name: string; total_amount: Decimal }[];
}

// Permission system types (based on user.permissions JSONB)
export interface UserPermissions {
  modules: {
    pos?: boolean;
    inventory?: boolean;
    customers?: boolean;
    suppliers?: boolean;
    sales?: boolean;
    hr?: boolean;
    finance?: boolean;
    vehicles?: boolean;
    promotions?: boolean;
    reports?: boolean;
  };
  actions: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
  };
}

// Subscription plan features (based on subscription_plans.features JSONB)
export interface SubscriptionFeatures {
  modules: string[];
  max_users: number;
  max_products?: number;
  max_transactions?: number;
  api_access?: boolean;
  custom_reports?: boolean;
  integrations?: string[];
}