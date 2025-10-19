/**
 * Promotions API
 * Handles all promotion-related database operations
 */

import { createClientSupabase } from '@/lib/supabase/client'
import type {
  Promotion,
  PromotionWithRelations,
  CreatePromotionInput,
  UpdatePromotionInput,
  PromotionFilters,
  PromotionCalculation,
} from '@/types/promotions'

const supabase = createClientSupabase()

/**
 * Get all promotions with optional filters
 */
export async function getPromotions(
  filters?: PromotionFilters
): Promise<Promotion[]> {
  let query = supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply search filter
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply type filter
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  // Apply date range filter
  if (filters?.start_date) {
    query = query.gte('start_date', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('end_date', filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching promotions:', error)
    throw new Error(`Failed to fetch promotions: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single promotion by ID with related data
 */
export async function getPromotionById(
  id: string
): Promise<PromotionWithRelations | null> {
  // Get promotion details
  const { data: promotion, error: promotionError } = await supabase
    .from('promotions')
    .select(
      `
      *,
      creator:users!promotions_created_by_fkey(id, name, email)
    `
    )
    .eq('id', id)
    .single()

  if (promotionError) {
    console.error('Error fetching promotion:', promotionError)
    throw new Error(`Failed to fetch promotion: ${promotionError.message}`)
  }

  if (!promotion) return null

  // Get associated products
  const { data: productLinks, error: productsError } = await supabase
    .from('promotion_products')
    .select(
      `
      product_id,
      products(id, name, sku)
    `
    )
    .eq('promotion_id', id)

  if (productsError) {
    console.error('Error fetching promotion products:', productsError)
  }

  // Get associated categories
  const { data: categoryLinks, error: categoriesError } = await supabase
    .from('promotion_categories')
    .select(
      `
      category_id,
      product_categories(id, name)
    `
    )
    .eq('promotion_id', id)

  if (categoriesError) {
    console.error('Error fetching promotion categories:', categoriesError)
  }

  // Map products
  const products =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productLinks?.map((link: any) => link.products)?.filter(Boolean) || []

  // Map categories
  const categories =
    categoryLinks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((link: any) => link.product_categories)
      ?.filter(Boolean) || []

  return {
    ...promotion,
    products,
    categories,
  } as PromotionWithRelations
}

/**
 * Create a new promotion
 */
export async function createPromotion(
  input: CreatePromotionInput
): Promise<Promotion> {
  const { product_ids, category_ids, ...promotionData } = input

  // Get current user's company_id
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    throw new Error('Failed to get user company')
  }

  // Create promotion
  const { data: promotion, error: promotionError } = await supabase
    .from('promotions')
    .insert({
      ...promotionData,
      company_id: userData.company_id,
      created_by: user.id,
    })
    .select()
    .single()

  if (promotionError) {
    console.error('Error creating promotion:', promotionError)
    throw new Error(`Failed to create promotion: ${promotionError.message}`)
  }

  // Add product associations
  if (product_ids && product_ids.length > 0) {
    const productLinks = product_ids.map(product_id => ({
      promotion_id: promotion.id,
      product_id,
    }))

    const { error: productsError } = await supabase
      .from('promotion_products')
      .insert(productLinks)

    if (productsError) {
      console.error('Error adding promotion products:', productsError)
      // Rollback: delete the promotion
      await supabase.from('promotions').delete().eq('id', promotion.id)
      throw new Error(
        `Failed to add promotion products: ${productsError.message}`
      )
    }
  }

  // Add category associations
  if (category_ids && category_ids.length > 0) {
    const categoryLinks = category_ids.map(category_id => ({
      promotion_id: promotion.id,
      category_id,
    }))

    const { error: categoriesError } = await supabase
      .from('promotion_categories')
      .insert(categoryLinks)

    if (categoriesError) {
      console.error('Error adding promotion categories:', categoriesError)
      // Rollback: delete the promotion and product links
      await supabase.from('promotions').delete().eq('id', promotion.id)
      throw new Error(
        `Failed to add promotion categories: ${categoriesError.message}`
      )
    }
  }

  return promotion
}

/**
 * Update a promotion
 */
export async function updatePromotion(
  id: string,
  input: UpdatePromotionInput
): Promise<Promotion> {
  const { product_ids, category_ids, ...promotionData } = input

  // Update promotion
  const { data: promotion, error: promotionError } = await supabase
    .from('promotions')
    .update({
      ...promotionData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (promotionError) {
    console.error('Error updating promotion:', promotionError)
    throw new Error(`Failed to update promotion: ${promotionError.message}`)
  }

  // Update product associations if provided
  if (product_ids !== undefined) {
    // Delete existing associations
    await supabase.from('promotion_products').delete().eq('promotion_id', id)

    // Add new associations
    if (product_ids.length > 0) {
      const productLinks = product_ids.map(product_id => ({
        promotion_id: id,
        product_id,
      }))

      const { error: productsError } = await supabase
        .from('promotion_products')
        .insert(productLinks)

      if (productsError) {
        console.error('Error updating promotion products:', productsError)
        throw new Error(
          `Failed to update promotion products: ${productsError.message}`
        )
      }
    }
  }

  // Update category associations if provided
  if (category_ids !== undefined) {
    // Delete existing associations
    await supabase.from('promotion_categories').delete().eq('promotion_id', id)

    // Add new associations
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map(category_id => ({
        promotion_id: id,
        category_id,
      }))

      const { error: categoriesError } = await supabase
        .from('promotion_categories')
        .insert(categoryLinks)

      if (categoriesError) {
        console.error('Error updating promotion categories:', categoriesError)
        throw new Error(
          `Failed to update promotion categories: ${categoriesError.message}`
        )
      }
    }
  }

  return promotion
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase.from('promotions').delete().eq('id', id)

  if (error) {
    console.error('Error deleting promotion:', error)
    throw new Error(`Failed to delete promotion: ${error.message}`)
  }
}

/**
 * Calculate promotion discount for a given amount
 */
export function calculatePromotionDiscount(
  promotion: Promotion,
  amount: number,
  quantity: number = 1
): PromotionCalculation {
  let discount_amount = 0
  let is_applicable = true
  let reason: string | undefined

  // Check if promotion is active
  if (promotion.status !== 'active' || !promotion.is_active) {
    is_applicable = false
    reason = 'Promotion is not active'
  }

  // Check minimum purchase amount
  if (is_applicable && amount < promotion.min_purchase_amount) {
    is_applicable = false
    reason = `Minimum purchase amount is ${promotion.min_purchase_amount}`
  }

  // Calculate discount based on type
  if (is_applicable) {
    switch (promotion.type) {
      case 'percentage':
        discount_amount = (amount * (promotion.discount_value || 0)) / 100
        // Apply max discount cap if set
        if (
          promotion.max_discount_amount &&
          discount_amount > promotion.max_discount_amount
        ) {
          discount_amount = promotion.max_discount_amount
        }
        break

      case 'fixed':
        discount_amount = promotion.discount_value || 0
        break

      case 'buy_x_get_y':
        // For buy X get Y, calculate based on quantity
        if (
          promotion.buy_quantity &&
          promotion.get_quantity &&
          quantity >= promotion.buy_quantity
        ) {
          const sets = Math.floor(quantity / promotion.buy_quantity)
          const free_items = sets * promotion.get_quantity
          const price_per_item = amount / quantity
          discount_amount = free_items * price_per_item
        } else {
          is_applicable = false
          reason = `Buy at least ${promotion.buy_quantity} items to get discount`
        }
        break
    }
  }

  const final_price = Math.max(0, amount - discount_amount)

  return {
    promotion_id: promotion.id,
    promotion_name: promotion.name,
    promotion_type: promotion.type,
    discount_amount,
    final_price,
    is_applicable,
    reason,
  }
}

/**
 * Get active promotions for a product
 */
export async function getActivePromotionsForProduct(
  product_id: string
): Promise<Promotion[]> {
  const now = new Date().toISOString()

  // Get promotions directly linked to this product
  const { data: productPromotions, error: productError } = await supabase
    .from('promotion_products')
    .select(
      `
      promotions!inner(*)
    `
    )
    .eq('product_id', product_id)
    .eq('promotions.status', 'active')
    .eq('promotions.is_active', true)
    .lte('promotions.start_date', now)
    .gte('promotions.end_date', now)

  if (productError) {
    console.error('Error fetching product promotions:', productError)
    return []
  }

  const directPromotions =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productPromotions?.map((link: any) => link.promotions) || []

  // Get product's category
  const { data: product } = await supabase
    .from('products')
    .select('category_id')
    .eq('id', product_id)
    .single()

  if (!product?.category_id) {
    return directPromotions
  }

  // Get promotions linked to the product's category
  const { data: categoryPromotions, error: categoryError } = await supabase
    .from('promotion_categories')
    .select(
      `
      promotions!inner(*)
    `
    )
    .eq('category_id', product.category_id)
    .eq('promotions.status', 'active')
    .eq('promotions.is_active', true)
    .lte('promotions.start_date', now)
    .gte('promotions.end_date', now)

  if (categoryError) {
    console.error('Error fetching category promotions:', categoryError)
    return directPromotions
  }

  const categoryPromos =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categoryPromotions?.map((link: any) => link.promotions) || []

  // Combine and deduplicate promotions
  const allPromotions = [...directPromotions, ...categoryPromos]
  const uniquePromotions = Array.from(
    new Map(allPromotions.map(p => [p.id, p])).values()
  )

  return uniquePromotions as Promotion[]
}
