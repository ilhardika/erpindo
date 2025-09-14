// Custom React hooks for Supabase operations with React Query integration
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/stores/authStore'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

interface QueryOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
}

interface SupabaseQueryResult<T> {
  data: T[] | null
  error: string | null
  loading: boolean
  refetch: () => void
}

/**
 * Custom hook for querying Supabase data with React Query
 * Includes automatic multi-tenant filtering and caching
 */
export function useSupabaseQuery<T = any>(
  table: string,
  queryKey: string[],
  options?: {
    columns?: string
    filters?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    enabled?: boolean
  } & QueryOptions
): SupabaseQueryResult<T> {
  const { user } = useAuth()
  const companyId = user?.tenant_id

  const queryResult = useQuery({
    queryKey: [...queryKey, companyId],
    queryFn: async () => {
      let query = supabase.from(table).select(options?.columns || '*')

      // Apply company_id filter for multi-tenancy (except for dev users)
      if (user?.role !== 'dev' && table !== 'subscription_plans' && companyId) {
        query = query.eq('company_id', companyId)
      }

      // Apply additional filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
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

      if (error) {
        throw new Error(error.message)
      }

      return data as T[]
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    cacheTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false
  })

  return {
    data: queryResult.data || null,
    error: queryResult.error?.message || null,
    loading: queryResult.isLoading,
    refetch: queryResult.refetch
  }
}

/**
 * Hook for inserting data with optimistic updates
 */
export function useSupabaseInsert<T = any>(
  table: string,
  invalidateQueries?: string[]
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const companyId = user?.tenant_id

  return useMutation({
    mutationFn: async (data: Partial<T> & { company_id?: string }) => {
      // Add company_id for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans' && !data.company_id && companyId) {
        data.company_id = companyId
      }

      const { data: result, error } = await supabase
        .from(table)
        .insert(data as any)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return result
    },
    onSuccess: () => {
      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
    }
  })
}

/**
 * Hook for updating data with optimistic updates
 */
export function useSupabaseUpdate<T = any>(
  table: string,
  invalidateQueries?: string[]
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const companyId = user?.tenant_id

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      let query = supabase.from(table).update(data as any).eq('id', id)

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans' && companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data: result, error } = await query.select().single()

      if (error) {
        throw new Error(error.message)
      }

      return result
    },
    onSuccess: () => {
      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
    }
  })
}

/**
 * Hook for deleting data
 */
export function useSupabaseDelete(
  table: string,
  invalidateQueries?: string[]
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const companyId = user?.tenant_id

  return useMutation({
    mutationFn: async (id: string) => {
      let query = supabase.from(table).delete().eq('id', id)

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans' && companyId) {
        query = query.eq('company_id', companyId)
      }

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return { success: true }
    },
    onSuccess: () => {
      // Invalidate related queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
    }
  })
}

/**
 * Hook for real-time subscriptions
 */
export function useSupabaseSubscription<T = any>(
  table: string,
  callback: (payload: any) => void,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    filter?: string
  }
) {
  const { user } = useAuth()
  const companyId = user?.tenant_id

  const subscribe = () => {
    let subscription = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: 'public',
          table: table,
          filter: options?.filter
        },
        (payload) => {
          // Filter by company_id if multi-tenant
          if (user?.role !== 'dev' && table !== 'subscription_plans') {
            const record = payload.new || payload.old
            if (record && record.company_id !== companyId) {
              return // Skip this change
            }
          }
          
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  return { subscribe }
}

/**
 * Hook for counting records
 */
export function useSupabaseCount(
  table: string,
  queryKey: string[],
  filters?: Record<string, any>,
  options?: QueryOptions
) {
  const { user } = useAuth()
  const companyId = user?.tenant_id

  return useQuery({
    queryKey: [...queryKey, 'count', companyId],
    queryFn: async () => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true })

      // Apply company_id filter for multi-tenancy
      if (user?.role !== 'dev' && table !== 'subscription_plans' && companyId) {
        query = query.eq('company_id', companyId)
      }

      // Apply additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })
      }

      const { count, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return count || 0
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    cacheTime: options?.cacheTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false
  })
}