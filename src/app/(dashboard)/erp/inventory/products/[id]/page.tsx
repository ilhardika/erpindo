'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Edit, Loader2, DollarSign, Trash2, Box } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DetailLayout } from '@/components/layouts'

import { getProductById, deleteProduct } from '@/lib/inventory/api'
import type { ProductWithRelations } from '@/types/inventory'

/**
 * Product Detail Page (View Only)
 * Display product information in read-only mode
 *
 * Clean Code Principles:
 * - Single Responsibility: Only displays product details
 * - Separation of Concerns: Display logic separate from edit logic
 * - KISS: Simple, clear information display
 */
export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getProductById(productId)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
        toast.error('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

  // Handle delete
  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await deleteProduct(productId)
      toast.success('Product deleted successfully')
      router.push('/erp/inventory')
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete product'
      )
    }
  }

  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500">
              {error || 'Product not found'}
            </p>
            <Button onClick={() => router.push('/erp/inventory')}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DetailLayout
      title={product.name}
      subtitle="Product Details"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/erp/inventory/products/${productId}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product identification and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Product Name
              </p>
              <p className="text-base font-semibold">{product.name}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">SKU</p>
              <p className="text-base font-mono">{product.sku}</p>
            </div>

            {product.barcode && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Barcode
                  </p>
                  <p className="text-base font-mono">{product.barcode}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <Badge variant="outline" className="font-normal">
                {product.category?.name || 'Uncategorized'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {product.description && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-base whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Cost and selling prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Cost Price
                </p>
                <p className="text-base font-semibold">
                  {formatCurrency(product.cost_price)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Selling Price
                </p>
                <p className="text-base font-semibold">
                  {formatCurrency(product.selling_price)}
                </p>
              </div>
            </div>

            {product.cost_price && product.selling_price && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Margin
                  </p>
                  <p className="text-base font-semibold">
                    {(
                      ((product.selling_price - product.cost_price) /
                        product.selling_price) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
            <CardDescription>Inventory levels and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Box className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Minimum Stock
                </p>
                <p className="text-base font-semibold">
                  {product.min_stock || 0}
                </p>
              </div>
            </div>

            {product.max_stock && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Maximum Stock
                  </p>
                  <p className="text-base font-semibold">{product.max_stock}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Reorder Point
              </p>
              <p className="text-base font-semibold">
                {product.reorder_point || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
            <CardDescription>Creation and modification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base">
                {product.created_at ? formatDate(product.created_at) : '-'}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-base">
                {product.updated_at ? formatDate(product.updated_at) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push('/erp/inventory')}>
          Back to List
        </Button>
      </div>
    </DetailLayout>
  )
}
