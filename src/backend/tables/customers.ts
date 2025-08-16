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

// Customers table
export const customers: CustomerTable[] = [
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
  {
    id: "cust-1-003",
    companyId: "company-1",
    code: "CUST-003",
    name: "CV. Mitra Teknologi",
    email: "admin@mitratek.com",
    phone: "+62 22 9876 5432",
    address: "Jl. Asia Afrika No. 78, Bandung",
    city: "Bandung",
    customerType: "corporate",
    segment: "vip",
    creditLimit: 75000000,
    paymentTerm: 45,
    totalPurchases: 200000000,
    lastPurchaseDate: "2024-12-05T00:00:00.000Z",
    isActive: true,
    notes: "VIP customer, mendapat diskon khusus 5%",
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-12-05T00:00:00.000Z",
  },

  // Customers for Company 2 (CV. Dagang Sukses Mandiri)
  {
    id: "cust-2-001",
    companyId: "company-2",
    code: "CUST-001",
    name: "Warung Makan Sari Rasa",
    email: "warungsarirasa@gmail.com",
    phone: "+62 31 1111 2222",
    address: "Jl. Pahlawan No. 56, Surabaya",
    city: "Surabaya",
    customerType: "corporate",
    segment: "regular",
    creditLimit: 10000000,
    paymentTerm: 7,
    totalPurchases: 25000000,
    lastPurchaseDate: "2024-12-12T00:00:00.000Z",
    isActive: true,
    notes: "Pelanggan tetap, order rutin setiap minggu",
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2024-12-12T00:00:00.000Z",
  },
  {
    id: "cust-2-002",
    companyId: "company-2",
    code: "CUST-002",
    name: "Ibu Siti Aminah",
    phone: "+62 812 1111 2222",
    address: "Perumahan Griya Asri Blok B-15, Surabaya",
    city: "Surabaya",
    customerType: "individual",
    segment: "regular",
    paymentTerm: 0,
    totalPurchases: 5000000,
    lastPurchaseDate: "2024-12-11T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-04-10T00:00:00.000Z",
    updatedAt: "2024-12-11T00:00:00.000Z",
  },

  // Customers for Company 5 (PT. Berkah Food & Beverage)
  {
    id: "cust-5-001",
    companyId: "company-5",
    code: "WALK-IN",
    name: "Walk-in Customer",
    customerType: "individual",
    segment: "regular",
    paymentTerm: 0,
    totalPurchases: 0,
    isActive: true,
    notes: "Default customer untuk walk-in",
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-05-15T00:00:00.000Z",
  },

  // Customers for Company 6 (CV. Cahaya Motor)
  {
    id: "cust-6-001",
    companyId: "company-6",
    code: "CUST-001",
    name: "Andi Pratama",
    email: "andi.pratama@gmail.com",
    phone: "+62 813 4567 8901",
    address: "Jl. Diponegoro No. 89, Surabaya",
    city: "Surabaya",
    customerType: "individual",
    segment: "premium",
    paymentTerm: 0,
    totalPurchases: 12000000,
    lastPurchaseDate: "2024-12-01T00:00:00.000Z",
    isActive: true,
    notes: "Pelanggan setia, sering service motor",
    createdAt: "2024-07-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
];

// Suppliers table
export const suppliers: SupplierTable[] = [
  // Suppliers for Company 1 (PT. Teknologi Maju)
  {
    id: "supp-1-001",
    companyId: "company-1",
    code: "SUPP-001",
    name: "PT. Distributor Tech",
    email: "sales@distributortech.com",
    phone: "+62 21 5555 6666",
    address: "Jl. Industri Raya No. 45, Jakarta Barat",
    city: "Jakarta",
    contactPerson: "Rina Wijaya",
    paymentTerm: 30,
    totalPurchases: 500000000,
    lastPurchaseDate: "2024-12-10T00:00:00.000Z",
    isActive: true,
    notes: "Supplier utama untuk laptop dan aksesoris",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-12-10T00:00:00.000Z",
  },
  {
    id: "supp-1-002",
    companyId: "company-1",
    code: "SUPP-002",
    name: "PT. Gaming Store",
    email: "procurement@gamingstore.com",
    phone: "+62 21 7777 8888",
    address: "Jl. Mangga Besar No. 123, Jakarta Barat",
    city: "Jakarta",
    contactPerson: "Doni Setiawan",
    paymentTerm: 14,
    totalPurchases: 150000000,
    lastPurchaseDate: "2024-12-05T00:00:00.000Z",
    isActive: true,
    notes: "Supplier khusus gaming accessories",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-12-05T00:00:00.000Z",
  },

  // Suppliers for Company 2 (CV. Dagang Sukses Mandiri)
  {
    id: "supp-2-001",
    companyId: "company-2",
    code: "SUPP-001",
    name: "Gudang Beras Sentral",
    email: "sales@berassentral.com",
    phone: "+62 31 4444 5555",
    address: "Jl. Raya Gresik Km 15, Gresik",
    city: "Gresik",
    contactPerson: "Pak Harto",
    paymentTerm: 7,
    totalPurchases: 200000000,
    lastPurchaseDate: "2024-12-08T00:00:00.000Z",
    isActive: true,
    notes: "Supplier beras utama, kualitas terjamin",
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-12-08T00:00:00.000Z",
  },
  {
    id: "supp-2-002",
    companyId: "company-2",
    code: "SUPP-002",
    name: "PT. Minyak Nusantara",
    email: "order@minyaknusantara.com",
    phone: "+62 31 6666 7777",
    address: "Kawasan Industri Surabaya, Blok A-12",
    city: "Surabaya",
    contactPerson: "Ibu Ratna",
    paymentTerm: 14,
    totalPurchases: 100000000,
    lastPurchaseDate: "2024-12-06T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-12-06T00:00:00.000Z",
  },

  // Suppliers for Company 5 (PT. Berkah Food & Beverage)
  {
    id: "supp-5-001",
    companyId: "company-5",
    code: "SUPP-001",
    name: "Pasar Induk Kramat Jati",
    phone: "+62 21 8888 9999",
    address: "Pasar Induk Kramat Jati, Jakarta Timur",
    city: "Jakarta",
    contactPerson: "Pak Bambang",
    paymentTerm: 1,
    totalPurchases: 50000000,
    lastPurchaseDate: "2024-12-12T00:00:00.000Z",
    isActive: true,
    notes: "Supplier sayuran dan bumbu segar",
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-12-12T00:00:00.000Z",
  },
  {
    id: "supp-5-002",
    companyId: "company-5",
    code: "SUPP-002",
    name: "Rumah Keripik Malang",
    email: "order@keripikmalang.com",
    phone: "+62 341 1234 5678",
    address: "Jl. Raya Malang-Batu Km 5, Malang",
    city: "Malang",
    contactPerson: "Bu Sari",
    paymentTerm: 7,
    totalPurchases: 25000000,
    lastPurchaseDate: "2024-12-10T00:00:00.000Z",
    isActive: true,
    notes: "Supplier keripik dan snack kemasan",
    createdAt: "2024-05-20T00:00:00.000Z",
    updatedAt: "2024-12-10T00:00:00.000Z",
  },

  // Suppliers for Company 6 (CV. Cahaya Motor)
  {
    id: "supp-6-001",
    companyId: "company-6",
    code: "SUPP-001",
    name: "PT. Motul Indonesia",
    email: "sales@motul.co.id",
    phone: "+62 21 2222 3333",
    address: "Jl. Industri Raya No. 100, Tangerang",
    city: "Tangerang",
    contactPerson: "Pak Agus",
    paymentTerm: 30,
    totalPurchases: 75000000,
    lastPurchaseDate: "2024-12-05T00:00:00.000Z",
    isActive: true,
    notes: "Supplier oli dan pelumas resmi",
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-12-05T00:00:00.000Z",
  },
  {
    id: "supp-6-002",
    companyId: "company-6",
    code: "SUPP-002",
    name: "PT. Michelin Indonesia",
    email: "b2b@michelin.co.id",
    phone: "+62 21 3333 4444",
    address: "Jl. TB Simatupang No. 200, Jakarta Selatan",
    city: "Jakarta",
    contactPerson: "Ibu Linda",
    paymentTerm: 45,
    totalPurchases: 120000000,
    lastPurchaseDate: "2024-12-03T00:00:00.000Z",
    isActive: true,
    notes: "Supplier ban dan spare parts",
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-12-03T00:00:00.000Z",
  },
];

// Helper functions for customers
export const getCustomerById = (id: string): CustomerTable | undefined => {
  return customers.find((customer) => customer.id === id);
};

export const getCustomersByCompanyId = (companyId: string): CustomerTable[] => {
  return customers.filter(
    (customer) => customer.companyId === companyId && customer.isActive
  );
};

export const getCustomerByCode = (
  companyId: string,
  code: string
): CustomerTable | undefined => {
  return customers.find(
    (customer) => customer.companyId === companyId && customer.code === code
  );
};

export const getCustomersBySegment = (
  companyId: string,
  segment: string
): CustomerTable[] => {
  return customers.filter(
    (customer) =>
      customer.companyId === companyId &&
      customer.segment === segment &&
      customer.isActive
  );
};

export const getCustomersByType = (
  companyId: string,
  type: string
): CustomerTable[] => {
  return customers.filter(
    (customer) =>
      customer.companyId === companyId &&
      customer.customerType === type &&
      customer.isActive
  );
};

// Helper functions for suppliers
export const getSupplierById = (id: string): SupplierTable | undefined => {
  return suppliers.find((supplier) => supplier.id === id);
};

export const getSuppliersByCompanyId = (companyId: string): SupplierTable[] => {
  return suppliers.filter(
    (supplier) => supplier.companyId === companyId && supplier.isActive
  );
};

export const getSupplierByCode = (
  companyId: string,
  code: string
): SupplierTable | undefined => {
  return suppliers.find(
    (supplier) => supplier.companyId === companyId && supplier.code === code
  );
};

// Statistics helpers
export const getCustomerStatistics = (companyId: string) => {
  const companyCustomers = getCustomersByCompanyId(companyId);
  return {
    totalCustomers: companyCustomers.length,
    individualCustomers: companyCustomers.filter(
      (c) => c.customerType === "individual"
    ).length,
    corporateCustomers: companyCustomers.filter(
      (c) => c.customerType === "corporate"
    ).length,
    vipCustomers: companyCustomers.filter((c) => c.segment === "vip").length,
    premiumCustomers: companyCustomers.filter((c) => c.segment === "premium")
      .length,
    regularCustomers: companyCustomers.filter((c) => c.segment === "regular")
      .length,
    totalSales: companyCustomers.reduce((sum, c) => sum + c.totalPurchases, 0),
    averagePurchase:
      companyCustomers.length > 0
        ? companyCustomers.reduce((sum, c) => sum + c.totalPurchases, 0) /
          companyCustomers.length
        : 0,
  };
};

export const getSupplierStatistics = (companyId: string) => {
  const companySuppliers = getSuppliersByCompanyId(companyId);
  return {
    totalSuppliers: companySuppliers.length,
    totalPurchases: companySuppliers.reduce(
      (sum, s) => sum + s.totalPurchases,
      0
    ),
    averagePurchase:
      companySuppliers.length > 0
        ? companySuppliers.reduce((sum, s) => sum + s.totalPurchases, 0) /
          companySuppliers.length
        : 0,
  };
};
