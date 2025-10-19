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
  Calendar,
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
import { deletePromotion } from '@/lib/promotions/api'
import type {
  Promotion,
  PromotionFilters,
  PromotionType,
  PromotionStatus,
} from '@/types/promotions'

interface PromotionTableProps {
  promotions: Promotion[]
  loading: boolean
  error: string | null
  filters: PromotionFilters
  onFilterChange: (filters: Partial<PromotionFilters>) => void
  onRefresh: () => void
}

export function PromotionTable({
  promotions,
  loading,
  error,
  filters,
  onFilterChange,
  onRefresh,
}: PromotionTableProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Debounce search input
  useDebounce(
    () => {
      onFilterChange({ search: searchInput })
    },
    500,
    [searchInput]
  )

  // Handle delete promotion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      setDeleting(id)
      await deletePromotion(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete promotion')
    } finally {
      setDeleting(null)
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Get status badge variant
  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)

    if (promotion.status === 'cancelled') {
      return <Badge variant="secondary">Cancelled</Badge>
    }
    if (promotion.status === 'draft') {
      return <Badge variant="outline">Draft</Badge>
    }
    if (now < startDate) {
      return <Badge className="bg-blue-500">Scheduled</Badge>
    }
    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (promotion.is_active) {
      return <Badge className="bg-green-500">Active</Badge>
    }
    return <Badge variant="secondary">Inactive</Badge>
  }

  // Format discount value
  const formatDiscount = (promotion: Promotion) => {
    if (promotion.type === 'percentage') {
      return `${promotion.discount_value}%`
    }
    if (promotion.type === 'fixed') {
      return `Rp ${promotion.discount_value?.toLocaleString()}`
    }
    if (promotion.type === 'buy_x_get_y') {
      return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity}`
    }
    return '-'
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {/* Type filter */}
            <Select
              value={filters.type || 'all'}
              onValueChange={value =>
                onFilterChange({
                  type: value === 'all' ? undefined : (value as PromotionType),
                })
              }
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={value =>
                onFilterChange({
                  status:
                    value === 'all' ? undefined : (value as PromotionStatus),
                })
              }
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading promotions...
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No promotions found.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map(promotion => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">
                      {promotion.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promotion.name}</div>
                        {promotion.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {promotion.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {promotion.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{formatDiscount(promotion)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(promotion.start_date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' }
                          )}{' '}
                          -{' '}
                          {new Date(promotion.end_date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(promotion)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/erp/promotions/${promotion.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/erp/promotions/${promotion.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(promotion.id)}
                            disabled={deleting === promotion.id}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleting === promotion.id
                              ? 'Deleting...'
                              : 'Delete'}
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
      </CardContent>
    </Card>
  )
}
