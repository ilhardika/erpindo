/**
 * Sales Module Types
 * Defines types for sales orders, invoices, payments, and delivery orders
 */

// ============================================================================
// Sales Order Types
// ============================================================================

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'

export interface SalesOrder {
  id: string
  company_id: string
  customer_id: string
  salesman_id: string | null

  order_number: string
  order_date: string // ISO date string

  status: OrderStatus

  subtotal: number
  discount_amount: number
  tax_amount: number
  shipping_amount: number
  grand_total: number

  notes: string | null
  terms: string | null

  created_by: string
  created_at: string
  updated_at: string
}

export interface SalesOrderItem {
  id: string
  order_id: string
  product_id: string

  product_name: string
  product_sku: string

  quantity: number
  unit_price: number
  discount_amount: number
  tax_amount: number
  subtotal: number

  promotion_id: string | null
  notes: string | null

  created_at: string
  updated_at: string
}

export interface SalesOrderWithRelations extends SalesOrder {
  items?: SalesOrderItem[]
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string
    company: string | null
  }
  salesman?: {
    id: string
    full_name: string
    email: string
  }
}

// ============================================================================
// Sales Invoice Types
// ============================================================================

export type InvoiceStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export interface SalesInvoice {
  id: string
  company_id: string
  order_id: string | null
  customer_id: string

  invoice_number: string
  invoice_date: string // ISO date string
  due_date: string // ISO date string

  status: InvoiceStatus

  subtotal: number
  discount_amount: number
  tax_amount: number
  shipping_amount: number
  grand_total: number
  paid_amount: number
  remaining_amount: number

  notes: string | null
  terms: string | null

  created_by: string
  created_at: string
  updated_at: string
}

export interface SalesInvoiceWithRelations extends SalesInvoice {
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string
    company: string | null
  }
  order?: SalesOrder
  payments?: SalesPayment[]
}

// ============================================================================
// Sales Payment Types
// ============================================================================

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'check' | 'other'

export interface SalesPayment {
  id: string
  company_id: string
  invoice_id: string

  payment_number: string
  payment_date: string // ISO date string
  payment_method: PaymentMethod

  amount: number
  reference_number: string | null
  notes: string | null

  created_by: string
  created_at: string
  updated_at: string
}

export interface SalesPaymentWithRelations extends SalesPayment {
  invoice?: {
    id: string
    invoice_number: string
    customer_id: string
    grand_total: number
    paid_amount: number
  }
}

// ============================================================================
// Delivery Order Types
// ============================================================================

export type DeliveryStatus =
  | 'pending'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'

export interface DeliveryOrder {
  id: string
  company_id: string
  order_id: string

  delivery_number: string
  delivery_date: string // ISO date string
  scheduled_date: string | null // ISO date string

  status: DeliveryStatus

  driver_name: string | null
  vehicle_plate: string | null

  delivery_address: string
  recipient_name: string | null
  recipient_phone: string | null

  notes: string | null
  proof_of_delivery: string | null // URL to image/document

  created_by: string
  created_at: string
  updated_at: string
  delivered_at: string | null
}

export interface DeliveryOrderWithRelations extends DeliveryOrder {
  order?: SalesOrder
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateSalesOrderInput {
  customer_id: string
  salesman_id?: string
  order_date: string
  status?: OrderStatus
  items: CreateSalesOrderItemInput[]
  subtotal: number
  discount_amount?: number
  tax_amount?: number
  shipping_amount?: number
  grand_total: number
  notes?: string
  terms?: string
}

export interface CreateSalesOrderItemInput {
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  discount_amount?: number
  tax_amount?: number
  subtotal: number
  promotion_id?: string
  notes?: string
}

export interface UpdateSalesOrderInput {
  customer_id?: string
  salesman_id?: string
  order_date?: string
  status?: OrderStatus
  items?: CreateSalesOrderItemInput[]
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  shipping_amount?: number
  grand_total?: number
  notes?: string
  terms?: string
}

export interface CreateSalesInvoiceInput {
  customer_id: string
  order_id?: string
  invoice_date: string
  due_date: string
  status?: InvoiceStatus
  subtotal: number
  discount_amount?: number
  tax_amount?: number
  shipping_amount?: number
  grand_total: number
  notes?: string
  terms?: string
}

export interface UpdateSalesInvoiceInput {
  customer_id?: string
  invoice_date?: string
  due_date?: string
  status?: InvoiceStatus
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  shipping_amount?: number
  grand_total?: number
  paid_amount?: number
  remaining_amount?: number
  notes?: string
  terms?: string
}

export interface CreateSalesPaymentInput {
  invoice_id: string
  payment_date: string
  payment_method: PaymentMethod
  amount: number
  reference_number?: string
  notes?: string
}

export interface CreateDeliveryOrderInput {
  order_id: string
  delivery_date: string
  scheduled_date?: string
  status?: DeliveryStatus
  driver_name?: string
  vehicle_plate?: string
  delivery_address: string
  recipient_name?: string
  recipient_phone?: string
  notes?: string
}

export interface UpdateDeliveryOrderInput {
  delivery_date?: string
  scheduled_date?: string
  status?: DeliveryStatus
  driver_name?: string
  vehicle_plate?: string
  delivery_address?: string
  recipient_name?: string
  recipient_phone?: string
  notes?: string
  proof_of_delivery?: string
  delivered_at?: string
}
