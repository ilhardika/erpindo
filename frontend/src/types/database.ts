// Database type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          features: string[] | null;
          max_users: number | null;
          max_companies: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          features?: string[] | null;
          max_users?: number | null;
          max_companies?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          features?: string[] | null;
          max_users?: number | null;
          max_companies?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string;
          npwp: string | null;
          legal_form: string | null;
          subscription_plan_id: string;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          npwp?: string | null;
          legal_form?: string | null;
          subscription_plan_id: string;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          npwp?: string | null;
          legal_form?: string | null;
          subscription_plan_id?: string;
          subscription_start_date?: string | null;
          subscription_end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string | null;
          role: 'dev' | 'owner' | 'staff';
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_sign_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          role: 'dev' | 'owner' | 'staff';
          full_name: string;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sign_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          role?: 'dev' | 'owner' | 'staff';
          full_name?: string;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sign_in_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          sku: string | null;
          barcode: string | null;
          price: number;
          cost_price: number | null;
          stock: number;
          min_stock: number | null;
          category: string | null;
          unit: string | null;
          weight: number | null;
          dimensions: Record<string, any> | null;
          images: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          sku?: string | null;
          barcode?: string | null;
          price: number;
          cost_price?: number | null;
          stock?: number;
          min_stock?: number | null;
          category?: string | null;
          unit?: string | null;
          weight?: number | null;
          dimensions?: Record<string, any> | null;
          images?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          sku?: string | null;
          barcode?: string | null;
          price?: number;
          cost_price?: number | null;
          stock?: number;
          min_stock?: number | null;
          category?: string | null;
          unit?: string | null;
          weight?: number | null;
          dimensions?: Record<string, any> | null;
          images?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          customer_type: 'individual' | 'business';
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          npwp: string | null;
          nik: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_type: 'individual' | 'business';
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          npwp?: string | null;
          nik?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_type?: 'individual' | 'business';
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          npwp?: string | null;
          nik?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales_orders: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string | null;
          order_number: string;
          order_date: string;
          status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount_amount: number | null;
          total_amount: number;
          payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'qris' | 'other';
          payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id?: string | null;
          order_number: string;
          order_date?: string;
          status?: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal: number;
          tax_rate?: number;
          tax_amount: number;
          discount_amount?: number | null;
          total_amount: number;
          payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'qris' | 'other';
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_id?: string | null;
          order_number?: string;
          order_date?: string;
          status?: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number | null;
          total_amount?: number;
          payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'qris' | 'other';
          payment_status?: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales_order_items: {
        Row: {
          id: string;
          sales_order_id: string;
          product_id: string;
          product_name: string;
          product_sku: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sales_order_id: string;
          product_id: string;
          product_name: string;
          product_sku?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sales_order_id?: string;
          product_id?: string;
          product_name?: string;
          product_sku?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          sales_order_id: string | null;
          customer_id: string | null;
          invoice_number: string;
          invoice_date: string;
          due_date: string | null;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          discount_amount: number | null;
          total_amount: number;
          paid_amount: number;
          balance_amount: number;
          currency: string;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          sales_order_id?: string | null;
          customer_id?: string | null;
          invoice_number: string;
          invoice_date?: string;
          due_date?: string | null;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          subtotal: number;
          tax_rate?: number;
          tax_amount: number;
          discount_amount?: number | null;
          total_amount: number;
          paid_amount?: number;
          balance_amount?: number;
          currency?: string;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          sales_order_id?: string | null;
          customer_id?: string | null;
          invoice_number?: string;
          invoice_date?: string;
          due_date?: string | null;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          discount_amount?: number | null;
          total_amount?: number;
          paid_amount?: number;
          balance_amount?: number;
          currency?: string;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'dev' | 'owner' | 'staff';
      customer_type: 'individual' | 'business';
      order_status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'qris' | 'other';
      payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
      invoice_status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Type exports for easier usage
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type SalesOrder = Database['public']['Tables']['sales_orders']['Row'];
export type SalesOrderItem = Database['public']['Tables']['sales_order_items']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];

export type UserRole = Database['public']['Enums']['user_role'];
export type CustomerType = Database['public']['Enums']['customer_type'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentMethod = Database['public']['Enums']['payment_method'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type InvoiceStatus = Database['public']['Enums']['invoice_status'];

// Insert types for easier form handling
export type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans']['Insert'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type SalesOrderInsert = Database['public']['Tables']['sales_orders']['Insert'];
export type SalesOrderItemInsert = Database['public']['Tables']['sales_order_items']['Insert'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

// Update types for easier form handling
export type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans']['Update'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type SalesOrderUpdate = Database['public']['Tables']['sales_orders']['Update'];
export type SalesOrderItemUpdate = Database['public']['Tables']['sales_order_items']['Update'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

// Additional utility types
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  column?: string;
  ascending?: boolean;
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams {
  filters?: FilterParams;
  search?: string;
}

// Indonesian-specific types
export interface IndonesianAddress {
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country: 'Indonesia';
}

export interface IndonesianBusinessInfo {
  npwp?: string; // Format: XX.XXX.XXX.X-XXX.XXX
  legal_form?: 'PT' | 'CV' | 'UD' | 'Firma' | 'Koperasi' | 'Yayasan' | 'Lainnya';
}

export interface IndonesianPersonalInfo {
  nik?: string; // 16 digits
  phone?: string; // Format: +62XXXXXXXXXX or 08XXXXXXXXX
}

export interface IndonesianTaxInfo {
  ppn_rate: 0.11; // PPN 11%
  currency: 'IDR';
  tax_inclusive?: boolean;
}