'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormLayout } from '@/components/layouts'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getProducts,
  getWarehouses,
  getStock,
  createStockMovement,
} from '@/lib/inventory/api'
import type { Product, Warehouse, Stock } from '@/types/inventory'

const adjustmentSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  actual_quantity: z.number().min(0, 'Actual quantity must be 0 or positive'),
  notes: z.string().min(1, 'Reason/notes is required for stock adjustment'),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

export default function StockOpnamePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [currentStock, setCurrentStock] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      product_id: '',
      warehouse_id: '',
      actual_quantity: 0,
      notes: '',
    },
  })

  const productId = form.watch('product_id')
  const warehouseId = form.watch('warehouse_id')
  const actualQuantity = form.watch('actual_quantity')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (productId && warehouseId) {
      loadCurrentStock()
    } else {
      setCurrentStock(null)
    }
  }, [productId, warehouseId])

  async function loadData() {
    try {
      setLoading(true)
      const [productsData, warehousesData] = await Promise.all([
        getProducts(),
        getWarehouses(),
      ])
      setProducts(productsData || [])
      setWarehouses(warehousesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentStock() {
    try {
      const stockData = await getStock(warehouseId)
      const productStock = stockData.find(s => s.product_id === productId)
      if (productStock) {
        setCurrentStock(productStock.quantity)
      } else {
        setCurrentStock(0)
      }
    } catch (error) {
      console.error('Error loading current stock:', error)
      setCurrentStock(null)
    }
  }

  async function onSubmit(data: AdjustmentFormData) {
    if (currentStock === null) {
      alert('Current stock not loaded. Please try again.')
      return
    }

    const difference = data.actual_quantity - currentStock

    if (difference === 0) {
      alert('No adjustment needed. Actual quantity is same as current stock.')
      return
    }

    if (
      !confirm(
        `This will ${difference > 0 ? 'add' : 'remove'} ${Math.abs(difference)} units ${difference > 0 ? 'to' : 'from'} stock. Continue?`
      )
    ) {
      return
    }

    try {
      setSubmitting(true)

      // Create stock movement for adjustment
      await createStockMovement({
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        movement_type: 'ADJUSTMENT',
        quantity: Math.abs(difference),
        reference_type: 'STOCK_OPNAME',
        reference_id: `OPNAME-${Date.now()}`,
        notes: `Stock Adjustment: ${data.notes}. Previous: ${currentStock}, Actual: ${data.actual_quantity}, Difference: ${difference > 0 ? '+' : ''}${difference}`,
      })

      alert('Stock adjustment completed successfully')
      router.push('/erp/inventory/stock-movements')
    } catch (error) {
      console.error('Error creating adjustment:', error)
      alert('Failed to create stock adjustment')
    } finally {
      setSubmitting(false)
    }
  }

  const difference = currentStock !== null ? actualQuantity - currentStock : 0
  const selectedProduct = products.find(p => p.id === productId)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <FormLayout
      title="Stock Opname (Adjustment)"
      description="Adjust stock quantities based on physical count"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product & Location</CardTitle>
              <CardDescription>
                Select the product and warehouse for stock adjustment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {currentStock !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
                <CardDescription>
                  Current stock and adjustment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Current Stock
                    </div>
                    <div className="text-2xl font-bold">{currentStock}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedProduct?.unit_id || 'units'}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="actual_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Actual Quantity (Physical Count) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {difference !== 0 && (
                  <div
                    className={`p-4 rounded-lg ${
                      difference > 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          {difference > 0 ? 'Stock Increase' : 'Stock Decrease'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Adjustment will be recorded as stock movement
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          difference > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {difference > 0 ? '+' : ''}
                        {difference}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Adjustment Reason</CardTitle>
              <CardDescription>
                Explain why this adjustment is needed (required)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason / Notes *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Physical count shows different quantity, damaged goods removed, etc."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting || currentStock === null || difference === 0}
            >
              {submitting ? 'Saving...' : 'Save Adjustment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/erp/inventory/stock-movements')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </FormLayout>
  )
}
