import { z } from 'zod'

/**
 * Customer form validation schema
 * Following clean code principles: centralized validation logic (DRY)
 */
export const customerFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  category_id: z.string().uuid('Please select a category'),
  credit_limit: z.number().min(0, 'Credit limit must be positive'),
  status: z.enum(['active', 'inactive']),
})

export type CustomerFormData = z.infer<typeof customerFormSchema>

/**
 * Category form validation schema
 */
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z
    .string()
    .max(200, 'Description must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>
