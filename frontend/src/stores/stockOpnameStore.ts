/**
 * Stock Opname Store with Zustand
 * Manages physical stock counting (stock opname) operations
 * Integrates with Supabase database for stock count management
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

export interface StockOpname {
  id: string;
  company_id: string;
  opname_number: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  description?: string;
  opname_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  completed_at?: string;
  completed_by?: string;
}

export interface StockOpnameItem {
  id: string;
  opname_id: string;
  product_id: string;
  system_stock: number;
  physical_stock?: number;
  variance: number;
  notes?: string;
  counted_at?: string;
  counted_by?: string;
  created_at: string;
  
  // Joined data
  product?: {
    name: string;
    sku: string;
    unit_of_measure: string;
    current_stock: number;
  };
}

export interface StockOpnameFilters {
  status?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StockOpnameState {
  // Data state
  opnames: StockOpname[];
  selectedOpname: StockOpname | null;
  opnameItems: StockOpnameItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: StockOpnameFilters;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // UI state
  isFormVisible: boolean;
  showItemForm: boolean;
}

export interface StockOpnameActions {
  // CRUD operations
  loadOpnames: () => Promise<void>;
  loadOpnameItems: (opnameId: string) => Promise<void>;
  createOpname: (opname: Omit<StockOpname, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => Promise<boolean>;
  updateOpname: (id: string, opname: Partial<StockOpname>) => Promise<boolean>;
  deleteOpname: (id: string) => Promise<boolean>;
  
  // Opname item operations
  addProductToOpname: (opnameId: string, productId: string) => Promise<boolean>;
  updateOpnameItem: (itemId: string, physicalStock: number, notes?: string) => Promise<boolean>;
  removeOpnameItem: (itemId: string) => Promise<boolean>;
  
  // Workflow operations
  startOpname: (opnameId: string) => Promise<boolean>;
  completeOpname: (opnameId: string) => Promise<boolean>;
  cancelOpname: (opnameId: string) => Promise<boolean>;
  
  // Filtering and pagination
  setFilters: (filters: Partial<StockOpnameFilters>) => void;
  setPagination: (page: number) => void;
  clearFilters: () => void;
  
  // UI actions
  selectOpname: (opname: StockOpname | null) => void;
  showForm: () => void;
  hideForm: () => void;
  clearError: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useStockOpnameStore = create<StockOpnameState & StockOpnameActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      opnames: [],
      selectedOpname: null,
      opnameItems: [],
      loading: false,
      saving: false,
      error: null,
      
      // Filters and pagination
      filters: {},
      currentPage: 1,
      pageSize: 20,
      totalCount: 0,
      
      // UI state
      isFormVisible: false,
      showItemForm: false,

      // ========================================================================
      // CRUD OPERATIONS
      // ========================================================================

      loadOpnames: async () => {
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
                .from('stock_opname')
                .select('*', { count: 'exact' })
                .eq('company_id', user.tenant_id)
                .order('created_at', { ascending: false });

              // Apply filters
              if (filters.status) {
                query = query.eq('status', filters.status);
              }
              
              if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
              }
              
              if (filters.date_from) {
                query = query.gte('opname_date', filters.date_from);
              }
              
              if (filters.date_to) {
                query = query.lte('opname_date', filters.date_to);
              }
              
              if (filters.search) {
                query = query.or(`opname_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
              }

              // Apply pagination
              const from = (currentPage - 1) * pageSize;
              const to = from + pageSize - 1;
              query = query.range(from, to);

              const { data, error, count } = await query;

              if (error) {
                console.error('stockOpnameStore: loadOpnames error', error);
                throw error;
              }

              return { data: data || [], count: count || 0 };
            },
            { maxAttempts: 2 },
            { operation: 'load_stock_opnames', table: 'stock_opname', timestamp: new Date() }
          );

          set({
            opnames: result.data,
            totalCount: result.count,
            loading: false,
          });

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'load_stock_opnames',
            table: 'stock_opname',
            timestamp: new Date(),
          });
          
          console.error('stockOpnameStore: loadOpnames failed', parsedError);
          set({
            loading: false,
            error: parsedError.userMessage,
            opnames: [],
          });
        }
      },

      loadOpnameItems: async (opnameId: string) => {
        try {
          set({ loading: true, error: null });
          
          const result = await withRetry(
            async () => {
              const { data, error } = await supabase
                .from('stock_opname_items')
                .select(`
                  *,
                  product:products(name, sku, unit_of_measure, stock_quantity)
                `)
                .eq('opname_id', opnameId)
                .order('created_at', { ascending: true });

              if (error) {
                console.error('stockOpnameStore: loadOpnameItems error', error);
                throw error;
              }

              return { data: data || [] };
            },
            { maxAttempts: 2 },
            { operation: 'load_opname_items', table: 'stock_opname_items', timestamp: new Date() }
          );

          set({
            opnameItems: result.data,
            loading: false,
          });

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'load_opname_items',
            table: 'stock_opname_items',
            timestamp: new Date(),
          });
          
          console.error('stockOpnameStore: loadOpnameItems failed', parsedError);
          set({
            loading: false,
            error: parsedError.userMessage,
            opnameItems: [],
          });
        }
      },

      createOpname: async (opnameData) => {
        try {
          set({ saving: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User not authenticated');
          }

          // Generate opname number
          const year = new Date().getFullYear();
          const month = String(new Date().getMonth() + 1).padStart(2, '0');
          const count = get().opnames.length + 1;
          const opnameNumber = `OP-${year}${month}-${String(count).padStart(3, '0')}`;

          const result = await withRetry(
            async () => {
              
              const { data, error } = await supabase
                .from('stock_opname')
                .insert({
                  ...opnameData,
                  opname_number: opnameNumber,
                  company_id: user.tenant_id,
                  created_by: user.id,
                })
                .select()
                .single();

              if (error) {
                console.error('stockOpnameStore: createOpname error', error);
                throw error;
              }

              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'create_stock_opname', table: 'stock_opname', timestamp: new Date() }
          );

          if (result.data) {
            // Add to local state
            set(state => ({
              opnames: [result.data, ...state.opnames],
              saving: false,
              isFormVisible: false,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'create_stock_opname',
            table: 'stock_opname',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: createOpname failed', parsedError);
          return false;
        }
      },

      updateOpname: async (id: string, opnameData) => {
        try {
          set({ saving: true, error: null });

          const result = await withRetry(
            async () => {
              
              const { data, error } = await supabase
                .from('stock_opname')
                .update({
                  ...opnameData,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

              if (error) {
                console.error('stockOpnameStore: updateOpname error', error);
                throw error;
              }

              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'update_stock_opname', table: 'stock_opname', timestamp: new Date() }
          );

          if (result.data) {
            // Update local state
            set(state => ({
              opnames: state.opnames.map(o => 
                o.id === id ? { ...o, ...result.data } : o
              ),
              selectedOpname: state.selectedOpname?.id === id ? { ...state.selectedOpname, ...result.data } : state.selectedOpname,
              saving: false,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'update_stock_opname',
            table: 'stock_opname',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: updateOpname failed', parsedError);
          return false;
        }
      },

      deleteOpname: async (id: string) => {
        try {
          set({ loading: true, error: null });

          const result = await withRetry(
            async () => {
              
              const { error } = await supabase
                .from('stock_opname')
                .delete()
                .eq('id', id);

              if (error) {
                console.error('stockOpnameStore: deleteOpname error', error);
                throw error;
              }

              return { data: true, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'delete_stock_opname', table: 'stock_opname', timestamp: new Date() }
          );

          if (result.data) {
            // Remove from local state
            set(state => ({
              opnames: state.opnames.filter(o => o.id !== id),
              selectedOpname: state.selectedOpname?.id === id ? null : state.selectedOpname,
              loading: false,
            }));
            
            return true;
          }

          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'delete_stock_opname',
            table: 'stock_opname',
            timestamp: new Date(),
          });
          
          set({
            loading: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: deleteOpname failed', parsedError);
          return false;
        }
      },

      // ========================================================================
      // OPNAME ITEM OPERATIONS
      // ========================================================================

      addProductToOpname: async (opnameId: string, productId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User not authenticated');
          }

          // Get current product stock
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productId)
            .single();

          if (productError) {
            throw productError;
          }

          const result = await withRetry(
            async () => {
              const { data, error } = await supabase
                .from('stock_opname_items')
                .insert({
                  opname_id: opnameId,
                  product_id: productId,
                  system_stock: product?.stock_quantity || 0,
                })
                .select(`
                  *,
                  product:products(name, sku, unit_of_measure, stock_quantity)
                `)
                .single();

              if (error) {
                console.error('stockOpnameStore: addProductToOpname error', error);
                throw error;
              }

              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'add_product_to_opname', table: 'stock_opname_items', timestamp: new Date() }
          );

          if (result.data) {
            // Add to local state
            set(state => ({
              opnameItems: [...state.opnameItems, result.data],
              saving: false,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'add_product_to_opname',
            table: 'stock_opname_items',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: addProductToOpname failed', parsedError);
          return false;
        }
      },

      updateOpnameItem: async (itemId: string, physicalStock: number, notes?: string) => {
        try {
          set({ saving: true, error: null });
          
          const { user } = useAuthStore.getState();

          const result = await withRetry(
            async () => {
              const { data, error } = await supabase
                .from('stock_opname_items')
                .update({
                  physical_stock: physicalStock,
                  notes,
                  counted_at: new Date().toISOString(),
                  counted_by: user?.id,
                })
                .eq('id', itemId)
                .select(`
                  *,
                  product:products(name, sku, unit_of_measure, stock_quantity)
                `)
                .single();

              if (error) {
                console.error('stockOpnameStore: updateOpnameItem error', error);
                throw error;
              }

              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'update_opname_item', table: 'stock_opname_items', timestamp: new Date() }
          );

          if (result.data) {
            // Update local state
            set(state => ({
              opnameItems: state.opnameItems.map(item => 
                item.id === itemId ? { ...item, ...result.data } : item
              ),
              saving: false,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'update_opname_item',
            table: 'stock_opname_items',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: updateOpnameItem failed', parsedError);
          return false;
        }
      },

      removeOpnameItem: async (itemId: string) => {
        try {
          set({ loading: true, error: null });

          const result = await withRetry(
            async () => {
              const { error } = await supabase
                .from('stock_opname_items')
                .delete()
                .eq('id', itemId);

              if (error) {
                console.error('stockOpnameStore: removeOpnameItem error', error);
                throw error;
              }

              return { data: true, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'remove_opname_item', table: 'stock_opname_items', timestamp: new Date() }
          );

          if (result.data) {
            // Remove from local state
            set(state => ({
              opnameItems: state.opnameItems.filter(item => item.id !== itemId),
              loading: false,
            }));
            
            return true;
          }

          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'remove_opname_item',
            table: 'stock_opname_items',
            timestamp: new Date(),
          });
          
          set({
            loading: false,
            error: parsedError.userMessage,
          });
          
          console.error('stockOpnameStore: removeOpnameItem failed', parsedError);
          return false;
        }
      },

      // ========================================================================
      // WORKFLOW OPERATIONS
      // ========================================================================

      startOpname: async (opnameId: string) => {
        return await get().updateOpname(opnameId, { status: 'in_progress' });
      },

      completeOpname: async (opnameId: string) => {
        const { user } = useAuthStore.getState();
        return await get().updateOpname(opnameId, { 
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id,
        });
      },

      cancelOpname: async (opnameId: string) => {
        return await get().updateOpname(opnameId, { status: 'cancelled' });
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
      // UI ACTIONS
      // ========================================================================

      selectOpname: (opname) => {
        set({ selectedOpname: opname });
      },

      showForm: () => {
        set({ isFormVisible: true });
      },

      hideForm: () => {
        set({ isFormVisible: false, selectedOpname: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'stock-opname-store',
    }
  )
);

// ============================================================================
// SELECTORS AND ACTIONS HOOKS
// ============================================================================

export const useStockOpnameSelectors = () => {
  const store = useStockOpnameStore();
  
  return {
    totalPages: Math.ceil(store.totalCount / store.pageSize),
    hasNextPage: store.currentPage < Math.ceil(store.totalCount / store.pageSize),
    hasPreviousPage: store.currentPage > 1,
    
    // Status summary
    statusSummary: store.opnames.reduce((acc, opname) => {
      acc[opname.status] = (acc[opname.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Variance summary for selected opname
    varianceSummary: store.opnameItems.reduce((acc, item) => {
      if (item.physical_stock !== undefined) {
        acc.totalItems += 1;
        acc.totalVariance += Math.abs(item.variance);
        if (item.variance > 0) acc.overItems += 1;
        if (item.variance < 0) acc.underItems += 1;
        if (item.variance === 0) acc.matchItems += 1;
      }
      return acc;
    }, { totalItems: 0, totalVariance: 0, overItems: 0, underItems: 0, matchItems: 0 }),
  };
};

export const useStockOpnameActions = () => {
  const {
    loadOpnames,
    loadOpnameItems,
    createOpname,
    updateOpname,
    deleteOpname,
    addProductToOpname,
    updateOpnameItem,
    removeOpnameItem,
    startOpname,
    completeOpname,
    cancelOpname,
    setFilters,
    setPagination,
    clearFilters,
    selectOpname,
    showForm,
    hideForm,
    clearError,
  } = useStockOpnameStore();

  return {
    loadOpnames,
    loadOpnameItems,
    createOpname,
    updateOpname,
    deleteOpname,
    addProductToOpname,
    updateOpnameItem,
    removeOpnameItem,
    startOpname,
    completeOpname,
    cancelOpname,
    setFilters,
    setPagination,
    clearFilters,
    selectOpname,
    showForm,
    hideForm,
    clearError,
  };
};