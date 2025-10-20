/**
 * POS API
 * Handles all POS-related database operations for shifts, transactions, and payments
 */

import { createClientSupabase } from '@/lib/supabase/client'
import type {
  PosShift,
  PosShiftWithCashier,
  PosTransaction,
  PosTransactionWithRelations,
  PosShiftFilters,
  PosTransactionFilters,
  CreateShiftInput,
  CloseShiftInput,
  CreateTransactionInput,
  ShiftSummary,
} from '@/types/pos'

const supabase = createClientSupabase()

// ============================================================================
// SHIFT MANAGEMENT
// ============================================================================

/**
 * Get all shifts with optional filters
 */
export async function getShifts(
  filters?: PosShiftFilters
): Promise<PosShiftWithCashier[]> {
  let query = supabase
    .from('pos_shifts')
    .select(
      `
      *,
      cashier:users!pos_shifts_cashier_id_fkey(id, name, email)
    `
    )
    .order('opened_at', { ascending: false })

  // Apply status filter
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  // Apply cashier filter
  if (filters?.cashier_id) {
    query = query.eq('cashier_id', filters.cashier_id)
  }

  // Apply date range filter
  if (filters?.date_from) {
    query = query.gte('opened_at', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('opened_at', filters.date_to)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await query) as any

  if (error) {
    console.error('Error fetching shifts:', error)
    throw new Error(`Failed to fetch shifts: ${error.message}`)
  }

  return data || []
}

/**
 * Get current active shift for a cashier
 */
export async function getCurrentShift(
  cashier_id: string
): Promise<PosShift | null> {
  const { data, error } = await supabase
    .from('pos_shifts')
    .select('*')
    .eq('cashier_id', cashier_id)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching current shift:', error)
    throw new Error(`Failed to fetch current shift: ${error.message}`)
  }

  return data
}

/**
 * Open a new shift
 */
export async function openShift(input: CreateShiftInput): Promise<PosShift> {
  // Get current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's company_id
   
  const { data: userData, error: userError } = (await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()) as any

  if (userError || !userData?.company_id) {
    throw new Error('Failed to get company information')
  }

  // Check if user already has an open shift
  const currentShift = await getCurrentShift(user.id)
  if (currentShift) {
    throw new Error('You already have an open shift. Please close it first.')
  }

  // Create new shift
   
  const { data, error } = await supabase
    .from('pos_shifts')
    .insert({
      company_id: userData.company_id,
      cashier_id: user.id,
      opening_cash: input.opening_cash,
      notes: input.notes || null,
      status: 'open',
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Error opening shift:', error)
    throw new Error(`Failed to open shift: ${error.message}`)
  }

  return data
}

/**
 * Close an existing shift
 */
export async function closeShift(
  shift_id: string,
  input: CloseShiftInput
): Promise<PosShift> {
  // Get shift summary first
  const summary = await getShiftSummary(shift_id)

  // Calculate variance
  const variance = input.actual_cash - summary.expected_cash

  // Update shift
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = supabase.from('pos_shifts') as any
  const { data, error } = await query
    .update({
      closing_cash: input.closing_cash,
      expected_cash: summary.expected_cash,
      actual_cash: input.actual_cash,
      variance,
      closed_at: new Date().toISOString(),
      notes: input.notes || null,
      status: 'closed',
    })
    .eq('id', shift_id)
    .select()
    .single()

  if (error) {
    console.error('Error closing shift:', error)
    throw new Error(`Failed to close shift: ${error.message}`)
  }

  return data
}

/**
 * Get shift summary with sales data
 */
export async function getShiftSummary(shift_id: string): Promise<ShiftSummary> {
  // Get shift details
   
  const { data: shift, error: shiftError } = (await supabase
    .from('pos_shifts')
    .select('*')
    .eq('id', shift_id)
    .single()) as any

  if (shiftError) {
    throw new Error(`Failed to fetch shift: ${shiftError.message}`)
  }

  // Get transactions for this shift
   
  const { data: transactions, error: transError } = (await supabase
    .from('pos_transactions')
    .select('*')
    .eq('shift_id', shift_id)
    .eq('payment_status', 'paid')) as any

  if (transError) {
    throw new Error(`Failed to fetch transactions: ${transError.message}`)
  }

  // Calculate totals
  const total_transactions = transactions?.length || 0
  const total_sales =
    transactions?.reduce((sum: number, t: any) => sum + Number(t.total), 0) || 0
  const cash_sales =
    transactions
      ?.filter((t: any) => t.payment_method === 'cash')
      .reduce((sum: number, t: any) => sum + Number(t.total), 0) || 0
  const card_sales =
    transactions
      ?.filter((t: any) => t.payment_method === 'card')
      .reduce((sum: number, t: any) => sum + Number(t.total), 0) || 0
  const transfer_sales =
    transactions
      ?.filter((t: any) => t.payment_method === 'transfer')
      .reduce((sum: number, t: any) => sum + Number(t.total), 0) || 0

  const expected_cash = Number(shift.opening_cash) + cash_sales

  return {
    shift_id: shift.id,
    opened_at: shift.opened_at,
    closed_at: shift.closed_at,
    opening_cash: Number(shift.opening_cash),
    closing_cash: shift.closing_cash ? Number(shift.closing_cash) : null,
    total_transactions,
    total_sales,
    cash_sales,
    card_sales,
    transfer_sales,
    expected_cash,
    actual_cash: shift.actual_cash ? Number(shift.actual_cash) : null,
    variance: shift.variance ? Number(shift.variance) : null,
  }
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(
  filters?: PosTransactionFilters
): Promise<PosTransaction[]> {
  let query = supabase
    .from('pos_transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  // Apply search filter (transaction number)
  if (filters?.search) {
    query = query.ilike('transaction_number', `%${filters.search}%`)
  }

  // Apply shift filter
  if (filters?.shift_id) {
    query = query.eq('shift_id', filters.shift_id)
  }

  // Apply customer filter
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  // Apply cashier filter
  if (filters?.cashier_id) {
    query = query.eq('cashier_id', filters.cashier_id)
  }

  // Apply payment method filter
  if (filters?.payment_method) {
    query = query.eq('payment_method', filters.payment_method)
  }

  // Apply payment status filter
  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }

  // Apply date range filter
  if (filters?.date_from) {
    query = query.gte('transaction_date', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('transaction_date', filters.date_to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data || []
}

/**
 * Get all transactions with full relations (for transaction history page)
 */
export async function getTransactionsWithRelations(
  filters?: PosTransactionFilters
): Promise<PosTransactionWithRelations[]> {
  let query = supabase
    .from('pos_transactions')
    .select(
      `
      *,
      shift:pos_shifts(id, opened_at, closed_at),
      customer:customers(id, name, email, phone),
      cashier:users!pos_transactions_cashier_id_fkey(id, name, email),
      items:pos_transaction_items(
        *,
        product:products(id, name, sku, selling_price),
        promotion:promotions(id, name, type)
      ),
      payments:pos_payments(*)
    `
    )
    .order('transaction_date', { ascending: false })

  // Apply search filter
  if (filters?.search) {
    query = query.ilike('transaction_number', `%${filters.search}%`)
  }

  // Apply shift filter
  if (filters?.shift_id) {
    query = query.eq('shift_id', filters.shift_id)
  }

  // Apply customer filter
  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  // Apply cashier filter
  if (filters?.cashier_id) {
    query = query.eq('cashier_id', filters.cashier_id)
  }

  // Apply payment method filter
  if (filters?.payment_method) {
    query = query.eq('payment_method', filters.payment_method)
  }

  // Apply payment status filter
  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }

  // Apply date range filter
  if (filters?.date_from) {
    query = query.gte('transaction_date', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('transaction_date', filters.date_to)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = (await query) as any

  if (error) {
    console.error('Error fetching transactions with relations:', error)
    throw new Error(
      `Failed to fetch transactions with relations: ${error.message}`
    )
  }

  return data || []
}

/**
 * Get a single transaction by ID with all related data
 */
export async function getTransactionById(
  id: string
): Promise<PosTransactionWithRelations | null> {
  // Get transaction with relations
   
  const { data: transaction, error: transError } = (await supabase
    .from('pos_transactions')
    .select(
      `
      *,
      shift:pos_shifts(id, opened_at, closed_at, cashier_id),
      customer:customers(id, name, email, phone),
      cashier:users!pos_transactions_cashier_id_fkey(id, name, email)
    `
    )
    .eq('id', id)
    .single()) as any

  if (transError) {
    console.error('Error fetching transaction:', transError)
    if (transError.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch transaction: ${transError.message}`)
  }

  // Get transaction items with product details
   
  const { data: items, error: itemsError } = (await supabase
    .from('pos_transaction_items')
    .select(
      `
      *,
      product:products(id, name, sku, selling_price),
      promotion:promotions(id, name, type)
    `
    )
    .eq('transaction_id', id)) as any

  if (itemsError) {
    console.error('Error fetching transaction items:', itemsError)
    throw new Error(`Failed to fetch transaction items: ${itemsError.message}`)
  }

  // Get payments (for split payment transactions)
  const { data: payments, error: paymentsError } = await supabase
    .from('pos_payments')
    .select('*')
    .eq('transaction_id', id)

  if (paymentsError) {
    console.error('Error fetching payments:', paymentsError)
    throw new Error(`Failed to fetch payments: ${paymentsError.message}`)
  }

  return {
    ...transaction,
    items: items || [],
    payments: payments || [],
  }
}

/**
 * Create a new POS transaction with items and payments
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<PosTransaction> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get user's company_id
   
  const { data: userData, error: userError } = (await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()) as any

  if (userError || !userData?.company_id) {
    throw new Error('Failed to get company information')
  }

  // Calculate totals
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )
  const discount_amount = input.items.reduce(
    (sum, item) => sum + (item.discount_amount || 0),
    0
  )
  const tax_amount = (subtotal - discount_amount) * 0.1 // 10% tax
  const total = subtotal - discount_amount + tax_amount

  // Generate transaction number
  const transaction_number = await generateTransactionNumber(
    userData.company_id
  )

  // Create transaction
   
  const { data: transaction, error: transError } = await supabase
    .from('pos_transactions')
    .insert({
      company_id: userData.company_id,
      transaction_number,
      shift_id: input.shift_id || null,
      customer_id: input.customer_id || null,
      cashier_id: user.id,
      subtotal,
      discount_amount,
      tax_amount,
      total,
      payment_method: input.payment_method,
      payment_status: 'paid',
      notes: input.notes || null,
    } as any)
    .select()
    .single()

  if (transError) {
    console.error('Error creating transaction:', transError)
    throw new Error(`Failed to create transaction: ${transError.message}`)
  }

  // Create transaction items
   
  const itemsToInsert = input.items.map(item => ({
    transaction_id: (transaction as any).id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_amount: item.discount_amount || 0,
    promotion_id: item.promotion_id || null,
    subtotal: item.unit_price * item.quantity - (item.discount_amount || 0),
  }))

   
  const { error: itemsError } = await supabase
    .from('pos_transaction_items')
    .insert(itemsToInsert as any)

  if (itemsError) {
    console.error('Error creating transaction items:', itemsError)
    throw new Error(`Failed to create transaction items: ${itemsError.message}`)
  }

  // Create payments if split payment
  if (input.payment_method === 'split' && input.payments) {
     
    const paymentsToInsert = input.payments.map(payment => ({
      transaction_id: (transaction as any).id,
      payment_method: payment.payment_method,
      amount: payment.amount,
      reference_number: payment.reference_number || null,
      notes: payment.notes || null,
    }))

     
    const { error: paymentsError } = await supabase
      .from('pos_payments')
      .insert(paymentsToInsert as any)

    if (paymentsError) {
      console.error('Error creating payments:', paymentsError)
      throw new Error(`Failed to create payments: ${paymentsError.message}`)
    }
  }

  return transaction
}

/**
 * Generate unique transaction number
 */
async function generateTransactionNumber(company_id: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  // Get count of today's transactions
  const { count, error } = await supabase
    .from('pos_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .gte('transaction_date', `${year}-${month}-${day}T00:00:00`)
    .lte('transaction_date', `${year}-${month}-${day}T23:59:59`)

  if (error) {
    console.error('Error counting transactions:', error)
    throw new Error('Failed to generate transaction number')
  }

  const nextNumber = (count || 0) + 1
  return `POS-${year}${month}${day}-${String(nextNumber).padStart(4, '0')}`
}

/**
 * Cancel a transaction (soft delete by changing status)
 */
export async function cancelTransaction(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = supabase.from('pos_transactions') as any
  const { error } = await query
    .update({
      payment_status: 'cancelled',
    })
    .eq('id', id)

  if (error) {
    console.error('Error cancelling transaction:', error)
    throw new Error(`Failed to cancel transaction: ${error.message}`)
  }
}

/**
 * Refund a transaction
 */
export async function refundTransaction(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = supabase.from('pos_transactions') as any
  const { error } = await query
    .update({
      payment_status: 'refunded',
    })
    .eq('id', id)

  if (error) {
    console.error('Error refunding transaction:', error)
    throw new Error(`Failed to refund transaction: ${error.message}`)
  }
}
