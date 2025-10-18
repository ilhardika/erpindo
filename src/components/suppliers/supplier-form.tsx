'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

import { CategoryDialog } from '@/components/suppliers/category-dialog'
import {
  supplierFormSchema,
  type SupplierFormData,
} from '@/lib/suppliers/validation'
import { getSupplierCategories } from '@/lib/suppliers/api'
import type { Supplier, SupplierCategory } from '@/lib/suppliers/types'

interface SupplierFormProps {
  supplier?: Supplier
  onSubmit: (data: SupplierFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * Supplier Form Component
 * Reusable form for creating and editing suppliers
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles supplier form UI and validation
 * - DRY: Reusable for both create and edit operations
 * - KISS: Simple, straightforward form structure
 * - Separation of Concerns: Validation logic in separate file, API calls handled by parent
 */
export function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
  isLoading = false,
}: SupplierFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<SupplierCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)

  const isEditMode = !!supplier

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplier
      ? {
          name: supplier.name,
          code: supplier.code || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          category_id: supplier.category_id || '',
          payment_terms: supplier.payment_terms || '',
          lead_time_days: supplier.lead_time_days || 0,
          status: supplier.status as 'active' | 'inactive',
        }
      : {
          name: '',
          code: '',
          email: '',
          phone: '',
          address: '',
          category_id: '',
          payment_terms: '',
          lead_time_days: 0,
          status: 'active',
        },
  })

  const selectedCategoryId = watch('category_id')
  const selectedStatus = watch('status')

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      setCategoryError(null)
      const data = await getSupplierCategories()
      if (data) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategoryError('Failed to load categories')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleCategoryCreated = (newCategory: SupplierCategory) => {
    setCategories(prev => [...prev, newCategory])
    setValue('category_id', newCategory.id)
    setShowCategoryDialog(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="PT ABC Supplier"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Supplier Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="SUPP-001"
                disabled={isLoading}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="supplier@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+62 21 123 4567"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter supplier address"
              rows={3}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCategoryId}
                  onValueChange={value => setValue('category_id', value)}
                  disabled={isLoading || isLoadingCategories}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryError ? (
                      <div className="p-2 text-sm text-destructive">
                        {categoryError}
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No categories found
                      </div>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryDialog(true)}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.category_id && (
                <p className="text-sm text-destructive">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: 'active' | 'inactive') =>
                  setValue('status', value)
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
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procurement Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                {...register('payment_terms')}
                placeholder="Net 30, Net 45, etc."
                disabled={isLoading}
              />
              {errors.payment_terms && (
                <p className="text-sm text-destructive">
                  {errors.payment_terms.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                e.g., Net 30, Net 45, COD, etc.
              </p>
            </div>

            {/* Lead Time Days */}
            <div className="space-y-2">
              <Label htmlFor="lead_time_days">Lead Time (days)</Label>
              <Input
                id="lead_time_days"
                type="number"
                min="0"
                {...register('lead_time_days', { valueAsNumber: true })}
                placeholder="0"
                disabled={isLoading}
              />
              {errors.lead_time_days && (
                <p className="text-sm text-destructive">
                  {errors.lead_time_days.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Number of days from order to delivery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onSuccess={handleCategoryCreated}
      />
    </form>
  )
}
