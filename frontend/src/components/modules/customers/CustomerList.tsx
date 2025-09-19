import React, { useEffect } from 'react';
import { Badge } from '../../ui/badge';
import DataTable, { type Column, type TableAction } from '../../ui/data-table';
import {
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
} from 'lucide-react';
import { useCustomerStore, useCustomerActions } from '../../../stores/customerStore';
import type { Customer } from '../../../types/database';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface CustomerListProps {
  onCreateCustomer?: () => void;
  onEditCustomer?: (customer: Customer) => void;
  onViewCustomer?: (customer: Customer) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  onCreateCustomer,
  onEditCustomer,
  onViewCustomer,
}) => {
  // Store state and actions
  const { 
    customers, 
    loading, 
    error, 
    currentPage, 
    pageSize, 
    totalCount,
    filters
  } = useCustomerStore();
  
  const { 
    loadCustomers,
    deleteCustomer,
    setFilters,
    setPagination
  } = useCustomerActions();

  useEffect(() => {
    // Only load customers on first mount or when customers array is empty
    if (customers.length === 0) {
      loadCustomers();
    }
  }, []); // Empty dependency array - only run on mount

  // Calculate total pages from store data
  const calculatedTotalPages = Math.ceil(totalCount / pageSize);

  // Handlers
  const handleSearch = (value: string) => {
    setFilters({ search: value });
  };

  const handlePageChange = (page: number) => {
    setPagination(page, pageSize);
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Yakin ingin menghapus pelanggan "${customer.name}"?`)) {
      await deleteCustomer(customer.id);
    }
  };

  // Get customer type badge variant
  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return { variant: 'default' as const, label: 'VIP' };
      case 'wholesale':
        return { variant: 'secondary' as const, label: 'Grosir' };
      default:
        return { variant: 'outline' as const, label: 'Reguler' };
    }
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? { variant: 'default' as const, label: 'Aktif' }
      : { variant: 'destructive' as const, label: 'Nonaktif' };
  };

  // Define table columns
  const columns: Column<Customer>[] = [
    {
      key: 'name',
      title: 'Customer',
      className: 'min-w-[200px]',
      render: (_, customer: Customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          {customer.address && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {customer.address}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      className: 'min-w-[180px]',
      render: (_, customer: Customer) => (
        <div className="space-y-1">
          {customer.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="w-3 h-3" />
              <span className="text-muted-foreground">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="w-3 h-3" />
              <span className="text-muted-foreground">{customer.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'customer_type',
      title: 'Type',
      className: 'min-w-[100px]',
      render: (_, customer: Customer) => {
        const customerType = getCustomerTypeBadge(customer.customer_type);
        return (
          <Badge variant={customerType.variant}>
            {customerType.label}
          </Badge>
        );
      },
    },
    {
      key: 'credit_limit',
      title: 'Credit Limit',
      className: 'min-w-[120px]',
      render: (_, customer: Customer) => (
        <div className="font-medium">
          {formatCurrency(customer.credit_limit)}
        </div>
      ),
    },
    {
      key: 'is_active',
      title: 'Status',
      className: 'min-w-[100px]',
      render: (_, customer: Customer) => {
        const statusBadge = getStatusBadge(customer.is_active);
        return (
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      title: 'Created',
      className: 'min-w-[120px]',
      render: (_, customer: Customer) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(customer.created_at)}
        </div>
      ),
    },
  ];

  // Define table actions
  const actions: TableAction<Customer>[] = [
    ...(onViewCustomer ? [{
      label: 'View',
      icon: <Eye className="w-4 h-4 mr-2" />,
      onClick: onViewCustomer,
    }] : []),
    ...(onEditCustomer ? [{
      label: 'Edit',
      icon: <Edit className="w-4 h-4 mr-2" />,
      onClick: onEditCustomer,
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
      title="Customers"
      data={customers}
      columns={columns}
      loading={loading}
      error={error || undefined}
      
      // Identifiers
      getItemId={(customer) => customer.id}
      
      // Search
      searchable
      searchPlaceholder="Search customers..."
      searchValue={filters.search || ''}
      onSearchChange={handleSearch}
      
      // Pagination
      currentPage={currentPage}
      totalPages={calculatedTotalPages}
      totalCount={totalCount}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      showPagination
      
      // Actions
      actions={actions}
      primaryAction={onCreateCustomer ? {
        label: 'Add Customer',
        onClick: onCreateCustomer,
      } : undefined}
      
      // Empty states
      emptyMessage="No customers found. Create your first customer!"
      
      // Other
      onRefresh={loadCustomers}
    />
  );
};