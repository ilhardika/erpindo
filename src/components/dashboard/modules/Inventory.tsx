"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAdvancedColumns } from "@/components/ui/advanced-table";
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package2,
  AlertTriangle,
} from "lucide-react";
import { User } from "@/backend/types/schema";
import { inventory, InventoryTable } from "@/backend/tables/inventory";
import { products, ProductTable } from "@/backend/tables/products";

interface ManageInventoryProps {
  user: User;
  onLogout: () => void;
}

// Enhanced inventory type with product details
interface InventoryWithProduct extends InventoryTable {
  product?: ProductTable;
}

export function ManageInventory({ user, onLogout }: ManageInventoryProps) {
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);

  // Merge inventory with product data
  const inventoryWithProducts: InventoryWithProduct[] = inventory.map(
    (inv) => ({
      ...inv,
      product: products.find((p) => p.id === inv.productId),
    })
  );

  // Define columns for inventory table
  const { column, customColumn } =
    createAdvancedColumns<InventoryWithProduct>();

  const inventoryColumns = [
    column("productId", "Nama Produk", {
      render: (item) => (
        <div className="flex items-center gap-3">
          <Package2 className="h-4 w-4 text-muted-foreground" />
          <div className="space-y-1">
            <span className="font-medium">
              {item.product?.name || "Unknown Product"}
            </span>
            <div className="text-sm text-muted-foreground">
              SKU: {item.product?.sku || "-"}
            </div>
          </div>
        </div>
      ),
    }),
    column("productId", "Kategori", {
      render: (item) => (
        <Badge variant="outline">{item.product?.category || "Unknown"}</Badge>
      ),
    }),
    column("currentStock", "Stok", {
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.currentStock}</span>
          <span className="text-sm text-muted-foreground">
            {item.product?.unitOfMeasure || "pcs"}
          </span>
          {item.currentStock <= item.minimumStock && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    }),
    column("averageCost", "Harga Rata-rata", {
      render: (item) => (
        <span className="font-medium">
          Rp {item.averageCost.toLocaleString("id-ID")}
        </span>
      ),
    }),
    column("productId", "Supplier", {
      render: (item) => (
        <span className="text-sm">{item.product?.supplier || "-"}</span>
      ),
    }),
    column("lastStockMovement", "Update Terakhir", {
      render: (item) => (
        <span className="text-sm">
          {item.lastStockMovement
            ? new Date(item.lastStockMovement).toLocaleDateString("id-ID")
            : "-"}
        </span>
      ),
    }),
    customColumn(
      "actions",
      "Aksi",
      (item) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Package2 className="mr-2 h-4 w-4" />
                Restock
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteItemId(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      {
        headerClassName: "text-right",
        className: "text-right",
        enableSorting: false,
        enableFiltering: false,
      }
    ),
  ];

  const handleDeleteItem = () => {
    // TODO: Implement delete item logic
    console.log("Delete item:", deleteItemId);
    setDeleteItemId(null);
  };

  const handleAddItem = () => {
    // TODO: Implement add item logic
    console.log("Add new inventory item");
  };

  // Custom header actions for inventory module
  const headerActions = (
    <>
      <Button variant="outline">
        <Package2 className="h-4 w-4 mr-2" />
        Restock All
      </Button>
      <Button variant="outline">
        <AlertTriangle className="h-4 w-4 mr-2" />
        Low Stock Alert
      </Button>
    </>
  );

  // Table actions
  const tableActions = (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        Total items: {inventoryWithProducts.length} | Low stock:{" "}
        {
          inventoryWithProducts.filter(
            (item) => item.currentStock <= item.minimumStock
          ).length
        }
      </div>
    </div>
  );

  return (
    <>
      <ModuleLayout
        user={user}
        onLogout={onLogout}
        title="Kelola Inventory"
        subtitle="Kelola stok dan inventaris produk perusahaan Anda"
        addButtonText="Tambah Produk"
        onAddClick={handleAddItem}
        columns={inventoryColumns}
        data={inventoryWithProducts}
        searchPlaceholder="Cari produk..."
        tableTitle="Daftar Inventory"
        headerActions={headerActions}
        tableActions={tableActions}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteItemId}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus item ini dari inventory?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItemId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
