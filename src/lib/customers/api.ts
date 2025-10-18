/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - TODO: Fix database types after regeneration
'use client'

import { createClientSupabase } from '@/lib/supabase/client'
import type {
  Customer,
  CustomerCategory,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/types/customers'

const supabase = createClientSupabase()

// ============================================
// CUSTOMER CATEGORIES
// ============================================

export async function getCustomerCategories(): Promise<CustomerCategory[]> {
  const { data, error } = await supabase
    .from('customer_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error)
    throw new Error(`Failed to fetch customer categories: ${error.message}`)
  return data || []
}

export async function createCustomerCategory(
  name: string,
  description?: string
): Promise<CustomerCategory> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  // @ts-expect-error - Database types need regeneration
  if (!userData || !userData.company_id) throw new Error('Company ID not found')

  // @ts-expect-error - Database types need regeneration
  const { data, error } = await supabase
    .from('customer_categories')
    .insert({
      // @ts-expect-error - Database types need regeneration
      company_id: userData.company_id as string,
      name,
      description: description || null,
    })
    .select()
    .single()

  if (error)
    throw new Error(`Failed to create customer category: ${error.message}`)
  return data as CustomerCategory
}

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomers(
  filters?: CustomerFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<Customer>> {
  const page = pagination?.page || 1
  const limit = pagination?.limit || 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('customers')
    .select('*, category:customer_categories(*)', { count: 'exact' })

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    )
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  // Apply pagination
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`)

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data, error } = await supabase
    .from('customers')
    .select('*, category:customer_categories(*)')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch customer: ${error.message}`)
  return data
}

export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) throw new Error('Company ID not found')

  const { data, error } = await supabase
    .from('customers')
    .insert({
      company_id: userData.company_id,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      category_id: input.category_id || null,
      credit_limit: input.credit_limit || 0,
      status: input.status || 'active',
      created_by: user.id,
    })
    .select('*, category:customer_categories(*)')
    .single()

  if (error) throw new Error(`Failed to create customer: ${error.message}`)
  return data
}

export async function updateCustomer(
  input: UpdateCustomerInput
): Promise<Customer> {
  const { id, ...updates } = input

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select('*, category:customer_categories(*)')
    .single()

  if (error) throw new Error(`Failed to update customer: ${error.message}`)
  return data
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) throw new Error(`Failed to delete customer: ${error.message}`)
}

export async function toggleCustomerStatus(id: string): Promise<Customer> {
  // Get current status
  const { data: current } = await supabase
    .from('customers')
    .select('status')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Customer not found')

  const newStatus = current.status === 'active' ? 'inactive' : 'active'

  return updateCustomer({ id, status: newStatus })
}
