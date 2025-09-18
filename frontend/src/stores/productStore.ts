/**
 * Product Store with Zustand
 * Manages product state, CRUD operations, and local caching
 * Integrates with Supabase database hooks for multi-tenant isolation
 * Date: 2025-09-14
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';
import { parseError, withRetry } from '../utils/errorHandling';
import type { Product, ProductInsert, ProductUpdate } from '../types/database';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a stock movement record
 */
const createStockMovement = async (
  productId: string,
  movementType: 'in' | 'out' | 'adjustment',
  quantity: number,
  referenceType: string,
  referenceId?: string,
  notes?: string
) => {
  try {
    const { user } = useAuthStore.getState();
    if (!user?.tenant_id) return false;

    const { error } = await supabase
      .from('stock_movements')
      .insert({
        company_id: user.tenant_id,
        product_id: productId,
        movement_type: movementType,
        quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        notes,
        created_by: user.id,
      });

    if (error) {
      console.error('createStockMovement error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('createStockMovement failed:', error);
    return false;
  }
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
  low_stock?: boolean;
  price_min?: number;
  price_max?: number;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'stock_quantity' | 'created_at';
  direction: 'asc' | 'desc';
}

export interface ProductState {
  // Data state
  products: Product[];
  selectedProduct: Product | null;
  
  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Filters and pagination
  filters: ProductFilters;
  sort: ProductSortOptions;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // Form state
  showForm: boolean;
  isEditing: boolean;
  formErrors: Record<string, string>;
}

export interface ProductActions {
  // Data operations
  loadProducts: () => Promise<void>;
  createProduct: (product: ProductInsert) => Promise<boolean>;
  updateProduct: (id: string, product: ProductUpdate) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Selection
  selectProduct: (product: Product | null) => void;
  
  // Filters and sorting
  setFilters: (filters: Partial<ProductFilters>) => void;
  setSort: (sort: ProductSortOptions) => void;
  setPagination: (page: number, pageSize?: number) => void;
  clearFilters: () => void;
  
  // UI actions
  showCreateForm: () => void;
  showEditForm: (product: Product) => void;
  hideForm: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Bulk operations
  toggleProductStatus: (id: string) => Promise<boolean>;
  bulkUpdateStatus: (ids: string[], isActive: boolean) => Promise<boolean>;
}

export type ProductStore = ProductState & ProductActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ProductState = {
  // Data state
  products: [],
  selectedProduct: null,
  
  // UI state
  loading: false,
  saving: false,
  error: null,
  
  // Filters and pagination
  filters: {},
  sort: { field: 'created_at', direction: 'desc' },
  currentPage: 1,
  pageSize: 50, // Temporarily increase to see all products
  totalCount: 0,
  
  // Form state
  showForm: false,
  isEditing: false,
  formErrors: {},
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // ========================================================================
      // DATA OPERATIONS
      // ========================================================================

      loadProducts: async () => {
        const { filters, sort, currentPage, pageSize } = get();
        
        try {
          set({ loading: true, error: null });

          // Get current user's tenant_id
          const { user } = useAuthStore.getState();
          
          if (!user?.tenant_id) {
            throw new Error('User tenant not found');
          }

          // Build Supabase query
          let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('company_id', user.tenant_id);


          // Apply filters
          if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }
          
          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          
          if (filters.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
          }
          
          if (filters.low_stock) {
            // Use a simple filter for now - can be enhanced later
            query = query.lt('stock_quantity', 10);
          }
          
          if (filters.price_min !== undefined) {
            query = query.gte('selling_price', filters.price_min);
          }
          
          if (filters.price_max !== undefined) {
            query = query.lte('selling_price', filters.price_max);
          }

          // Apply sorting
          query = query.order(sort.field, { ascending: sort.direction === 'asc' });

          // Apply pagination
          const from = (currentPage - 1) * pageSize;
          const to = from + pageSize - 1;
          
          query = query.range(from, to);

          const { data, count, error } = await query;


          if (error) {
            throw error;
          }

          set({
            products: data || [],
            totalCount: count || 0,
            loading: false,
          });


        } catch (error) {
          console.error('Error loading products:', error);
          const parsedError = parseError(error, {
            operation: 'load_products',
            table: 'products',
            timestamp: new Date(),
          });
          
          set({
            loading: false,
            error: parsedError.userMessage,
          });
        }
      },

      createProduct: async (productData: ProductInsert) => {
        try {
          set({ saving: true, error: null, formErrors: {} });

          // Get current user's tenant_id
          const { user } = useAuthStore.getState();
          if (!user?.tenant_id) {
            throw new Error('User tenant not found');
          }

          // Add company_id to product data
          const dataWithCompany = {
            ...productData,
            company_id: user.tenant_id,
            created_by: user.id.startsWith('demo-') ? null : user.id // Set null for demo users to avoid FK constraint
          };


          const { data, error } = await supabase
            .from('products')
            .insert([dataWithCompany])
            .select()
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            // Create stock movement for initial stock
            if (dataWithCompany.stock_quantity && dataWithCompany.stock_quantity > 0) {
              await createStockMovement(
                data.id,
                'in',
                dataWithCompany.stock_quantity,
                'initial_stock',
                undefined,
                'Initial stock when creating product'
              );
            }
            
            // Add to local state
            set(state => ({
              products: [data, ...state.products],
              saving: false,
              showForm: false,
              selectedProduct: null,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          console.error('Error creating product:', error);
          const parsedError = parseError(error, {
            operation: 'create_product',
            table: 'products',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          return false;
        }
      },

      updateProduct: async (id: string, productData: ProductUpdate) => {
        try {
          set({ saving: true, error: null, formErrors: {} });

          const result = await withRetry(
            async () => {
              
              const { data, error } = await supabase
                .from('products')
                .update({
                  ...productData,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

              if (error) {
                console.error('productStore: updateProduct error', error);
                throw error;
              }

              return { data, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'update_product', table: 'products', timestamp: new Date() }
          );

          if (result.data) {
            // Track stock quantity changes
            const oldProduct = get().products.find(p => p.id === id);
            if (oldProduct && productData.stock_quantity !== undefined && 
                productData.stock_quantity !== oldProduct.stock_quantity) {
              
              const quantityDiff = productData.stock_quantity - oldProduct.stock_quantity;
              const movementType = quantityDiff > 0 ? 'in' : 'out';
              const absQuantity = Math.abs(quantityDiff);
              
              await createStockMovement(
                id,
                movementType,
                absQuantity,
                'adjustment',
                undefined,
                `Stock adjustment: ${oldProduct.stock_quantity} → ${productData.stock_quantity}`
              );
            }
            
            // Update local state
            set(state => ({
              products: state.products.map(p => 
                p.id === id ? { ...p, ...result.data } : p
              ),
              saving: false,
              showForm: false,
              selectedProduct: null,
            }));
            
            return true;
          }
          
          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'update_product',
            table: 'products',
            timestamp: new Date(),
          });
          
          set({
            saving: false,
            error: parsedError.userMessage,
          });
          
          return false;
        }
      },

      deleteProduct: async (id: string) => {
        try {
          set({ loading: true, error: null });

          const result = await withRetry(
            async () => {
              
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

              if (error) {
                console.error('productStore: deleteProduct error', error);
                throw error;
              }

              return { data: true, error: null };
            },
            { maxAttempts: 2 },
            { operation: 'delete_product', table: 'products', timestamp: new Date() }
          );

          if (result.data) {
            // Remove from local state
            set(state => ({
              products: state.products.filter(p => p.id !== id),
              loading: false,
              selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
            }));
            
            return true;
          }

          return false;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'delete_product',
            table: 'products',
            timestamp: new Date(),
          });
          
          set({
            loading: false,
            error: parsedError.userMessage,
          });
          
          return false;
        }
      },

      // ========================================================================
      // SELECTION
      // ========================================================================

      selectProduct: (product: Product | null) => {
        set({ selectedProduct: product });
      },

      // ========================================================================
      // FILTERS AND SORTING
      // ========================================================================

      setFilters: (newFilters: Partial<ProductFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filtering
        }));
        // Remove auto-reload to prevent infinite loops
      },

      setSort: (sort: ProductSortOptions) => {
        set({ sort, currentPage: 1 });
        // Remove auto-reload to prevent infinite loops
      },

      setPagination: (page: number, pageSize?: number) => {
        set(state => ({
          currentPage: page,
          pageSize: pageSize || state.pageSize,
        }));
        // Remove auto-reload to prevent infinite loops
      },

      clearFilters: () => {
        set({
          filters: {},
          currentPage: 1,
        });
        // Remove auto-reload to prevent infinite loops
      },

      // ========================================================================
      // UI ACTIONS
      // ========================================================================

      showCreateForm: () => {
        set({
          showForm: true,
          isEditing: false,
          selectedProduct: null,
          formErrors: {},
          error: null,
        });
      },

      showEditForm: (product: Product) => {
        set({
          showForm: true,
          isEditing: true,
          selectedProduct: product,
          formErrors: {},
          error: null,
        });
      },

      hideForm: () => {
        set({
          showForm: false,
          isEditing: false,
          selectedProduct: null,
          formErrors: {},
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // ========================================================================
      // BULK OPERATIONS
      // ========================================================================

      toggleProductStatus: async (id: string) => {
        const product = get().products.find(p => p.id === id);
        if (!product) return false;

        return get().updateProduct(id, {
          is_active: !product.is_active,
        });
      },

      bulkUpdateStatus: async (ids: string[], isActive: boolean) => {
        try {
          set({ loading: true, error: null });

          // Update all products
          const promises = ids.map(id => 
            get().updateProduct(id, { is_active: isActive })
          );

          const results = await Promise.all(promises);
          const success = results.every(result => result);

          set({ loading: false });
          return success;

        } catch (error) {
          const parsedError = parseError(error, {
            operation: 'bulk_update_status',
            table: 'products',
            timestamp: new Date(),
          });
          
          set({
            loading: false,
            error: parsedError.userMessage,
          });
          
          return false;
        }
      },
    }),
    {
      name: 'product-store',
      partialize: (state: ProductStore) => ({
        filters: state.filters,
        sort: state.sort,
        pageSize: state.pageSize,
      }),
    }
  )
);

// ============================================================================
// COMPUTED SELECTORS
// ============================================================================

export const useProductSelectors = () => {
  const store = useProductStore();
  
  return {
    // Filtered products for current page
    currentPageProducts: store.products,
    
    // Pagination info
    totalPages: Math.ceil(store.totalCount / store.pageSize),
    hasNextPage: store.currentPage < Math.ceil(store.totalCount / store.pageSize),
    hasPreviousPage: store.currentPage > 1,
    
    // Active products only
    activeProducts: store.products.filter(p => p.is_active),
    
    // Low stock products
    lowStockProducts: store.products.filter(p => 
      p.stock_quantity <= (p.minimum_stock || 0)
    ),
    
    // Categories from products
    availableCategories: [...new Set(
      store.products
        .map(p => p.category)
        .filter(Boolean)
    )],
    
    // Form state helpers
    canSave: !store.saving && !store.loading,
    hasUnsavedChanges: store.showForm && store.selectedProduct !== null,
  };
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useProductActions = () => {
  const {
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    selectProduct,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    showCreateForm,
    showEditForm,
    hideForm,
    setError,
    clearError,
    toggleProductStatus,
    bulkUpdateStatus,
  } = useProductStore();

  return {
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    selectProduct,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    showCreateForm,
    showEditForm,
    hideForm,
    setError,
    clearError,
    toggleProductStatus,
    bulkUpdateStatus,
  };
};