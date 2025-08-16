export interface TransactionTable {
  id: string;
  companyId: string; // Foreign key to companies table
  transactionNumber: string; // Invoice/transaction number
  transactionType: "sale" | "purchase" | "return_sale" | "return_purchase";
  customerId?: string; // For sales transactions
  supplierId?: string; // For purchase transactions
  employeeId?: string; // Employee who handled the transaction
  transactionDate: string;
  dueDate?: string; // For credit transactions
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: "pending" | "partial" | "paid" | "overdue";
  paymentMethod?: "cash" | "transfer" | "credit_card" | "debit_card" | "credit";
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItemTable {
  id: string;
  transactionId: string; // Foreign key to transactions table
  productId: string; // Foreign key to products table
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface PaymentTable {
  id: string;
  companyId: string; // Foreign key to companies table
  transactionId: string; // Foreign key to transactions table
  paymentNumber: string;
  paymentDate: string;
  paymentMethod: "cash" | "transfer" | "credit_card" | "debit_card";
  amount: number;
  notes?: string;
  employeeId?: string; // Employee who processed the payment
  createdAt: string;
}

// Transactions table
export const transactions: TransactionTable[] = [
  // Sales transactions for Company 1 (PT. Teknologi Maju)
  {
    id: "trans-1-001",
    companyId: "company-1",
    transactionNumber: "INV/2024/12/001",
    transactionType: "sale",
    customerId: "cust-1-001",
    employeeId: "emp-1-002",
    transactionDate: "2024-12-10T10:30:00.000Z",
    dueDate: "2025-01-09T00:00:00.000Z",
    subtotal: 25000000,
    taxAmount: 2750000,
    discountAmount: 500000,
    totalAmount: 27250000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    notes: "Pembelian laptop untuk kantor pusat",
    isActive: true,
    createdAt: "2024-12-10T10:30:00.000Z",
    updatedAt: "2024-12-10T15:20:00.000Z",
  },
  {
    id: "trans-1-002",
    companyId: "company-1",
    transactionNumber: "INV/2024/12/002",
    transactionType: "sale",
    customerId: "cust-1-002",
    employeeId: "emp-1-001",
    transactionDate: "2024-12-08T14:15:00.000Z",
    subtotal: 5000000,
    taxAmount: 550000,
    discountAmount: 0,
    totalAmount: 5550000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Pembelian gaming setup",
    isActive: true,
    createdAt: "2024-12-08T14:15:00.000Z",
    updatedAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "trans-1-003",
    companyId: "company-1",
    transactionNumber: "INV/2024/12/003",
    transactionType: "sale",
    customerId: "cust-1-003",
    employeeId: "emp-1-002",
    transactionDate: "2024-12-05T09:00:00.000Z",
    dueDate: "2025-01-19T00:00:00.000Z",
    subtotal: 15000000,
    taxAmount: 1650000,
    discountAmount: 750000, // VIP discount 5%
    totalAmount: 15900000,
    paymentStatus: "pending",
    paymentMethod: "credit",
    notes: "Server upgrade untuk client VIP",
    isActive: true,
    createdAt: "2024-12-05T09:00:00.000Z",
    updatedAt: "2024-12-05T09:00:00.000Z",
  },

  // Sales transactions for Company 2 (CV. Dagang Sukses Mandiri)
  {
    id: "trans-2-001",
    companyId: "company-2",
    transactionNumber: "INV/2024/12/001",
    transactionType: "sale",
    customerId: "cust-2-001",
    employeeId: "emp-2-001",
    transactionDate: "2024-12-12T08:30:00.000Z",
    dueDate: "2024-12-19T00:00:00.000Z",
    subtotal: 2500000,
    taxAmount: 275000,
    discountAmount: 50000,
    totalAmount: 2725000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    notes: "Supply beras dan sembako untuk warung",
    isActive: true,
    createdAt: "2024-12-12T08:30:00.000Z",
    updatedAt: "2024-12-12T16:45:00.000Z",
  },
  {
    id: "trans-2-002",
    companyId: "company-2",
    transactionNumber: "INV/2024/12/002",
    transactionType: "sale",
    customerId: "cust-2-002",
    employeeId: "emp-2-002",
    transactionDate: "2024-12-11T16:20:00.000Z",
    subtotal: 150000,
    taxAmount: 0, // Under tax threshold
    discountAmount: 0,
    totalAmount: 150000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Belanja bulanan keluarga",
    isActive: true,
    createdAt: "2024-12-11T16:20:00.000Z",
    updatedAt: "2024-12-11T16:20:00.000Z",
  },

  // Sales transactions for Company 5 (PT. Berkah Food & Beverage) - Restaurant POS
  {
    id: "trans-5-001",
    companyId: "company-5",
    transactionNumber: "RCP/2024/12/001",
    transactionType: "sale",
    customerId: "cust-5-001", // Walk-in customer
    employeeId: "emp-5-001",
    transactionDate: "2024-12-12T12:15:00.000Z",
    subtotal: 85000,
    taxAmount: 9350,
    discountAmount: 0,
    totalAmount: 94350,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Makan siang - Nasi Gudeg + Es Teh",
    isActive: true,
    createdAt: "2024-12-12T12:15:00.000Z",
    updatedAt: "2024-12-12T12:15:00.000Z",
  },
  {
    id: "trans-5-002",
    companyId: "company-5",
    transactionNumber: "RCP/2024/12/002",
    transactionType: "sale",
    customerId: "cust-5-001",
    employeeId: "emp-5-002",
    transactionDate: "2024-12-12T19:30:00.000Z",
    subtotal: 120000,
    taxAmount: 13200,
    discountAmount: 0,
    totalAmount: 133200,
    paymentStatus: "paid",
    paymentMethod: "debit_card",
    notes: "Makan malam keluarga - Paket Ayam Bakar",
    isActive: true,
    createdAt: "2024-12-12T19:30:00.000Z",
    updatedAt: "2024-12-12T19:30:00.000Z",
  },

  // Service transaction for Company 6 (CV. Cahaya Motor)
  {
    id: "trans-6-001",
    companyId: "company-6",
    transactionNumber: "SVC/2024/12/001",
    transactionType: "sale",
    customerId: "cust-6-001",
    employeeId: "emp-6-001",
    transactionDate: "2024-12-01T10:00:00.000Z",
    subtotal: 350000,
    taxAmount: 38500,
    discountAmount: 17500, // Member discount
    totalAmount: 371000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Service rutin + ganti oli",
    isActive: true,
    createdAt: "2024-12-01T10:00:00.000Z",
    updatedAt: "2024-12-01T10:00:00.000Z",
  },

  // Purchase transactions
  {
    id: "trans-1-p001",
    companyId: "company-1",
    transactionNumber: "PO/2024/12/001",
    transactionType: "purchase",
    supplierId: "supp-1-001",
    employeeId: "emp-1-001",
    transactionDate: "2024-12-08T09:00:00.000Z",
    dueDate: "2025-01-07T00:00:00.000Z",
    subtotal: 100000000,
    taxAmount: 11000000,
    discountAmount: 2000000, // Volume discount
    totalAmount: 109000000,
    paymentStatus: "partial",
    paymentMethod: "credit",
    notes: "Purchase order laptop dan aksesoris",
    isActive: true,
    createdAt: "2024-12-08T09:00:00.000Z",
    updatedAt: "2024-12-10T10:00:00.000Z",
  },
  {
    id: "trans-2-p001",
    companyId: "company-2",
    transactionNumber: "PO/2024/12/001",
    transactionType: "purchase",
    supplierId: "supp-2-001",
    employeeId: "emp-2-001",
    transactionDate: "2024-12-06T07:00:00.000Z",
    dueDate: "2024-12-13T00:00:00.000Z",
    subtotal: 15000000,
    taxAmount: 1650000,
    discountAmount: 300000,
    totalAmount: 16350000,
    paymentStatus: "paid",
    paymentMethod: "transfer",
    notes: "Restok beras dan minyak goreng",
    isActive: true,
    createdAt: "2024-12-06T07:00:00.000Z",
    updatedAt: "2024-12-06T16:30:00.000Z",
  },
];

// Transaction Items table
export const transactionItems: TransactionItemTable[] = [
  // Items for trans-1-001 (Laptop sale)
  {
    id: "item-1-001-001",
    transactionId: "trans-1-001",
    productId: "prod-1-001", // ASUS ROG Laptop
    quantity: 5,
    unitPrice: 15000000,
    discount: 0,
    totalPrice: 75000000,
    notes: "Laptop untuk developer team",
    createdAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "item-1-001-002",
    transactionId: "trans-1-001",
    productId: "prod-1-003", // Wireless Mouse
    quantity: 10,
    unitPrice: 250000,
    discount: 0,
    totalPrice: 2500000,
    createdAt: "2024-12-10T10:30:00.000Z",
  },

  // Items for trans-1-002 (Gaming setup)
  {
    id: "item-1-002-001",
    transactionId: "trans-1-002",
    productId: "prod-1-002", // Mechanical Keyboard
    quantity: 1,
    unitPrice: 1500000,
    discount: 0,
    totalPrice: 1500000,
    createdAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "item-1-002-002",
    transactionId: "trans-1-002",
    productId: "prod-1-004", // Gaming Headset
    quantity: 1,
    unitPrice: 800000,
    discount: 0,
    totalPrice: 800000,
    createdAt: "2024-12-08T14:15:00.000Z",
  },

  // Items for trans-2-001 (Grocery wholesale)
  {
    id: "item-2-001-001",
    transactionId: "trans-2-001",
    productId: "prod-2-001", // Beras Premium
    quantity: 50,
    unitPrice: 15000,
    discount: 100,
    totalPrice: 740000,
    notes: "Karung 25kg",
    createdAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "item-2-001-002",
    transactionId: "trans-2-001",
    productId: "prod-2-002", // Minyak Goreng
    quantity: 20,
    unitPrice: 18000,
    discount: 0,
    totalPrice: 360000,
    notes: "Botol 1 liter",
    createdAt: "2024-12-12T08:30:00.000Z",
  },

  // Items for trans-5-001 (Restaurant order)
  {
    id: "item-5-001-001",
    transactionId: "trans-5-001",
    productId: "prod-5-001", // Nasi Gudeg
    quantity: 2,
    unitPrice: 25000,
    discount: 0,
    totalPrice: 50000,
    createdAt: "2024-12-12T12:15:00.000Z",
  },
  {
    id: "item-5-001-002",
    transactionId: "trans-5-001",
    productId: "prod-5-003", // Es Teh Manis
    quantity: 2,
    unitPrice: 8000,
    discount: 0,
    totalPrice: 16000,
    createdAt: "2024-12-12T12:15:00.000Z",
  },
];

// Payments table
export const payments: PaymentTable[] = [
  // Payment for trans-1-001
  {
    id: "pay-1-001",
    companyId: "company-1",
    transactionId: "trans-1-001",
    paymentNumber: "PAY/2024/12/001",
    paymentDate: "2024-12-10T15:20:00.000Z",
    paymentMethod: "transfer",
    amount: 27250000,
    notes: "Transfer dari PT. Solusi Digital",
    employeeId: "emp-1-002",
    createdAt: "2024-12-10T15:20:00.000Z",
  },
  // Partial payment for purchase trans-1-p001
  {
    id: "pay-1-p001-1",
    companyId: "company-1",
    transactionId: "trans-1-p001",
    paymentNumber: "PAY/2024/12/002",
    paymentDate: "2024-12-10T10:00:00.000Z",
    paymentMethod: "transfer",
    amount: 50000000,
    notes: "Pembayaran DP 50%",
    employeeId: "emp-1-001",
    createdAt: "2024-12-10T10:00:00.000Z",
  },
  // Payment for trans-2-001
  {
    id: "pay-2-001",
    companyId: "company-2",
    transactionId: "trans-2-001",
    paymentNumber: "PAY/2024/12/003",
    paymentDate: "2024-12-12T16:45:00.000Z",
    paymentMethod: "transfer",
    amount: 2725000,
    notes: "Transfer dari Warung Sari Rasa",
    employeeId: "emp-2-001",
    createdAt: "2024-12-12T16:45:00.000Z",
  },
];

// Helper functions
export const getTransactionById = (
  id: string
): TransactionTable | undefined => {
  return transactions.find((transaction) => transaction.id === id);
};

export const getTransactionsByCompanyId = (
  companyId: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) => transaction.companyId === companyId && transaction.isActive
  );
};

export const getTransactionsByType = (
  companyId: string,
  type: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) =>
      transaction.companyId === companyId &&
      transaction.transactionType === type &&
      transaction.isActive
  );
};

export const getTransactionsByCustomer = (
  customerId: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) =>
      transaction.customerId === customerId && transaction.isActive
  );
};

export const getTransactionsBySupplier = (
  supplierId: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) =>
      transaction.supplierId === supplierId && transaction.isActive
  );
};

export const getTransactionsByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) =>
      transaction.companyId === companyId &&
      transaction.transactionDate >= startDate &&
      transaction.transactionDate <= endDate &&
      transaction.isActive
  );
};

export const getTransactionsByPaymentStatus = (
  companyId: string,
  status: string
): TransactionTable[] => {
  return transactions.filter(
    (transaction) =>
      transaction.companyId === companyId &&
      transaction.paymentStatus === status &&
      transaction.isActive
  );
};

export const getTransactionItems = (
  transactionId: string
): TransactionItemTable[] => {
  return transactionItems.filter(
    (item) => item.transactionId === transactionId
  );
};

export const getPaymentsByTransaction = (
  transactionId: string
): PaymentTable[] => {
  return payments.filter((payment) => payment.transactionId === transactionId);
};

export const getPaymentsByCompany = (companyId: string): PaymentTable[] => {
  return payments.filter((payment) => payment.companyId === companyId);
};

// Statistics helpers
export const getTransactionStatistics = (
  companyId: string,
  dateFrom?: string,
  dateTo?: string
) => {
  let companyTransactions = getTransactionsByCompanyId(companyId);

  if (dateFrom && dateTo) {
    companyTransactions = getTransactionsByDateRange(
      companyId,
      dateFrom,
      dateTo
    );
  }

  const sales = companyTransactions.filter((t) => t.transactionType === "sale");
  const purchases = companyTransactions.filter(
    (t) => t.transactionType === "purchase"
  );
  const returns = companyTransactions.filter((t) =>
    t.transactionType.includes("return")
  );

  return {
    totalTransactions: companyTransactions.length,
    totalSales: sales.length,
    totalPurchases: purchases.length,
    totalReturns: returns.length,

    salesRevenue: sales.reduce((sum, t) => sum + t.totalAmount, 0),
    purchaseExpenses: purchases.reduce((sum, t) => sum + t.totalAmount, 0),
    netRevenue:
      sales.reduce((sum, t) => sum + t.totalAmount, 0) -
      purchases.reduce((sum, t) => sum + t.totalAmount, 0),

    pendingPayments: companyTransactions.filter(
      (t) => t.paymentStatus === "pending"
    ).length,
    overduePayments: companyTransactions.filter(
      (t) => t.paymentStatus === "overdue"
    ).length,

    averageSaleValue:
      sales.length > 0
        ? sales.reduce((sum, t) => sum + t.totalAmount, 0) / sales.length
        : 0,
    averagePurchaseValue:
      purchases.length > 0
        ? purchases.reduce((sum, t) => sum + t.totalAmount, 0) /
          purchases.length
        : 0,
  };
};

export const getDailyTransactionSummary = (companyId: string, date: string) => {
  const dayTransactions = transactions.filter(
    (t) =>
      t.companyId === companyId &&
      t.transactionDate.startsWith(date) &&
      t.isActive
  );

  const sales = dayTransactions.filter((t) => t.transactionType === "sale");

  return {
    date,
    totalTransactions: dayTransactions.length,
    totalSales: sales.length,
    dailyRevenue: sales.reduce((sum, t) => sum + t.totalAmount, 0),
    cashSales: sales
      .filter((t) => t.paymentMethod === "cash")
      .reduce((sum, t) => sum + t.totalAmount, 0),
    creditSales: sales
      .filter((t) => t.paymentMethod === "credit")
      .reduce((sum, t) => sum + t.totalAmount, 0),
    cardSales: sales
      .filter((t) => ["credit_card", "debit_card"].includes(t.paymentMethod!))
      .reduce((sum, t) => sum + t.totalAmount, 0),
  };
};
