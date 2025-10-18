'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormLayout } from '@/components/layouts'
import { ProductForm } from '@/components/inventory/product-form'
import {
  createProduct,
  getProductCategories,
  getProductUnits,
} from '@/lib/inventory/api'
import { getSuppliers } from '@/lib/suppliers/api'
import type {
  ProductCategory,
  ProductUnit,
  CreateProductInput,
} from '@/types/inventory'

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [suppliers, setSuppliers] = useState<
    Array<{ id: string; name: string; code: string | null }>
  >([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [categoriesData, unitsData, suppliersData] = await Promise.all([
        getProductCategories(),
        getProductUnits(),
        getSuppliers(),
      ])
      setCategories(categoriesData)
      setUnits(unitsData)
      if (suppliersData) {
        setSuppliers(
          suppliersData.map(s => ({
            id: s.id,
            name: s.name,
            code: s.code || null,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load form data')
    }
  }

  async function handleSubmit(data: CreateProductInput) {
    try {
      setIsSubmitting(true)
      await createProduct(data)
      alert('Product created successfully')
      router.push('/erp/inventory')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormLayout
      title="Add New Product"
      description="Create a new product in your inventory"
    >
      <ProductForm
        categories={categories}
        units={units}
        suppliers={suppliers}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </FormLayout>
  )
}
