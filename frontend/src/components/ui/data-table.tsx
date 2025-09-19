/**
 * DataTable Component - Reusable data table with sorting, filtering, and selection
 * Generic table component that can be used across different data types
 * Date: 2025-09-18
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Checkbox } from './checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Alert, AlertDescription } from './alert';
// import { Pagination } from './pagination';
import {
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLast,
  ChevronLeft,
  ChevronFirst,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (items: T[]) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface DataTableProps<T = any> {
  title?: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  
  // Selection
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getItemId: (item: T) => string;
  
  // Actions
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  
  // Search & Filter
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  filterable?: boolean;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  
  // Sorting
  sortable?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showPagination?: boolean;
  
  // Other
  emptyMessage?: string;
  className?: string;
  onRefresh?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DataTable = <T,>({
  title,
  data,
  columns,
  loading = false,
  error,
  
  // Selection
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId,
  
  // Actions
  actions = [],
  bulkActions = [],
  primaryAction,
  
  // Search & Filter
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  
  filterable = false,
  filterOptions = [],
  filterValue = '',
  onFilterChange,
  
  // Sorting
  sortable = false,
  sortField,
  sortDirection,
  onSortChange,
  
  // Pagination
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  showPagination = true,
  
  // Other
  emptyMessage = 'No data available',
  className,
  onRefresh,
}: DataTableProps<T>) => {
  
  const isAllSelected = selectable && selectedItems.length === data.length && data.length > 0;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getItemId));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return;
    
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <Card className={className}>
      {(title || searchable || filterable || primaryAction || onRefresh || (bulkActions.length > 0 && selectedItems.length > 0)) && (
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {title && <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>}
              
              {/* Bulk Actions */}
              {bulkActions.length > 0 && selectedItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {selectedItems.length} selected
                  </span>
                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={() => {
                        const selectedData = data.filter(item => selectedItems.includes(getItemId(item)));
                        action.onClick(selectedData);
                      }}
                      className={action.className}
                    >
                      {action.icon}
                      <span className="hidden sm:inline ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              {/* Search */}
              {searchable && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 w-full sm:w-[200px] lg:w-[250px]"
                  />
                </div>
              )}

              {/* Filter */}
              {filterable && filterOptions.length > 0 && (
                <Select value={filterValue} onValueChange={onFilterChange}>
                  <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Refresh */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                  className="px-3"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline ml-2">Refresh</span>
                </Button>
              )}

              {/* Primary Action */}
              {primaryAction && (
                <Button 
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {primaryAction.icon}
                  <span className="ml-2">{primaryAction.label}</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Responsive table wrapper with horizontal scroll */}
        <div className="rounded-md border overflow-hidden">
          <div className="responsive-table-container">
            <Table className="responsive-table min-w-full">
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead className="w-12 sticky left-0 bg-background z-10">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`${column.headerClassName || ''} ${sortable && column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    onClick={() => sortable && column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.title}
                      {sortable && column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                
                {actions.length > 0 && (
                  <TableHead className="w-12 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <div className="text-center py-8 text-muted-foreground">
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const itemId = getItemId(item);
                  const isSelected = selectedItems.includes(itemId);
                  
                  return (
                    <TableRow key={itemId} className={isSelected ? 'bg-muted/50' : ''}>
                      {selectable && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectItem(itemId)}
                          />
                        </TableCell>
                      )}
                      
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render 
                            ? column.render((item as any)[column.key], item, index)
                            : (item as any)[column.key]
                          }
                        </TableCell>
                      ))}
                      
                      {actions.length > 0 && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              {actions.map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(item)}
                                  className={action.className}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Responsive Pagination */}
        {showPagination && (
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 p-4 border-t">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              {totalCount === 0 ? (
                'No results'
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                  </span>
                  <span className="sm:hidden">
                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 p-0"
              >
                <ChevronFirst />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 p-0"
              >
                <ChevronLeft />
              </Button>
              
              <span className="text-sm whitespace-nowrap px-3 py-2 min-w-[60px] text-center">
                <span className="font-medium">{currentPage}/{totalPages}</span>
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 p-0"
              >
                <ChevronRight />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 p-0"
              >
                <ChevronLast />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;