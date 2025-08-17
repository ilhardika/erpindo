import {
  transactions,
  TransactionTable,
  TransactionItemTable,
  PaymentTable,
} from "../tables/transactions";
import { productService } from "./inventory";
import { customerService, supplierService } from "./inventory";

/**
 * Sales Service - handles transactions, POS, sales, and purchasing
 */

// =============================================================================
// TRANSACTION QUERIES
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

// =============================================================================
// POS FUNCTIONS
// =============================================================================

export const posService = {
  // Create a new sales transaction (POS)
  createSale: (saleData: {
    companyId: string;
    customerId?: string;
    employeeId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      discount?: number;
    }>;
    paymentMethod: TransactionTable["paymentMethod"];
    discountAmount?: number;
    taxAmount?: number;
    notes?: string;
  }) => {
    // Calculate totals
    let subtotal = 0;
    const transactionItems: Omit<
      TransactionItemTable,
      "id" | "transactionId"
    >[] = [];

    for (const item of saleData.items) {
      const product = productService.findById(item.productId);
      if (!product) continue;

      const unitPrice = item.unitPrice || product.sellingPrice;
      const discount = item.discount || 0;
      const totalPrice = unitPrice * item.quantity - discount;

      subtotal += totalPrice;

      transactionItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount,
        totalPrice,
        createdAt: new Date().toISOString(),
      });

      // Update product stock
      productService.adjustStock(item.productId, -item.quantity, "Sale");
    }

    const discountAmount = saleData.discountAmount || 0;
    const taxAmount = saleData.taxAmount || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Generate transaction number
    const transactionNumber = `INV-${Date.now()}`;

    // Create transaction
    const newTransaction: TransactionTable = {
      id: `txn-${Date.now()}`,
      companyId: saleData.companyId,
      transactionNumber,
      transactionType: "sale",
      customerId: saleData.customerId,
      employeeId: saleData.employeeId,
      transactionDate: new Date().toISOString(),
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentStatus: saleData.paymentMethod === "credit" ? "pending" : "paid",
      paymentMethod: saleData.paymentMethod,
      notes: saleData.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);

    // Update customer purchase history if customer provided
    if (saleData.customerId) {
      customerService.updatePurchaseHistory(saleData.customerId, totalAmount);
    }

    return {
      transaction: newTransaction,
      items: transactionItems,
    };
  },

  // Process refund
  processRefund: (
    originalTransactionId: string,
    refundData: {
      items: Array<{
        productId: string;
        quantity: number;
      }>;
      reason?: string;
      employeeId: string;
    }
  ) => {
    const originalTransaction = transactions.find(
      (t) => t.id === originalTransactionId
    );
    if (
      !originalTransaction ||
      originalTransaction.transactionType !== "sale"
    ) {
      return null;
    }

    // Calculate refund amount (simplified)
    let refundAmount = 0;
    for (const item of refundData.items) {
      const product = productService.findById(item.productId);
      if (product) {
        refundAmount += product.sellingPrice * item.quantity;
        // Restore stock
        productService.adjustStock(item.productId, item.quantity, "Refund");
      }
    }

    // Create refund transaction
    const refundTransaction: TransactionTable = {
      id: `txn-refund-${Date.now()}`,
      companyId: originalTransaction.companyId,
      transactionNumber: `REF-${Date.now()}`,
      transactionType: "return_sale",
      customerId: originalTransaction.customerId,
      employeeId: refundData.employeeId,
      transactionDate: new Date().toISOString(),
      subtotal: -refundAmount,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: -refundAmount,
      paymentStatus: "paid",
      paymentMethod: "cash", // Refunds typically in cash
      notes: `Refund for ${originalTransaction.transactionNumber}. Reason: ${refundData.reason}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(refundTransaction);

    return refundTransaction;
  },

  // Daily cashier shift functions
  openShift: (employeeId: string, companyId: string, openingCash: number) => {
    // In real app, this would create a shift record
    return {
      shiftId: `shift-${Date.now()}`,
      employeeId,
      companyId,
      openedAt: new Date().toISOString(),
      openingCash,
      status: "open" as const,
    };
  },

  closeShift: (shiftId: string, closingCash: number) => {
    // In real app, this would update the shift record and calculate summary
    const todaySales = transactionQuery.findByDateRange(
      "company-1", // This should come from shift data
      new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
      new Date().toISOString()
    );

    const totalSales = todaySales
      .filter((t) => t.transactionType === "sale" && t.paymentMethod === "cash")
      .reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      shiftId,
      closedAt: new Date().toISOString(),
      closingCash,
      totalSales,
      transactions: todaySales.length,
      status: "closed" as const,
    };
  },
};

// =============================================================================
// PURCHASING FUNCTIONS
// =============================================================================

export const purchaseService = {
  // Create purchase order
  createPurchase: (purchaseData: {
    companyId: string;
    supplierId: string;
    employeeId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    paymentMethod?: TransactionTable["paymentMethod"];
    notes?: string;
    requiresApproval?: boolean;
  }) => {
    let subtotal = 0;

    for (const item of purchaseData.items) {
      subtotal += item.unitPrice * item.quantity;
    }

    const totalAmount = subtotal; // No tax/discount for purchases in this example

    const newPurchase: TransactionTable = {
      id: `purchase-${Date.now()}`,
      companyId: purchaseData.companyId,
      transactionNumber: `PO-${Date.now()}`,
      transactionType: "purchase",
      supplierId: purchaseData.supplierId,
      employeeId: purchaseData.employeeId,
      transactionDate: new Date().toISOString(),
      subtotal,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount,
      paymentStatus: purchaseData.requiresApproval ? "pending" : "paid",
      paymentMethod: purchaseData.paymentMethod || "credit",
      notes: purchaseData.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(newPurchase);

    // If not requiring approval, update stock immediately
    if (!purchaseData.requiresApproval) {
      for (const item of purchaseData.items) {
        productService.adjustStock(item.productId, item.quantity, "Purchase");
      }

      // Update supplier purchase history
      supplierService.updatePurchaseHistory(
        purchaseData.supplierId,
        totalAmount
      );
    }

    return newPurchase;
  },

  // Approve purchase and receive goods
  approvePurchase: (purchaseId: string, approvedBy: string) => {
    const purchase = transactions.find(
      (t) => t.id === purchaseId && t.transactionType === "purchase"
    );

    if (!purchase) return null;

    purchase.paymentStatus = "paid";
    purchase.notes = `${purchase.notes || ""} - Approved by ${approvedBy}`;
    purchase.updatedAt = new Date().toISOString();

    // Update supplier purchase history
    if (purchase.supplierId) {
      supplierService.updatePurchaseHistory(
        purchase.supplierId,
        purchase.totalAmount
      );
    }

    return purchase;
  },
};

// =============================================================================
// SALES ANALYTICS
// =============================================================================

export const getSalesAnalytics = (
  companyId: string,
  period?: { start: string; end: string }
) => {
  let salesTransactions = transactionQuery.findByType(companyId, "sale");

  if (period) {
    salesTransactions = salesTransactions.filter(
      (t) =>
        t.transactionDate >= period.start && t.transactionDate <= period.end
    );
  }

  const totalSales = salesTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );
  const totalTransactions = salesTransactions.length;
  const avgTransactionValue =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Sales by payment method
  const salesByPaymentMethod = salesTransactions.reduce((acc, t) => {
    const method = t.paymentMethod || "unknown";
    acc[method] = (acc[method] || 0) + t.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Sales by employee
  const salesByEmployee = salesTransactions.reduce((acc, t) => {
    const employee = t.employeeId || "unknown";
    if (!acc[employee]) {
      acc[employee] = { count: 0, total: 0 };
    }
    acc[employee].count++;
    acc[employee].total += t.totalAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return {
    summary: {
      totalSales,
      totalTransactions,
      avgTransactionValue,
    },
    breakdown: {
      byPaymentMethod: salesByPaymentMethod,
      byEmployee: salesByEmployee,
    },
    period: period || "All time",
  };
};

export const getTopProducts = (
  companyId: string,
  period?: { start: string; end: string },
  limit = 10
) => {
  // This would typically require transaction items data
  // For now, return a mock response
  return {
    period: period || "All time",
    products: [
      {
        productId: "prod-1-001",
        productName: "Laptop ASUS VivoBook 14",
        totalSold: 15,
        revenue: 127500000,
      },
      {
        productId: "prod-1-002",
        productName: "Mouse Wireless Logitech",
        totalSold: 45,
        revenue: 6750000,
      },
    ].slice(0, limit),
  };
};

export const getTopCustomers = (
  companyId: string,
  period?: { start: string; end: string },
  limit = 10
) => {
  let salesTransactions = transactionQuery
    .findByType(companyId, "sale")
    .filter((t) => t.customerId);

  if (period) {
    salesTransactions = salesTransactions.filter(
      (t) =>
        t.transactionDate >= period.start && t.transactionDate <= period.end
    );
  }

  const customerSales = salesTransactions.reduce((acc, t) => {
    const customerId = t.customerId!;
    if (!acc[customerId]) {
      acc[customerId] = { count: 0, total: 0 };
    }
    acc[customerId].count++;
    acc[customerId].total += t.totalAmount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return Object.entries(customerSales)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, limit)
    .map(([customerId, data]) => {
      const customer = customerService.findById(customerId);
      return {
        customerId,
        customerName: customer?.name || "Unknown",
        transactionCount: data.count,
        totalPurchases: data.total,
      };
    });
};
