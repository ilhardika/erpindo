/**
 * POS Store - Point of Sale Management
 * Handles cart operations, discounts, payments, and cashier shifts
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Product, Customer } from '@/types/database';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  lineTotal: number;
  barcode?: string;
}

export interface Discount {
  type: 'percentage' | 'fixed_amount';
  value: number;
  description?: string;
}

export interface Payment {
  method: 'cash' | 'bank_transfer' | 'qr_code';
  amount: number;
  reference?: string; // For bank transfer or QR code
  receivedAmount?: number; // For cash payments
  change?: number;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalTransactions: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface PosTransaction {
  id: string;
  orderNumber: string;
  customer?: Customer;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  payment: Payment;
  cashierShiftId: string;
  timestamp: Date;
  notes?: string;
  refundId?: string; // If this is a refund transaction
  originalTransactionId?: string; // If this is a refund
}

export interface RefundRequest {
  originalTransactionId: string;
  items: Array<{
    cartItemId: string;
    quantityToRefund: number;
    reason: string;
  }>;
  reason: string;
  refundAmount: number;
}

// ============================================================================
// POS STORE INTERFACE
// ============================================================================

interface PosState {
  // Cart Management
  cart: CartItem[];
  selectedCustomer: Customer | null;
  discount: Discount | null;
  taxRate: number;
  
  // Calculations
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Payment
  currentPayment: Payment | null;
  
  // Cashier Shift
  currentShift: CashierShift | null;
  shiftHistory: CashierShift[];
  
  // Transaction History
  transactions: PosTransaction[];
  
  // UI State
  isProcessingPayment: boolean;
  isGeneratingInvoice: boolean;
  lastInvoiceUrl: string | null;
  
  // Search State
  productSearchQuery: string;
  barcodeInput: string;
}

interface PosActions {
  // Cart Management
  addToCart: (product: Product, quantity?: number, barcode?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  updateCartItemDiscount: (itemId: string, discountPercent: number) => void;
  clearCart: () => void;
  
  // Customer & Discount
  setSelectedCustomer: (customer: Customer | null) => void;
  applyDiscount: (discount: Discount) => void;
  removeDiscount: () => void;
  
  // Barcode & Search
  setBarcodeInput: (barcode: string) => void;
  setProductSearchQuery: (query: string) => void;
  addProductByBarcode: (barcode: string) => Promise<boolean>;
  
  // Payment Processing
  setPaymentMethod: (method: Payment['method']) => void;
  setPaymentAmount: (amount: number) => void;
  setReceivedAmount: (amount: number) => void;
  calculateChange: () => number;
  processPayment: () => Promise<string | null>; // Returns transaction ID
  
  // Invoice Generation
  generateInvoice: (transactionId: string) => Promise<string | null>; // Returns PDF URL
  downloadInvoice: (invoiceUrl: string) => void;
  
  // Refund Processing
  processRefund: (refundRequest: RefundRequest) => Promise<string | null>;
  
  // Cashier Shift Management
  openShift: (cashierId: string, cashierName: string, startingCash: number) => void;
  closeShift: (endingCash: number, notes?: string) => void;
  getCurrentShiftSummary: () => {
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    cashTransactions: number;
    nonCashTransactions: number;
  };
  
  // Calculations
  calculateTotals: () => void;
  
  // Reset & Cleanup
  resetTransaction: () => void;
  
  // Data Management
  loadTransactionHistory: () => Promise<void>;
  exportShiftReport: (shiftId: string) => Promise<string>; // Returns report URL
}

// ============================================================================
// POS STORE IMPLEMENTATION
// ============================================================================

export const usePosStore = create<PosState & PosActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        cart: [],
        selectedCustomer: null,
        discount: null,
        taxRate: 0.11, // 11% PPN Indonesia
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        currentPayment: null,
        currentShift: null,
        shiftHistory: [],
        transactions: [],
        isProcessingPayment: false,
        isGeneratingInvoice: false,
        lastInvoiceUrl: null,
        productSearchQuery: '',
        barcodeInput: '',

        // Cart Management Actions
        addToCart: (product: Product, quantity = 1, barcode) => {
          const state = get();
          const existingItemIndex = state.cart.findIndex(
            item => item.product.id === product.id
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex].quantity += quantity;
            updatedCart[existingItemIndex].lineTotal = 
              updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].unitPrice * 
              (1 - updatedCart[existingItemIndex].discountPercent / 100) - 
              updatedCart[existingItemIndex].discountAmount;
            
            set({ cart: updatedCart });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: crypto.randomUUID(),
              product,
              quantity,
              unitPrice: product.selling_price,
              discountPercent: 0,
              discountAmount: 0,
              lineTotal: quantity * product.selling_price,
              barcode
            };
            set({ cart: [...state.cart, newItem] });
          }
          
          get().calculateTotals();
        },

        removeFromCart: (itemId: string) => {
          const state = get();
          set({ cart: state.cart.filter(item => item.id !== itemId) });
          get().calculateTotals();
        },

        updateCartItemQuantity: (itemId: string, quantity: number) => {
          const state = get();
          if (quantity <= 0) {
            get().removeFromCart(itemId);
            return;
          }

          const updatedCart = state.cart.map(item => {
            if (item.id === itemId) {
              const lineTotal = quantity * item.unitPrice * (1 - item.discountPercent / 100) - item.discountAmount;
              return { ...item, quantity, lineTotal };
            }
            return item;
          });
          
          set({ cart: updatedCart });
          get().calculateTotals();
        },

        updateCartItemDiscount: (itemId: string, discountPercent: number) => {
          const state = get();
          const updatedCart = state.cart.map(item => {
            if (item.id === itemId) {
              const lineTotal = item.quantity * item.unitPrice * (1 - discountPercent / 100) - item.discountAmount;
              return { ...item, discountPercent, lineTotal };
            }
            return item;
          });
          
          set({ cart: updatedCart });
          get().calculateTotals();
        },

        clearCart: () => {
          set({ 
            cart: [], 
            selectedCustomer: null, 
            discount: null,
            currentPayment: null,
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            totalAmount: 0
          });
        },

        // Customer & Discount Actions
        setSelectedCustomer: (customer: Customer | null) => {
          set({ selectedCustomer: customer });
        },

        applyDiscount: (discount: Discount) => {
          set({ discount });
          get().calculateTotals();
        },

        removeDiscount: () => {
          set({ discount: null });
          get().calculateTotals();
        },

        // Barcode & Search Actions
        setBarcodeInput: (barcode: string) => {
          set({ barcodeInput: barcode });
        },

        setProductSearchQuery: (query: string) => {
          set({ productSearchQuery: query });
        },

        addProductByBarcode: async (barcode: string) => {
          try {
            // This would typically fetch from the product service
            // For now, we'll simulate the lookup
            // TODO: Implement actual barcode lookup
            console.log('Looking up product with barcode:', barcode);
            return false; // Product not found
          } catch (error) {
            console.error('Error looking up product by barcode:', error);
            return false;
          }
        },

        // Payment Actions
        setPaymentMethod: (method: Payment['method']) => {
          const state = get();
          set({ 
            currentPayment: { 
              ...state.currentPayment,
              method,
              amount: state.totalAmount
            } as Payment
          });
        },

        setPaymentAmount: (amount: number) => {
          const state = get();
          set({ 
            currentPayment: { 
              ...state.currentPayment,
              amount
            } as Payment
          });
        },

        setReceivedAmount: (receivedAmount: number) => {
          const state = get();
          if (state.currentPayment?.method === 'cash') {
            const change = receivedAmount - state.totalAmount;
            set({ 
              currentPayment: { 
                ...state.currentPayment,
                receivedAmount,
                change: Math.max(0, change)
              } as Payment
            });
          }
        },

        calculateChange: () => {
          const state = get();
          if (state.currentPayment?.method === 'cash' && state.currentPayment.receivedAmount) {
            return Math.max(0, state.currentPayment.receivedAmount - state.totalAmount);
          }
          return 0;
        },

        processPayment: async () => {
          const state = get();
          if (!state.currentPayment || !state.currentShift) {
            throw new Error('Payment information or cashier shift missing');
          }

          set({ isProcessingPayment: true });

          try {
            // Generate order number
            const orderNumber = `POS-${Date.now()}`;
            
            // Create transaction
            const transaction: PosTransaction = {
              id: crypto.randomUUID(),
              orderNumber,
              customer: state.selectedCustomer || undefined,
              items: [...state.cart],
              subtotal: state.subtotal,
              taxAmount: state.taxAmount,
              discountAmount: state.discountAmount,
              totalAmount: state.totalAmount,
              payment: { ...state.currentPayment },
              cashierShiftId: state.currentShift.id,
              timestamp: new Date(),
            };

            // Update shift totals
            const updatedShift = {
              ...state.currentShift,
              totalSales: state.currentShift.totalSales + state.totalAmount,
              totalTransactions: state.currentShift.totalTransactions + 1
            };

            // Save transaction (this would typically go to the database)
            set({ 
              transactions: [...state.transactions, transaction],
              currentShift: updatedShift,
              isProcessingPayment: false
            });

            // Clear current transaction
            get().resetTransaction();

            return transaction.id;
          } catch (error) {
            console.error('Error processing payment:', error);
            set({ isProcessingPayment: false });
            throw error;
          }
        },

        // Invoice Generation
        generateInvoice: async (transactionId: string) => {
          const state = get();
          const transaction = state.transactions.find(t => t.id === transactionId);
          
          if (!transaction) {
            throw new Error('Transaction not found');
          }

          set({ isGeneratingInvoice: true });

          try {
            // This would typically call a service to generate PDF
            // For now, we'll simulate the process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const invoiceUrl = `invoices/${transaction.orderNumber}.pdf`;
            set({ 
              lastInvoiceUrl: invoiceUrl,
              isGeneratingInvoice: false 
            });
            
            return invoiceUrl;
          } catch (error) {
            console.error('Error generating invoice:', error);
            set({ isGeneratingInvoice: false });
            throw error;
          }
        },

        downloadInvoice: (invoiceUrl: string) => {
          // Trigger download
          const link = document.createElement('a');
          link.href = invoiceUrl;
          link.download = invoiceUrl.split('/').pop() || 'invoice.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },

        // Refund Processing
        processRefund: async (refundRequest: RefundRequest) => {
          const state = get();
          const originalTransaction = state.transactions.find(
            t => t.id === refundRequest.originalTransactionId
          );

          if (!originalTransaction) {
            throw new Error('Original transaction not found');
          }

          if (!state.currentShift) {
            throw new Error('No active cashier shift');
          }

          try {
            // Create refund transaction
            const refundTransaction: PosTransaction = {
              id: crypto.randomUUID(),
              orderNumber: `REF-${originalTransaction.orderNumber}`,
              customer: originalTransaction.customer,
              items: refundRequest.items.map(refundItem => {
                const originalItem = originalTransaction.items.find(
                  item => item.id === refundItem.cartItemId
                );
                if (!originalItem) throw new Error('Original item not found');
                
                return {
                  ...originalItem,
                  id: crypto.randomUUID(),
                  quantity: -refundItem.quantityToRefund,
                  lineTotal: -(refundItem.quantityToRefund * originalItem.unitPrice * (1 - originalItem.discountPercent / 100) - originalItem.discountAmount)
                };
              }),
              subtotal: -refundRequest.refundAmount,
              taxAmount: 0,
              discountAmount: 0,
              totalAmount: -refundRequest.refundAmount,
              payment: { method: 'cash', amount: -refundRequest.refundAmount },
              cashierShiftId: state.currentShift.id,
              timestamp: new Date(),
              refundId: crypto.randomUUID(),
              originalTransactionId: refundRequest.originalTransactionId,
              notes: refundRequest.reason
            };

            // Update shift totals
            const updatedShift = {
              ...state.currentShift,
              totalSales: state.currentShift.totalSales - refundRequest.refundAmount,
              totalTransactions: state.currentShift.totalTransactions + 1
            };

            set({ 
              transactions: [...state.transactions, refundTransaction],
              currentShift: updatedShift
            });

            return refundTransaction.id;
          } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
          }
        },

        // Cashier Shift Management
        openShift: (cashierId: string, cashierName: string, startingCash: number) => {
          const newShift: CashierShift = {
            id: crypto.randomUUID(),
            cashierId,
            cashierName,
            startTime: new Date(),
            startingCash,
            totalSales: 0,
            totalTransactions: 0,
            status: 'open'
          };
          
          set({ currentShift: newShift });
        },

        closeShift: (endingCash: number, notes?: string) => {
          const state = get();
          if (!state.currentShift) return;

          const closedShift = {
            ...state.currentShift,
            endTime: new Date(),
            endingCash,
            status: 'closed' as const,
            notes
          };

          set({ 
            currentShift: null,
            shiftHistory: [...state.shiftHistory, closedShift]
          });
        },

        getCurrentShiftSummary: () => {
          const state = get();
          if (!state.currentShift) {
            return {
              totalSales: 0,
              totalTransactions: 0,
              averageTransaction: 0,
              cashTransactions: 0,
              nonCashTransactions: 0
            };
          }

          const shiftTransactions = state.transactions.filter(
            t => t.cashierShiftId === state.currentShift?.id
          );

          const cashTransactions = shiftTransactions.filter(t => t.payment.method === 'cash').length;
          const nonCashTransactions = shiftTransactions.length - cashTransactions;

          return {
            totalSales: state.currentShift.totalSales,
            totalTransactions: state.currentShift.totalTransactions,
            averageTransaction: state.currentShift.totalTransactions > 0 
              ? state.currentShift.totalSales / state.currentShift.totalTransactions 
              : 0,
            cashTransactions,
            nonCashTransactions
          };
        },

        // Calculations
        calculateTotals: () => {
          const state = get();
          
          // Calculate subtotal from cart items
          const subtotal = state.cart.reduce((sum, item) => sum + item.lineTotal, 0);
          
          // Apply global discount
          let discountAmount = 0;
          if (state.discount) {
            if (state.discount.type === 'percentage') {
              discountAmount = subtotal * (state.discount.value / 100);
            } else {
              discountAmount = state.discount.value;
            }
          }
          
          const subtotalAfterDiscount = subtotal - discountAmount;
          const taxAmount = subtotalAfterDiscount * state.taxRate;
          const totalAmount = subtotalAfterDiscount + taxAmount;
          
          set({
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount
          });
        },

        // Reset & Cleanup
        resetTransaction: () => {
          set({
            cart: [],
            selectedCustomer: null,
            discount: null,
            currentPayment: null,
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            totalAmount: 0,
            barcodeInput: '',
            productSearchQuery: ''
          });
        },

        // Data Management
        loadTransactionHistory: async () => {
          // This would typically load from database
          // For now, we'll keep the existing transactions
          console.log('Loading transaction history...');
        },

        exportShiftReport: async (shiftId: string) => {
          const state = get();
          const shift = state.shiftHistory.find(s => s.id === shiftId) || state.currentShift;
          
          if (!shift) {
            throw new Error('Shift not found');
          }

          // This would typically generate a report file
          // For now, we'll simulate the process
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return `reports/shift-${shift.id}.pdf`;
        }
      }),
      {
        name: 'pos-store',
        // Only persist essential data, not UI state
        partialize: (state) => ({
          currentShift: state.currentShift,
          shiftHistory: state.shiftHistory,
          transactions: state.transactions,
          taxRate: state.taxRate
        })
      }
    ),
    { name: 'POS Store' }
  )
);

export default usePosStore;