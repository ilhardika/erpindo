// Inventory Module TypeScript Types
// Module 3: Products, Stock, Warehouses

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'

// ============================================
// PRODUCT CATEGORY TYPES
// ============================================
export interface ProductCategory {
  id: string
  company_id: string
  name: string
  description: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface CreateProductCategoryInput {
  name: string
  description?: string
  is_active?: boolean
}

export interface UpdateProductCategoryInput {
  name?: string
  description?: string
  is_active?: boolean
}

// ============================================
// PRODUCT UNIT TYPES
// ============================================
export interface ProductUnit {
  id: string
  company_id: string
  name: string
  symbol: string
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface CreateProductUnitInput {
  name: string
  symbol: string
  is_active?: boolean
}

export interface UpdateProductUnitInput {
  name?: string
  symbol?: string
  is_active?: boolean
}

// ============================================
// WAREHOUSE TYPES
// ============================================
export interface Warehouse {
  id: string
  company_id: string
  code: string
  name: string
  address: string | null
  is_default: boolean | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface CreateWarehouseInput {
  code: string
  name: string
  address?: string
  is_default?: boolean
  is_active?: boolean
}

export interface UpdateWarehouseInput {
  code?: string
  name?: string
  address?: string
  is_default?: boolean
  is_active?: boolean
}

// ============================================
// PRODUCT TYPES
// ============================================
export interface Product {
  id: string
  company_id: string
  category_id: string | null
  unit_id: string | null
  supplier_id: string | null
  sku: string
  barcode: string | null
  name: string
  description: string | null
  cost_price: number | null
  selling_price: number | null
  min_stock: number | null
  max_stock: number | null
  reorder_point: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

// Product with relations
export interface ProductWithRelations extends Product {
  category?: ProductCategory
  unit?: ProductUnit
  supplier?: {
    id: string
    name: string
    code: string | null
  }
  stock_levels?: StockLevel[]
}

export interface CreateProductInput {
  sku: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  unit_id?: string
  supplier_id?: string
  cost_price: number
  selling_price: number
  min_stock?: number
  max_stock?: number
  reorder_point?: number
  is_active?: boolean
}

export interface UpdateProductInput {
  sku?: string
  barcode?: string
  name?: string
  description?: string
  category_id?: string
  unit_id?: string
  supplier_id?: string
  cost_price?: number
  selling_price?: number
  min_stock?: number
  max_stock?: number
  reorder_point?: number
  is_active?: boolean
}

// ============================================
// STOCK TYPES
// ============================================
export interface Stock {
  id: string
  company_id: string
  product_id: string
  warehouse_id: string
  quantity: number | null
  last_updated: string | null
  created_at: string | null
  updated_at: string | null
}

// Stock with relations
export interface StockLevel extends Stock {
  product?: Product
  warehouse?: Warehouse
}

export interface CreateStockInput {
  product_id: string
  warehouse_id: string
  quantity: number
}

export interface UpdateStockInput {
  quantity: number
}

// ============================================
// STOCK MOVEMENT TYPES
// ============================================
export interface StockMovement {
  id: string
  company_id: string
  product_id: string
  warehouse_id: string
  movement_type: MovementType
  quantity: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string | null
}

// Stock movement with relations
export interface StockMovementWithRelations extends StockMovement {
  product?: Product
  warehouse?: Warehouse
  created_by_user?: {
    id: string
    full_name: string
    email: string
  }
}

export interface CreateStockMovementInput {
  product_id: string
  warehouse_id: string
  movement_type: MovementType
  quantity: number
  reference_type?: string
  reference_id?: string
  notes?: string
}

// ============================================
// UTILITY TYPES
// ============================================
export interface ProductFilter {
  search?: string
  category_id?: string
  warehouse_id?: string
  supplier_id?: string
  status?: 'active' | 'inactive' | 'all'
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'all'
}

export interface StockMovementFilter {
  product_id?: string
  warehouse_id?: string
  movement_type?: MovementType
  date_from?: string
  date_to?: string
  reference_type?: string
}

export interface InventoryStats {
  total_products: number
  active_products: number
  low_stock_products: number
  out_of_stock_products: number
  total_stock_value: number
  total_warehouses: number
}

// ============================================
// STOCK ADJUSTMENT TYPES
// ============================================
export interface StockAdjustment {
  product_id: string
  warehouse_id: string
  current_quantity: number
  new_quantity: number
  difference: number
  notes: string
}

export interface CreateStockAdjustmentInput {
  product_id: string
  warehouse_id: string
  new_quantity: number
  notes: string
}
