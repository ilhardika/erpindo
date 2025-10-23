/**
 * Sales Module API
 * Handles CRUD operations for sales orders, invoices, payments, and delivery orders
 */

import { createClientSupabase } from '@/lib/supabase/client'
import type {
  SalesOrder,
  SalesOrderWithRelations,
  SalesInvoice,
  SalesInvoiceWithRelations,
  SalesPayment,
  SalesPaymentWithRelations,
  DeliveryOrder,
  DeliveryOrderWithRelations,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  CreateSalesInvoiceInput,
  UpdateSalesInvoiceInput,
  CreateSalesPaymentInput,
  OrderStatus,
  CreateDeliveryOrderInput,
  UpdateDeliveryOrderInput,
} from '@/types/sales'

const supabase = createClientSupabase()

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentCompanyId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: userData, error } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (error || !userData) throw new Error('Failed to get user company')
  return userData.company_id
}

async function generateOrderNumber(companyId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')

  // Get count of orders this month
  const startOfMonth = new Date(year, today.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth)

  const sequence = String((count || 0) + 1).padStart(4, '0')
  return `SO-${year}${month}-${sequence}`
}

async function generateInvoiceNumber(companyId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')

  const startOfMonth = new Date(year, today.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('sales_invoices')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth)

  const sequence = String((count || 0) + 1).padStart(4, '0')
  return `INV-${year}${month}-${sequence}`
}

async function generatePaymentNumber(companyId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')

  const startOfMonth = new Date(year, today.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('sales_payments')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth)

  const sequence = String((count || 0) + 1).padStart(4, '0')
  return `PAY-${year}${month}-${sequence}`
}

async function generateDeliveryNumber(companyId: string): Promise<string> {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')

  const startOfMonth = new Date(year, today.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('delivery_orders')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth)

  const sequence = String((count || 0) + 1).padStart(4, '0')
  return `DO-${year}${month}-${sequence}`
}

// ============================================================================
// Sales Orders
// ============================================================================

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('sales_orders')
    .select('*')
    .eq('company_id', companyId)
    .order('order_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSalesOrderById(
  id: string
): Promise<SalesOrderWithRelations | null> {
  const { data: order, error } = await supabase
    .from('sales_orders')
    .select(
      `
      *,
      customer:customers(id, name, email, phone, company),
      salesman:users!salesman_id(id, full_name, email)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  if (!order) return null

  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('sales_order_items')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  if (itemsError) throw itemsError

  return {
    ...order,
    items: items || [],
  }
}

export async function createSalesOrder(
  input: CreateSalesOrderInput
): Promise<SalesOrder> {
  const companyId = await getCurrentCompanyId()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const orderNumber = await generateOrderNumber(companyId)

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('sales_orders')
    .insert({
      company_id: companyId,
      customer_id: input.customer_id,
      salesman_id: input.salesman_id || null,
      order_number: orderNumber,
      order_date: input.order_date,
      status: input.status || 'draft',
      subtotal: input.subtotal,
      discount_amount: input.discount_amount || 0,
      tax_amount: input.tax_amount || 0,
      shipping_amount: input.shipping_amount || 0,
      grand_total: input.grand_total,
      notes: input.notes || null,
      terms: input.terms || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (orderError) throw orderError
  if (!order) throw new Error('Failed to create order')

  // Create order items
  if (input.items && input.items.length > 0) {
    const itemsToInsert = input.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0,
      tax_amount: item.tax_amount || 0,
      subtotal: item.subtotal,
      promotion_id: item.promotion_id || null,
      notes: item.notes || null,
    }))

    const { error: itemsError } = await supabase
      .from('sales_order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      // Rollback order if items fail
      await supabase.from('sales_orders').delete().eq('id', order.id)
      throw itemsError
    }
  }

  return order
}

export async function updateSalesOrder(
  id: string,
  input: UpdateSalesOrderInput
): Promise<SalesOrder> {
  const { data, error } = await supabase
    .from('sales_orders')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Order not found')

  // Update items if provided
  if (input.items) {
    // Delete existing items
    await supabase.from('sales_order_items').delete().eq('order_id', id)

    // Insert new items
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map(item => ({
        order_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount || 0,
        tax_amount: item.tax_amount || 0,
        subtotal: item.subtotal,
        promotion_id: item.promotion_id || null,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError
    }
  }

  return data
}

export async function deleteSalesOrder(id: string): Promise<void> {
  const { error } = await supabase.from('sales_orders').delete().eq('id', id)
  if (error) throw error
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<SalesOrder> {
  const { data, error } = await supabase
    .from('sales_orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Order not found')

  return data
}

export async function cancelSalesOrder(id: string): Promise<SalesOrder> {
  return updateOrderStatus(id, 'cancelled')
}

export async function confirmSalesOrder(id: string): Promise<SalesOrder> {
  return updateOrderStatus(id, 'confirmed')
}

export async function processSalesOrder(id: string): Promise<SalesOrder> {
  return updateOrderStatus(id, 'processing')
}

export async function completeSalesOrder(id: string): Promise<SalesOrder> {
  return updateOrderStatus(id, 'completed')
}

export async function convertOrderToInvoice(
  orderId: string,
  dueDate: string
): Promise<SalesInvoice> {
  const order = await getSalesOrderById(orderId)
  if (!order) throw new Error('Order not found')

  const invoiceData: CreateSalesInvoiceInput = {
    customer_id: order.customer_id,
    order_id: orderId,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: dueDate,
    status: 'unpaid',
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    tax_amount: order.tax_amount,
    shipping_amount: order.shipping_amount,
    grand_total: order.grand_total,
    notes: order.notes || undefined,
    terms: order.terms || undefined,
  }

  return createSalesInvoice(invoiceData)
}

// ============================================================================
// Sales Invoices
// ============================================================================

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('sales_invoices')
    .select('*')
    .eq('company_id', companyId)
    .order('invoice_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSalesInvoiceById(
  id: string
): Promise<SalesInvoiceWithRelations | null> {
  const { data: invoice, error } = await supabase
    .from('sales_invoices')
    .select(
      `
      *,
      customer:customers(id, name, email, phone, company),
      order:sales_orders(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  if (!invoice) return null

  // Get payments
  const { data: payments, error: paymentsError } = await supabase
    .from('sales_payments')
    .select('*')
    .eq('invoice_id', id)
    .order('payment_date', { ascending: true })

  if (paymentsError) throw paymentsError

  return {
    ...invoice,
    payments: payments || [],
  }
}

export async function createSalesInvoice(
  input: CreateSalesInvoiceInput
): Promise<SalesInvoice> {
  const companyId = await getCurrentCompanyId()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const invoiceNumber = await generateInvoiceNumber(companyId)

  const { data, error } = await supabase
    .from('sales_invoices')
    .insert({
      company_id: companyId,
      order_id: input.order_id || null,
      customer_id: input.customer_id,
      invoice_number: invoiceNumber,
      invoice_date: input.invoice_date,
      due_date: input.due_date,
      status: input.status || 'unpaid',
      subtotal: input.subtotal,
      discount_amount: input.discount_amount || 0,
      tax_amount: input.tax_amount || 0,
      shipping_amount: input.shipping_amount || 0,
      grand_total: input.grand_total,
      paid_amount: 0,
      remaining_amount: input.grand_total,
      notes: input.notes || null,
      terms: input.terms || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create invoice')

  return data
}

export async function updateSalesInvoice(
  id: string,
  input: UpdateSalesInvoiceInput
): Promise<SalesInvoice> {
  const { data, error } = await supabase
    .from('sales_invoices')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Invoice not found')

  return data
}

export async function deleteSalesInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('sales_invoices').delete().eq('id', id)
  if (error) throw error
}

// ============================================================================
// Sales Payments
// ============================================================================

export async function getSalesPayments(): Promise<SalesPayment[]> {
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('sales_payments')
    .select('*')
    .eq('company_id', companyId)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createSalesPayment(
  input: CreateSalesPaymentInput
): Promise<SalesPayment> {
  const companyId = await getCurrentCompanyId()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const paymentNumber = await generatePaymentNumber(companyId)

  // Create payment
  const { data: payment, error: paymentError } = await supabase
    .from('sales_payments')
    .insert({
      company_id: companyId,
      invoice_id: input.invoice_id,
      payment_number: paymentNumber,
      payment_date: input.payment_date,
      payment_method: input.payment_method,
      amount: input.amount,
      reference_number: input.reference_number || null,
      notes: input.notes || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (paymentError) throw paymentError
  if (!payment) throw new Error('Failed to create payment')

  // Update invoice paid amount and status
  const { data: invoice, error: invoiceError } = await supabase
    .from('sales_invoices')
    .select('*')
    .eq('id', input.invoice_id)
    .single()

  if (invoiceError) throw invoiceError
  if (!invoice) throw new Error('Invoice not found')

  const newPaidAmount = invoice.paid_amount + input.amount
  const newRemainingAmount = invoice.grand_total - newPaidAmount
  let newStatus = invoice.status

  if (newRemainingAmount <= 0) {
    newStatus = 'paid'
  } else if (newPaidAmount > 0) {
    newStatus = 'partial'
  }

  await supabase
    .from('sales_invoices')
    .update({
      paid_amount: newPaidAmount,
      remaining_amount: newRemainingAmount,
      status: newStatus,
    })
    .eq('id', input.invoice_id)

  return payment
}

export async function deleteSalesPayment(id: string): Promise<void> {
  // Get payment to update invoice
  const { data: payment, error: paymentError } = await supabase
    .from('sales_payments')
    .select('*')
    .eq('id', id)
    .single()

  if (paymentError) throw paymentError
  if (!payment) throw new Error('Payment not found')

  // Delete payment
  const { error } = await supabase.from('sales_payments').delete().eq('id', id)
  if (error) throw error

  // Update invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('sales_invoices')
    .select('*')
    .eq('id', payment.invoice_id)
    .single()

  if (invoiceError) throw invoiceError
  if (!invoice) return

  const newPaidAmount = invoice.paid_amount - payment.amount
  const newRemainingAmount = invoice.grand_total - newPaidAmount
  let newStatus = invoice.status

  if (newRemainingAmount === invoice.grand_total) {
    newStatus = 'unpaid'
  } else if (newRemainingAmount > 0) {
    newStatus = 'partial'
  }

  await supabase
    .from('sales_invoices')
    .update({
      paid_amount: newPaidAmount,
      remaining_amount: newRemainingAmount,
      status: newStatus,
    })
    .eq('id', payment.invoice_id)
}

// ============================================================================
// Delivery Orders
// ============================================================================

export async function getDeliveryOrders(): Promise<DeliveryOrder[]> {
  const companyId = await getCurrentCompanyId()

  const { data, error } = await supabase
    .from('delivery_orders')
    .select('*')
    .eq('company_id', companyId)
    .order('delivery_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDeliveryOrderById(
  id: string
): Promise<DeliveryOrderWithRelations | null> {
  const { data, error } = await supabase
    .from('delivery_orders')
    .select(
      `
      *,
      order:sales_orders(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data || null
}

export async function createDeliveryOrder(
  input: CreateDeliveryOrderInput
): Promise<DeliveryOrder> {
  const companyId = await getCurrentCompanyId()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const deliveryNumber = await generateDeliveryNumber(companyId)

  const { data, error } = await supabase
    .from('delivery_orders')
    .insert({
      company_id: companyId,
      order_id: input.order_id,
      delivery_number: deliveryNumber,
      delivery_date: input.delivery_date,
      scheduled_date: input.scheduled_date || null,
      status: input.status || 'pending',
      driver_name: input.driver_name || null,
      vehicle_plate: input.vehicle_plate || null,
      delivery_address: input.delivery_address,
      recipient_name: input.recipient_name || null,
      recipient_phone: input.recipient_phone || null,
      notes: input.notes || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Failed to create delivery order')

  return data
}

export async function updateDeliveryOrder(
  id: string,
  input: UpdateDeliveryOrderInput
): Promise<DeliveryOrder> {
  const { data, error } = await supabase
    .from('delivery_orders')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Delivery order not found')

  return data
}

export async function deleteDeliveryOrder(id: string): Promise<void> {
  const { error } = await supabase.from('delivery_orders').delete().eq('id', id)
  if (error) throw error
}

export async function startDelivery(id: string): Promise<DeliveryOrder> {
  const input: UpdateDeliveryOrderInput = {
    status: 'in_transit',
  }
  return updateDeliveryOrder(id, input)
}

export async function completeDelivery(id: string): Promise<DeliveryOrder> {
  const input: UpdateDeliveryOrderInput = {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
  }
  return updateDeliveryOrder(id, input)
}

export async function cancelDelivery(id: string): Promise<DeliveryOrder> {
  const input: UpdateDeliveryOrderInput = {
    status: 'cancelled',
  }
  return updateDeliveryOrder(id, input)
}

// Alias for getDeliveryOrderById
export async function getDeliveryOrder(
  id: string
): Promise<DeliveryOrderWithRelations | null> {
  return getDeliveryOrderById(id)
}
