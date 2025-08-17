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

/**
 * Inventory Service - handles products, customers, suppliers, and inventory management
 */

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

    products.splice(productIndex, 1);
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

  getOverstockProducts: (companyId: string) => {
    return products.filter(
      (p) =>
        p.companyId === companyId &&
        p.isActive &&
        p.maxStock &&
        p.stock > p.maxStock
    );
  },
};

// =============================================================================
// CUSTOMER MANAGEMENT
// =============================================================================

export const customerService = {
  // Re-export customer queries
  ...customerQuery,

  // Customer management functions
  create: (
    customerData: Omit<(typeof customers)[0], "id" | "createdAt" | "updatedAt">
  ) => {
    const newCustomer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    return newCustomer;
  },

  update: (id: string, updates: Partial<(typeof customers)[0]>) => {
    const customerIndex = customers.findIndex((c) => c.id === id);
    if (customerIndex === -1) return null;

    customers[customerIndex] = {
      ...customers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return customers[customerIndex];
  },

  updatePurchaseHistory: (customerId: string, purchaseAmount: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return null;

    customer.totalPurchases += purchaseAmount;
    customer.lastPurchaseDate = new Date().toISOString();
    customer.updatedAt = new Date().toISOString();

    // Auto-upgrade segment based on total purchases
    if (customer.totalPurchases > 100000000 && customer.segment !== "vip") {
      customer.segment = "vip";
    } else if (
      customer.totalPurchases > 50000000 &&
      customer.segment === "regular"
    ) {
      customer.segment = "premium";
    }

    return customer;
  },

  deactivate: (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return false;

    customer.isActive = false;
    customer.updatedAt = new Date().toISOString();
    return true;
  },
};

// =============================================================================
// SUPPLIER MANAGEMENT
// =============================================================================

export const supplierService = {
  // Re-export supplier queries
  ...supplierQuery,

  // Supplier management functions
  create: (
    supplierData: Omit<(typeof suppliers)[0], "id" | "createdAt" | "updatedAt">
  ) => {
    const newSupplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliers.push(newSupplier);
    return newSupplier;
  },

  update: (id: string, updates: Partial<(typeof suppliers)[0]>) => {
    const supplierIndex = suppliers.findIndex((s) => s.id === id);
    if (supplierIndex === -1) return null;

    suppliers[supplierIndex] = {
      ...suppliers[supplierIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return suppliers[supplierIndex];
  },

  updatePurchaseHistory: (supplierId: string, purchaseAmount: number) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return null;

    supplier.totalPurchases += purchaseAmount;
    supplier.lastPurchaseDate = new Date().toISOString();
    supplier.updatedAt = new Date().toISOString();

    return supplier;
  },

  deactivate: (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (!supplier) return false;

    supplier.isActive = false;
    supplier.updatedAt = new Date().toISOString();
    return true;
  },
};

// =============================================================================
// INVENTORY ANALYTICS
// =============================================================================

export const getInventoryDashboard = (companyId: string) => {
  const productStats = getProductStats(companyId);
  const lowStockCount = productService.getLowStockProducts(companyId).length;
  const outOfStockCount =
    productService.getOutOfStockProducts(companyId).length;

  const companyProducts = products.filter(
    (p) => p.companyId === companyId && p.isActive
  );
  const avgStockLevel =
    companyProducts.length > 0
      ? companyProducts.reduce((sum, p) => sum + p.stock / p.minStock, 0) /
        companyProducts.length
      : 0;

  return {
    products: productStats,
    stockAlerts: {
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      avgStockLevel: avgStockLevel,
    },
    topCategories: Object.entries(
      companyProducts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + p.stock * p.costPrice;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, value]) => ({ category, value })),
  };
};

export const getStockMovementSummary = (companyId: string, days = 30) => {
  // This would typically come from a stock movements table
  // For now, return a mock summary
  const companyProducts = products.filter((p) => p.companyId === companyId);

  return {
    totalProducts: companyProducts.length,
    totalValue: companyProducts.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0
    ),
    movements: {
      in: Math.floor(Math.random() * 100), // Mock data
      out: Math.floor(Math.random() * 100), // Mock data
      adjustments: Math.floor(Math.random() * 10), // Mock data
    },
    period: `Last ${days} days`,
  };
};
