'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DetailLayout } from '@/components/layouts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2 } from 'lucide-react'
import { getProductById, deleteProduct } from '@/lib/inventory/api'
import type { Product } from '@/types/inventory'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  async function loadProduct() {
    try {
      setLoading(true)
      const data = await getProductById(params.id as string)
      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
      alert('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await deleteProduct(params.id as string)
      alert('Product deleted successfully')
      router.push('/erp/inventory')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!product) {
    return <div className="p-6">Product not found</div>
  }

  return (
    <DetailLayout
      title={product.name}
      subtitle={`SKU: ${product.sku}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/erp/inventory/products/${product.id}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Product Name</div>
              <div className="font-medium">{product.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">SKU</div>
              <div className="font-medium">{product.sku}</div>
            </div>
            {product.barcode && (
              <div>
                <div className="text-sm text-muted-foreground">Barcode</div>
                <div className="font-medium">{product.barcode}</div>
              </div>
            )}
            {product.description && (
              <div>
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="font-medium">{product.description}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Cost Price</div>
              <div className="font-medium">
                {product.cost_price
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(product.cost_price)
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Selling Price</div>
              <div className="font-medium">
                {product.selling_price
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                    }).format(product.selling_price)
                  : '-'}
              </div>
            </div>
            {product.cost_price && product.selling_price && (
              <div>
                <div className="text-sm text-muted-foreground">Margin</div>
                <div className="font-medium">
                  {(
                    ((product.selling_price - product.cost_price) /
                      product.selling_price) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Minimum Stock</div>
              <div className="font-medium">{product.min_stock || 0}</div>
            </div>
            {product.max_stock && (
              <div>
                <div className="text-sm text-muted-foreground">
                  Maximum Stock
                </div>
                <div className="font-medium">{product.max_stock}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Reorder Point</div>
              <div className="font-medium">{product.reorder_point || 0}</div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Created At</div>
              <div className="font-medium">
                {product.created_at
                  ? new Date(product.created_at).toLocaleString('id-ID')
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="font-medium">
                {product.updated_at
                  ? new Date(product.updated_at).toLocaleString('id-ID')
                  : '-'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push('/erp/inventory')}>
          Back to Inventory
        </Button>
      </div>
    </DetailLayout>
  )
}
