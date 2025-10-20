// POS Module Types

// Base Entity Types
export interface PosShift {
  id: string
  company_id: string
  cashier_id: string
  opened_at: string
  closed_at: string | null
  opening_cash: number
  closing_cash: number | null
  expected_cash: number | null
  actual_cash: number | null
  variance: number | null
  notes: string | null
  status: ShiftStatus
  created_at: string
  updated_at: string
}

export interface PosTransaction {
  id: string
  company_id: string
  transaction_number: string
  shift_id: string | null
  customer_id: string | null
  cashier_id: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  transaction_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PosTransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount_amount: number
  promotion_id: string | null
  subtotal: number
  created_at: string
  updated_at: string
}

export interface PosPayment {
  id: string
  transaction_id: string
  payment_method: PaymentMethod
  amount: number
  reference_number: string | null
  payment_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

// Enums
export type ShiftStatus = 'open' | 'closed'

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'transfer'
  | 'e-wallet'
  | 'credit'
  | 'split'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled'

// Extended Types with Relations
export interface PosShiftWithCashier extends PosShift {
  cashier: {
    id: string
    name: string
    email: string
  }
}

export interface PosTransactionWithRelations extends PosTransaction {
  shift?: PosShift | null
  customer?: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
  cashier: {
    id: string
    name: string
    email: string
  }
  items: PosTransactionItemWithProduct[]
  payments: PosPayment[]
}

export interface PosTransactionItemWithProduct extends PosTransactionItem {
  product: {
    id: string
    name: string
    sku: string
    selling_price: number
  }
  promotion?: {
    id: string
    name: string
    type: string
  } | null
}

// Filter Types
export interface PosShiftFilters {
  status?: ShiftStatus
  cashier_id?: string
  date_from?: string
  date_to?: string
}

export interface PosTransactionFilters {
  shift_id?: string
  customer_id?: string
  cashier_id?: string
  payment_method?: PaymentMethod
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
  search?: string // search by transaction_number
}

// Input Types for Creating/Updating
export interface CreateShiftInput {
  opening_cash: number
  notes?: string
}

export interface CloseShiftInput {
  closing_cash: number
  actual_cash: number
  notes?: string
}

export interface CreateTransactionInput {
  shift_id?: string
  customer_id?: string
  items: CreateTransactionItemInput[]
  payment_method: PaymentMethod
  payments?: CreatePaymentInput[] // For split payments
  notes?: string
}

export interface CreateTransactionItemInput {
  product_id: string
  quantity: number
  unit_price: number
  discount_amount?: number
  promotion_id?: string
}

export interface CreatePaymentInput {
  payment_method: PaymentMethod
  amount: number
  reference_number?: string
  notes?: string
}

// Cart Types for POS Interface
export interface CartItem {
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  discount_amount: number
  promotion_id?: string | null
  promotion_name?: string | null
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
}

// Summary Types
export interface ShiftSummary {
  shift_id: string
  opened_at: string
  closed_at: string | null
  opening_cash: number
  closing_cash: number | null
  total_transactions: number
  total_sales: number
  cash_sales: number
  card_sales: number
  transfer_sales: number
  expected_cash: number
  actual_cash: number | null
  variance: number | null
}

export interface DailySalesSummary {
  date: string
  total_transactions: number
  total_sales: number
  total_items_sold: number
  average_transaction: number
}
