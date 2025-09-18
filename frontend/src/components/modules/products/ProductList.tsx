import React, { useEffect } from 'react';
import DataTable from '../../ui/data-table';
import type { Column, TableAction } from '../../ui/data-table';
import { Badge } from '../../ui/badge';
import {
  Edit,
  Trash2,
  Eye,
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

  // Load products on mount
  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
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
    if (!product || !product.name) {
      console.error('Invalid product for deletion:', product);
      return;
    }
    
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

  // Define columns for DataTable
  const columns: Column<Product>[] = [
    {
      key: 'name',
      title: 'Product',
      className: 'min-w-[200px]',
      render: (value, product) => {
        const productName = product?.name || value || 'Unnamed Product';
        const productDescription = product?.description;
        
        return (
          <div className="font-medium">
            <div className="font-semibold">{productName}</div>
            {productDescription && (
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {productDescription}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'category',
      title: 'Category',
      className: 'min-w-[100px]',
      render: (value, product) => {
        const categoryValue = value || product?.category || 'Uncategorized';
        return (
          <Badge variant="secondary">
            {categoryValue}
          </Badge>
        );
      },
    },
    {
      key: 'selling_price',
      title: 'Price',
      className: 'min-w-[100px]',
      render: (value, product) => {
        const sellingPrice = value || product?.selling_price || 0;
        return (
          <div className="font-semibold text-green-600">
            {formatCurrency(sellingPrice)}
          </div>
        );
      },
    },
    {
      key: 'stock_quantity',
      title: 'Stock',
      className: 'min-w-[120px]',
      render: (value, product) => {
        const stockQuantity = value || product?.stock_quantity || 0;
        const stockStatus = getStockStatus(stockQuantity);
        return (
          <div className="flex items-center gap-2">
            {getStockIcon(stockQuantity)}
            <div>
              <div className="font-medium">{stockQuantity}</div>
              <Badge variant={stockStatus.variant} className="text-xs">
                {stockStatus.label}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Created',
      className: 'min-w-[120px]',
      render: (value, product) => {
        const createdAt = value || product?.created_at;
        return (
          <div className="text-sm text-muted-foreground">
            {createdAt ? formatDate(createdAt) : 'N/A'}
          </div>
        );
      },
    },
  ];

  // Define actions for DataTable
  const actions: TableAction<Product>[] = [
    ...(onViewProduct ? [{
      label: 'View',
      icon: <Eye className="w-4 h-4 mr-2" />,
      onClick: (product: Product) => onViewProduct(product),
    }] : []),
    ...(onEditProduct ? [{
      label: 'Edit',
      icon: <Edit className="w-4 h-4 mr-2" />,
      onClick: (product: Product) => onEditProduct(product),
    }] : []),
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4 mr-2" />,
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-700',
    },
  ];

  return (
    <DataTable
        title="Products"
        data={products}
        columns={columns}
        loading={loading}
        error={error || undefined}
        
        // Identifiers
        getItemId={(product) => product?.id || 'unknown'}
        
        // Search
        searchable
        searchPlaceholder="Search products..."
        searchValue={filters.search || ''}
        onSearchChange={handleSearch}
        
        // Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showPagination
        alwaysShowPagination
        
        // Actions
        actions={actions}
        primaryAction={onCreateProduct ? {
          label: 'Add Product',
          onClick: onCreateProduct,
        } : undefined}
        
        // Empty states
        emptyMessage="No products found. Create your first product!"
        
        // Other
        onRefresh={loadProducts}
      />
  );
};

export default ProductList;