/**
 * StockMovementHistory Component
 * Displays stock movement tracking with filtering and pagination
 * Shows history of all stock changes with details
 * Date: 2025-09-14
 */

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Badge } from '../../ui/badge';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Eye,
} from 'lucide-react';
import { useStockMovementStore, useStockMovementSelectors, useStockMovementActions } from '../../../stores/stockMovementStore';
import { formatDate } from '@/utils/formatters';
import { cn } from '../../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface StockMovementHistoryProps {
  productId?: string; // If provided, show movements for specific product only
  onViewMovement?: (movementId: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({
  productId,
  onViewMovement,
  className,
}) => {
  // Store state
  const {
    movements,
    loading,
    error,
    filters,
    currentPage,
  } = useStockMovementStore();

  const {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    movementSummary,
    todayMovements,
  } = useStockMovementSelectors();

  const {
    loadMovements,
    setFilters,
    setPagination,
    clearFilters,
    clearError,
  } = useStockMovementActions();

  // Local state
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    // Set product filter if productId provided
    if (productId && !filters.product_id) {
      setFilters({ product_id: productId });
    }
    loadMovements();
  }, [productId]);

  useEffect(() => {
    // Reload when filters or pagination changes
    loadMovements();
  }, [filters, currentPage]);

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleRefresh = () => {
    loadMovements();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    clearFilters();
    setShowFilters(false);
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'transfer':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'opname':
        return <FileText className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const variants = {
      in: 'bg-green-100 text-green-800',
      out: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      transfer: 'bg-purple-100 text-purple-800',
      opname: 'bg-orange-100 text-orange-800',
    } as const;

    return (
      <Badge className={cn('capitalize', variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800')}>
        {type}
      </Badge>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => { clearError(); loadMovements(); }}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stock Movement History
            {productId && (
              <Badge variant="outline" className="ml-2">
                Product Filter Active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Stock In</span>
            </div>
            <p className="text-lg font-bold text-green-600">{movementSummary.in || 0}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Stock Out</span>
            </div>
            <p className="text-lg font-bold text-red-600">{movementSummary.out || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Adjustments</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{movementSummary.adjustment || 0}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-lg font-bold text-orange-600">{todayMovements.length}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {(Object.keys(filters).length > 0 || productId) && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={productId ? true : false} // Don't allow clearing product filter if it's a prop
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Movement Type</label>
                <Select
                  value={filters.movement_type || ''}
                  onValueChange={(value) => setFilters({ movement_type: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="opname">Stock Opname</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date From</label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters({ date_from: e.target.value || undefined })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date To</label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => setFilters({ date_to: e.target.value || undefined })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Movement Table */}
        {loading && movements.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading movement history...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Movements Found</h3>
            <p className="text-gray-600">
              {Object.keys(filters).length > 0 || productId
                ? 'No stock movements match your current filters.'
                : 'No stock movements recorded yet.'}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow 
                    key={movement.id}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 transition-colors",
                      className
                    )}
                    onClick={() => onViewMovement?.(movement.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(movement.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{movement.product?.name}</div>
                        <div className="text-sm text-gray-600">{movement.product?.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementTypeIcon(movement.movement_type)}
                        {getMovementTypeBadge(movement.movement_type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        'font-medium',
                        movement.movement_type === 'in' && 'text-green-600',
                        movement.movement_type === 'out' && 'text-red-600',
                        movement.movement_type === 'adjustment' && 'text-blue-600'
                      )}>
                        {movement.movement_type === 'out' ? '-' : '+'}
                        {movement.quantity} {movement.product?.unit_of_measure}
                      </span>
                    </TableCell>
                    <TableCell>
                      {movement.reference_type && (
                        <Badge variant="outline" className="capitalize">
                          {movement.reference_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {movement.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {movement.created_by || 'System'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {onViewMovement && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewMovement(movement.id);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StockMovementHistory;