import { z } from 'zod'

// Supplier form validation schema
export const supplierFormSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  code: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
  payment_terms: z.string().optional().or(z.literal('')),
  lead_time_days: z
    .number()
    .int()
    .min(0, 'Lead time must be 0 or greater')
    .optional(),
  status: z.enum(['active', 'inactive']),
})

export type SupplierFormData = z.infer<typeof supplierFormSchema>

// Supplier category form validation schema
export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>
