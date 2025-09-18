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
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Users,
  CreditCard,
  Mail,
  Phone,
} from 'lucide-react';
import { useCustomerStore, useCustomerStats } from '../../../stores/customerStore';
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
    loadCustomers,
    deleteCustomer,
    searchCustomers,
    clearError
  } = useCustomerStore();

  const stats = useCustomerStats();

  // Local state for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filtered and paginated data
  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  // Load customers on mount
  useEffect(() => {
    if (customers.length === 0) {
      loadCustomers();
    }
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle delete customer
  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Yakin ingin menghapus pelanggan "${customer.name}"?`)) {
      const success = await deleteCustomer(customer.id);
      if (success) {
      }
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-2">Terjadi kesalahan saat memuat data pelanggan</p>
            <p className="text-sm text-gray-600">{error}</p>
            <Button 
              onClick={() => {
                clearError();
                loadCustomers();
              }}
              className="mt-4"
            >
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VIP</p>
                <p className="text-2xl font-bold text-purple-600">{stats.vipCustomers}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grosir</p>
                <p className="text-2xl font-bold text-orange-600">{stats.wholesaleCustomers}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Customer List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Pelanggan
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari nama, email, atau telepon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Add Customer Button */}
              <Button 
                onClick={onCreateCustomer}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat data pelanggan...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {searchQuery ? 'Tidak ada pelanggan yang ditemukan' : 'Belum ada data pelanggan'}
              </p>
              {!searchQuery && (
                <Button onClick={onCreateCustomer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pelanggan Pertama
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Limit Kredit</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => {
                      const typeBadge = getCustomerTypeBadge(customer.customer_type);
                      const statusBadge = getStatusBadge(customer.is_active);

                      return (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              {customer.address && (
                                <p className="text-sm text-gray-600 truncate max-w-xs">
                                  {customer.address}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {customer.email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-xs">{customer.email}</span>
                                </div>
                              )}
                              {customer.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeBadge.variant}>
                              {typeBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(customer.credit_limit)}
                          </TableCell>
                          <TableCell>
                            {formatDate(customer.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewCustomer?.(customer)}
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditCustomer?.(customer)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(customer)}
                                title="Hapus"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedCustomers.map((customer) => {
                  const typeBadge = getCustomerTypeBadge(customer.customer_type);
                  const statusBadge = getStatusBadge(customer.is_active);

                  return (
                    <Card key={customer.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{customer.name}</h3>
                            {customer.address && (
                              <p className="text-sm text-gray-600 mt-1">
                                {customer.address}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={typeBadge.variant} className="text-xs">
                              {typeBadge.label}
                            </Badge>
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span>Limit: {formatCurrency(customer.credit_limit)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-xs text-gray-500">
                            {formatDate(customer.created_at)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewCustomer?.(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditCustomer?.(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} dari {totalItems} pelanggan
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerList;