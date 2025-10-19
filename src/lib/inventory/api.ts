// Inventory Module API Utilities
// CRUD operations for products, categories, units, warehouses, stock, and movements

import { supabase } from '@/lib/supabase/client'
import type {
  Product,
  ProductWithRelations,
  CreateProductInput,
  UpdateProductInput,
  ProductCategory,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  ProductUnit,
  CreateProductUnitInput,
  UpdateProductUnitInput,
  Warehouse,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  Stock,
  CreateStockInput,
  UpdateStockInput,
  StockMovement,
  CreateStockMovementInput,
  MovementType,
} from '@/types/inventory'

// Helper function to get current user's company_id
async function getCurrentCompanyId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const { data: user } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!user || !user.company_id) throw new Error('User company not found')
  return user.company_id
}

// ============================================
// PRODUCT CATEGORY API
// ============================================

export async function getProductCategories(): Promise<ProductCategory[]> {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createProductCategory(
  input: CreateProductCategoryInput
): Promise<ProductCategory> {
  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      ...input,
      company_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductCategory(
  id: string,
  input: UpdateProductCategoryInput
): Promise<ProductCategory> {
  const { data, error } = await supabase
    .from('product_categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProductCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// PRODUCT UNIT API
// ============================================

export async function getProductUnits(): Promise<ProductUnit[]> {
  const { data, error } = await supabase
    .from('product_units')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createProductUnit(
  input: CreateProductUnitInput
): Promise<ProductUnit> {
  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('product_units')
    .insert({
      ...input,
      company_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProductUnit(
  id: string,
  input: UpdateProductUnitInput
): Promise<ProductUnit> {
  const { data, error } = await supabase
    .from('product_units')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProductUnit(id: string): Promise<void> {
  const { error } = await supabase.from('product_units').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// WAREHOUSE API
// ============================================

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function createWarehouse(
  input: CreateWarehouseInput
): Promise<Warehouse> {
  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('warehouses')
    .insert({
      ...input,
      company_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateWarehouse(
  id: string,
  input: UpdateWarehouseInput
): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('warehouses')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteWarehouse(id: string): Promise<void> {
  const { error } = await supabase.from('warehouses').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// PRODUCT API
// ============================================

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getProductById(
  id: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:product_categories(id, name),
      unit:product_units(id, name, symbol),
      supplier:suppliers(id, name, code)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ProductWithRelations
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...input,
      company_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) throw error
}

// ============================================
// STOCK API
// ============================================

export async function getStock(warehouseId?: string): Promise<Stock[]> {
  let query = supabase.from('stock').select('*')

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId)
  }

  const { data, error } = await query.order('product_id')

  if (error) throw error
  return data || []
}

export async function createStock(input: CreateStockInput): Promise<Stock> {
  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('stock')
    .insert({
      ...input,
      company_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStock(
  id: string,
  input: UpdateStockInput
): Promise<Stock> {
  const { data, error } = await supabase
    .from('stock')
    .update({ ...input, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// STOCK MOVEMENT API
// ============================================

export async function getStockMovements(): Promise<StockMovement[]> {
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as StockMovement[]
}

export async function createStockMovement(
  input: CreateStockMovementInput
): Promise<StockMovement> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Not authenticated')

  const company_id = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('stock_movements')
    .insert({
      ...input,
      company_id,
      created_by: userData.user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Update stock quantity
  await updateStockQuantity(
    input.product_id,
    input.warehouse_id,
    input.movement_type,
    input.quantity
  )

  return data as StockMovement
}

// Helper function to update stock quantity based on movement
async function updateStockQuantity(
  productId: string,
  warehouseId: string,
  movementType: MovementType,
  quantity: number
): Promise<void> {
  const company_id = await getCurrentCompanyId()

  // Get current stock
  const { data: currentStock } = await supabase
    .from('stock')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .single()

  let newQuantity = currentStock?.quantity || 0

  if (movementType === 'IN' || movementType === 'ADJUSTMENT') {
    newQuantity += quantity
  } else if (movementType === 'OUT') {
    newQuantity -= quantity
  }

  if (newQuantity < 0) {
    throw new Error('Insufficient stock')
  }

  if (currentStock) {
    // Update existing stock
    await supabase
      .from('stock')
      .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
      .eq('id', currentStock.id)
  } else {
    // Create new stock record
    await supabase.from('stock').insert({
      company_id,
      product_id: productId,
      warehouse_id: warehouseId,
      quantity: newQuantity,
    })
  }
}
