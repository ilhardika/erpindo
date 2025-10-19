/**
 * Promotion Validation and Calculation Utilities
 *
 * Clean Code Principles:
 * - Single Responsibility: Each function has one clear purpose
 * - Pure Functions: No side effects, deterministic outputs
 * - Reusability: Can be used in POS, Sales, and other modules
 */

import type { Promotion } from '@/types/promotions'

/**
 * Validate if a promotion is currently valid and applicable
 */
export function isPromotionValid(promotion: Promotion): {
  valid: boolean
  reason?: string
} {
  const now = new Date()
  const startDate = new Date(promotion.start_date)
  const endDate = new Date(promotion.end_date)

  // Check if promotion is active
  if (!promotion.is_active) {
    return { valid: false, reason: 'Promotion is not active' }
  }

  // Check status
  if (promotion.status === 'cancelled') {
    return { valid: false, reason: 'Promotion has been cancelled' }
  }

  if (promotion.status === 'draft') {
    return { valid: false, reason: 'Promotion is still in draft' }
  }

  // Check date range
  if (now < startDate) {
    return { valid: false, reason: 'Promotion has not started yet' }
  }

  if (now > endDate) {
    return { valid: false, reason: 'Promotion has expired' }
  }

  return { valid: true }
}

/**
 * Calculate discount amount for a given order total
 */
export function calculatePromotionDiscount(
  promotion: Promotion,
  orderTotal: number,
  quantity: number = 1
): {
  discountAmount: number
  appliedPromotion: string
  details: string
} {
  // Check minimum purchase requirement
  if (
    promotion.min_purchase_amount &&
    orderTotal < promotion.min_purchase_amount
  ) {
    return {
      discountAmount: 0,
      appliedPromotion: '',
      details: `Minimum purchase of Rp ${promotion.min_purchase_amount.toLocaleString()} required`,
    }
  }

  let discountAmount = 0
  let details = ''

  // Calculate based on promotion type
  if (promotion.type === 'percentage') {
    const percentage = promotion.discount_value || 0
    discountAmount = (orderTotal * percentage) / 100
    details = `${percentage}% discount applied`
  } else if (promotion.type === 'fixed') {
    discountAmount = promotion.discount_value || 0
    details = `Rp ${discountAmount.toLocaleString()} discount applied`
  } else if (promotion.type === 'buy_x_get_y') {
    const buyQty = promotion.buy_quantity || 1
    const getQty = promotion.get_quantity || 1

    // Calculate how many free items customer gets
    const freeItems = Math.floor(quantity / buyQty) * getQty
    if (freeItems > 0) {
      // Assume discount is the price of free items
      const itemPrice = orderTotal / quantity
      discountAmount = freeItems * itemPrice
      details = `Buy ${buyQty} Get ${getQty} - ${freeItems} free item(s)`
    } else {
      details = `Buy ${buyQty} to get ${getQty} free`
    }
  }

  // Apply maximum discount cap if set
  if (
    promotion.max_discount_amount &&
    discountAmount > promotion.max_discount_amount
  ) {
    discountAmount = promotion.max_discount_amount
    details += ` (capped at Rp ${promotion.max_discount_amount.toLocaleString()})`
  }

  return {
    discountAmount: Math.round(discountAmount),
    appliedPromotion: promotion.code,
    details,
  }
}

/**
 * Find the best promotion to apply from multiple promotions
 */
export function findBestPromotion(
  promotions: Promotion[],
  orderTotal: number,
  quantity: number = 1
): {
  promotion: Promotion | null
  discountAmount: number
  details: string
} {
  let bestPromotion: Promotion | null = null
  let maxDiscount = 0
  let bestDetails = ''

  for (const promotion of promotions) {
    // Validate promotion
    const validation = isPromotionValid(promotion)
    if (!validation.valid) {
      continue
    }

    // Calculate discount
    const result = calculatePromotionDiscount(promotion, orderTotal, quantity)

    // Track best discount
    if (result.discountAmount > maxDiscount) {
      maxDiscount = result.discountAmount
      bestPromotion = promotion
      bestDetails = result.details
    }
  }

  return {
    promotion: bestPromotion,
    discountAmount: maxDiscount,
    details: bestDetails,
  }
}

/**
 * Check if a promotion applies to a specific product
 */
export function doesPromotionApplyToProduct(
  promotion: Promotion & {
    products?: { id: string }[]
    categories?: { id: string }[]
  },
  productId: string,
  productCategoryId?: string
): boolean {
  // If no targeting specified, applies to all products
  const hasNoTargeting =
    (!promotion.products || promotion.products.length === 0) &&
    (!promotion.categories || promotion.categories.length === 0)

  if (hasNoTargeting) {
    return true
  }

  // Check if product is directly included
  if (promotion.products && promotion.products.length > 0) {
    const isProductIncluded = promotion.products.some(p => p.id === productId)
    if (isProductIncluded) {
      return true
    }
  }

  // Check if product's category is included
  if (
    productCategoryId &&
    promotion.categories &&
    promotion.categories.length > 0
  ) {
    const isCategoryIncluded = promotion.categories.some(
      c => c.id === productCategoryId
    )
    if (isCategoryIncluded) {
      return true
    }
  }

  return false
}

/**
 * Check if a promotion applies to a specific customer segment
 */
export function doesPromotionApplyToCustomer(
  promotion: Promotion,
  customerSegment?: string
): boolean {
  // If no customer segment specified, applies to all customers
  if (!promotion.customer_segment) {
    return true
  }

  // If customer segment not provided, cannot apply targeted promotion
  if (!customerSegment) {
    return false
  }

  // Check if customer segment matches (case-insensitive)
  return (
    promotion.customer_segment.toLowerCase() === customerSegment.toLowerCase()
  )
}

/**
 * Format promotion description for display
 */
export function formatPromotionDescription(promotion: Promotion): string {
  if (promotion.type === 'percentage') {
    return `Get ${promotion.discount_value}% off`
  }

  if (promotion.type === 'fixed') {
    return `Get Rp ${promotion.discount_value?.toLocaleString()} off`
  }

  if (promotion.type === 'buy_x_get_y') {
    return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity} Free`
  }

  return promotion.description || 'Special promotion'
}
