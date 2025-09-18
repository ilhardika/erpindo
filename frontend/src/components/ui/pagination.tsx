/**
 * Pagination Component - Reusable pagination with always-show option
 * Provides complete pagination functionality with page size selector
 * Date: 2025-09-18
 */

import React from 'react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  alwaysShow?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  alwaysShow = false,
  className = '',
}) => {
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  // Don't show if no data and alwaysShow is false
  if (!alwaysShow && totalPages <= 1) {
    return null;
  }

  // Calculate showing range
  const startItem = Math.max(1, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalCount, currentPage * pageSize);

  return (
    <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <span>
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
        <span>
          {totalCount > 0 
            ? `Showing ${startItem} to ${endItem} of ${totalCount} entries`
            : 'No entries found'
          }
        </span>
        
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        
        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }, (_, i) => {
            let pageNum;
            const maxPages = Math.max(1, totalPages);
            
            if (maxPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= maxPages - 2) {
              pageNum = maxPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, totalPages))}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;