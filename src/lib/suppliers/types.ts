// Supplier types and interfaces
export interface Supplier {
  id: string
  company_id: string
  name: string
  code?: string
  email?: string
  phone?: string
  address?: string
  category_id?: string
  payment_terms?: string
  lead_time_days?: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  created_by?: string
  category?: SupplierCategory
}

export interface SupplierCategory {
  id: string
  company_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Re-export form types from validation
export type { SupplierFormData, CategoryFormData } from './validation'
