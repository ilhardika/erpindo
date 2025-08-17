import { CustomerTable, SupplierTable } from "../tables/customers";

// Customers data
export const customersData: CustomerTable[] = [
  // Customers for Company 1 (PT. Teknologi Maju)
  {
    id: "cust-1-001",
    companyId: "company-1",
    code: "CUST-001",
    name: "PT. Solusi Digital Indonesia",
    email: "purchasing@solusidigital.com",
    phone: "+62 21 1234 5678",
    address: "Jl. Gatot Subroto No. 45, Jakarta Selatan",
    city: "Jakarta",
    customerType: "corporate",
    segment: "premium",
    creditLimit: 50000000,
    paymentTerm: 30,
    totalPurchases: 125000000,
    lastPurchaseDate: "2024-12-10T00:00:00.000Z",
    isActive: true,
    notes: "Customer besar, selalu bayar tepat waktu",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-12-10T00:00:00.000Z",
  },
  {
    id: "cust-1-002",
    companyId: "company-1",
    code: "CUST-002",
    name: "Budi Santoso",
    email: "budi.santoso@gmail.com",
    phone: "+62 812 3456 7890",
    address: "Jl. Merdeka No. 123, Bandung",
    city: "Bandung",
    customerType: "individual",
    segment: "regular",
    paymentTerm: 0, // Cash
    totalPurchases: 15000000,
    lastPurchaseDate: "2024-12-08T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2024-12-08T00:00:00.000Z",
  },
];

// Suppliers data
export const suppliersData: SupplierTable[] = [
  {
    id: "supp-1-001",
    companyId: "company-1",
    code: "SUPP-001",
    name: "PT. Distributor Tech",
    email: "sales@distributortech.com",
    phone: "+62 21 9876 5432",
    address: "Jl. Industri Raya No. 88, Jakarta Utara",
    city: "Jakarta",
    contactPerson: "Manager Penjualan",
    paymentTerm: 14,
    totalPurchases: 500000000,
    lastPurchaseDate: "2024-12-12T00:00:00.000Z",
    isActive: true,
    notes: "Supplier utama untuk produk elektronik",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-12-12T00:00:00.000Z",
  },
];
