'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTableLayout } from '@/components/layouts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeftRight,
  Settings,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import {
  getStockMovements,
  getProducts,
  getWarehouses,
} from '@/lib/inventory/api'
import type {
  StockMovement,
  Product,
  Warehouse,
  MovementType,
} from '@/types/inventory'

export default function StockMovementsPage() {
  const router = useRouter()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<MovementType | 'all'>('all')
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [movementsData, productsData, warehousesData] = await Promise.all([
        getStockMovements(),
        getProducts(),
        getWarehouses(),
      ])
      setMovements(movementsData || [])
      setProducts(productsData || [])
      setWarehouses(warehousesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Failed to load stock movements')
    } finally {
      setLoading(false)
    }
  }

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch =
      searchTerm === '' ||
      movement.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference_type
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType =
      filterType === 'all' || movement.movement_type === filterType
    const matchesProduct =
      filterProduct === 'all' || movement.product_id === filterProduct
    const matchesWarehouse =
      filterWarehouse === 'all' || movement.warehouse_id === filterWarehouse

    return matchesSearch && matchesType && matchesProduct && matchesWarehouse
  })

  function getMovementIcon(type: MovementType) {
    switch (type) {
      case 'IN':
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case 'OUT':
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      case 'TRANSFER':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
      case 'ADJUSTMENT':
        return <Settings className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  function getMovementBadge(type: MovementType) {
    switch (type) {
      case 'IN':
        return <Badge className="bg-green-500">Stock IN</Badge>
      case 'OUT':
        return <Badge className="bg-red-500">Stock OUT</Badge>
      case 'TRANSFER':
        return <Badge className="bg-blue-500">Transfer</Badge>
      case 'ADJUSTMENT':
        return <Badge className="bg-yellow-500 text-black">Adjustment</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  function getProductName(productId: string) {
    const product = products.find(p => p.id === productId)
    return product ? `${product.name} (${product.sku})` : 'Unknown Product'
  }

  function getWarehouseName(warehouseId: string) {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse ? warehouse.name : 'Unknown Warehouse'
  }

  return (
    <DataTableLayout
      title="Stock Movements"
      description="View and track all inventory stock movements"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/erp/inventory/stock-opname')}
          >
            Stock Opname
          </Button>
          <Button onClick={() => router.push('/erp/inventory')}>
            Back to Inventory
          </Button>
        </div>
      }
    >
      <Card>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by reference or notes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={value =>
                  setFilterType(value as MovementType | 'all')
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IN">Stock IN</SelectItem>
                  <SelectItem value="OUT">Stock OUT</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterWarehouse}
                onValueChange={setFilterWarehouse}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading stock movements...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Movements Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.length > 0 ? (
                      filteredMovements.map(movement => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {movement.created_at
                              ? new Date(movement.created_at).toLocaleString(
                                  'id-ID',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getMovementIcon(movement.movement_type)}
                              {getMovementBadge(movement.movement_type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getProductName(movement.product_id)}
                          </TableCell>
                          <TableCell>
                            {getWarehouseName(movement.warehouse_id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                movement.movement_type === 'IN'
                                  ? 'text-green-600 font-medium'
                                  : movement.movement_type === 'OUT'
                                    ? 'text-red-600 font-medium'
                                    : 'font-medium'
                              }
                            >
                              {movement.movement_type === 'IN' && '+'}
                              {movement.movement_type === 'OUT' && '-'}
                              {movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {movement.reference_type && movement.reference_id
                                ? `${movement.reference_type}: ${movement.reference_id}`
                                : '-'}
                            </code>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {movement.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          {movements.length === 0
                            ? 'No stock movements found. Movements will appear when you create purchase orders, sales orders, or adjustments.'
                            : 'No movements match your filters.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              {filteredMovements.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredMovements.length} of {movements.length} total
                  movements
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DataTableLayout>
  )
}
