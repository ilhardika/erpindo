'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CustomerTable } from '@/components/customers/customer-table'
import { DataTableLayout } from '@/components/layouts'
import { getCustomers, getCustomerCategories } from '@/lib/customers/api'
import type {
  Customer,
  CustomerCategory,
  CustomerFilters,
} from '@/types/customers'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<CustomerCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    category_id: undefined,
    status: undefined,
  })

  const pageLimit = 10

  // Fetch customers with filters and pagination
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getCustomers(filters, {
        page: currentPage,
        limit: pageLimit,
      })
      setCustomers(result.data)
      setTotalCount(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const data = await getCustomerCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Load customers when filters or page changes
  useEffect(() => {
    fetchCustomers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CustomerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <DataTableLayout
      title="Customers"
      description="Manage your customer database"
      actions={
        <Button asChild>
          <Link href="/erp/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      }
    >
      {/* Table */}
      <CustomerTable
        customers={customers}
        categories={categories}
        loading={loading}
        error={error}
        filters={filters}
        onFilterChange={handleFilterChange}
        currentPage={currentPage}
        totalCount={totalCount}
        pageLimit={pageLimit}
        onPageChange={handlePageChange}
        onRefresh={fetchCustomers}
      />
    </DataTableLayout>
  )
}
