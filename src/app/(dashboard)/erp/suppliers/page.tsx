'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SupplierTable } from '@/components/suppliers/supplier-table'
import { getSuppliers, getSupplierCategories } from '@/lib/suppliers/api'
import type { Supplier, SupplierCategory } from '@/lib/suppliers/types'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<SupplierCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)

    const [suppliersData, categoriesData] = await Promise.all([
      getSuppliers(),
      getSupplierCategories(),
    ])

    if (suppliersData) setSuppliers(suppliersData)
    if (categoriesData) setCategories(categoriesData)

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and vendor relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/erp/suppliers/categories">Manage Categories</Link>
          </Button>
          <Button asChild>
            <Link href="/erp/suppliers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <SupplierTable
        suppliers={suppliers}
        categories={categories}
        loading={isLoading}
        onRefresh={loadData}
      />
    </div>
  )
}
