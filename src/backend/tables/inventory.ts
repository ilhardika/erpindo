// Define interfaces
export interface InventoryTable {
  id: string;
  companyId: string; // Foreign key to companies table
  productId: string; // Foreign key to products table
  warehouseLocation?: string;
  currentStock: number;
  reservedStock: number; // Stock yang sudah di-reserve untuk order
  availableStock: number; // currentStock - reservedStock
  minimumStock: number;
  maximumStock?: number;
  reorderPoint: number;
  averageCost: number; // Weighted average cost
  lastStockMovement?: string;
  lastPurchasePrice?: number;
  lastSalePrice?: number;
  stockValue: number; // currentStock * averageCost
  isActive: boolean;
  updatedAt: string;
}

export interface StockMovementTable {
  id: string;
  companyId: string; // Foreign key to companies table
  productId: string; // Foreign key to products table
  movementType: "in" | "out" | "adjustment" | "transfer";
  movementReason:
    | "purchase"
    | "sale"
    | "return"
    | "damaged"
    | "expired"
    | "manual_adjustment"
    | "transfer_in"
    | "transfer_out";
  quantity: number; // Positive for IN, Negative for OUT
  unitCost?: number; // For purchases and adjustments
  referenceType?: "transaction" | "adjustment" | "transfer";
  referenceId?: string; // ID of transaction, adjustment, or transfer
  stockBefore: number;
  stockAfter: number;
  notes?: string;
  employeeId?: string; // Employee who made the movement
  movementDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface StockAdjustmentTable {
  id: string;
  companyId: string; // Foreign key to companies table
  adjustmentNumber: string; // Manual adjustment reference number
  adjustmentDate: string; // YYYY-MM-DD
  adjustmentType: "stock_opname" | "damaged" | "expired" | "lost" | "found";
  totalItems: number; // Number of different products adjusted
  totalValue: number; // Total value of adjustments
  reason: string;
  status: "draft" | "approved" | "cancelled";
  createdBy: string; // Employee ID
  approvedBy?: string; // Employee ID
  approvedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentItemTable {
  id: string;
  adjustmentId: string; // Foreign key to stockAdjustments table
  productId: string; // Foreign key to products table
  systemStock: number; // Stock in system before adjustment
  physicalStock: number; // Actual counted stock
  difference: number; // physicalStock - systemStock
  unitCost: number;
  totalValue: number; // difference * unitCost
  reason?: string;
  createdAt: string;
}

// Data exports - importing from data layer
export const inventory: InventoryTable[] = [];
export const stockMovements: StockMovementTable[] = [];
export const stockAdjustments: StockAdjustmentTable[] = [];
export const stockAdjustmentItems: StockAdjustmentItemTable[] = [];

// Helper functions for inventory
export const getInventoryById = (id: string): InventoryTable | undefined => {
  return inventory.find((inv) => inv.id === id);
};

export const getInventoryByCompanyId = (
  companyId: string
): InventoryTable[] => {
  return inventory.filter((inv) => inv.companyId === companyId && inv.isActive);
};

export const getInventoryByProductId = (
  companyId: string,
  productId: string
): InventoryTable | undefined => {
  return inventory.find(
    (inv) =>
      inv.companyId === companyId && inv.productId === productId && inv.isActive
  );
};

export const getLowStockItems = (companyId: string): InventoryTable[] => {
  return inventory.filter(
    (inv) =>
      inv.companyId === companyId &&
      inv.availableStock <= inv.reorderPoint &&
      inv.isActive
  );
};

export const getOutOfStockItems = (companyId: string): InventoryTable[] => {
  return inventory.filter(
    (inv) =>
      inv.companyId === companyId && inv.availableStock <= 0 && inv.isActive
  );
};

export const getOverStockItems = (companyId: string): InventoryTable[] => {
  return inventory.filter(
    (inv) =>
      inv.companyId === companyId &&
      inv.maximumStock &&
      inv.currentStock > inv.maximumStock &&
      inv.isActive
  );
};

// Helper functions for stock movements
export const getStockMovementsByProductId = (
  companyId: string,
  productId: string,
  limit?: number
): StockMovementTable[] => {
  let movements = stockMovements
    .filter((mov) => mov.companyId === companyId && mov.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
    );

  if (limit) {
    movements = movements.slice(0, limit);
  }

  return movements;
};

export const getStockMovementsByCompanyId = (
  companyId: string,
  limit?: number
): StockMovementTable[] => {
  let movements = stockMovements
    .filter((mov) => mov.companyId === companyId)
    .sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
    );

  if (limit) {
    movements = movements.slice(0, limit);
  }

  return movements;
};

export const getStockMovementsByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): StockMovementTable[] => {
  return stockMovements
    .filter(
      (mov) =>
        mov.companyId === companyId &&
        mov.movementDate >= startDate &&
        mov.movementDate <= endDate
    )
    .sort(
      (a, b) =>
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
    );
};

export const getStockMovementsByType = (
  companyId: string,
  type: string,
  reason?: string
): StockMovementTable[] => {
  let movements = stockMovements.filter(
    (mov) => mov.companyId === companyId && mov.movementType === type
  );

  if (reason) {
    movements = movements.filter((mov) => mov.movementReason === reason);
  }

  return movements.sort(
    (a, b) =>
      new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
  );
};

// Helper functions for stock adjustments
export const getStockAdjustmentsByCompanyId = (
  companyId: string
): StockAdjustmentTable[] => {
  return stockAdjustments
    .filter((adj) => adj.companyId === companyId)
    .sort(
      (a, b) =>
        new Date(b.adjustmentDate).getTime() -
        new Date(a.adjustmentDate).getTime()
    );
};

export const getStockAdjustmentItems = (
  adjustmentId: string
): StockAdjustmentItemTable[] => {
  return stockAdjustmentItems.filter(
    (item) => item.adjustmentId === adjustmentId
  );
};

// Statistics helpers
export const getInventoryStatistics = (companyId: string) => {
  const companyInventory = getInventoryByCompanyId(companyId);
  const lowStock = getLowStockItems(companyId);
  const outOfStock = getOutOfStockItems(companyId);
  const overStock = getOverStockItems(companyId);

  return {
    totalItems: companyInventory.length,
    totalStockValue: companyInventory.reduce(
      (sum, inv) => sum + inv.stockValue,
      0
    ),
    totalCurrentStock: companyInventory.reduce(
      (sum, inv) => sum + inv.currentStock,
      0
    ),
    totalReservedStock: companyInventory.reduce(
      (sum, inv) => sum + inv.reservedStock,
      0
    ),
    totalAvailableStock: companyInventory.reduce(
      (sum, inv) => sum + inv.availableStock,
      0
    ),

    lowStockItems: lowStock.length,
    outOfStockItems: outOfStock.length,
    overStockItems: overStock.length,

    averageStockValue:
      companyInventory.length > 0
        ? companyInventory.reduce((sum, inv) => sum + inv.stockValue, 0) /
          companyInventory.length
        : 0,

    stockTurnoverItems: companyInventory.filter((inv) => inv.lastStockMovement)
      .length,
  };
};

export const getStockMovementStatistics = (
  companyId: string,
  dateFrom?: string,
  dateTo?: string
) => {
  let movements = getStockMovementsByCompanyId(companyId);

  if (dateFrom && dateTo) {
    movements = getStockMovementsByDateRange(companyId, dateFrom, dateTo);
  }

  const inMovements = movements.filter((mov) => mov.movementType === "in");
  const outMovements = movements.filter((mov) => mov.movementType === "out");
  const adjustments = movements.filter(
    (mov) => mov.movementType === "adjustment"
  );

  return {
    totalMovements: movements.length,
    inMovements: inMovements.length,
    outMovements: outMovements.length,
    adjustmentMovements: adjustments.length,

    stockIn: inMovements.reduce((sum, mov) => sum + Math.abs(mov.quantity), 0),
    stockOut: outMovements.reduce(
      (sum, mov) => sum + Math.abs(mov.quantity),
      0
    ),
    netMovement:
      inMovements.reduce((sum, mov) => sum + mov.quantity, 0) +
      outMovements.reduce((sum, mov) => sum + mov.quantity, 0),

    purchaseMovements: movements.filter(
      (mov) => mov.movementReason === "purchase"
    ).length,
    saleMovements: movements.filter((mov) => mov.movementReason === "sale")
      .length,
    manualAdjustmentMovements: movements.filter((mov) =>
      mov.movementReason.includes("adjustment")
    ).length,
  };
};

export const getProductStockHistory = (
  companyId: string,
  productId: string,
  days: number = 30
) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const movements = getStockMovementsByProductId(companyId, productId)
    .filter((mov) => new Date(mov.movementDate) >= startDate)
    .sort(
      (a, b) =>
        new Date(a.movementDate).getTime() - new Date(b.movementDate).getTime()
    );

  return movements.map((mov) => ({
    date: mov.movementDate,
    movementType: mov.movementType,
    movementReason: mov.movementReason,
    quantity: mov.quantity,
    stockBefore: mov.stockBefore,
    stockAfter: mov.stockAfter,
    notes: mov.notes,
  }));
};
