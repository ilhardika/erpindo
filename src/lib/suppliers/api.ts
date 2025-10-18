/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - TODO: Fix database types after regeneration
'use client'

import { createClientSupabase } from '@/lib/supabase/client'
import type { Supplier, SupplierCategory } from './types'
import type { SupplierFormData, CategoryFormData } from './validation'

// ============================================================================
// Supplier CRUD Operations
// ============================================================================

/**
 * Get all suppliers for the current user's company
 */
export async function getSuppliers(): Promise<Supplier[] | null> {
  const supabase = createClientSupabase()

  const { data, error } = await supabase
    .from('suppliers')
    .select(
      `
      *,
      category:supplier_categories(id, name)
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching suppliers:', error)
    return null
  }

  return data
}

/**
 * Get a single supplier by ID
 */
export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = createClientSupabase()

  const { data, error } = await supabase
    .from('suppliers')
    .select(
      `
      *,
      category:supplier_categories(id, name)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching supplier:', error)
    return null
  }

  return data
}

/**
 * Create a new supplier
 */
export async function createSupplier(
  formData: SupplierFormData
): Promise<Supplier | null> {
  const supabase = createClientSupabase()

  // Get current user and their company
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not authenticated')
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('Error fetching user company:', userError)
    return null
  }

  // Prepare supplier data
  const supplierData = {
    company_id: userData.company_id,
    name: formData.name,
    code: formData.code || null,
    email: formData.email || null,
    phone: formData.phone || null,
    address: formData.address || null,
    category_id: formData.category_id || null,
    payment_terms: formData.payment_terms || null,
    lead_time_days: formData.lead_time_days || 0,
    status: formData.status,
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplierData])
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier:', error)
    return null
  }

  return data
}

/**
 * Update an existing supplier
 */
export async function updateSupplier(
  id: string,
  formData: SupplierFormData
): Promise<boolean> {
  const supabase = createClientSupabase()

  const supplierData = {
    name: formData.name,
    code: formData.code || null,
    email: formData.email || null,
    phone: formData.phone || null,
    address: formData.address || null,
    category_id: formData.category_id || null,
    payment_terms: formData.payment_terms || null,
    lead_time_days: formData.lead_time_days || 0,
    status: formData.status,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('suppliers')
    .update(supplierData)
    .eq('id', id)

  if (error) {
    console.error('Error updating supplier:', error)
    return false
  }

  return true
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(id: string): Promise<boolean> {
  const supabase = createClientSupabase()

  const { error } = await supabase.from('suppliers').delete().eq('id', id)

  if (error) {
    console.error('Error deleting supplier:', error)
    return false
  }

  return true
}

// ============================================================================
// Supplier Category CRUD Operations
// ============================================================================

/**
 * Get all supplier categories for the current user's company
 */
export async function getSupplierCategories(): Promise<
  SupplierCategory[] | null
> {
  const supabase = createClientSupabase()

  const { data, error } = await supabase
    .from('supplier_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching supplier categories:', error)
    return null
  }

  return data
}

/**
 * Create a new supplier category
 */
export async function createSupplierCategory(
  formData: CategoryFormData
): Promise<SupplierCategory | null> {
  const supabase = createClientSupabase()

  // Get current user and their company
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('User not authenticated')
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('Error fetching user company:', userError)
    return null
  }

  const categoryData = {
    company_id: userData.company_id,
    name: formData.name,
    description: formData.description || null,
  }

  const { data, error } = await supabase
    .from('supplier_categories')
    .insert([categoryData])
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier category:', error)
    return null
  }

  return data
}

/**
 * Delete a supplier category
 */
export async function deleteSupplierCategory(id: string): Promise<boolean> {
  const supabase = createClientSupabase()

  const { error } = await supabase
    .from('supplier_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting supplier category:', error)
    return false
  }

  return true
}
