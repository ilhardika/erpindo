/**
 * StockOpnameList Component
 * Displays and manages stock opname (physical stock counting) operations
 * Includes creation, editing, and completion of stock counts
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  ClipboardList,
  RefreshCw,
  Calendar,
  MapPin,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useStockOpnameStore, useStockOpnameSelectors, useStockOpnameActions } from '../../../stores/stockOpnameStore';
import { formatDate } from '@/utils/formatters';
import { cn } from '../../../lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface StockOpnameListProps {
  onCreateOpname: () => void;
  onEditOpname: (opnameId: string) => void;
  onViewOpname?: (opnameId: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

export const StockOpnameList: React.FC<StockOpnameListProps> = ({
  onCreateOpname,
  onEditOpname,
  onViewOpname,
  className,
}) => {
  // Store state
  const {
    opnames,
    loading,
    error,
    filters,
    currentPage,
  } = useStockOpnameStore();

  const {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    statusSummary,
  } = useStockOpnameSelectors();

  const {
    loadOpnames,
    deleteOpname,
    startOpname,
    completeOpname,
    cancelOpname,
    setFilters,
    setPagination,
    clearFilters,
    clearError,
  } = useStockOpnameActions();

  // Local state
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    loadOpnames();
  }, []);

  useEffect(() => {
    // Reload when filters or pagination changes
    loadOpnames();
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
    loadOpnames();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    clearFilters();
    setShowFilters(false);
  };

  const handleDeleteOpname = async (opnameId: string) => {
    if (window.confirm('Are you sure you want to delete this stock opname? This action cannot be undone.')) {
      await deleteOpname(opnameId);
    }
  };

  const handleStartOpname = async (opnameId: string) => {
    if (window.confirm('Start this stock opname? You will be able to begin counting products.')) {
      await startOpname(opnameId);
    }
  };

  const handleCompleteOpname = async (opnameId: string) => {
    if (window.confirm('Complete this stock opname? Stock adjustments will be applied based on variance.')) {
      await completeOpname(opnameId);
    }
  };

  const handleCancelOpname = async (opnameId: string) => {
    if (window.confirm('Cancel this stock opname? All counting data will be retained but no adjustments will be made.')) {
      await cancelOpname(opnameId);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    } as const;

    const labels = {
      draft: 'Draft',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    } as const;

    return (
      <Badge className={cn(variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800')}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-600" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <ClipboardList className="w-4 h-4 text-gray-600" />;
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => { clearError(); loadOpnames(); }}>
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
            <ClipboardList className="w-5 h-5" />
            Stock Opname (Physical Count)
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
            <Button onClick={onCreateOpname}>
              <Plus className="w-4 h-4 mr-2" />
              New Stock Count
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Draft</span>
            </div>
            <p className="text-lg font-bold text-gray-600">{statusSummary.draft || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{statusSummary.in_progress || 0}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-lg font-bold text-green-600">{statusSummary.completed || 0}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Cancelled</span>
            </div>
            <p className="text-lg font-bold text-red-600">{statusSummary.cancelled || 0}</p>
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
                  placeholder="Search stock opname..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {Object.keys(filters).length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters({ status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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

        {/* Opname Table */}
        {loading && opnames.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading stock opname...</p>
          </div>
        ) : opnames.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Stock Opname Found</h3>
            <p className="text-gray-600 mb-4">
              {Object.keys(filters).length > 0
                ? 'No stock opname match your current filters.'
                : 'Create your first stock opname to start physical counting.'}
            </p>
            <Button onClick={onCreateOpname}>
              <Plus className="w-4 h-4 mr-2" />
              Create Stock Count
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opname Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opnames.map((opname) => (
                  <TableRow 
                    key={opname.id}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50 transition-colors",
                      className
                    )}
                    onClick={() => onViewOpname?.(opname.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(opname.status)}
                        <span className="font-medium">{opname.opname_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(opname.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(opname.opname_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {opname.location || 'All Locations'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {opname.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(opname.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
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
                          {onViewOpname && (
                            <>
                              <DropdownMenuItem onClick={() => onViewOpname(opname.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Detail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem onClick={() => onEditOpname(opname.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          
                          {opname.status === 'draft' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStartOpname(opname.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Start Counting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOpname(opname.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {opname.status === 'in_progress' && (
                            <>
                              <DropdownMenuItem onClick={() => handleCompleteOpname(opname.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCancelOpname(opname.id)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default StockOpnameList;