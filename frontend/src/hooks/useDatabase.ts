/**
 * Database Hooks for ERP System
 * Provides type-safe CRUD operations for all database entities
 * Uses real Supabase connection with multi-tenant isolation
 * Date: 2025-09-14
 */

import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/authStore';
import type {
  UUID,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
  DatabaseResult,
  DatabaseListResult,
} from '../types/database';

// ============================================================================
// HOOK OPTIONS & TYPES
// ============================================================================

export interface QueryFilters {
  search?: string;
  status?: string;
  is_active?: boolean;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

// ============================================================================
// MAIN DATABASE HOOK
// ============================================================================

export function useDatabase<T extends TableName>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Build query with company isolation
  const buildQuery = useCallback((filters: QueryFilters = {}) => {
    let query = supabase.from(tableName).select('*');

    // Apply company-level isolation for tenant tables
    const systemTables = ['subscription_plans'];
    if (!systemTables.includes(tableName) && user?.tenant_id) {
      query = query.eq('company_id', user.tenant_id);
    }

    // Apply search filter
    if (filters.search) {
      const orConditions = `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,code.ilike.%${filters.search}%`;
      query = query.or(orConditions);
    }

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    // Apply date range filters
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      query = query.order(filters.sortBy, {
        ascending: filters.sortOrder === 'asc'
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    return query;
  }, [tableName, user?.tenant_id]);

  // Select all records with filtering
  const selectAll = useCallback(async (
    filters: QueryFilters = {}
  ): Promise<DatabaseListResult<TableRow<T>>> => {
    try {
      setLoading(true);
      setError(null);

      const query = buildQuery(filters);
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        error: null
      };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return {
        data: [],
        count: 0,
        error
      };
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // Select record by ID
  const selectById = useCallback(async (
    id: UUID
  ): Promise<DatabaseResult<TableRow<T>>> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(tableName)
        .select('*')
        .eq('id', id);

      // Apply company isolation
      const systemTables = ['subscription_plans'];
      if (!systemTables.includes(tableName) && user?.tenant_id) {
        query = query.eq('company_id', user.tenant_id);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [tableName, user?.tenant_id]);

  // Insert new record
  const insert = useCallback(async (
    values: TableInsert<T>,
    options: MutationOptions<TableRow<T>> = {}
  ): Promise<DatabaseResult<TableRow<T>>> => {
    try {
      setLoading(true);
      setError(null);

      // Add company_id for tenant tables
      const systemTables = ['subscription_plans'];
      const insertData = !systemTables.includes(tableName) && user?.tenant_id
        ? { ...values, company_id: user.tenant_id }
        : values;

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const response = { data, error: null };
      options.onSuccess?.(data);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      return { data: null, error };
    } finally {
      setLoading(false);
      options.onSettled?.();
    }
  }, [tableName, user?.tenant_id]);

  // Update existing record
  const update = useCallback(async (
    id: UUID,
    values: TableUpdate<T>,
    options: MutationOptions<TableRow<T>> = {}
  ): Promise<DatabaseResult<TableRow<T>>> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(tableName)
        .update(values)
        .eq('id', id);

      // Apply company isolation
      const systemTables = ['subscription_plans'];
      if (!systemTables.includes(tableName) && user?.tenant_id) {
        query = query.eq('company_id', user.tenant_id);
      }

      const { data, error } = await query.select().single();

      if (error) throw error;

      const response = { data, error: null };
      options.onSuccess?.(data);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      return { data: null, error };
    } finally {
      setLoading(false);
      options.onSettled?.();
    }
  }, [tableName, user?.tenant_id]);

  // Delete record
  const remove = useCallback(async (
    id: UUID,
    options: MutationOptions<boolean> = {}
  ): Promise<DatabaseResult<boolean>> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      // Apply company isolation
      const systemTables = ['subscription_plans'];
      if (!systemTables.includes(tableName) && user?.tenant_id) {
        query = query.eq('company_id', user.tenant_id);
      }

      const { error } = await query;

      if (error) throw error;

      const response = { data: true, error: null };
      options.onSuccess?.(true);
      return response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      return { data: null, error };
    } finally {
      setLoading(false);
      options.onSettled?.();
    }
  }, [tableName, user?.tenant_id]);

  return {
    // State
    loading,
    error,
    
    // Operations
    selectAll,
    selectById,
    insert,
    update,
    remove,
    
    // Utilities
    buildQuery
  };
}

// ============================================================================
// ENTITY-SPECIFIC HOOKS
// ============================================================================

// System
export const useSubscriptionPlans = () => useDatabase('subscription_plans');

// Companies & Users
export const useCompanies = () => useDatabase('companies');
export const useUsers = () => useDatabase('users');

// Business Entities
export const useCustomers = () => useDatabase('customers');
export const useSuppliers = () => useDatabase('suppliers');
export const useEmployees = () => useDatabase('employees');

// Products & Inventory
export const useProducts = () => useDatabase('products');
export const useStockMovements = () => useDatabase('stock_movements');

// Sales & Orders
export const useSalesOrders = () => useDatabase('sales_orders');
export const useSalesOrderItems = () => useDatabase('sales_order_items');

// Finance
export const useInvoices = () => useDatabase('invoices');
export const useTransactions = () => useDatabase('transactions');

// Assets & Logistics
export const useVehicles = () => useDatabase('vehicles');

// Marketing
export const usePromotions = () => useDatabase('promotions');

// ============================================================================
// DASHBOARD STATS HOOK
// ============================================================================

export interface DashboardStats {
  total_customers: number;
  total_products: number;
  total_orders: number;
  low_stock_products: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user?.tenant_id) return;
    
    try {
      setLoading(true);
      setError(null);

      // Execute all queries in parallel
      const [
        customersResult,
        productsResult,
        ordersResult,
        lowStockResult
      ] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('company_id', user.tenant_id),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', user.tenant_id),
        supabase.from('sales_orders').select('id', { count: 'exact', head: true }).eq('company_id', user.tenant_id),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', user.tenant_id).filter('stock_quantity', 'lte', 'minimum_stock'),
      ]);

      setStats({
        total_customers: customersResult.count || 0,
        total_products: productsResult.count || 0,
        total_orders: ordersResult.count || 0,
        low_stock_products: lowStockResult.count || 0,
      });

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}