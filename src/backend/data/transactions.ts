export interface TransactionData {
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

export interface TransactionItemData {
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

export interface PaymentData {
  id: string;
  companyId: string;
  transactionId: string;
  paymentNumber: string;
  paymentDate: string;
  paymentMethod: "cash" | "transfer" | "credit_card" | "debit_card" | "other";
  amount: number;
  notes?: string;
  employeeId?: string;
  createdAt: string;
}

// Transactions data
export const transactionsData: TransactionData[] = [
  {
    id: "trans-1-001",
    companyId: "company-1",
    transactionNumber: "INV/2024/12/001",
    transactionType: "sale",
    customerId: "cust-1-001",
    employeeId: "emp-1-002",
    transactionDate: "2024-12-10T10:30:00.000Z",
    dueDate: "2025-01-09T00:00:00.000Z",
    subtotal: 77500000,
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
    subtotal: 2300000,
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
    discountAmount: 750000,
    totalAmount: 15900000,
    paymentStatus: "pending",
    paymentMethod: "credit",
    notes: "Server upgrade untuk client VIP",
    isActive: true,
    createdAt: "2024-12-05T09:00:00.000Z",
    updatedAt: "2024-12-05T09:00:00.000Z",
  },
  {
    id: "trans-2-001",
    companyId: "company-2",
    transactionNumber: "INV/2024/12/001",
    transactionType: "sale",
    customerId: "cust-2-001",
    employeeId: "emp-2-001",
    transactionDate: "2024-12-12T08:30:00.000Z",
    dueDate: "2024-12-19T00:00:00.000Z",
    subtotal: 1100000,
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
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 150000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Belanja bulanan keluarga",
    isActive: true,
    createdAt: "2024-12-11T16:20:00.000Z",
    updatedAt: "2024-12-11T16:20:00.000Z",
  },
  {
    id: "trans-5-001",
    companyId: "company-5",
    transactionNumber: "RCP/2024/12/001",
    transactionType: "sale",
    customerId: "cust-5-001",
    employeeId: "emp-5-001",
    transactionDate: "2024-12-12T12:15:00.000Z",
    subtotal: 66000,
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
    discountAmount: 17500,
    totalAmount: 371000,
    paymentStatus: "paid",
    paymentMethod: "cash",
    notes: "Service rutin + ganti oli",
    isActive: true,
    createdAt: "2024-12-01T10:00:00.000Z",
    updatedAt: "2024-12-01T10:00:00.000Z",
  },
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
    discountAmount: 2000000,
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

// Transaction Items data
export const transactionItemsData: TransactionItemData[] = [
  {
    id: "item-1-001-001",
    transactionId: "trans-1-001",
    productId: "prod-1-001",
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
    productId: "prod-1-003",
    quantity: 10,
    unitPrice: 250000,
    discount: 0,
    totalPrice: 2500000,
    createdAt: "2024-12-10T10:30:00.000Z",
  },
  {
    id: "item-1-002-001",
    transactionId: "trans-1-002",
    productId: "prod-1-002",
    quantity: 1,
    unitPrice: 1500000,
    discount: 0,
    totalPrice: 1500000,
    createdAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "item-1-002-002",
    transactionId: "trans-1-002",
    productId: "prod-1-004",
    quantity: 1,
    unitPrice: 800000,
    discount: 0,
    totalPrice: 800000,
    createdAt: "2024-12-08T14:15:00.000Z",
  },
  {
    id: "item-2-001-001",
    transactionId: "trans-2-001",
    productId: "prod-2-001",
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
    productId: "prod-2-002",
    quantity: 20,
    unitPrice: 18000,
    discount: 0,
    totalPrice: 360000,
    notes: "Botol 1 liter",
    createdAt: "2024-12-12T08:30:00.000Z",
  },
  {
    id: "item-5-001-001",
    transactionId: "trans-5-001",
    productId: "prod-5-001",
    quantity: 2,
    unitPrice: 25000,
    discount: 0,
    totalPrice: 50000,
    createdAt: "2024-12-12T12:15:00.000Z",
  },
  {
    id: "item-5-001-002",
    transactionId: "trans-5-001",
    productId: "prod-5-003",
    quantity: 2,
    unitPrice: 8000,
    discount: 0,
    totalPrice: 16000,
    createdAt: "2024-12-12T12:15:00.000Z",
  },
];

// Payments data
export const paymentsData: PaymentData[] = [
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
