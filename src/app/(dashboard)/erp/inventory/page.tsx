'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductTable } from '@/components/inventory/product-table'
import { DataTableLayout } from '@/components/layouts'
import { getProducts, getProductCategories } from '@/lib/inventory/api'
import type { Product, ProductCategory } from '@/types/inventory'

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DataTableLayout
      title="Products"
      description="Manage your product inventory"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/erp/inventory/categories">Manage Categories</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/erp/inventory/units">Manage Units</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/erp/inventory/warehouses">Manage Warehouses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/erp/inventory/stock-movements">Stock Movements</Link>
          </Button>
          <Button asChild>
            <Link href="/erp/inventory/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </>
      }
    >
      {/* Table */}
      <ProductTable
        products={products}
        categories={categories}
        loading={loading}
        onRefresh={loadData}
      />
    </DataTableLayout>
  )
}
