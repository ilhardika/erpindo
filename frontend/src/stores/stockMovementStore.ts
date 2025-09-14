/**
 * Stock Movement Store with Zustand
 * Manages stock movement tracking and history
 * Integrates with Supabase database for stock mutation logging
 * Date: 2025-09-14
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';
import { parseError, withRetry } from '../utils/errorHandling';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'transfer' | 'opname';
  quantity: number;
  reference_type?: string; // 'sale', 'purchase', 'adjustment', 'transfer', 'opname'
  reference_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  
  // Joined data
  product?: {
    name: string;
    sku: string;
    unit_of_measure: string;
  };
  creator?: {
    name: string;
    email: string;
  };
}

export interface StockMovementFilters {
  product_id?: string;
  movement_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StockMovementState {
  // Data state
  movements: StockMovement[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: StockMovementFilters;
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

export interface StockMovementActions {
  // CRUD operations
  loadMovements: () => Promise<void>;
  createMovement: (movement: Omit<StockMovement, 'id' | 'created_at' | 'company_id'>) => Promise<boolean>;
  
  // Filtering and pagination
  setFilters: (filters: Partial<StockMovementFilters>) => void;
  setPagination: (page: number) => void;
  clearFilters: () => void;
  
  // Utility actions
  clearError: () => void;
  getProductMovements: (productId: string) => StockMovement[];
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useStockMovementStore = create<StockMovementState & StockMovementActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      movements: [],
      loading: false,
      saving: false,
      error: null,
      
      // Filters and pagination
      filters: {},
      currentPage: 1,
      pageSize: 50,
      totalCount: 0,

      // ========================================================================
      // CRUD OPERATIONS
      // ========================================================================

      loadMovements: async () => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User not authenticated');
          }

          const { filters, currentPage, pageSize } = get();
          
          const result = await withRetry(
            async () => {
              let query = supabase
                .from('stock_movements')
                .select(`
                  *,
                  product:products(name, sku, unit_of_measure),
                  creator:users(name, email)
                `)
                .eq('company_id', user.tenant_id)
                .order('created_at', { ascending: false });

              // Apply filters
              if (filters.product_id) {
                query = query.eq('product_id', filters.product_id);
              }
              
              if (filters.movement_type) {
                query = query.eq('movement_type', filters.movement_type);
              }
              
              if (filters.date_from) {
                query = query.gte('created_at', filters.date_from);
              }
              
              if (filters.date_to) {
                query = query.lte('created_at', filters.date_to);
              }
              
              if (filters.search) {
                query = query.or(`notes.ilike.%${filters.search}%,reference_type.ilike.%${filters.search}%`);
              }

              // Apply pagination
              const from = (currentPage - 1) * pageSize;
              const to = from + pageSize - 1;
              query = query.range(from, to);

              const { data, error, count } = await query;

              if (error) {
                console.error('stockMovementStore: loadMovements error', error);
                throw error;
              }

              console.log('stockMovementStore: loadMovements success', { count: data?.length });
              return { data: data || [], count: count || 0 };
            },
            { maxAttempts: 2 },
            { operation: 'load_stock_movements', table: 'stock_movements', timestamp: new Date() }
          );

          set({
            movements: result.data,
            totalCount: result.count,
            loading: false,
          });

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'load_stock_movements',
            table: 'stock_movements',
            timestamp: new Date(),
          });
          
          console.error('stockMovementStore: loadMovements failed', parsedError);
          set({
            loading: false,
            error: parsedError.userMessage,
            movements: [],
          });
        }
      },

      createMovement: async (movementData) => {
        try {
          set({ saving: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User not authenticated');
          }

          const result = await withRetry(
            async () => {
              console.log('stockMovementStore: createMovement called', movementData);
              
              const { data, error } = await supabase
                .from('stock_movements')
                .insert({
                  ...movementData,
                  company_id: user.tenant_id,
                  created_by: user.id,
                })
                .select(`
                  *,
                  product:products(name, sku, unit_of_measure),
                  creator:users(name, email)
                `)
                .single();

              if (error) {
                console.error('stockMovementStore: createMovement error', error);
                throw error;
              }

              console.log('stockMovementStore: createMovement success', data);
              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'create_stock_movement', table: 'stock_movements', timestamp: new Date() }
          );

          if (result.data) {
            // Add to local state
            set(state => ({
              movements: [result.data, ...state.movements],
              saving: false,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'create_stock_movement',
            table: 'stock_movements',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockMovementStore: createMovement failed', parsedError);
          return false;
        }
      },

      // ========================================================================
      // FILTERING AND PAGINATION
      // ========================================================================

      setFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filtering
        }));
      },

      setPagination: (page) => {
        set({ currentPage: page });
      },

      clearFilters: () => {
        set({
          filters: {},
          currentPage: 1,
        });
      },

      // ========================================================================
      // UTILITY ACTIONS
      // ========================================================================

      clearError: () => {
        set({ error: null });
      },

      getProductMovements: (productId: string) => {
        const { movements } = get();
        return movements.filter(movement => movement.product_id === productId);
      },
    }),
    {
      name: 'stock-movement-store',
    }
  )
);

// ============================================================================
// SELECTORS AND ACTIONS HOOKS
// ============================================================================

export const useStockMovementSelectors = () => {
  const store = useStockMovementStore();
  
  return {
    totalPages: Math.ceil(store.totalCount / store.pageSize),
    hasNextPage: store.currentPage < Math.ceil(store.totalCount / store.pageSize),
    hasPreviousPage: store.currentPage > 1,
    
    // Movement type summary
    movementSummary: store.movements.reduce((acc, movement) => {
      acc[movement.movement_type] = (acc[movement.movement_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Today's movements
    todayMovements: store.movements.filter(movement => {
      const today = new Date().toISOString().split('T')[0];
      return movement.created_at.startsWith(today);
    }),
  };
};

export const useStockMovementActions = () => {
  const {
    loadMovements,
    createMovement,
    setFilters,
    setPagination,
    clearFilters,
    clearError,
    getProductMovements,
  } = useStockMovementStore();

  return {
    loadMovements,
    createMovement,
    setFilters,
    setPagination,
    clearFilters,
    clearError,
    getProductMovements,
  };
};