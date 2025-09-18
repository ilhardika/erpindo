/**
 * Customer Store with Zustand
 * Manages customer state, CRUD operations, and local caching
 * Integrates with Supabase database hooks for multi-tenant isolation
 * Date: 2025-09-18
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';
import { parseError } from '../utils/errorHandling';
import type { Customer, CustomerInsert, CustomerUpdate } from '../types/database';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CustomerFilters {
  search?: string;
  customer_type?: 'regular' | 'vip' | 'wholesale';
  is_active?: boolean;
}

export interface CustomerSort {
  field: keyof Customer;
  direction: 'asc' | 'desc';
}

interface CustomerStore {
  // State
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: CustomerFilters;
  sort: CustomerSort;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // Actions
  loadCustomers: () => Promise<void>;
  createCustomer: (customer: CustomerInsert) => Promise<boolean>;
  updateCustomer: (id: string, updates: CustomerUpdate) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  setSelectedCustomer: (customer: Customer | null) => void;
  clearError: () => void;
  
  // Filters and sorting
  setFilters: (filters: Partial<CustomerFilters>) => void;
  setSort: (sort: CustomerSort) => void;
  setPagination: (page: number, pageSize?: number) => void;
  clearFilters: () => void;
  
  // Search & Filter
  searchCustomers: (query: string) => Customer[];
  getCustomerById: (id: string) => Customer | null;
  getCustomersByType: (customerType: 'regular' | 'vip' | 'wholesale') => Customer[];
  getActiveCustomers: () => Customer[];
  getTopCustomers: (limit?: number) => Customer[];
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useCustomerStore = create<CustomerStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      customers: [],
      selectedCustomer: null,
      loading: false,
      error: null,
      
      // Filters and pagination
      filters: {},
      sort: { field: 'name', direction: 'asc' },
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,

      // Load customers with filters and pagination
      loadCustomers: async () => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User not authenticated or missing tenant');
          }

          const { filters, sort, currentPage, pageSize } = get();

          // Build query with filters
          let query = supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('company_id', user.tenant_id);

          // Apply filters
          if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
          }

          if (filters.customer_type) {
            query = query.eq('customer_type', filters.customer_type);
          }

          if (filters.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
          }

          // Apply sorting
          query = query.order(sort.field, { ascending: sort.direction === 'asc' });

          // Apply pagination
          const start = (currentPage - 1) * pageSize;
          query = query.range(start, start + pageSize - 1);

          const { data, error, count } = await query;

          if (error) throw error;

          set({ 
            customers: data || [],
            totalCount: count || 0,
            loading: false 
          });
        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'load_customers',
            table: 'customers',
            timestamp: new Date(),
          });
          console.error('loadCustomers error:', parsedError);
          set({ 
            error: parsedError.userMessage,
            loading: false 
          });
        }
      },

      // Create new customer
      createCustomer: async (customerData: CustomerInsert) => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();

          
          if (!user?.tenant_id) {
            throw new Error('User not authenticated or missing tenant');
          }

          // Test: First try to read from customers table to check if we have any access
          try {
            const testRead = await supabase
              .from('customers')
              .select('count')
              .eq('company_id', user.tenant_id)
              .limit(1);
          } catch (readError) {
          }

          const customerToInsert = {
            ...customerData,
            company_id: user.tenant_id,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            // Ensure all required fields have defaults
            customer_type: customerData.customer_type || 'regular',
            credit_limit: customerData.credit_limit ?? 0,
            payment_terms: customerData.payment_terms ?? 30,
          };


          const { data, error } = await supabase
            .from('customers')
            .insert(customerToInsert as any)
            .select()
            .single();

          
          if (error) {
            // console log removed
            throw error;
          }

          // Add to local state
          set(state => ({
            customers: [data, ...state.customers],
            loading: false
          }));

          return true;
        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'create_customer',
            table: 'customers',
            timestamp: new Date(),
          });
          console.error('createCustomer error:', parsedError);
          set({ 
            error: parsedError.userMessage,
            loading: false 
          });
          return false;
        }
      },

      // Update existing customer
      updateCustomer: async (id: string, updates: CustomerUpdate) => {
        try {
          set({ loading: true, error: null });

          const updateData = {
            ...updates,
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('customers')
            .update(updateData as any)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          // Update local state
          set(state => ({
            customers: state.customers.map(customer => 
              customer.id === id ? data : customer
            ),
            selectedCustomer: state.selectedCustomer?.id === id ? data : state.selectedCustomer,
            loading: false
          }));

          return true;
        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'update_customer',
            table: 'customers',
            timestamp: new Date(),
          });
          console.error('updateCustomer error:', parsedError);
          set({ 
            error: parsedError.userMessage,
            loading: false 
          });
          return false;
        }
      },

      // Delete customer
      deleteCustomer: async (id: string) => {
        try {
          set({ loading: true, error: null });

          // Check if customer has any related records first
          const { data: relatedRecords, error: checkError } = await supabase
            .from('sales_orders')
            .select('id')
            .eq('customer_id', id)
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
              .eq('id', id);

            if (deactivateError) throw deactivateError;

            // Update local state
            set(state => ({
              customers: state.customers.map(customer => 
                customer.id === id ? { ...customer, is_active: false } : customer
              ),
              selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
              loading: false
            }));
          } else {
            // Safe to delete if no related records
            const { error } = await supabase
              .from('customers')
              .delete()
              .eq('id', id);

            if (error) throw error;

            // Remove from local state
            set(state => ({
              customers: state.customers.filter(customer => customer.id !== id),
              selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
              loading: false
            }));
          }

          return true;
        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'delete_customer',
            table: 'customers',
            timestamp: new Date(),
          });
          console.error('deleteCustomer error:', parsedError);
          set({ 
            error: parsedError.userMessage,
            loading: false 
          });
          return false;
        }
      },

      // Set selected customer
      setSelectedCustomer: (customer: Customer | null) => {
        set({ selectedCustomer: customer });
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Search customers by name, email, or phone
      searchCustomers: (query: string) => {
        const { customers } = get();
        if (!query.trim()) return customers;

        const searchTerm = query.toLowerCase().trim();
        return customers.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm) ||
          customer.phone?.includes(searchTerm)
        );
      },

      // Get customer by ID
      getCustomerById: (id: string) => {
        const { customers } = get();
        return customers.find(customer => customer.id === id) || null;
      },

      // Get customers by type
      getCustomersByType: (customerType: 'regular' | 'vip' | 'wholesale') => {
        const { customers } = get();
        return customers.filter(customer => customer.customer_type === customerType);
      },

      // Get active customers only
      getActiveCustomers: () => {
        const { customers } = get();
        return customers.filter(customer => customer.is_active);
      },

      // Get top customers (by name for now, can be enhanced with purchase data)
      getTopCustomers: (limit = 10) => {
        const { customers } = get();
        return customers
          .filter(customer => customer.is_active)
          .slice(0, limit);
      },

      // ========================================================================
      // FILTERS AND PAGINATION
      // ========================================================================

      setFilters: (newFilters: Partial<CustomerFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        }));
        
        // Reload customers with new filters
        get().loadCustomers();
      },

      setSort: (sort: CustomerSort) => {
        set({ sort, currentPage: 1 });
        
        // Reload customers with new sort
        get().loadCustomers();
      },

      setPagination: (page: number, newPageSize?: number) => {
        set((state) => ({
          currentPage: page,
          pageSize: newPageSize || state.pageSize,
        }));
        
        // Reload customers with new pagination
        get().loadCustomers();
      },

      clearFilters: () => {
        set({
          filters: {},
          currentPage: 1,
        });
        
        // Reload customers without filters
        get().loadCustomers();
      },
    }),
    {
      name: 'customer-store',
      partialize: (state: CustomerStore) => ({ 
        // Don't persist loading or error states
        customers: state.customers,
        selectedCustomer: state.selectedCustomer,
      }),
    }
  )
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get customer statistics
 */
export const useCustomerStats = () => {
  const customers = useCustomerStore(state => state.customers);
  
  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.is_active).length,
    regularCustomers: customers.filter(c => c.customer_type === 'regular').length,
    vipCustomers: customers.filter(c => c.customer_type === 'vip').length,
    wholesaleCustomers: customers.filter(c => c.customer_type === 'wholesale').length,
  };
};

/**
 * Hook to manage customer operations with loading states
 */
export const useCustomerOperations = () => {
  const store = useCustomerStore();
  
  const createCustomerWithFeedback = async (customer: CustomerInsert) => {
    const success = await store.createCustomer(customer);
    if (success && !store.error) {
      // Could add toast notification here
    }
    return success;
  };

  const updateCustomerWithFeedback = async (id: string, updates: CustomerUpdate) => {
    const success = await store.updateCustomer(id, updates);
    if (success && !store.error) {
      // Could add toast notification here
    }
    return success;
  };

  const deleteCustomerWithFeedback = async (id: string) => {
    const success = await store.deleteCustomer(id);
    if (success && !store.error) {
      // Could add toast notification here
    }
    return success;
  };

  return {
    createCustomer: createCustomerWithFeedback,
    updateCustomer: updateCustomerWithFeedback,
    deleteCustomer: deleteCustomerWithFeedback,
    loading: store.loading,
    error: store.error,
  };
};

/**
 * Hook to get customer actions (similar to useProductActions for consistency)
 */
export const useCustomerActions = () => {
  const {
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setSelectedCustomer,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    clearError,
  } = useCustomerStore();

  return {
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setSelectedCustomer,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    clearError,
  };
};