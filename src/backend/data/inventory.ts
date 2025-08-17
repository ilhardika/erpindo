// Pure data storage for inventory-related entities
// This file contains only data arrays without business logic

export interface InventoryData {
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

export interface StockMovementData {
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
  movementDate: string;
  createdAt: string;
}

export interface StockAdjustmentData {
  id: string;
  companyId: string; // Foreign key to companies table
  adjustmentNumber: string;
  adjustmentDate: string;
  adjustmentType:
    | "physical_count"
    | "damage"
    | "expiry"
    | "loss"
    | "found"
    | "correction";
  totalItems: number;
  totalValue: number;
  employeeId?: string; // Employee who did the adjustment
  approvedBy?: string; // Manager who approved
  status: "draft" | "approved" | "applied";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentItemData {
  id: string;
  adjustmentId: string; // Foreign key to stock_adjustments table
  productId: string; // Foreign key to products table
  systemStock: number; // Stock according to system
  physicalStock: number; // Actual counted stock
  difference: number; // physicalStock - systemStock
  unitCost: number;
  totalValue: number; // difference * unitCost
  reason?: string;
  createdAt: string;
}

// Inventory data - Current stock levels for all products
export const inventoryData: InventoryData[] = [
  // Inventory for Company 1 (PT. Teknologi Maju)
  {
    id: "inv-1-001",
    companyId: "company-1",
    productId: "prod-1-001",
    warehouseLocation: "Gudang Utama Lantai 2",
    currentStock: 25,
    reservedStock: 5, // 5 laptops reserved for pending orders
    availableStock: 20,
    minimumStock: 10,
    maximumStock: 50,
    reorderPoint: 15,
    averageCost: 14500000,
    lastStockMovement: "2024-12-10T10:30:00.000Z",
    lastPurchasePrice: 14000000,
    lastSalePrice: 15000000,
    stockValue: 362500000,
    isActive: true,
    updatedAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "inv-1-002",
    companyId: "company-1",
    productId: "prod-1-002",
    warehouseLocation: "Gudang Utama Lantai 1",
    currentStock: 45,
    reservedStock: 2,
    availableStock: 43,
    minimumStock: 20,
    maximumStock: 100,
    reorderPoint: 25,
    averageCost: 1300000,
    lastStockMovement: "2024-12-08T14:15:00.000Z",
    lastPurchasePrice: 1200000,
    lastSalePrice: 1500000,
    stockValue: 58500000,
    isActive: true,
    updatedAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "inv-1-003",
    companyId: "company-1",
    productId: "prod-1-003",
    warehouseLocation: "Gudang Utama Lantai 1",
    currentStock: 150,
    reservedStock: 10,
    availableStock: 140,
    minimumStock: 50,
    maximumStock: 300,
    reorderPoint: 75,
    averageCost: 200000,
    lastStockMovement: "2024-12-10T10:30:00.000Z",
    lastPurchasePrice: 180000,
    lastSalePrice: 250000,
    stockValue: 30000000,
    isActive: true,
    updatedAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "inv-1-004",
    companyId: "company-1",
    productId: "prod-1-004",
    warehouseLocation: "Gudang Utama Lantai 1",
    currentStock: 30,
    reservedStock: 1,
    availableStock: 29,
    minimumStock: 15,
    maximumStock: 60,
    reorderPoint: 20,
    averageCost: 650000,
    lastStockMovement: "2024-12-08T14:15:00.000Z",
    lastPurchasePrice: 600000,
    lastSalePrice: 800000,
    stockValue: 19500000,
    isActive: true,
    updatedAt: "2024-12-08T14:15:00.000Z",
  },

  // Inventory for Company 2 (CV. Dagang Sukses Mandiri)
  {
    id: "inv-2-001",
    companyId: "company-2",
    productId: "prod-2-001",
    warehouseLocation: "Gudang Beras A",
    currentStock: 500, // 500 karung beras 25kg
    reservedStock: 75,
    availableStock: 425,
    minimumStock: 100,
    maximumStock: 1000,
    reorderPoint: 150,
    averageCost: 14500,
    lastStockMovement: "2024-12-12T08:30:00.000Z",
    lastPurchasePrice: 14000,
    lastSalePrice: 15000,
    stockValue: 7250000,
    isActive: true,
    updatedAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "inv-2-002",
    companyId: "company-2",
    productId: "prod-2-002",
    warehouseLocation: "Gudang Minyak B",
    currentStock: 200, // 200 botol minyak 1L
    reservedStock: 25,
    availableStock: 175,
    minimumStock: 50,
    maximumStock: 400,
    reorderPoint: 75,
    averageCost: 16500,
    lastStockMovement: "2024-12-12T08:30:00.000Z",
    lastPurchasePrice: 16000,
    lastSalePrice: 18000,
    stockValue: 3300000,
    isActive: true,
    updatedAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "inv-2-003",
    companyId: "company-2",
    productId: "prod-2-003",
    warehouseLocation: "Gudang Gula C",
    currentStock: 100, // 100 karung gula 50kg
    reservedStock: 10,
    availableStock: 90,
    minimumStock: 20,
    maximumStock: 200,
    reorderPoint: 30,
    averageCost: 23000,
    lastStockMovement: "2024-12-11T10:00:00.000Z",
    lastPurchasePrice: 22500,
    lastSalePrice: 25000,
    stockValue: 2300000,
    isActive: true,
    updatedAt: "2024-12-11T10:00:00.000Z",
  },

  // Inventory for Company 5 (PT. Berkah Food & Beverage)
  {
    id: "inv-5-001",
    companyId: "company-5",
    productId: "prod-5-001",
    warehouseLocation: "Freezer Utama",
    currentStock: 0, // Ready-to-serve food
    reservedStock: 0,
    availableStock: 0,
    minimumStock: 0,
    reorderPoint: 0,
    averageCost: 15000, // Cost to prepare one portion
    lastStockMovement: "2024-12-12T12:15:00.000Z",
    stockValue: 0,
    isActive: true,
    updatedAt: "2024-12-12T12:15:00.000Z",
  },
  {
    id: "inv-5-002",
    companyId: "company-5",
    productId: "prod-5-002",
    warehouseLocation: "Freezer Utama",
    currentStock: 0, // Ready-to-serve food
    reservedStock: 0,
    availableStock: 0,
    minimumStock: 0,
    reorderPoint: 0,
    averageCost: 20000,
    stockValue: 0,
    isActive: true,
    updatedAt: "2024-12-12T19:30:00.000Z",
  },

  // Inventory for Company 6 (CV. Cahaya Motor)
  {
    id: "inv-6-001",
    companyId: "company-6",
    productId: "prod-6-001",
    warehouseLocation: "Gudang Oli",
    currentStock: 48, // 48 botol oli
    reservedStock: 2,
    availableStock: 46,
    minimumStock: 20,
    maximumStock: 100,
    reorderPoint: 30,
    averageCost: 45000,
    lastStockMovement: "2024-12-01T10:00:00.000Z",
    lastPurchasePrice: 42000,
    lastSalePrice: 55000,
    stockValue: 2160000,
    isActive: true,
    updatedAt: "2024-12-01T10:00:00.000Z",
  },
  {
    id: "inv-6-002",
    companyId: "company-6",
    productId: "prod-6-002",
    warehouseLocation: "Gudang Spare Parts",
    currentStock: 25, // 25 set kampas rem
    reservedStock: 3,
    availableStock: 22,
    minimumStock: 10,
    maximumStock: 50,
    reorderPoint: 15,
    averageCost: 85000,
    lastStockMovement: "2024-11-28T14:00:00.000Z",
    lastPurchasePrice: 80000,
    lastSalePrice: 110000,
    stockValue: 2125000,
    isActive: true,
    updatedAt: "2024-11-28T14:00:00.000Z",
  },
];

// Stock Movement data - All inventory movements
export const stockMovementData: StockMovementData[] = [
  // Recent movements for Company 1
  {
    id: "mov-1-001",
    companyId: "company-1",
    productId: "prod-1-001",
    movementType: "out",
    movementReason: "sale",
    quantity: -5,
    referenceType: "transaction",
    referenceId: "trans-1-001",
    stockBefore: 30,
    stockAfter: 25,
    employeeId: "emp-1-002",
    movementDate: "2024-12-10T10:30:00.000Z",
    createdAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "mov-1-002",
    companyId: "company-1",
    productId: "prod-1-003",
    movementType: "out",
    movementReason: "sale",
    quantity: -10,
    referenceType: "transaction",
    referenceId: "trans-1-001",
    stockBefore: 160,
    stockAfter: 150,
    employeeId: "emp-1-002",
    movementDate: "2024-12-10T10:30:00.000Z",
    createdAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "mov-1-003",
    companyId: "company-1",
    productId: "prod-1-002",
    movementType: "out",
    movementReason: "sale",
    quantity: -1,
    referenceType: "transaction",
    referenceId: "trans-1-002",
    stockBefore: 46,
    stockAfter: 45,
    employeeId: "emp-1-001",
    movementDate: "2024-12-08T14:15:00.000Z",
    createdAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "mov-1-004",
    companyId: "company-1",
    productId: "prod-1-004",
    movementType: "out",
    movementReason: "sale",
    quantity: -1,
    referenceType: "transaction",
    referenceId: "trans-1-002",
    stockBefore: 31,
    stockAfter: 30,
    employeeId: "emp-1-001",
    movementDate: "2024-12-08T14:15:00.000Z",
    createdAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "mov-1-005",
    companyId: "company-1",
    productId: "prod-1-001",
    movementType: "in",
    movementReason: "purchase",
    quantity: 10,
    unitCost: 14000000,
    referenceType: "transaction",
    referenceId: "trans-1-p001",
    stockBefore: 20,
    stockAfter: 30,
    employeeId: "emp-1-001",
    movementDate: "2024-12-08T16:00:00.000Z",
    createdAt: "2024-12-08T16:00:00.000Z",
  },

  // Movements for Company 2
  {
    id: "mov-2-001",
    companyId: "company-2",
    productId: "prod-2-001",
    movementType: "out",
    movementReason: "sale",
    quantity: -50,
    referenceType: "transaction",
    referenceId: "trans-2-001",
    stockBefore: 550,
    stockAfter: 500,
    employeeId: "emp-2-001",
    movementDate: "2024-12-12T08:30:00.000Z",
    createdAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "mov-2-002",
    companyId: "company-2",
    productId: "prod-2-002",
    movementType: "out",
    movementReason: "sale",
    quantity: -20,
    referenceType: "transaction",
    referenceId: "trans-2-001",
    stockBefore: 220,
    stockAfter: 200,
    employeeId: "emp-2-001",
    movementDate: "2024-12-12T08:30:00.000Z",
    createdAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "mov-2-003",
    companyId: "company-2",
    productId: "prod-2-001",
    movementType: "in",
    movementReason: "purchase",
    quantity: 100,
    unitCost: 14000,
    referenceType: "transaction",
    referenceId: "trans-2-p001",
    stockBefore: 450,
    stockAfter: 550,
    employeeId: "emp-2-001",
    movementDate: "2024-12-06T16:00:00.000Z",
    createdAt: "2024-12-06T16:00:00.000Z",
  },

  // Movements for Company 6 (Motor workshop)
  {
    id: "mov-6-001",
    companyId: "company-6",
    productId: "prod-6-001",
    movementType: "out",
    movementReason: "sale",
    quantity: -2,
    referenceType: "transaction",
    referenceId: "trans-6-001",
    stockBefore: 50,
    stockAfter: 48,
    notes: "Service rutin - ganti oli",
    employeeId: "emp-6-001",
    movementDate: "2024-12-01T10:00:00.000Z",
    createdAt: "2024-12-01T10:00:00.000Z",
  },
  {
    id: "mov-6-002",
    companyId: "company-6",
    productId: "prod-6-001",
    movementType: "in",
    movementReason: "purchase",
    quantity: 24,
    unitCost: 42000,
    referenceId: "PO-6-001",
    stockBefore: 26,
    stockAfter: 50,
    employeeId: "emp-6-001",
    movementDate: "2024-11-25T09:00:00.000Z",
    createdAt: "2024-11-25T09:00:00.000Z",
  },
];

// Stock Adjustment data - For inventory corrections
export const stockAdjustmentData: StockAdjustmentData[] = [
  {
    id: "adj-1-001",
    companyId: "company-1",
    adjustmentNumber: "ADJ/2024/11/001",
    adjustmentDate: "2024-11-30T00:00:00.000Z",
    adjustmentType: "physical_count",
    totalItems: 4,
    totalValue: -1500000, // Net loss
    employeeId: "emp-1-001",
    approvedBy: "emp-1-manager",
    status: "applied",
    notes: "Monthly physical stock count",
    createdAt: "2024-11-30T10:00:00.000Z",
    updatedAt: "2024-11-30T15:30:00.000Z",
  },
  {
    id: "adj-2-001",
    companyId: "company-2",
    adjustmentNumber: "ADJ/2024/12/001",
    adjustmentDate: "2024-12-01T00:00:00.000Z",
    adjustmentType: "damage",
    totalItems: 2,
    totalValue: -750000,
    employeeId: "emp-2-002",
    approvedBy: "emp-2-001",
    status: "applied",
    notes: "Kerusakan karung beras karena tikus",
    createdAt: "2024-12-01T08:00:00.000Z",
    updatedAt: "2024-12-01T10:00:00.000Z",
  },
];

// Stock Adjustment Item data - Detail adjustments
export const stockAdjustmentItemData: StockAdjustmentItemData[] = [
  // Items for ADJ/2024/11/001 (Company 1)
  {
    id: "adj-item-1-001",
    adjustmentId: "adj-1-001",
    productId: "prod-1-001",
    systemStock: 22,
    physicalStock: 20,
    difference: -2,
    unitCost: 14500000,
    totalValue: -29000000,
    reason: "Missing laptops - possible theft",
    createdAt: "2024-11-30T10:00:00.000Z",
  },
  {
    id: "adj-item-1-002",
    adjustmentId: "adj-1-001",
    productId: "prod-1-003",
    systemStock: 158,
    physicalStock: 160,
    difference: 2,
    unitCost: 200000,
    totalValue: 400000,
    reason: "Found extra mice in storage",
    createdAt: "2024-11-30T10:00:00.000Z",
  },

  // Items for ADJ/2024/12/001 (Company 2)
  {
    id: "adj-item-2-001",
    adjustmentId: "adj-2-001",
    productId: "prod-2-001",
    systemStock: 452,
    physicalStock: 450,
    difference: -2,
    unitCost: 14500,
    totalValue: -29000,
    reason: "Karung sobek, beras tumpah",
    createdAt: "2024-12-01T08:00:00.000Z",
  },
];
