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

// Products table - contains all products for all companies
export const products: ProductTable[] = [
  // Products for Company 1 (PT. Teknologi Maju)
  {
    id: "prod-1-001",
    companyId: "company-1",
    sku: "TM-LAP-001",
    name: "Laptop ASUS VivoBook 14",
    description:
      "Laptop ASUS VivoBook 14 inch dengan processor Intel i5, RAM 8GB, SSD 512GB",
    category: "Electronics",
    brand: "ASUS",
    unitOfMeasure: "pcs",
    costPrice: 7500000,
    sellingPrice: 8500000,
    stock: 25,
    minStock: 5,
    maxStock: 50,
    supplier: "PT. Distributor Tech",
    barcode: "1234567890123",
    isActive: true,
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-1-002",
    companyId: "company-1",
    sku: "TM-MSE-001",
    name: "Mouse Wireless Logitech M170",
    description: "Mouse wireless Logitech M170 dengan konektivitas 2.4GHz",
    category: "Electronics",
    brand: "Logitech",
    unitOfMeasure: "pcs",
    costPrice: 120000,
    sellingPrice: 150000,
    stock: 150,
    minStock: 20,
    maxStock: 200,
    supplier: "PT. Distributor Tech",
    barcode: "1234567890124",
    isActive: true,
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-1-003",
    companyId: "company-1",
    sku: "TM-KBD-001",
    name: "Keyboard Mechanical RGB",
    description: "Keyboard mechanical dengan backlight RGB, switch blue",
    category: "Electronics",
    brand: "Corsair",
    unitOfMeasure: "pcs",
    costPrice: 800000,
    sellingPrice: 1000000,
    stock: 30,
    minStock: 5,
    maxStock: 40,
    supplier: "PT. Gaming Store",
    barcode: "1234567890125",
    isActive: true,
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },

  // Products for Company 2 (CV. Dagang Sukses Mandiri)
  {
    id: "prod-2-001",
    companyId: "company-2",
    sku: "DSM-RIC-001",
    name: "Beras Premium 5kg",
    description: "Beras premium kualitas super, kemasan 5kg",
    category: "Food",
    brand: "Ramos",
    unitOfMeasure: "kg",
    costPrice: 65000,
    sellingPrice: 75000,
    stock: 500,
    minStock: 50,
    maxStock: 1000,
    supplier: "Gudang Beras Sentral",
    barcode: "2234567890123",
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-2-002",
    companyId: "company-2",
    sku: "DSM-OIL-001",
    name: "Minyak Goreng Tropical 2L",
    description: "Minyak goreng kelapa sawit kemasan 2 liter",
    category: "Food",
    brand: "Tropical",
    unitOfMeasure: "liter",
    costPrice: 28000,
    sellingPrice: 32000,
    stock: 200,
    minStock: 30,
    maxStock: 300,
    supplier: "PT. Minyak Nusantara",
    barcode: "2234567890124",
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },

  // Products for Company 5 (PT. Berkah Food & Beverage)
  {
    id: "prod-5-001",
    companyId: "company-5",
    sku: "BFB-NAG-001",
    name: "Nasi Gudeg Yogya",
    description: "Nasi gudeg khas Yogyakarta dengan ayam, tahu, tempe",
    category: "Ready Food",
    brand: "Berkah",
    unitOfMeasure: "porsi",
    costPrice: 12000,
    sellingPrice: 18000,
    stock: 0, // Fresh food, no stock
    minStock: 0,
    maxStock: 0,
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-5-002",
    companyId: "company-5",
    sku: "BFB-DRK-001",
    name: "Es Jeruk Peras",
    description: "Minuman segar es jeruk peras asli",
    category: "Beverages",
    brand: "Berkah",
    unitOfMeasure: "gelas",
    costPrice: 3000,
    sellingPrice: 8000,
    stock: 0, // Fresh beverage, no stock
    minStock: 0,
    maxStock: 0,
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-5-003",
    companyId: "company-5",
    sku: "BFB-SNK-001",
    name: "Keripik Singkong Pedas",
    description: "Keripik singkong rasa pedas manis",
    category: "Snacks",
    brand: "Berkah",
    unitOfMeasure: "pack",
    costPrice: 8000,
    sellingPrice: 12000,
    stock: 150,
    minStock: 20,
    maxStock: 200,
    supplier: "Rumah Keripik Malang",
    barcode: "5234567890123",
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },

  // Products for Company 6 (CV. Cahaya Motor)
  {
    id: "prod-6-001",
    companyId: "company-6",
    sku: "CM-OIL-001",
    name: "Oli Mesin Motul 10W-40",
    description: "Oli mesin motor Motul 10W-40 semi synthetic 1 liter",
    category: "Automotive",
    brand: "Motul",
    unitOfMeasure: "liter",
    costPrice: 85000,
    sellingPrice: 110000,
    stock: 48,
    minStock: 10,
    maxStock: 60,
    supplier: "PT. Motul Indonesia",
    barcode: "6234567890123",
    isActive: true,
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
  {
    id: "prod-6-002",
    companyId: "company-6",
    sku: "CM-TIR-001",
    name: "Ban Motor Michelin 90/80-14",
    description: "Ban motor tubeless Michelin ukuran 90/80-14",
    category: "Automotive",
    brand: "Michelin",
    unitOfMeasure: "pcs",
    costPrice: 380000,
    sellingPrice: 450000,
    stock: 24,
    minStock: 4,
    maxStock: 30,
    supplier: "PT. Michelin Indonesia",
    barcode: "6234567890124",
    isActive: true,
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-12-15T00:00:00.000Z",
  },
];

// Helper functions to simulate database operations
export const getProductById = (id: string): ProductTable | undefined => {
  return products.find((product) => product.id === id);
};

export const getProductsByCompanyId = (companyId: string): ProductTable[] => {
  return products.filter(
    (product) => product.companyId === companyId && product.isActive
  );
};

export const getProductsBySku = (
  companyId: string,
  sku: string
): ProductTable | undefined => {
  return products.find(
    (product) => product.companyId === companyId && product.sku === sku
  );
};

export const getProductsByCategory = (
  companyId: string,
  category: string
): ProductTable[] => {
  return products.filter(
    (product) =>
      product.companyId === companyId &&
      product.category.toLowerCase() === category.toLowerCase() &&
      product.isActive
  );
};

export const getProductsByBrand = (
  companyId: string,
  brand: string
): ProductTable[] => {
  return products.filter(
    (product) =>
      product.companyId === companyId &&
      product.brand?.toLowerCase() === brand.toLowerCase() &&
      product.isActive
  );
};

export const getLowStockProducts = (companyId: string): ProductTable[] => {
  return products.filter(
    (product) =>
      product.companyId === companyId &&
      product.stock <= product.minStock &&
      product.isActive
  );
};

export const searchProducts = (
  companyId: string,
  searchTerm: string
): ProductTable[] => {
  const term = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.companyId === companyId &&
      (product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.brand?.toLowerCase().includes(term)) &&
      product.isActive
  );
};

// Statistics helpers
export const getProductStatistics = (companyId: string) => {
  const companyProducts = getProductsByCompanyId(companyId);
  const categories = [...new Set(companyProducts.map((p) => p.category))];
  const brands = [
    ...new Set(companyProducts.map((p) => p.brand).filter(Boolean)),
  ];

  return {
    totalProducts: companyProducts.length,
    activeProducts: companyProducts.filter((p) => p.isActive).length,
    lowStockProducts: getLowStockProducts(companyId).length,
    totalStockValue: companyProducts.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0
    ),
    totalSellingValue: companyProducts.reduce(
      (sum, p) => sum + p.stock * p.sellingPrice,
      0
    ),
    categories: categories,
    brands: brands,
    categoryBreakdown: categories.reduce((acc, cat) => {
      acc[cat] = companyProducts.filter((p) => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>),
  };
};
