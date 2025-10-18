'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useDebounce } from '@/hooks/use-debounce'
import { deleteCustomer } from '@/lib/customers/api'
import type {
  Customer,
  CustomerCategory,
  CustomerFilters,
} from '@/types/customers'

interface CustomerTableProps {
  customers: Customer[]
  categories: CustomerCategory[]
  loading: boolean
  error: string | null
  filters: CustomerFilters
  onFilterChange: (filters: Partial<CustomerFilters>) => void
  currentPage: number
  totalCount: number
  pageLimit: number
  onPageChange: (page: number) => void
  onRefresh: () => void
}

export function CustomerTable({
  customers,
  categories,
  loading,
  error,
  filters,
  onFilterChange,
  currentPage,
  totalCount,
  pageLimit,
  onPageChange,
  onRefresh,
}: CustomerTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [deleting, setDeleting] = useState<string | null>(null)

  // Debounce search input
  useDebounce(
    () => {
      onFilterChange({ search: searchInput })
    },
    500,
    [searchInput]
  )

  // Handle delete customer
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      setDeleting(id)
      await deleteCustomer(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete customer')
    } finally {
      setDeleting(null)
    }
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageLimit)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Category filter */}
            <Select
              value={filters.category_id || 'all'}
              onValueChange={value =>
                onFilterChange({
                  category_id: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={value =>
                onFilterChange({
                  status:
                    value === 'all'
                      ? undefined
                      : (value as 'active' | 'inactive'),
                })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading customers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.category?.name || '-'}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                      }).format(customer.credit_limit)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleting === customer.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/erp/customers/${customer.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/erp/customers/${customer.id}/edit`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(customer.id)}
                            className="text-destructive"
                            disabled={deleting === customer.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && customers.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageLimit + 1} to{' '}
              {Math.min(currentPage * pageLimit, totalCount)} of {totalCount}{' '}
              customers
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
