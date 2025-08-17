import {
  transactionsData,
  transactionItemsData,
  paymentsData,
  type TransactionData,
  type TransactionItemData,
  type PaymentData,
} from "../data/transactions";

export interface TransactionTable extends TransactionData {}

export interface TransactionItemTable extends TransactionItemData {}

export interface PaymentTable extends PaymentData {}

// Import transactions data from data layer
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
