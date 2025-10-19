'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

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
import { Checkbox } from '@/components/ui/checkbox'

import type { Promotion, PromotionType } from '@/types/promotions'
import { getProducts } from '@/lib/inventory/api'
import { getProductCategories } from '@/lib/inventory/api'
import type { Product, ProductCategory } from '@/types/inventory'

// Validation schema
const promotionFormSchema = z.object({
  name: z.string().min(1, 'Promotion name is required'),
  code: z.string().min(1, 'Promotion code is required'),
  type: z.enum(['percentage', 'fixed', 'buy_x_get_y']),
  description: z.string().optional(),
  discount_value: z.number().min(0).optional(),
  buy_quantity: z.number().min(1).optional(),
  get_quantity: z.number().min(1).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  min_purchase_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().min(0).optional(),
  customer_segment: z.string().optional(),
  status: z.string(),
  is_active: z.boolean(),
  product_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
})

export type PromotionFormData = z.infer<typeof promotionFormSchema>

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: (data: PromotionFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * Promotion Form Component
 * Reusable form for creating and editing promotions
 */
export function PromotionForm({
  promotion,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromotionFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const isEditMode = !!promotion

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: promotion
      ? {
          name: promotion.name,
          code: promotion.code,
          type: promotion.type as PromotionType,
          description: promotion.description || '',
          discount_value: promotion.discount_value || undefined,
          buy_quantity: promotion.buy_quantity || undefined,
          get_quantity: promotion.get_quantity || undefined,
          start_date: promotion.start_date.split('T')[0],
          end_date: promotion.end_date.split('T')[0],
          min_purchase_amount: promotion.min_purchase_amount || undefined,
          max_discount_amount: promotion.max_discount_amount || undefined,
          customer_segment: promotion.customer_segment || '',
          status: promotion.status,
          is_active: promotion.is_active ?? true,
        }
      : {
          name: '',
          code: '',
          type: 'percentage',
          description: '',
          discount_value: 0,
          buy_quantity: 1,
          get_quantity: 1,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          min_purchase_amount: 0,
          max_discount_amount: 0,
          customer_segment: '',
          status: 'draft',
          is_active: true,
        },
  })

  const selectedType = watch('type')
  const selectedStatus = watch('status')
  const isActive = watch('is_active')

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getProductCategories(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Handle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Handle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Custom submit handler to include selected products/categories
  const handleFormSubmit = async (data: PromotionFormData) => {
    await onSubmit({
      ...data,
      product_ids: selectedProducts,
      category_ids: selectedCategories,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Promotion Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Grand Opening Sale"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Code */}
          <div className="grid gap-2">
            <Label htmlFor="code">
              Promotion Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., GO2025"
              {...register('code')}
              disabled={isLoading}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="grid gap-2">
            <Label htmlFor="type">
              Promotion Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={value => setValue('type', value as PromotionType)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage Discount</SelectItem>
                <SelectItem value="fixed">Fixed Amount Discount</SelectItem>
                <SelectItem value="buy_x_get_y">Buy X Get Y Free</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this promotion..."
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
        </CardContent>
      </Card>

      {/* Section 2: Discount Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedType === 'percentage' && (
            <div className="grid gap-2">
              <Label htmlFor="discount_value">Discount Percentage (%)</Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 20"
                {...register('discount_value', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.discount_value && (
                <p className="text-sm text-red-500">
                  {errors.discount_value.message}
                </p>
              )}
            </div>
          )}

          {selectedType === 'fixed' && (
            <div className="grid gap-2">
              <Label htmlFor="discount_value">Discount Amount (Rp)</Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 50000"
                {...register('discount_value', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.discount_value && (
                <p className="text-sm text-red-500">
                  {errors.discount_value.message}
                </p>
              )}
            </div>
          )}

          {selectedType === 'buy_x_get_y' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buy_quantity">
                  Buy Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="buy_quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 2"
                  {...register('buy_quantity', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.buy_quantity && (
                  <p className="text-sm text-red-500">
                    {errors.buy_quantity.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="get_quantity">
                  Get Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="get_quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  {...register('get_quantity', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.get_quantity && (
                  <p className="text-sm text-red-500">
                    {errors.get_quantity.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Validity & Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Validity & Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                disabled={isLoading}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                disabled={isLoading}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          {/* Purchase Rules */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="min_purchase_amount">Minimum Purchase (Rp)</Label>
              <Input
                id="min_purchase_amount"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 100000"
                {...register('min_purchase_amount', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.min_purchase_amount && (
                <p className="text-sm text-red-500">
                  {errors.min_purchase_amount.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="max_discount_amount">
                Maximum Discount Cap (Rp)
              </Label>
              <Input
                id="max_discount_amount"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g., 500000"
                {...register('max_discount_amount', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.max_discount_amount && (
                <p className="text-sm text-red-500">
                  {errors.max_discount_amount.message}
                </p>
              )}
            </div>
          </div>

          {/* Customer Segment */}
          <div className="grid gap-2">
            <Label htmlFor="customer_segment">Customer Segment</Label>
            <Input
              id="customer_segment"
              placeholder="e.g., VIP, Regular, New"
              {...register('customer_segment')}
              disabled={isLoading}
            />
            {errors.customer_segment && (
              <p className="text-sm text-red-500">
                {errors.customer_segment.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Targeting */}
      <Card>
        <CardHeader>
          <CardTitle>Targeting (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select specific products or categories. Leave empty to apply to all
            products.
          </p>

          {/* Product Selection */}
          <div className="grid gap-2">
            <Label>Select Products</Label>
            {isLoadingData ? (
              <p className="text-sm text-muted-foreground">
                Loading products...
              </p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products available
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border p-4 space-y-2">
                {products.map(product => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`product-${product.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {product.name} ({product.sku})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="grid gap-2">
            <Label>Select Categories</Label>
            {isLoadingData ? (
              <p className="text-sm text-muted-foreground">
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories available
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border p-4 space-y-2">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Promotion Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={value => setValue('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={isActive}
              onCheckedChange={checked => setValue('is_active', !!checked)}
              disabled={isLoading}
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active (can be applied)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card>
        <CardContent className="flex justify-end gap-4 pt-6">
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
            {isEditMode ? 'Update Promotion' : 'Create Promotion'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
