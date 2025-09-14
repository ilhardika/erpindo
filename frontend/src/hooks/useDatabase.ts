// Custom hooks for database operations
import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/stores/authStore'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

export interface DatabaseResult<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface DatabaseMutation<T> {
  mutate: (data: T) => Promise<{ data: any; error: string | null }>
  loading: boolean
}

/**
 * Hook for basic database CRUD operations with multi-tenant support
 */
export function useDatabase() {
  const { user } = useAuth()

  // Ensure user has company_id for multi-tenant filtering
  const getCompanyId = useCallback(() => {
    if (!user?.tenant_id) {
      throw new Error('User must be authenticated with a company')
    }
    return user.tenant_id
  }, [user?.tenant_id])

  // Generic select function with RLS support
  const select = useCallback(async <T>(
    table: keyof Tables,
    options?: {
      columns?: string
      filters?: Record<string, any>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
    }
  ): Promise<DatabaseResult<T[]>> => {
    try {
      let query = supabase.from(table).select(options?.columns || '*')

      // Apply company_id filter for multi-tenancy (except for dev users)
      if (user?.role !== 'dev' && table !== 'subscription_plans') {
        const companyId = getCompanyId()
        query = query.eq('company_id', companyId)
      }

      // Apply additional filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      return {
        data: data as T[] || null,
        error: error?.message || null,
        loading: false
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      }
    }
  }, [user?.role, getCompanyId])

  // Generic insert function
  const insert = useCallback(async <T>(
    table: keyof Tables,
    data: Partial<T> & { company_id?: string }
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      // Add company_id for multi-tenancy (except for dev-only tables)
      if (user?.role !== 'dev' && table !== 'subscription_plans' && !data.company_id) {
        data.company_id = getCompanyId()
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      return {
        data: result as T || null,
        error: error?.message || null
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }, [user?.role, getCompanyId])

  // Generic update function
  const update = useCallback(async <T>(
    table: keyof Tables,
    id: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      let query = supabase.from(table).update(data).eq('id', id)

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans') {
        const companyId = getCompanyId()
        query = query.eq('company_id', companyId)
      }

      const { data: result, error } = await query.select().single()

      return {
        data: result as T || null,
        error: error?.message || null
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }, [user?.role, getCompanyId])

  // Generic delete function
  const remove = useCallback(async (
    table: keyof Tables,
    id: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      let query = supabase.from(table).delete().eq('id', id)

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans') {
        const companyId = getCompanyId()
        query = query.eq('company_id', companyId)
      }

      const { error } = await query

      return {
        success: !error,
        error: error?.message || null
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }, [user?.role, getCompanyId])

  // Count records
  const count = useCallback(async (
    table: keyof Tables,
    filters?: Record<string, any>
  ): Promise<{ count: number; error: string | null }> => {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans') {
        const companyId = getCompanyId()
        query = query.eq('company_id', companyId)
      }

      // Apply additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { count: result, error } = await query

      return {
        count: result || 0,
        error: error?.message || null
      }
    } catch (err) {
      return {
        count: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  }, [user?.role, getCompanyId])

  return {
    select,
    insert,
    update,
    remove,
    count,
    user,
    companyId: user?.tenant_id
  }
}