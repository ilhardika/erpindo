/**
 * ProductList Component
 * Displays products in a responsive table with search, filtering, and bulk operations
 * Integrates with productStore for state management and real-time updates
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
import { Checkbox } from '../../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useProductStore, useProductSelectors, useProductActions } from '../../../stores/productStore';
import type { Product } from '../../../types/database';
import type { ProductFilters } from '../../../stores/productStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { cn } from '../../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ProductListProps {
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  className?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export const ProductList: React.FC<ProductListProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
  className,
}) => {
  console.log('ProductList: onViewProduct prop =', typeof onViewProduct, onViewProduct ? 'AVAILABLE' : 'NOT PROVIDED');
  
  // Store state
  const {
    products,
    loading,
    error,
    filters,
    sort,
    currentPage,
  } = useProductStore();

  console.log('ProductList: Current state:', { products, loading, error });

  const {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    activeProducts,
    lowStockProducts,
    availableCategories,
  } = useProductSelectors();

  const {
    loadProducts,
    deleteProduct,
    setFilters,
    setSort,
    setPagination,
    clearFilters,
    toggleProductStatus,
    bulkUpdateStatus,
    clearError,
  } = useProductActions();

  // Local state
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    console.log('ProductList: Component mounted, calling loadProducts');
    loadProducts();
  }, []); // Only run on mount

  // Reload when filters, sort, or pagination changes
  useEffect(() => {
    console.log('ProductList: Filters/sort/pagination changed, reloading');
    loadProducts();
  }, [filters, sort, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, setFilters]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(productId);
      if (success) {
        setSelectedProducts(prev => prev.filter(id => id !== productId));
      }
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!selectedProducts.length) return;

    const message = action === 'delete' 
      ? `Are you sure you want to delete ${selectedProducts.length} products?`
      : `Are you sure you want to ${action} ${selectedProducts.length} products?`;

    if (!window.confirm(message)) return;

    let success = false;

    if (action === 'delete') {
      const promises = selectedProducts.map(id => deleteProduct(id));
      const results = await Promise.all(promises);
      success = results.every(result => result);
    } else {
      success = await bulkUpdateStatus(
        selectedProducts, 
        action === 'activate'
      );
    }

    if (success) {
      setSelectedProducts([]);
    }
  };

  const handleSortChange = (field: string) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    setSort({ field: field as any, direction: newDirection });
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters({ [key]: value });
  };

  const getStockBadgeVariant = (product: Product) => {
    const isLowStock = product.stock_quantity <= (product.minimum_stock || 0);
    if (isLowStock) return 'destructive';
    if (product.stock_quantity <= (product.minimum_stock || 0) * 2) return 'outline';
    return 'secondary';
  };

  const getSortIcon = (field: string) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and pricing
          </p>
        </div>
        <Button onClick={onCreateProduct} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                products.reduce((sum, p) => sum + (p.selling_price * p.stock_quantity), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => loadProducts()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <Select
                value={filters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {availableCategories.filter(category => category !== null).map(category => (
                    <SelectItem key={category} value={category!}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.is_active?.toString() || ''}
                onValueChange={(value) => handleFilterChange('is_active', 
                  value === '' ? undefined : value === 'true'
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="low-stock"
                  checked={filters.low_stock || false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('low_stock', checked || undefined)
                  }
                />
                <label htmlFor="low-stock" className="text-sm">
                  Show only low stock
                </label>
              </div>

              <Button
                variant="ghost"
                onClick={clearFilters}
                className="col-span-full w-fit"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardHeader>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <CardHeader className="pt-0">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedProducts.length} products selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('name')}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      Product
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('price')}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      Price
                      {getSortIcon('price')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('stock_quantity')}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      Stock
                      {getSortIcon('stock_quantity')}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('created_at')}
                      className="h-auto p-0 font-semibold flex items-center gap-1"
                    >
                      Created
                      {getSortIcon('created_at')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No products found</p>
                      <Button
                        variant="outline"
                        onClick={onCreateProduct}
                        className="mt-2"
                      >
                        Create your first product
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow 
                      key={product.id}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50 transition-colors",
                        className
                      )}
                      onClick={() => {
                        console.log('Row clicked for product:', product.name);
                        onViewProduct?.(product);
                      }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProduct(product.id, checked as boolean)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category && (
                          <Badge variant="outline">{product.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(product.selling_price)}
                        </div>
                        {product.cost_price && (
                          <div className="text-sm text-muted-foreground">
                            Cost: {formatCurrency(product.cost_price)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockBadgeVariant(product)}>
                          {product.stock_quantity}
                          {product.unit_of_measure && ` ${product.unit_of_measure}`}
                        </Badge>
                        {product.minimum_stock && (
                          <div className="text-sm text-muted-foreground">
                            Min: {product.minimum_stock}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(product.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onViewProduct && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  console.log('Dropdown View Detail clicked for product:', product.name);
                                  onViewProduct(product);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Detail
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => onEditProduct(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleProductStatus(product.id)}
                            >
                              {product.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(1)}
                  disabled={!hasPreviousPage}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(currentPage - 1)}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(totalPages)}
                  disabled={!hasNextPage}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductList;