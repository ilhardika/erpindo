// Supplier Types
// Module: Suppliers
// Description: TypeScript interfaces for suppliers and supplier categories

export interface SupplierCategory {
  id: string
  company_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  company_id: string
  code: string
  name: string
  email?: string
  phone?: string
  address?: string
  category_id?: string
  payment_terms: number // Payment terms in days (default: 30)
  lead_time_days: number // Lead time for delivery in days (default: 7)
  status: 'active' | 'inactive'
  notes?: string
  created_at: string
  updated_at: string

  // Joined data
  category?: SupplierCategory
}

// Form data types (exported from validation.ts)
export type {
  SupplierFormData,
  CategoryFormData,
} from '@/lib/suppliers/validation'
