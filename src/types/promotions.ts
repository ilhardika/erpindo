/**
 * Promotions Module Types
 * Defines types for promotion management system
 */

export type PromotionType = 'percentage' | 'fixed' | 'buy_x_get_y'
export type PromotionStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'cancelled'
export type CustomerSegment = 'all' | 'new' | 'regular' | 'vip'

/**
 * Main Promotion entity
 */
export interface Promotion {
  id: string
  company_id: string
  name: string
  code: string
  description: string | null
  type: PromotionType

  // Discount configuration
  discount_value: number | null
  buy_quantity: number | null
  get_quantity: number | null

  // Validity period
  start_date: string
  end_date: string

  // Rules
  min_purchase_amount: number
  max_discount_amount: number | null

  // Customer targeting
  customer_segment: CustomerSegment

  // Status
  status: PromotionStatus
  is_active: boolean

  // Audit
  created_at: string
  updated_at: string
  created_by: string | null
}

/**
 * Promotion with related data (for detail views)
 */
export interface PromotionWithRelations extends Promotion {
  products?: Array<{
    id: string
    name: string
    sku: string
  }>
  categories?: Array<{
    id: string
    name: string
  }>
  creator?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Promotion Products Junction
 */
export interface PromotionProduct {
  id: string
  promotion_id: string
  product_id: string
  created_at: string
}

/**
 * Promotion Categories Junction
 */
export interface PromotionCategory {
  id: string
  promotion_id: string
  category_id: string
  created_at: string
}

/**
 * Form data for creating a promotion
 */
export interface CreatePromotionInput {
  name: string
  code: string
  description?: string
  type: PromotionType

  // Discount configuration
  discount_value?: number
  buy_quantity?: number
  get_quantity?: number

  // Validity period
  start_date: string
  end_date: string

  // Rules
  min_purchase_amount?: number
  max_discount_amount?: number

  // Customer targeting
  customer_segment?: CustomerSegment

  // Targeting
  product_ids?: string[]
  category_ids?: string[]
}

/**
 * Form data for updating a promotion
 */
export interface UpdatePromotionInput extends Partial<CreatePromotionInput> {
  status?: PromotionStatus
  is_active?: boolean
}

/**
 * Filters for promotion list
 */
export interface PromotionFilters {
  search?: string
  status?: PromotionStatus | 'all'
  type?: PromotionType | 'all'
  start_date?: string
  end_date?: string
}

/**
 * Promotion calculation result
 */
export interface PromotionCalculation {
  promotion_id: string
  promotion_name: string
  promotion_type: PromotionType
  discount_amount: number
  final_price: number
  is_applicable: boolean
  reason?: string // why not applicable
}

/**
 * Promotion validation result
 */
export interface PromotionValidation {
  is_valid: boolean
  is_active: boolean
  is_date_valid: boolean
  is_min_purchase_met: boolean
  is_customer_eligible: boolean
  applicable_promotions: Promotion[]
  errors: string[]
}
