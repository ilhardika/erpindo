'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product, ProductCategory, ProductUnit } from '@/types/inventory'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  unit_id: z.string().optional(),
  supplier_id: z.string().optional(),
  cost_price: z.number().min(0, 'Cost price must be positive'),
  selling_price: z.number().min(0, 'Selling price must be positive'),
  min_stock: z.number().min(0, 'Min stock must be positive').optional(),
  max_stock: z.number().min(0, 'Max stock must be positive').optional(),
  reorder_point: z.number().min(0, 'Reorder point must be positive').optional(),
  is_active: z.boolean(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  categories: ProductCategory[]
  units: ProductUnit[]
  suppliers: Array<{ id: string; name: string; code: string | null }>
  onSubmit: (data: ProductFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * Product Form Component
 * Reusable form for creating and editing products
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles product form UI and validation
 * - DRY: Reusable for both create and edit operations
 * - KISS: Simple, straightforward form structure
 * - Separation of Concerns: Validation logic in schema, API calls handled by parent
 */
export function ProductForm({
  product,
  categories,
  units,
  suppliers,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const isEditMode = !!product

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      unit_id: product?.unit_id || '',
      supplier_id: product?.supplier_id || '',
      cost_price: product?.cost_price || 0,
      selling_price: product?.selling_price || 0,
      min_stock: product?.min_stock || 0,
      max_stock: product?.max_stock || undefined,
      reorder_point: product?.reorder_point || 0,
      is_active: product?.is_active ?? true,
    },
  })

  const selectedCategoryId = watch('category_id')
  const selectedUnitId = watch('unit_id')
  const selectedSupplierId = watch('supplier_id')
  const selectedStatus = watch('is_active')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* SKU */}
          <div className="grid gap-2">
            <Label htmlFor="sku">
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sku"
              placeholder="e.g., PRD-001"
              {...register('sku')}
              disabled={isLoading}
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku.message}</p>
            )}
          </div>

          {/* Barcode */}
          <div className="grid gap-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              placeholder="e.g., 123456789012"
              {...register('barcode')}
              disabled={isLoading}
            />
            {errors.barcode && (
              <p className="text-sm text-red-500">{errors.barcode.message}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Samsung Galaxy S24"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description..."
              rows={3}
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
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
            {errors.category_id && (
              <p className="text-sm text-red-500">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Unit */}
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Select
              value={selectedUnitId}
              onValueChange={value => setValue('unit_id', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unit_id && (
              <p className="text-sm text-red-500">{errors.unit_id.message}</p>
            )}
          </div>

          {/* Supplier */}
          <div className="grid gap-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              value={selectedSupplierId}
              onValueChange={value => setValue('supplier_id', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} {supplier.code && `(${supplier.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplier_id && (
              <p className="text-sm text-red-500">
                {errors.supplier_id.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus ? 'active' : 'inactive'}
              onValueChange={value => setValue('is_active', value === 'active')}
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
            {errors.is_active && (
              <p className="text-sm text-red-500">{errors.is_active.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cost Price */}
          <div className="grid gap-2">
            <Label htmlFor="cost_price">
              Cost Price (Rp) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cost_price"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              {...register('cost_price', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.cost_price && (
              <p className="text-sm text-red-500">
                {errors.cost_price.message}
              </p>
            )}
          </div>

          {/* Selling Price */}
          <div className="grid gap-2">
            <Label htmlFor="selling_price">
              Selling Price (Rp) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="selling_price"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              {...register('selling_price', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.selling_price && (
              <p className="text-sm text-red-500">
                {errors.selling_price.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Min Stock */}
          <div className="grid gap-2">
            <Label htmlFor="min_stock">Minimum Stock</Label>
            <Input
              id="min_stock"
              type="number"
              min="0"
              placeholder="0"
              {...register('min_stock', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.min_stock && (
              <p className="text-sm text-red-500">{errors.min_stock.message}</p>
            )}
          </div>

          {/* Max Stock */}
          <div className="grid gap-2">
            <Label htmlFor="max_stock">Maximum Stock</Label>
            <Input
              id="max_stock"
              type="number"
              min="0"
              placeholder="0"
              {...register('max_stock', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.max_stock && (
              <p className="text-sm text-red-500">{errors.max_stock.message}</p>
            )}
          </div>

          {/* Reorder Point */}
          <div className="grid gap-2">
            <Label htmlFor="reorder_point">Reorder Point</Label>
            <Input
              id="reorder_point"
              type="number"
              min="0"
              placeholder="0"
              {...register('reorder_point', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.reorder_point && (
              <p className="text-sm text-red-500">
                {errors.reorder_point.message}
              </p>
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
          {isEditMode ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
