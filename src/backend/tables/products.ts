import { productsData } from "../data/products";

export interface ProductTable {
  id: string;
  companyId: string; // Foreign key to companies table
  sku: string; // Stock Keeping Unit
  name: string;
  description?: string;
  category: string;
  brand?: string;
  unitOfMeasure: string; // pcs, kg, liter, etc.
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  supplier?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Export products data
export const products = productsData;

// Query functions
export const productQuery = {
  findById: (id: string) => products.find((product) => product.id === id),
  findByCompanyId: (companyId: string) =>
    products.filter((product) => product.companyId === companyId),
  findBySku: (sku: string) => products.find((product) => product.sku === sku),
  findByCategory: (companyId: string, category: string) =>
    products.filter((product) => 
      product.companyId === companyId && product.category === category
    ),
  findByBrand: (companyId: string, brand: string) =>
    products.filter((product) => 
      product.companyId === companyId && product.brand === brand
    ),
  findLowStock: (companyId: string) =>
    products.filter((product) => 
      product.companyId === companyId && product.stock <= product.minStock
    ),
  findActiveProducts: (companyId: string) =>
    products.filter((product) => 
      product.companyId === companyId && product.isActive
    ),
  findByBarcode: (barcode: string) => 
    products.find((product) => product.barcode === barcode),
};

// Helper functions
export const getProductStats = (companyId?: string) => {
  const targetProducts = companyId 
    ? products.filter(p => p.companyId === companyId)
    : products;
  
  const activeProducts = targetProducts.filter(p => p.isActive);
  const lowStockProducts = targetProducts.filter(p => p.stock <= p.minStock);
  
  return {
    total: targetProducts.length,
    active: activeProducts.length,
    inactive: targetProducts.length - activeProducts.length,
    lowStock: lowStockProducts.length,
    totalValue: activeProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0),
  };
};

export const getCategoryStats = (companyId: string) => {
  const companyProducts = products.filter(p => p.companyId === companyId);
  
  return companyProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = {
        count: 0,
        totalStock: 0,
        totalValue: 0,
      };
    }
    
    acc[product.category].count++;
    acc[product.category].totalStock += product.stock;
    acc[product.category].totalValue += product.stock * product.costPrice;
    
    return acc;
  }, {} as Record<string, { count: number; totalStock: number; totalValue: number }>);
};
