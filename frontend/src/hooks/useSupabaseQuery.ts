/**
 * Advanced Supabase Query Hooks for ERP System
 * Provides caching, pagination, real-time subscriptions, and complex queries
 * Uses MCP Supabase patterns for production-ready data fetching
 * Date: 2025-09-14
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../stores/authStore';
import type {
  TableName,
  TableRow,
} from '../types/database';

// ============================================================================
// ADVANCED QUERY TYPES & OPTIONS
// ============================================================================

export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number; // Cache time in ms
  cacheTime?: number; // Cache persist time in ms
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  select?: string; // Custom select fields
  orderBy?: { column: string; ascending?: boolean }[];
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  orderBy?: { column: string; ascending?: boolean }[];
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SubscriptionOptions {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
}

export interface OptimisticUpdate<T> {
  type: 'insert' | 'update' | 'delete';
  data: T | Partial<T>;
  rollback?: () => void;
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.staleTime) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, staleTime = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

// ============================================================================
// ADVANCED SUPABASE QUERY HOOK
// ============================================================================

export function useSupabaseQuery<T extends TableName>(
  tableName: T,
  options: QueryOptions = {}
) {
  const [data, setData] = useState<TableRow<T>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  const { user } = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    refetchInterval,
    select = '*',
    orderBy = [{ column: 'created_at', ascending: false }],
    filters = {},
    limit,
    offset,
  } = options;

  // Generate cache key
  const cacheKey = `${tableName}-${JSON.stringify({ 
    select, 
    orderBy, 
    filters, 
    limit, 
    offset,
    company_id: user?.tenant_id 
  })}`;

  // Fetch function
  const fetchData = useCallback(async (forceRefetch = false) => {
    if (!enabled || !user?.tenant_id) return;

    // Check cache first
    if (!forceRefetch) {
      const cachedData = queryCache.get<TableRow<T>[]>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from(tableName)
        .select(select, { count: 'exact' });

      // Apply company isolation
      const systemTables = ['subscription_plans'];
      if (!systemTables.includes(tableName)) {
        query = query.eq('company_id', user.tenant_id);
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'string' && value.startsWith('ilike:')) {
            query = query.ilike(key, value.substring(6));
          } else if (typeof value === 'string' && value.startsWith('gte:')) {
            query = query.gte(key, value.substring(4));
          } else if (typeof value === 'string' && value.startsWith('lte:')) {
            query = query.lte(key, value.substring(4));
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      orderBy.forEach(({ column, ascending = true }) => {
        query = query.order(column, { ascending });
      });

      // Apply pagination
      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 50) - 1);
      }

      const { data: fetchedData, error: fetchError } = await query.abortSignal(
        abortControllerRef.current.signal
      );

      if (fetchError) throw fetchError;

      const result = fetchedData || [];
      setData(result);
      setLastFetch(new Date());

      // Cache the result
      queryCache.set(cacheKey, result, staleTime);

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      
      const error = err as Error;
      setError(error);
      console.error('Query error:', error);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    user?.tenant_id,
    tableName,
    select,
    orderBy,
    filters,
    limit,
    offset,
    cacheKey,
    staleTime,
  ]);

  // Refetch function
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Invalidate cache for this query
  const invalidate = useCallback(() => {
    queryCache.invalidate(tableName);
    return fetchData(true);
  }, [tableName, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (refetchOnWindowFocus) {
      const handleFocus = () => {
        fetchData(true);
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    invalidate,
  };
}

// ============================================================================
// PAGINATED QUERY HOOK
// ============================================================================

export function usePaginatedQuery<T extends TableName>(
  tableName: T,
  paginationOptions: PaginationOptions
) {
  const [result, setResult] = useState<PaginationResult<TableRow<T>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { user } = useAuth();

  const { page, pageSize, orderBy = [], filters = {} } = paginationOptions;

  const fetchPage = useCallback(async () => {
    if (!user?.tenant_id) return;

    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * pageSize;

      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' });

      // Apply company isolation
      const systemTables = ['subscription_plans'];
      if (!systemTables.includes(tableName)) {
        query = query.eq('company_id', user.tenant_id);
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      orderBy.forEach(({ column, ascending = true }) => {
        query = query.order(column, { ascending });
      });

      // Apply pagination
      query = query.range(offset, offset + pageSize - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const totalPages = Math.ceil((count || 0) / pageSize);

      setResult({
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  }, [tableName, page, pageSize, orderBy, filters, user?.tenant_id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    result,
    loading,
    error,
    refetch: fetchPage,
  };
}

// ============================================================================
// REAL-TIME SUBSCRIPTION HOOK
// ============================================================================

export function useSupabaseSubscription<T extends TableName>(
  tableName: T,
  options: SubscriptionOptions = { event: '*' }
) {
  const [lastChange, setLastChange] = useState<{
    eventType: string;
    new: TableRow<T> | null;
    old: TableRow<T> | null;
    timestamp: Date;
  } | null>(null);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  const { event = '*', filter, schema = 'public' } = options;

  useEffect(() => {
    if (!user?.tenant_id) return;

    // Create subscription
    let subscription = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table: tableName,
          filter,
        },
        (payload: any) => {
          setLastChange({
            eventType: payload.eventType,
            new: payload.new as TableRow<T>,
            old: payload.old as TableRow<T>,
            timestamp: new Date(),
          });

          // Invalidate cache on changes
          queryCache.invalidate(tableName);
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [tableName, event, filter, schema, user?.tenant_id]);

  return {
    lastChange,
  };
}

// ============================================================================
// OPTIMISTIC UPDATES HOOK
// ============================================================================

export function useOptimisticUpdates<T extends TableName>(_tableName: T) {
  const [optimisticData, setOptimisticData] = useState<TableRow<T>[]>([]);
  const [rollbackQueue, setRollbackQueue] = useState<(() => void)[]>([]);

  const applyOptimisticUpdate = useCallback((update: OptimisticUpdate<TableRow<T>>) => {
    const rollback = () => {
      setOptimisticData(prev => {
        switch (update.type) {
          case 'insert':
            return prev.filter(item => item.id !== (update.data as TableRow<T>).id);
          case 'update':
            // Restore original data
            return prev;
          case 'delete':
            return [...prev, update.data as TableRow<T>];
          default:
            return prev;
        }
      });
    };

    setOptimisticData(prev => {
      switch (update.type) {
        case 'insert':
          return [...prev, update.data as TableRow<T>];
        case 'update':
          return prev.map(item => 
            item.id === (update.data as TableRow<T>).id 
              ? { ...item, ...update.data }
              : item
          );
        case 'delete':
          return prev.filter(item => item.id !== (update.data as TableRow<T>).id);
        default:
          return prev;
      }
    });

    setRollbackQueue(prev => [...prev, rollback]);

    return rollback;
  }, []);

  const clearOptimistic = useCallback(() => {
    setOptimisticData([]);
    setRollbackQueue([]);
  }, []);

  const rollbackAll = useCallback(() => {
    rollbackQueue.forEach(rollback => rollback());
    clearOptimistic();
  }, [rollbackQueue, clearOptimistic]);

  return {
    optimisticData,
    applyOptimisticUpdate,
    clearOptimistic,
    rollbackAll,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

// Global cache control
export function useQueryCache() {
  const invalidateAll = useCallback(() => {
    queryCache.clear();
  }, []);

  const invalidateTable = useCallback((tableName: string) => {
    queryCache.invalidate(tableName);
  }, []);

  return {
    invalidateAll,
    invalidateTable,
  };
}

// Connection status
export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('connection-test');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setReconnecting(false);
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true);
        setReconnecting(false);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
        setReconnecting(true);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    isConnected,
    reconnecting,
  };
}