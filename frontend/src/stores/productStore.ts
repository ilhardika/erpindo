// @ts-nocheck - Temporary fix for Supabase TypeScript issues
// Product management store with Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { createAppError, handleSupabaseError } from '@/lib/errorHandling'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export interface ProductState {
  // Data
  products: Product[]
  currentProduct: Product | null
  
  // UI State
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string | null
  sortBy: 'name' | 'created_at' | 'stock' | 'price'
  sortOrder: 'asc' | 'desc'
  
  // Pagination
  page: number
  limit: number
  total: number
  
  // Actions
  fetchProducts: () => Promise<void>
  fetchProduct: (id: string) => Promise<void>
  createProduct: (data: ProductInsert) => Promise<boolean>
  updateProduct: (id: string, data: ProductUpdate) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  
  // Search & Filter
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setSorting: (by: ProductState['sortBy'], order: ProductState['sortOrder']) => void
  
  // UI Actions
  setCurrentProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Pagination
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name' as const,
  sortOrder: 'asc' as const,
  page: 1,
  limit: 20,
  total: 0
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch products with search and filtering
      fetchProducts: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const { searchQuery, selectedCategory, sortBy, sortOrder, page, limit } = get()
          
          let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            
          // Apply filters
          if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%, sku.ilike.%${searchQuery}%`)
          }
          
          if (selectedCategory) {
            query = query.eq('category', selectedCategory)
          }
          
          // Apply sorting
          query = query.order(sortBy, { ascending: sortOrder === 'asc' })
          
          // Apply pagination
          const start = (page - 1) * limit
          const end = start + limit - 1
          query = query.range(start, end)
          
          const { data, error, count } = await query
          
          if (error) {
            const appError = handleSupabaseError(error)
            set({ error: appError.message, isLoading: false })
            return
          }
          
          set({
            products: data || [],
            total: count || 0,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const appError = createAppError('DATABASE_ERROR', 'Gagal memuat data produk')
          set({ error: appError.message, isLoading: false })
        }
      },

      // Fetch single product
      fetchProduct: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single()
          
          if (error) {
            const appError = handleSupabaseError(error)
            set({ error: appError.message, isLoading: false })
            return
          }
          
          set({
            currentProduct: data,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const appError = createAppError('DATABASE_ERROR', 'Gagal memuat data produk')
          set({ error: appError.message, isLoading: false })
        }
      },

      // Create new product
      createProduct: async (productData) => {
        set({ isLoading: true, error: null })
        
        try {
          // Generate SKU if not provided
          if (!productData.sku) {
            const timestamp = Date.now().toString().slice(-6)
            productData.sku = `PRD${timestamp}`
          }
          
          // @ts-ignore - Temporary fix for TypeScript issue with Supabase types
          const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()
          
          if (error) {
            const appError = handleSupabaseError(error)
            set({ error: appError.message, isLoading: false })
            return false
          }
          
          // Add to local state
          const { products } = get()
          set({
            products: [data, ...products],
            currentProduct: data,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          const appError = createAppError('DATABASE_ERROR', 'Gagal membuat produk baru')
          set({ error: appError.message, isLoading: false })
          return false
        }
      },

      // Update product
      updateProduct: async (id, updateData) => {
        set({ isLoading: true, error: null })
        
        try {
          // @ts-ignore - Temporary fix for TypeScript issue with Supabase types
          const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()
          
          if (error) {
            const appError = handleSupabaseError(error)
            set({ error: appError.message, isLoading: false })
            return false
          }
          
          // Update local state
          const { products, currentProduct } = get()
          const updatedProducts = products.map(product => 
            product.id === id ? data : product
          )
          
          set({
            products: updatedProducts,
            currentProduct: currentProduct?.id === id ? data : currentProduct,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          const appError = createAppError('DATABASE_ERROR', 'Gagal memperbarui produk')
          set({ error: appError.message, isLoading: false })
          return false
        }
      },

      // Delete product
      deleteProduct: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
          
          if (error) {
            const appError = handleSupabaseError(error)
            set({ error: appError.message, isLoading: false })
            return false
          }
          
          // Remove from local state
          const { products, currentProduct } = get()
          const filteredProducts = products.filter(product => product.id !== id)
          
          set({
            products: filteredProducts,
            currentProduct: currentProduct?.id === id ? null : currentProduct,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          const appError = createAppError('DATABASE_ERROR', 'Gagal menghapus produk')
          set({ error: appError.message, isLoading: false })
          return false
        }
      },

      // Search & Filter actions
      setSearchQuery: (query) => {
        set({ searchQuery: query, page: 1 })
        get().fetchProducts()
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category, page: 1 })
        get().fetchProducts()
      },

      setSorting: (by, order) => {
        set({ sortBy: by, sortOrder: order, page: 1 })
        get().fetchProducts()
      },

      // UI actions
      setCurrentProduct: (product) => set({ currentProduct: product }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Pagination
      setPage: (page) => {
        set({ page })
        get().fetchProducts()
      },

      setLimit: (limit) => {
        set({ limit, page: 1 })
        get().fetchProducts()
      },

      // Reset store
      reset: () => set(initialState)
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        limit: state.limit
      })
    }
  )
)

// Selector hooks for easier access
export const useProducts = () => {
  const store = useProductStore()
  return {
    products: store.products,
    total: store.total,
    isLoading: store.isLoading,
    error: store.error,
    searchQuery: store.searchQuery,
    selectedCategory: store.selectedCategory,
    sortBy: store.sortBy,
    sortOrder: store.sortOrder,
    page: store.page,
    limit: store.limit
  }
}

export const useProductActions = () => {
  const store = useProductStore()
  return {
    fetchProducts: store.fetchProducts,
    fetchProduct: store.fetchProduct,
    createProduct: store.createProduct,
    updateProduct: store.updateProduct,
    deleteProduct: store.deleteProduct,
    setSearchQuery: store.setSearchQuery,
    setSelectedCategory: store.setSelectedCategory,
    setSorting: store.setSorting,
    setCurrentProduct: store.setCurrentProduct,
    setPage: store.setPage,
    setLimit: store.setLimit,
    clearError: store.clearError,
    reset: store.reset
  }
}

export const useCurrentProduct = () => {
  const store = useProductStore()
  return {
    currentProduct: store.currentProduct,
    isLoading: store.isLoading,
    error: store.error
  }
}