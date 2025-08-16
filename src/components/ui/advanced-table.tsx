"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
  PaginationState,
  Column,
} from "@tanstack/react-table";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
} from "lucide-react";

// Enhanced column interface with better typing
interface AdvancedColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

interface AdvancedDataTableProps<T> {
  columns: AdvancedColumn<T>[];
  data: T[];
  title?: string;
  searchPlaceholder?: string;
  className?: string;
  enableSearch?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

function AdvancedDataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  searchPlaceholder = "Cari...",
  className,
  enableSearch = true,
  enablePagination = true,
  pageSize = 10,
}: AdvancedDataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Get unique values for each column for filtering
  const getUniqueColumnValues = React.useCallback(
    (columnId: string) => {
      const values = data
        .map((row) => {
          const value = row[columnId];
          return value != null ? String(value) : "";
        })
        .filter(
          (value, index, arr) => arr.indexOf(value) === index && value !== ""
        )
        .sort();
      return values;
    },
    [data]
  );

  // Column Filter Component
  const ColumnFilter = ({
    column,
    title,
  }: {
    column: Column<T, unknown>;
    title: string;
  }) => {
    const columnFilterValue = (column.getFilterValue() as string[]) || [];
    const [filterSearch, setFilterSearch] = React.useState("");
    const uniqueValues = getUniqueColumnValues(column.id);

    const filteredValues = uniqueValues.filter((value) =>
      value.toLowerCase().includes(filterSearch.toLowerCase())
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex items-center gap-1 hover:bg-muted/80"
          >
            <Filter className="h-3 w-3" />
            <ChevronDown className="h-3 w-3" />
            {columnFilterValue.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 leading-none">
                {columnFilterValue.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="p-1">
            <div className="text-xs text-muted-foreground px-2 py-1">
              Select Multiple
            </div>
            {columnFilterValue.length > 0 && (
              <div className="flex items-center px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => column.setFilterValue([])}
                >
                  Clear All
                </Button>
              </div>
            )}
            <div className="max-h-[200px] overflow-y-auto">
              {filteredValues.map((value) => {
                const isSelected = columnFilterValue.includes(value);
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    className="text-xs"
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        column.setFilterValue([...columnFilterValue, value]);
                      } else {
                        column.setFilterValue(
                          columnFilterValue.filter((item) => item !== value)
                        );
                      }
                    }}
                  >
                    {value}
                  </DropdownMenuCheckboxItem>
                );
              })}
              {filteredValues.length === 0 && (
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  No options found
                </div>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Convert our Column<T> to TanStack ColumnDef<T>
  const columnDefs = React.useMemo<ColumnDef<T, any>[]>(
    () =>
      columns.map((c) => {
        const base: ColumnDef<T, any> = {
          accessorKey: String(c.key) as any,
          header: ({ column }) => {
            const isSorted = column.getIsSorted();
            const canSort = c.enableSorting !== false;
            const canFilter = c.enableFiltering !== false;

            return (
              <div className="flex items-center justify-between gap-2">
                {/* Header Title with Sort */}
                <div
                  className={cn(
                    "flex items-center gap-1",
                    canSort &&
                      "cursor-pointer select-none hover:text-foreground transition-colors"
                  )}
                  onClick={
                    canSort
                      ? () => column.toggleSorting(isSorted === "asc")
                      : undefined
                  }
                >
                  <span className="font-medium text-sm">{c.header}</span>
                  {canSort && isSorted && (
                    <span className="text-xs">
                      {isSorted === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>

                {/* Filter Dropdown */}
                {canFilter && <ColumnFilter column={column} title={c.header} />}
              </div>
            );
          },
          meta: { className: c.className, headerClassName: c.headerClassName },
          enableSorting: c.enableSorting !== false,
          filterFn: (row, id, value) => {
            if (!value || value.length === 0) return true;
            const cellValue = String(row.getValue(id) || "");
            return value.includes(cellValue);
          },
        } as ColumnDef<T, any>;

        if (c.render) {
          return {
            ...base,
            cell: ({ row }) => c.render!(row.original as T, row.index),
          } as ColumnDef<T, any>;
        }

        return base;
      }),
    [columns]
  );

  const table = useReactTable({
    data: data as T[],
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  const totalPages = Math.ceil(
    table.getFilteredRowModel().rows.length / pagination.pageSize
  );
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const currentPageRowCount = table.getRowModel().rows.length;

  return (
    <Card className={cn("min-w-0", className)}>
      {title && (
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* Search Bar */}
        {enableSearch && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
        )}

        {/* Modern Table */}
        <div className="rounded-lg border border-muted/20 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="border-b border-border bg-slate-100 dark:bg-slate-800"
                  >
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          "h-14 px-6 text-left align-middle text-sm font-semibold text-slate-700 dark:text-slate-200",
                          (header.column.columnDef.meta as any)?.headerClassName
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-sm">
                          {globalFilter
                            ? "Tidak ada hasil yang ditemukan"
                            : "Tidak ada data tersedia"}
                        </div>
                        {globalFilter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGlobalFilter("")}
                            className="text-xs"
                          >
                            Hapus pencarian
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-muted/10 transition-colors hover:bg-muted/50",
                        "even:bg-muted/10"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-6 py-4 align-middle text-sm",
                            (cell.column.columnDef.meta as any)?.className
                          )}
                        >
                          {cell.column.columnDef.cell
                            ? flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            : String(cell.getValue() ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Pagination */}
        {enablePagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <div className="text-sm text-muted-foreground">
              Menampilkan {currentPageRowCount} dari {filteredRowCount} data
              {filteredRowCount !== data.length &&
                ` (difilter dari ${data.length} total)`}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-3"
              >
                ««
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm font-medium px-3 py-2">
                  Halaman {pagination.pageIndex + 1} dari{" "}
                  {Math.max(1, totalPages)}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-9 px-3"
              >
                »»
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to create columns with better typing
function createAdvancedColumns<T>() {
  return {
    column: <K extends keyof T>(
      key: K,
      header: string,
      options?: {
        render?: (item: T, index: number) => React.ReactNode;
        className?: string;
        headerClassName?: string;
        enableSorting?: boolean;
        enableFiltering?: boolean;
      }
    ): AdvancedColumn<T> => ({
      key,
      header,
      render: options?.render,
      className: options?.className,
      headerClassName: options?.headerClassName,
      enableSorting: options?.enableSorting,
      enableFiltering: options?.enableFiltering,
    }),
    customColumn: (
      key: string,
      header: string,
      render: (item: T, index: number) => React.ReactNode,
      options?: {
        className?: string;
        headerClassName?: string;
        enableSorting?: boolean;
        enableFiltering?: boolean;
      }
    ): AdvancedColumn<T> => ({
      key,
      header,
      render,
      className: options?.className,
      headerClassName: options?.headerClassName,
      enableSorting: options?.enableSorting,
      enableFiltering: options?.enableFiltering,
    }),
  };
}

export {
  AdvancedDataTable,
  createAdvancedColumns,
  type AdvancedColumn,
  type AdvancedDataTableProps,
};
