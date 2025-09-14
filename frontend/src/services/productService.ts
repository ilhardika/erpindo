/**
 * Product Service
 * Handles all product-related CRUD operations with Supabase
 * Includes multi-tenant isolation, error handling, and business logic
 * Date: 2025-09-14
 */

import { supabase } from '../lib/supabase';
import { parseError, withRetry } from '../utils/errorHandling';
import type { 
  Product, 
  ProductInsert, 
  ProductUpdate 
} from '../types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ProductQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'name' | 'sku' | 'selling_price' | 'cost_price' | 'stock_quantity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductQueryResult {
  data: Product[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  totalCostValue: number;
  averageMargin: number;
  topCategories: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ProductServiceError extends Error {
  public readonly code: string;
  public readonly operation: string;
  public readonly originalError?: any;

  constructor(
    message: string,
    code: string,
    operation: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'ProductServiceError';
    this.code = code;
    this.operation = operation;
    this.originalError = originalError;
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class ProductService {
  private static instance: ProductService;
  
  private constructor() {}
  
  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  // ========================================================================
  // QUERY OPERATIONS
  // ========================================================================

  /**
   * Get products with filtering, pagination, and sorting
   */
  async getProducts(
    companyId: string,
    options: ProductQueryOptions = {}
  ): Promise<ProductQueryResult> {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        category,
        isActive,
        lowStock,
        priceMin,
        priceMax,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = options;

      return await withRetry(
        async () => {
          // Start building the query
          let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('company_id', companyId);

          // Apply filters
          if (search) {
            query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
          }

          if (category) {
            query = query.eq('category', category);
          }

          if (isActive !== undefined) {
            query = query.eq('is_active', isActive);
          }

          if (priceMin !== undefined) {
            query = query.gte('selling_price', priceMin);
          }

          if (priceMax !== undefined) {
            query = query.lte('selling_price', priceMax);
          }

          // Low stock filter requires a subquery or custom logic
          if (lowStock) {
            query = query.or('stock_quantity.lte.minimum_stock');
          }

          // Apply sorting
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });

          // Apply pagination
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          query = query.range(from, to);

          const { data, error, count } = await query;

          if (error) {
            throw new ProductServiceError(
              'Failed to fetch products',
              error.code || 'FETCH_ERROR',
              'getProducts',
              error
            );
          }

          const totalPages = Math.ceil((count || 0) / pageSize);

          return {
            data: data || [],
            count: count || 0,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          };
        },
        { maxAttempts: 3 },
        { operation: 'getProducts', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'getProducts',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'getProducts',
        error
      );
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string, companyId: string): Promise<Product> {
    try {
      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .eq('company_id', companyId)
            .single();

          if (error) {
            throw new ProductServiceError(
              'Product not found',
              error.code || 'NOT_FOUND',
              'getProductById',
              error
            );
          }

          return data;
        },
        { maxAttempts: 2 },
        { operation: 'getProductById', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'getProductById',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'getProductById',
        error
      );
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string, companyId: string): Promise<Product | null> {
    try {
      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('sku', sku)
            .eq('company_id', companyId)
            .maybeSingle();

          if (error) {
            throw new ProductServiceError(
              'Failed to fetch product by SKU',
              error.code || 'FETCH_ERROR',
              'getProductBySku',
              error
            );
          }

          return data;
        },
        { maxAttempts: 2 },
        { operation: 'getProductBySku', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'getProductBySku',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'getProductBySku',
        error
      );
    }
  }

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  /**
   * Create a new product
   */
  async createProduct(productData: ProductInsert): Promise<Product> {
    try {
      // Validate SKU uniqueness
      if (productData.sku) {
        const existingProduct = await this.getProductBySku(
          productData.sku,
          productData.company_id
        );
        if (existingProduct) {
          throw new ProductServiceError(
            'A product with this SKU already exists',
            'DUPLICATE_SKU',
            'createProduct'
          );
        }
      }

      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select('*')
            .single();

          if (error) {
            throw new ProductServiceError(
              'Failed to create product',
              error.code || 'CREATE_ERROR',
              'createProduct',
              error
            );
          }

          return data;
        },
        { maxAttempts: 2 },
        { operation: 'createProduct', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      if (error instanceof ProductServiceError) {
        throw error;
      }
      
      const parsedError = parseError(error, {
        operation: 'createProduct',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'createProduct',
        error
      );
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    companyId: string,
    productData: ProductUpdate
  ): Promise<Product> {
    try {
      // Validate SKU uniqueness if SKU is being updated
      if (productData.sku) {
        const existingProduct = await this.getProductBySku(
          productData.sku,
          companyId
        );
        if (existingProduct && existingProduct.id !== id) {
          throw new ProductServiceError(
            'A product with this SKU already exists',
            'DUPLICATE_SKU',
            'updateProduct'
          );
        }
      }

      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .update({
              ...productData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('company_id', companyId)
            .select('*')
            .single();

          if (error) {
            throw new ProductServiceError(
              'Failed to update product',
              error.code || 'UPDATE_ERROR',
              'updateProduct',
              error
            );
          }

          return data;
        },
        { maxAttempts: 2 },
        { operation: 'updateProduct', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      if (error instanceof ProductServiceError) {
        throw error;
      }
      
      const parsedError = parseError(error, {
        operation: 'updateProduct',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'updateProduct',
        error
      );
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string, companyId: string): Promise<void> {
    try {
      return await withRetry(
        async () => {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('company_id', companyId);

          if (error) {
            throw new ProductServiceError(
              'Failed to delete product',
              error.code || 'DELETE_ERROR',
              'deleteProduct',
              error
            );
          }
        },
        { maxAttempts: 2 },
        { operation: 'deleteProduct', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'deleteProduct',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'deleteProduct',
        error
      );
    }
  }

  // ========================================================================
  // BULK OPERATIONS
  // ========================================================================

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(
    ids: string[],
    companyId: string,
    isActive: boolean
  ): Promise<Product[]> {
    try {
      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .update({
              is_active: isActive,
              updated_at: new Date().toISOString(),
            })
            .in('id', ids)
            .eq('company_id', companyId)
            .select('*');

          if (error) {
            throw new ProductServiceError(
              'Failed to bulk update products',
              error.code || 'BULK_UPDATE_ERROR',
              'bulkUpdateStatus',
              error
            );
          }

          return data || [];
        },
        { maxAttempts: 2 },
        { operation: 'bulkUpdateStatus', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'bulkUpdateStatus',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'bulkUpdateStatus',
        error
      );
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(ids: string[], companyId: string): Promise<void> {
    try {
      return await withRetry(
        async () => {
          const { error } = await supabase
            .from('products')
            .delete()
            .in('id', ids)
            .eq('company_id', companyId);

          if (error) {
            throw new ProductServiceError(
              'Failed to bulk delete products',
              error.code || 'BULK_DELETE_ERROR',
              'bulkDeleteProducts',
              error
            );
          }
        },
        { maxAttempts: 2 },
        { operation: 'bulkDeleteProducts', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'bulkDeleteProducts',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'bulkDeleteProducts',
        error
      );
    }
  }

  // ========================================================================
  // INVENTORY OPERATIONS
  // ========================================================================

  /**
   * Update stock quantity
   */
  async updateStock(
    id: string,
    companyId: string,
    newQuantity: number
  ): Promise<Product> {
    try {
      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('products')
            .update({
              stock_quantity: newQuantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('company_id', companyId)
            .select('*')
            .single();

          if (error) {
            throw new ProductServiceError(
              'Failed to update stock',
              error.code || 'STOCK_UPDATE_ERROR',
              'updateStock',
              error
            );
          }

          // TODO: Create stock movement record
          // This would involve calling a stock movement service

          return data;
        },
        { maxAttempts: 2 },
        { operation: 'updateStock', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'updateStock',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'updateStock',
        error
      );
    }
  }

  // ========================================================================
  // ANALYTICS & REPORTING
  // ========================================================================

  /**
   * Get product statistics
   */
  async getProductStats(companyId: string): Promise<ProductStats> {
    try {
      return await withRetry(
        async () => {
          const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', companyId);

          if (error) {
            throw new ProductServiceError(
              'Failed to fetch product statistics',
              error.code || 'STATS_ERROR',
              'getProductStats',
              error
            );
          }

          const activeProducts = products?.filter(p => p.is_active) || [];
          const lowStockProducts = products?.filter(p => 
            p.stock_quantity <= p.minimum_stock
          ) || [];
          const outOfStockProducts = products?.filter(p => 
            p.stock_quantity === 0
          ) || [];

          const totalInventoryValue = products?.reduce((sum, p) => 
            sum + (p.selling_price * p.stock_quantity), 0
          ) || 0;

          const totalCostValue = products?.reduce((sum, p) => 
            sum + ((p.cost_price || 0) * p.stock_quantity), 0
          ) || 0;

          const averageMargin = totalInventoryValue > 0 && totalCostValue > 0
            ? ((totalInventoryValue - totalCostValue) / totalInventoryValue) * 100
            : 0;

          // Group by categories
          const categoryStats = products?.reduce((acc, product) => {
            const category = product.category || 'Uncategorized';
            if (!acc[category]) {
              acc[category] = { count: 0, value: 0 };
            }
            acc[category].count++;
            acc[category].value += product.selling_price * product.stock_quantity;
            return acc;
          }, {} as Record<string, { count: number; value: number }>) || {};

          const topCategories = Object.entries(categoryStats)
            .map(([category, stats]) => ({
              category,
              count: (stats as { count: number; value: number }).count,
              value: (stats as { count: number; value: number }).value,
            }))
            .sort((a, b) => b.value - a.value);

          return {
            totalProducts: products?.length || 0,
            activeProducts: activeProducts.length,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts: outOfStockProducts.length,
            totalInventoryValue,
            totalCostValue,
            averageMargin,
            topCategories,
          };
        },
        { maxAttempts: 2 },
        { operation: 'getProductStats', table: 'products', timestamp: new Date() }
      );
    } catch (error) {
      const parsedError = parseError(error, {
        operation: 'getProductStats',
        table: 'products',
        timestamp: new Date(),
      });
      throw new ProductServiceError(
        parsedError.userMessage,
        parsedError.code,
        'getProductStats',
        error
      );
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Generate unique SKU
   */
  generateSKU(productName: string, category?: string): string {
    const namePrefix = productName.substring(0, 3).toUpperCase();
    const categoryPrefix = category 
      ? category.substring(0, 2).toUpperCase() 
      : 'GN';
    const timestamp = Date.now().toString().slice(-6);
    
    return `${namePrefix}-${categoryPrefix}-${timestamp}`;
  }

  /**
   * Validate product data
   */
  validateProductData(data: ProductInsert | ProductUpdate): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 2)) {
      errors.push('Product name must be at least 2 characters');
    }

    if ('sku' in data && (!data.sku || data.sku.trim().length < 2)) {
      errors.push('SKU must be at least 2 characters');
    }

    if ('selling_price' in data && data.selling_price !== undefined && data.selling_price < 0) {
      errors.push('Selling price cannot be negative');
    }

    if ('cost_price' in data && data.cost_price !== undefined && data.cost_price < 0) {
      errors.push('Cost price cannot be negative');
    }

    if ('stock_quantity' in data && data.stock_quantity !== undefined && data.stock_quantity < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    if ('minimum_stock' in data && data.minimum_stock !== undefined && data.minimum_stock < 0) {
      errors.push('Minimum stock cannot be negative');
    }

    return errors;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const productService = ProductService.getInstance();
export default productService;