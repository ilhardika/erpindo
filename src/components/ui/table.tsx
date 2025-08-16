"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Reusable column and DataTable helpers used by dashboards
interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  className?: string;
  actions?: React.ReactNode;
}

function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  className,
  actions,
}: DataTableProps<T>) {
  const columnDefs = React.useMemo<ColumnDef<T, any>[]>(
    () =>
      columns.map((c) => {
        const base: ColumnDef<T, any> = {
          accessorKey: String(c.key) as any,
          header: c.header,
          meta: { className: c.className, headerClassName: c.headerClassName },
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
  });

  return (
    <Card className={cn("min-w-0", className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          {title && <CardTitle>{title}</CardTitle>}
          {actions}
        </CardHeader>
      )}
      <CardContent>
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "h-10 px-2 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
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
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "p-2 align-middle whitespace-nowrap",
                          (cell.column.columnDef.meta as any)?.className
                        )}
                      >
                        {cell.column.columnDef.cell
                          ? flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          : String(cell.getValue())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function createColumns<T>() {
  return {
    column: <K extends keyof T>(
      key: K,
      header: string,
      options?: {
        render?: (item: T, index: number) => React.ReactNode;
        className?: string;
        headerClassName?: string;
      }
    ): Column<T> => ({
      key,
      header,
      render: options?.render,
      className: options?.className,
      headerClassName: options?.headerClassName,
    }),
    customColumn: (
      key: string,
      header: string,
      render: (item: T, index: number) => React.ReactNode,
      options?: { className?: string; headerClassName?: string }
    ): Column<T> => ({
      key,
      header,
      render,
      className: options?.className,
      headerClassName: options?.headerClassName,
    }),
  };
}

export { DataTable, createColumns, type Column, type DataTableProps };
