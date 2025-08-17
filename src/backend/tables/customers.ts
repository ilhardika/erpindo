import { customersData, suppliersData } from "../data/customers";

export interface CustomerTable {
  id: string;
  companyId: string; // Foreign key to companies table
  code: string; // Customer code
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  customerType: "individual" | "corporate";
  segment: "regular" | "premium" | "vip";
  creditLimit?: number;
  paymentTerm?: number; // days
  totalPurchases: number;
  lastPurchaseDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierTable {
  id: string;
  companyId: string; // Foreign key to companies table
  code: string; // Supplier code
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  contactPerson?: string;
  paymentTerm?: number; // days
  totalPurchases: number;
  lastPurchaseDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Export data
export const customers = customersData;
export const suppliers = suppliersData;

// Customer Query functions
export const customerQuery = {
  findById: (id: string) => customers.find((customer) => customer.id === id),
  findByCode: (code: string) => customers.find((customer) => customer.code === code),
  findByCompanyId: (companyId: string) =>
    customers.filter((customer) => customer.companyId === companyId),
  findBySegment: (companyId: string, segment: "regular" | "premium" | "vip") =>
    customers.filter((customer) => 
      customer.companyId === companyId && customer.segment === segment
    ),
  findByType: (companyId: string, type: "individual" | "corporate") =>
    customers.filter((customer) => 
      customer.companyId === companyId && customer.customerType === type
    ),
  findActiveCustomers: (companyId: string) =>
    customers.filter((customer) => 
      customer.companyId === companyId && customer.isActive
    ),
  findTopCustomers: (companyId: string, limit = 10) =>
    customers
      .filter((customer) => customer.companyId === companyId)
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, limit),
};

// Supplier Query functions
export const supplierQuery = {
  findById: (id: string) => suppliers.find((supplier) => supplier.id === id),
  findByCode: (code: string) => suppliers.find((supplier) => supplier.code === code),
  findByCompanyId: (companyId: string) =>
    suppliers.filter((supplier) => supplier.companyId === companyId),
  findActiveSuppliers: (companyId: string) =>
    suppliers.filter((supplier) => 
      supplier.companyId === companyId && supplier.isActive
    ),
  findTopSuppliers: (companyId: string, limit = 10) =>
    suppliers
      .filter((supplier) => supplier.companyId === companyId)
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, limit),
};

// Helper functions
export const getCustomerStats = (companyId?: string) => {
  const targetCustomers = companyId 
    ? customers.filter(c => c.companyId === companyId)
    : customers;
  
  const activeCustomers = targetCustomers.filter(c => c.isActive);
  const corporateCustomers = targetCustomers.filter(c => c.customerType === "corporate");
  const premiumCustomers = targetCustomers.filter(c => c.segment === "premium" || c.segment === "vip");
  
  return {
    total: targetCustomers.length,
    active: activeCustomers.length,
    corporate: corporateCustomers.length,
    individual: targetCustomers.length - corporateCustomers.length,
    premium: premiumCustomers.length,
    totalPurchaseValue: activeCustomers.reduce((sum, c) => sum + c.totalPurchases, 0),
  };
};

export const getSupplierStats = (companyId?: string) => {
  const targetSuppliers = companyId 
    ? suppliers.filter(s => s.companyId === companyId)
    : suppliers;
  
  const activeSuppliers = targetSuppliers.filter(s => s.isActive);
  
  return {
    total: targetSuppliers.length,
    active: activeSuppliers.length,
    inactive: targetSuppliers.length - activeSuppliers.length,
    totalPurchaseValue: activeSuppliers.reduce((sum, s) => sum + s.totalPurchases, 0),
  };
};
