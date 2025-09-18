import React, { useEffect } from 'react';
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
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Pagination } from '../../ui/pagination';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useProductStore, useProductActions } from '../../../stores/productStore';
import type { Product } from '../../../types/database';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ProductListProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
}) => {
  // Store state and actions
  const { 
    products, 
    loading, 
    error, 
    currentPage, 
    pageSize, 
    totalCount,
    filters 
  } = useProductStore();
  const { 
    loadProducts, 
    deleteProduct, 
    setFilters, 
    setPagination 
  } = useProductActions();

  useEffect(() => {
    // Only load products on first mount or when products array is empty
    if (products.length === 0) {
      console.log('ProductList: Loading products (initial load)');
      loadProducts();
    } else {
      console.log('ProductList: Using existing products:', products.length);
    }
  }, []); // Empty dependency array - only run on mount

  // Calculate total pages from store data
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters({ search: value });
  };

  const handlePageChange = (page: number) => {
    setPagination(page, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination(1, newPageSize);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await deleteProduct(product.id);
    }
  };

  const getStockStatus = (stock: number, minStock: number = 10) => {
    if (stock === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const };
    } else if (stock <= minStock) {
      return { label: 'Low Stock', variant: 'secondary' as const };
    } else {
      return { label: 'In Stock', variant: 'default' as const };
    }
  };

  const getStockIcon = (stock: number, minStock: number = 10) => {
    if (stock === 0) {
      return <AlertTriangle className="w-4 h-4" />;
    } else if (stock <= minStock) {
      return <AlertTriangle className="w-4 h-4" />;
    } else {
      return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading products: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Products</CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>

            {onCreateProduct && (
              <Button onClick={onCreateProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex items-center justify-center py-8">
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="text-center py-8 text-muted-foreground">
                      {filters.search ? 'No products found matching your search.' : 'No products found. Create your first product!'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => {
                  const stockStatus = getStockStatus(product.stock_quantity, 10);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{product.sku}</code>
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">
                            {product.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(product.selling_price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStockIcon(product.stock_quantity, 10)}
                          <span className="font-mono text-sm">
                            {product.stock_quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(product.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {onViewProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {onEditProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          alwaysShow={true}
        />
      </CardContent>
    </Card>
  );
};

export default ProductList;
