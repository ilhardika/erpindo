// Customer module type definitions

export interface CustomerCategory {
  id: string
  company_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  category_id: string | null
  credit_limit: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  created_by: string | null
  // Joined data
  category?: CustomerCategory
}

export interface CreateCustomerInput {
  name: string
  email?: string
  phone?: string
  address?: string
  category_id?: string
  credit_limit?: number
  status?: 'active' | 'inactive'
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string
}

export interface CustomerFilters {
  search?: string // Search in name, email, phone
  category_id?: string
  status?: 'active' | 'inactive'
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}
