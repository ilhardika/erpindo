/**
 * Product Categories Store
 * Manages CRUD operations for user-specific product categories
 * Date: 2025-09-16
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { ProductCategory, ProductCategoryInsert, ProductCategoryUpdate } from '../types/database';

// ============================================================================
// TYPES
// ============================================================================

interface ProductCategoryState {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  selectedCategory: ProductCategory | null;
}

interface ProductCategoryActions {
  // Category CRUD
  loadCategories: () => Promise<void>;
  createCategory: (category: Omit<ProductCategoryInsert, 'user_id'>) => Promise<boolean>;
  updateCategory: (id: string, updates: ProductCategoryUpdate) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  
  // UI State
  selectCategory: (category: ProductCategory | null) => void;
  clearError: () => void;
  
  // Search & Filter
  searchCategories: (query: string) => ProductCategory[];
  getActiveCategories: () => ProductCategory[];
}

type ProductCategoryStore = ProductCategoryState & ProductCategoryActions;

// ============================================================================
// STORE
// ============================================================================

export const useProductCategoryStore = create<ProductCategoryStore>((set, get) => ({
  // Initial state
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  // ========================================================================
  // CATEGORY CRUD OPERATIONS
  // ========================================================================

  loadCategories: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      console.error('ProductCategoryStore: User not authenticated');
      set({ error: 'User not authenticated' });
      return;
    }

    set({ loading: true, error: null });

    try {
      // Test query without RLS first
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });


      if (error) {
        console.error('ProductCategoryStore: Supabase error details:', error);
        throw error;
      }

      set({ 
        categories: data || [],
        loading: false 
      });
    } catch (error) {
      console.error('ProductCategoryStore: Error loading categories:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load categories',
        loading: false 
      });
    }
  },

  createCategory: async (categoryData) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated' });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const insertData: ProductCategoryInsert = {
        ...categoryData,
        user_id: user.id,
        tenant_id: user.tenant_id || null,
      };

      const { data, error } = await supabase
        .from('product_categories')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set(state => ({
        categories: [...state.categories, data],
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: false 
      });
      return false;
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await (supabase
        .from('product_categories') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? data : cat
        ),
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: false 
      });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        loading: false
      }));

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category',
        loading: false 
      });
      return false;
    }
  },

  // ========================================================================
  // UI STATE MANAGEMENT
  // ========================================================================

  selectCategory: (category) => {
    set({ selectedCategory: category });
  },

  clearError: () => {
    set({ error: null });
  },

  // ========================================================================
  // SEARCH & FILTER
  // ========================================================================

  searchCategories: (query) => {
    const { categories } = get();
    if (!query.trim()) return categories;

    const lowercaseQuery = query.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.description?.toLowerCase().includes(lowercaseQuery)
    );
  },

  getActiveCategories: () => {
    const { categories } = get();
    return categories.filter(category => category.is_active);
  },
}));

// ============================================================================
// SELECTORS & ACTIONS HOOKS
// ============================================================================

export const useProductCategorySelectors = () => {
  return useProductCategoryStore(state => ({
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    selectedCategory: state.selectedCategory,
  }));
};

export const useProductCategoryActions = () => {
  const loadCategories = useProductCategoryStore(state => state.loadCategories);
  const createCategory = useProductCategoryStore(state => state.createCategory);
  const updateCategory = useProductCategoryStore(state => state.updateCategory);
  const deleteCategory = useProductCategoryStore(state => state.deleteCategory);
  const selectCategory = useProductCategoryStore(state => state.selectCategory);
  const clearError = useProductCategoryStore(state => state.clearError);
  const searchCategories = useProductCategoryStore(state => state.searchCategories);
  const getActiveCategories = useProductCategoryStore(state => state.getActiveCategories);
  
  return {
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    selectCategory,
    clearError,
    searchCategories,
    getActiveCategories,
  };
};