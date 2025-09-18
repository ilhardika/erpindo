/**
 * Customer Service
 * Handles all customer-related CRUD operations with Supabase
 * Includes multi-tenant isolation, error handling, and business logic
 * Date: 2025-09-18
 */

import { supabase } from '../lib/supabase';
import { parseError } from '../utils/errorHandling';
import type { 
  Customer, 
  CustomerInsert, 
  CustomerUpdate 
} from '../types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  customerType?: 'regular' | 'vip' | 'wholesale';
  isActive?: boolean;
  sortBy?: 'name' | 'customer_type' | 'credit_limit' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerQueryResult {
  data: Customer[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  wholesaleCustomers: number;
  regularCustomers: number;
  totalCreditLimit: number;
  averagePaymentTerms: number;
  recentCustomers: Customer[];
}

export interface CustomerWithHistory extends Customer {
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  averageOrderValue?: number;
}

// ============================================================================
// CUSTOMER CRUD OPERATIONS
// ============================================================================

/**
 * Get customers with advanced filtering and pagination
 */
export const getCustomers = async (
  companyId: string, 
  options: CustomerQueryOptions = {}
): Promise<CustomerQueryResult> => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search,
      customerType,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (customerType) {
      query = query.eq('customer_type', customerType);
    }

    if (typeof isActive === 'boolean') {
      query = query.eq('is_active', isActive);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: data || [],
      count: count || 0,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'get_customers',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('getCustomers error:', parsedError);
    throw parsedError;
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (
  customerId: string,
  companyId: string
): Promise<Customer | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Customer not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'get_customer_by_id',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('getCustomerById error:', parsedError);
    throw parsedError;
  }
};

/**
 * Create new customer
 */
export const createCustomer = async (
  customerData: CustomerInsert,
  companyId: string,
  userId: string
): Promise<Customer> => {
  try {
    const insertData: CustomerInsert = {
      ...customerData,
      company_id: companyId,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'create_customer',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('createCustomer error:', parsedError);
    throw parsedError;
  }
};

/**
 * Update existing customer
 */
export const updateCustomer = async (
  customerId: string,
  customerData: CustomerUpdate,
  companyId: string
): Promise<Customer> => {
  try {
    const updateData: CustomerUpdate = {
      ...customerData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('customers')
      .update(updateData as any)
      .eq('id', customerId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'update_customer',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('updateCustomer error:', parsedError);
    throw parsedError;
  }
};

/**
 * Delete customer (or deactivate if has related records)
 */
export const deleteCustomer = async (
  customerId: string,
  companyId: string
): Promise<{ success: boolean; deactivated?: boolean }> => {
  try {
    // Check if customer has any related records first
    const { data: relatedRecords, error: checkError } = await supabase
      .from('sales_orders')
      .select('id')
      .eq('customer_id', customerId)
      .limit(1);

    if (checkError) throw checkError;

    if (relatedRecords && relatedRecords.length > 0) {
      // If has related records, deactivate instead of delete
      const { error: deactivateError } = await supabase
        .from('customers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', customerId)
        .eq('company_id', companyId);

      if (deactivateError) throw deactivateError;

      return { success: true, deactivated: true };
    } else {
      // Safe to delete if no related records
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('company_id', companyId);

      if (error) throw error;

      return { success: true, deactivated: false };
    }
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'delete_customer',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('deleteCustomer error:', parsedError);
    throw parsedError;
  }
};

// ============================================================================
// CUSTOMER ANALYTICS & STATS
// ============================================================================

/**
 * Get customer statistics
 */
export const getCustomerStats = async (companyId: string): Promise<CustomerStats> => {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw error;

    const stats: CustomerStats = {
      totalCustomers: customers?.length || 0,
      activeCustomers: customers?.filter(c => c.is_active).length || 0,
      vipCustomers: customers?.filter(c => c.customer_type === 'vip').length || 0,
      wholesaleCustomers: customers?.filter(c => c.customer_type === 'wholesale').length || 0,
      regularCustomers: customers?.filter(c => c.customer_type === 'regular').length || 0,
      totalCreditLimit: customers?.reduce((sum, c) => sum + (c.credit_limit || 0), 0) || 0,
      averagePaymentTerms: customers?.length 
        ? customers.reduce((sum, c) => sum + (c.payment_terms || 0), 0) / customers.length 
        : 0,
      recentCustomers: customers
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5) || [],
    };

    return stats;
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'get_customer_stats',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('getCustomerStats error:', parsedError);
    throw parsedError;
  }
};

/**
 * Get customers with purchase history
 */
export const getCustomersWithHistory = async (
  companyId: string,
  options: CustomerQueryOptions = {}
): Promise<CustomerWithHistory[]> => {
  try {
    // First get customers
    const customers = await getCustomers(companyId, options);

    // For each customer, get their order statistics
    const customersWithHistory = await Promise.all(
      customers.data.map(async (customer) => {
        try {
          const { data: orders, error } = await supabase
            .from('sales_orders')
            .select('total_amount, created_at')
            .eq('customer_id', customer.id)
            .eq('company_id', companyId);

          if (error) {
            console.error(`Error fetching orders for customer ${customer.id}:`, error);
            return {
              ...customer,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: undefined,
              averageOrderValue: 0,
            };
          }

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          const lastOrderDate = orders?.length 
            ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : undefined;
          const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

          return {
            ...customer,
            totalOrders,
            totalSpent,
            lastOrderDate,
            averageOrderValue,
          };
        } catch (error) {
          console.error(`Error processing customer ${customer.id}:`, error);
          return {
            ...customer,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: undefined,
            averageOrderValue: 0,
          };
        }
      })
    );

    return customersWithHistory;
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'get_customers_with_history',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('getCustomersWithHistory error:', parsedError);
    throw parsedError;
  }
};

/**
 * Search customers by name, email, or phone
 */
export const searchCustomers = async (
  companyId: string,
  query: string,
  limit: number = 10
): Promise<Customer[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'search_customers',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('searchCustomers error:', parsedError);
    throw parsedError;
  }
};

/**
 * Get top customers by total spending
 */
export const getTopCustomers = async (
  companyId: string,
  limit: number = 10
): Promise<CustomerWithHistory[]> => {
  try {
    const customersWithHistory = await getCustomersWithHistory(companyId, {
      isActive: true,
      pageSize: 100 // Get more customers to analyze
    });

    // Sort by total spent and take top customers
    return customersWithHistory
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, limit);
  } catch (error) {
    const parsedError = parseError(error, {
      operation: 'get_top_customers',
      table: 'customers',
      timestamp: new Date(),
    });
    console.error('getTopCustomers error:', parsedError);
    throw parsedError;
  }
};

/**
 * Validate customer data before save
 */
export const validateCustomerData = (customerData: Partial<CustomerInsert | CustomerUpdate>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Required fields
  if (!customerData.name?.trim()) {
    errors.push('Nama pelanggan wajib diisi');
  }

  // Email validation
  if (customerData.email && customerData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      errors.push('Format email tidak valid');
    }
  }

  // Phone validation
  if (customerData.phone && customerData.phone.trim()) {
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    const cleanPhone = customerData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(customerData.phone) || cleanPhone.length < 8) {
      errors.push('Format nomor telepon tidak valid');
    }
  }

  // Credit limit validation
  if (typeof customerData.credit_limit === 'number' && customerData.credit_limit < 0) {
    errors.push('Limit kredit tidak boleh negatif');
  }

  // Payment terms validation
  if (typeof customerData.payment_terms === 'number') {
    if (customerData.payment_terms < 0 || customerData.payment_terms > 365) {
      errors.push('Tenor pembayaran harus antara 0-365 hari');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// EXPORT DEFAULT FUNCTIONS
// ============================================================================

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomersWithHistory,
  searchCustomers,
  getTopCustomers,
  validateCustomerData,
};