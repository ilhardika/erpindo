/**
 * Business Service - Comprehensive Business Operations Management
 *
 * Handles: Products, Inventory, Sales, Customers, Suppliers, Transactions
 * Consolidates: inventory.ts + sales.ts + related business logic
 */

import {
  products,
  ProductTable,
  productQuery,
  getProductStats,
} from "../tables/products";
import {
  customers,
  suppliers,
  customerQuery,
  supplierQuery,
} from "../tables/customers";
import {
  transactions,
  transactionItems,
  payments,
  TransactionTable,
  TransactionItemTable,
  PaymentTable,
} from "../tables/transactions";
import {
  inventory,
  stockMovements,
  getInventoryByCompanyId,
  getLowStockItems,
  getOutOfStockItems,
  getInventoryStatistics,
} from "../tables/inventory";

// =============================================================================
// PRODUCT MANAGEMENT
// =============================================================================

export const productService = {
  // Re-export product queries
  ...productQuery,

  // Product management functions
  create: (
    productData: Omit<ProductTable, "id" | "createdAt" | "updatedAt">
  ) => {
    const newProduct: ProductTable = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    return newProduct;
  },

  update: (id: string, updates: Partial<ProductTable>) => {
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) return null;

    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return products[productIndex];
  },

  delete: (id: string) => {
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) return false;

    products[productIndex] = {
      ...products[productIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    return true;
  },

  // Stock management
  adjustStock: (productId: string, adjustment: number, reason?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    product.stock += adjustment;
    product.updatedAt = new Date().toISOString();

    // In real app, this would create a stock movement record
    return {
      productId,
      previousStock: product.stock - adjustment,
      newStock: product.stock,
      adjustment,
      reason: reason || "Manual adjustment",
    };
  },

  updateStock: (productId: string, newStock: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const previousStock = product.stock;
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();

    return {
      productId,
      previousStock,
      newStock,
      adjustment: newStock - previousStock,
    };
  },

  // Stock monitoring
  getLowStockProducts: (companyId: string) => {
    return products.filter(
      (p) => p.companyId === companyId && p.isActive && p.stock <= p.minStock
    );
  },

  getOutOfStockProducts: (companyId: string) => {
    return products.filter(
      (p) => p.companyId === companyId && p.isActive && p.stock <= 0
    );
  },
};

// =============================================================================
// CUSTOMER & SUPPLIER MANAGEMENT
// =============================================================================

export const customerService = {
  // Re-export customer queries
  ...customerQuery,

  // Customer management functions
  create: (customerData: Omit<any, "id" | "createdAt" | "updatedAt">) => {
    const newCustomer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer as any);
    return newCustomer;
  },

  update: (id: string, updates: any) => {
    const customerIndex = customers.findIndex((c) => c.id === id);
    if (customerIndex === -1) return null;

    customers[customerIndex] = {
      ...customers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return customers[customerIndex];
  },

  getCustomerTransactions: (customerId: string) => {
    return transactions.filter((txn) => txn.customerId === customerId);
  },

  getCustomerStats: (customerId: string) => {
    const customerTransactions = transactions.filter(
      (txn) => txn.customerId === customerId
    );

    const totalSpent = customerTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0
    );

    return {
      totalTransactions: customerTransactions.length,
      totalSpent,
      averageOrderValue: totalSpent / customerTransactions.length || 0,
      lastTransactionDate: customerTransactions.sort((a, b) =>
        b.transactionDate.localeCompare(a.transactionDate)
      )[0]?.transactionDate,
    };
  },
};

export const supplierService = {
  // Re-export supplier queries
  ...supplierQuery,

  // Supplier management functions
  create: (supplierData: Omit<any, "id" | "createdAt" | "updatedAt">) => {
    const newSupplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliers.push(newSupplier as any);
    return newSupplier;
  },

  update: (id: string, updates: any) => {
    const supplierIndex = suppliers.findIndex((s) => s.id === id);
    if (supplierIndex === -1) return null;

    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return suppliers[supplierIndex];
  },

  getSupplierTransactions: (supplierId: string) => {
    return transactions.filter((txn) => txn.supplierId === supplierId);
  },
};

// =============================================================================
// INVENTORY MANAGEMENT
// =============================================================================

export const inventoryService = {
  // Re-export inventory functions
  getByCompany: getInventoryByCompanyId,
  getLowStock: getLowStockItems,
  getOutOfStock: getOutOfStockItems,
  getStatistics: getInventoryStatistics,

  // Advanced inventory operations
  adjustInventory: (
    companyId: string,
    productId: string,
    adjustment: number,
    reason: string
  ) => {
    const inventoryItem = inventory.find(
      (inv) => inv.companyId === companyId && inv.productId === productId
    );

    if (!inventoryItem) return null;

    const previousStock = inventoryItem.currentStock;
    inventoryItem.currentStock += adjustment;
    inventoryItem.availableStock =
      inventoryItem.currentStock - inventoryItem.reservedStock;
    inventoryItem.stockValue =
      inventoryItem.currentStock * inventoryItem.averageCost;
    inventoryItem.updatedAt = new Date().toISOString();

    // Create stock movement record
    const movement = {
      id: `mov-${Date.now()}`,
      companyId,
      productId,
      movementType: adjustment > 0 ? "in" : ("out" as const),
      movementReason: reason as any,
      quantity: adjustment,
      stockBefore: previousStock,
      stockAfter: inventoryItem.currentStock,
      notes: `Manual adjustment: ${reason}`,
      movementDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    stockMovements.push(movement);

    return {
      inventory: inventoryItem,
      movement,
    };
  },

  reserveStock: (companyId: string, productId: string, quantity: number) => {
    const inventoryItem = inventory.find(
      (inv) => inv.companyId === companyId && inv.productId === productId
    );

    if (!inventoryItem) return null;
    if (inventoryItem.availableStock < quantity) return null;

    inventoryItem.reservedStock += quantity;
    inventoryItem.availableStock -= quantity;
    inventoryItem.updatedAt = new Date().toISOString();

    return inventoryItem;
  },

  releaseReservedStock: (
    companyId: string,
    productId: string,
    quantity: number
  ) => {
    const inventoryItem = inventory.find(
      (inv) => inv.companyId === companyId && inv.productId === productId
    );

    if (!inventoryItem) return null;

    const releaseQty = Math.min(quantity, inventoryItem.reservedStock);
    inventoryItem.reservedStock -= releaseQty;
    inventoryItem.availableStock += releaseQty;
    inventoryItem.updatedAt = new Date().toISOString();

    return inventoryItem;
  },
};

// =============================================================================
// TRANSACTION & SALES MANAGEMENT
// =============================================================================

export const transactionQuery = {
  findById: (id: string) => transactions.find((txn) => txn.id === id),
  findByCompanyId: (companyId: string) =>
    transactions.filter((txn) => txn.companyId === companyId),
  findByType: (companyId: string, type: TransactionTable["transactionType"]) =>
    transactions.filter(
      (txn) => txn.companyId === companyId && txn.transactionType === type
    ),
  findByCustomerId: (customerId: string) =>
    transactions.filter((txn) => txn.customerId === customerId),
  findBySupplierId: (supplierId: string) =>
    transactions.filter((txn) => txn.supplierId === supplierId),
  findByEmployee: (employeeId: string) =>
    transactions.filter((txn) => txn.employeeId === employeeId),
  findByDateRange: (companyId: string, startDate: string, endDate: string) =>
    transactions.filter(
      (txn) =>
        txn.companyId === companyId &&
        txn.transactionDate >= startDate &&
        txn.transactionDate <= endDate
    ),
  findPending: (companyId: string) =>
    transactions.filter(
      (txn) => txn.companyId === companyId && txn.paymentStatus === "pending"
    ),
  findOverdue: (companyId: string) =>
    transactions.filter(
      (txn) => txn.companyId === companyId && txn.paymentStatus === "overdue"
    ),
};

export const salesService = {
  // POS Functions
  createSale: (
    companyId: string,
    customerId: string,
    employeeId: string,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>
  ) => {
    // Validate stock availability
    for (const item of items) {
      const inventoryItem = inventory.find(
        (inv) => inv.companyId === companyId && inv.productId === item.productId
      );
      if (!inventoryItem || inventoryItem.availableStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Create transaction
    const transaction: TransactionTable = {
      id: `txn-${Date.now()}`,
      companyId,
      transactionType: "sale",
      transactionNumber: `SALE-${Date.now()}`,
      transactionDate: new Date().toISOString(),
      customerId,
      employeeId,
      subtotal: items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentStatus: "pending",
      notes: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transaction.totalAmount =
      transaction.subtotal + transaction.taxAmount - transaction.discountAmount;

    // Create transaction items
    const txnItems = items.map((item, index) => ({
      id: `txn-item-${Date.now()}-${index}`,
      transactionId: transaction.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      notes: "",
    }));

    // Update inventory
    for (const item of items) {
      const inventoryItem = inventory.find(
        (inv) => inv.companyId === companyId && inv.productId === item.productId
      );
      if (inventoryItem) {
        inventoryItem.currentStock -= item.quantity;
        inventoryItem.availableStock -= item.quantity;
        inventoryItem.stockValue =
          inventoryItem.currentStock * inventoryItem.averageCost;
        inventoryItem.lastStockMovement = new Date().toISOString();
        inventoryItem.updatedAt = new Date().toISOString();

        // Create stock movement
        const movement = {
          id: `mov-${Date.now()}-${item.productId}`,
          companyId,
          productId: item.productId,
          movementType: "out" as const,
          movementReason: "sale" as const,
          quantity: -item.quantity,
          referenceType: "transaction" as const,
          referenceId: transaction.id,
          stockBefore: inventoryItem.currentStock + item.quantity,
          stockAfter: inventoryItem.currentStock,
          employeeId,
          movementDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        stockMovements.push(movement);
      }
    }

    // Save to database
    transactions.push(transaction);
    transactionItems.push(...txnItems);

    return {
      transaction,
      items: txnItems,
    };
  },

  // Purchase Functions
  createPurchase: (
    companyId: string,
    supplierId: string,
    employeeId: string,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>
  ) => {
    // Create purchase transaction
    const transaction: TransactionTable = {
      id: `txn-${Date.now()}`,
      companyId,
      transactionType: "purchase",
      transactionNumber: `PURCHASE-${Date.now()}`,
      transactionDate: new Date().toISOString(),
      supplierId,
      employeeId,
      subtotal: items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentStatus: "pending",
      notes: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transaction.totalAmount =
      transaction.subtotal + transaction.taxAmount - transaction.discountAmount;

    // Create transaction items
    const txnItems = items.map((item, index) => ({
      id: `txn-item-${Date.now()}-${index}`,
      transactionId: transaction.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      notes: "",
    }));

    // Update inventory
    for (const item of items) {
      const inventoryItem = inventory.find(
        (inv) => inv.companyId === companyId && inv.productId === item.productId
      );
      if (inventoryItem) {
        inventoryItem.currentStock += item.quantity;
        inventoryItem.availableStock += item.quantity;
        inventoryItem.lastPurchasePrice = item.unitPrice;
        inventoryItem.averageCost =
          (inventoryItem.averageCost *
            (inventoryItem.currentStock - item.quantity) +
            item.unitPrice * item.quantity) /
          inventoryItem.currentStock;
        inventoryItem.stockValue =
          inventoryItem.currentStock * inventoryItem.averageCost;
        inventoryItem.lastStockMovement = new Date().toISOString();
        inventoryItem.updatedAt = new Date().toISOString();

        // Create stock movement
        const movement = {
          id: `mov-${Date.now()}-${item.productId}`,
          companyId,
          productId: item.productId,
          movementType: "in" as const,
          movementReason: "purchase" as const,
          quantity: item.quantity,
          unitCost: item.unitPrice,
          referenceType: "transaction" as const,
          referenceId: transaction.id,
          stockBefore: inventoryItem.currentStock - item.quantity,
          stockAfter: inventoryItem.currentStock,
          employeeId,
          movementDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        stockMovements.push(movement);
      }
    }

    // Save to database
    transactions.push(transaction);
    transactionItems.push(...txnItems);

    return {
      transaction,
      items: txnItems,
    };
  },

  // Payment processing
  processPayment: (
    transactionId: string,
    amount: number,
    paymentMethod: string,
    employeeId: string
  ) => {
    const transaction = transactions.find((txn) => txn.id === transactionId);
    if (!transaction) return null;

    const payment: PaymentTable = {
      id: `pay-${Date.now()}`,
      transactionId,
      amount,
      paymentMethod: paymentMethod as any,
      paymentDate: new Date().toISOString(),
      employeeId,
      notes: "",
      createdAt: new Date().toISOString(),
    };

    payments.push(payment);

    // Update transaction payment status
    const totalPaid = payments
      .filter((p) => p.transactionId === transactionId)
      .reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= transaction.totalAmount) {
      transaction.paymentStatus = "paid";
    } else if (totalPaid > 0) {
      transaction.paymentStatus = "partial";
    }

    transaction.updatedAt = new Date().toISOString();

    return { transaction, payment };
  },

  // Sales analytics
  getSalesStats: (companyId: string, dateFrom?: string, dateTo?: string) => {
    let salesTransactions = transactions.filter(
      (txn) => txn.companyId === companyId && txn.transactionType === "sale"
    );

    if (dateFrom && dateTo) {
      salesTransactions = salesTransactions.filter(
        (txn) =>
          txn.transactionDate >= dateFrom && txn.transactionDate <= dateTo
      );
    }

    const totalRevenue = salesTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0
    );

    const paidTransactions = salesTransactions.filter(
      (txn) => txn.paymentStatus === "paid"
    );

    const paidRevenue = paidTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0
    );

    return {
      totalTransactions: salesTransactions.length,
      totalRevenue,
      paidTransactions: paidTransactions.length,
      paidRevenue,
      pendingRevenue: totalRevenue - paidRevenue,
      averageOrderValue: totalRevenue / salesTransactions.length || 0,
    };
  },

  getPurchaseStats: (companyId: string, dateFrom?: string, dateTo?: string) => {
    let purchaseTransactions = transactions.filter(
      (txn) => txn.companyId === companyId && txn.transactionType === "purchase"
    );

    if (dateFrom && dateTo) {
      purchaseTransactions = purchaseTransactions.filter(
        (txn) =>
          txn.transactionDate >= dateFrom && txn.transactionDate <= dateTo
      );
    }

    const totalSpending = purchaseTransactions.reduce(
      (sum, txn) => sum + txn.totalAmount,
      0
    );

    return {
      totalPurchases: purchaseTransactions.length,
      totalSpending,
      averagePurchaseValue: totalSpending / purchaseTransactions.length || 0,
    };
  },
};

// =============================================================================
// UNIFIED BUSINESS EXPORT
// =============================================================================

export const BusinessService = {
  products: productService,
  customers: customerService,
  suppliers: supplierService,
  inventory: inventoryService,
  sales: salesService,
  transactions: transactionQuery,
};

export default BusinessService;
