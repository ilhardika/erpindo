'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { CategoryDialog } from '@/components/customers/category-dialog'
import {
  customerFormSchema,
  type CustomerFormData,
} from '@/lib/customers/validation'
import { getCustomerCategories } from '@/lib/customers/api'
import type { Customer, CustomerCategory } from '@/types/customers'

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * Customer Form Component
 * Reusable form for creating and editing customers
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles customer form UI and validation
 * - DRY: Reusable for both create and edit operations
 * - KISS: Simple, straightforward form structure
 * - Separation of Concerns: Validation logic in separate file, API calls handled by parent
 */
export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const [categories, setCategories] = useState<CustomerCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const isEditMode = !!customer

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          category_id: customer.category_id || '',
          credit_limit: customer.credit_limit
            ? Number(customer.credit_limit)
            : 0,
          status: customer.status as 'active' | 'inactive',
        }
      : {
          name: '',
          email: '',
          phone: '',
          address: '',
          category_id: '',
          credit_limit: 0,
          status: 'active',
        },
  })

  const selectedCategoryId = watch('category_id')
  const selectedStatus = watch('status')

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        setCategoryError(null)
        const data = await getCustomerCategories()
        setCategories(data)
      } catch (error) {
        setCategoryError(
          error instanceof Error ? error.message : 'Failed to load categories'
        )
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const handleCategoryCreated = (newCategory: CustomerCategory) => {
    setCategories(prev => [...prev, newCategory])
    setValue('category_id', newCategory.id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Toko Maju Jaya"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@email.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="081234567890"
              {...register('phone')}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter customer address..."
              rows={3}
              {...register('address')}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <CategoryDialog onCategoryCreated={handleCategoryCreated} />
            </div>

            {isLoadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : categoryError ? (
              <p className="text-sm text-red-500">{categoryError}</p>
            ) : (
              <Select
                value={selectedCategoryId}
                onValueChange={value => setValue('category_id', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.category_id && (
              <p className="text-sm text-red-500">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Credit Limit */}
          <div className="grid gap-2">
            <Label htmlFor="credit_limit">Credit Limit (Rp)</Label>
            <Input
              id="credit_limit"
              type="number"
              min="0"
              step="1000"
              placeholder="0"
              {...register('credit_limit', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.credit_limit && (
              <p className="text-sm text-red-500">
                {errors.credit_limit.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={value =>
                setValue('status', value as 'active' | 'inactive')
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}
