// Define interfaces
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

// Import transactions data from data layer
import {
  transactionsData,
  transactionItemsData,
  paymentsData,
} from "../data/transactions";

export const transactions = transactionsData;
export const transactionItems = transactionItemsData;
export const payments = paymentsData;

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
    (transaction) => transaction.companyId === companyId
  );
};
