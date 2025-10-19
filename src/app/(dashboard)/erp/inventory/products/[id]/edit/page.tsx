'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FormLayout } from '@/components/layouts'
import { ProductForm } from '@/components/inventory/product-form'
import {
  getProductById,
  updateProduct,
  getProductCategories,
  getProductUnits,
} from '@/lib/inventory/api'
import { getSuppliers } from '@/lib/suppliers/api'
import type {
  Product,
  ProductCategory,
  ProductUnit,
  UpdateProductInput,
} from '@/types/inventory'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; name: string; code: string | null }>
  >([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (productId) {
      loadData()
    }
  }, [productId])

  async function loadData() {
    try {
      setLoading(true)
      const [productData, categoriesData, unitsData, suppliersData] =
        await Promise.all([
          getProductById(productId),
          getProductCategories(),
          getProductUnits(),
          getSuppliers(),
        ])

      setProduct(productData)
      setCategories(categoriesData)
      setUnits(unitsData)
      setSuppliers(
        suppliersData
          ? suppliersData.map(s => ({
              id: s.id,
              name: s.name,
              code: s.code || null,
            }))
          : []
      )
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load product data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: UpdateProductInput) {
    try {
      setSubmitting(true)
      await updateProduct(productId, data)
      alert('Product updated successfully')
      router.push('/erp/inventory')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!product) {
    return <div className="p-6">Product not found</div>
  }

  return (
    <FormLayout
      title="Edit Product"
      description="Update product information and settings"
    >
      <ProductForm
        product={product}
        categories={categories}
        units={units}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        isLoading={submitting}
        onCancel={() => router.push(`/erp/inventory/products/${productId}`)}
      />
    </FormLayout>
  )
}
