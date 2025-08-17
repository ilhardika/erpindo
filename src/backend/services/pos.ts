import { TransactionTable, ProductTable, POSShift, Refund } from "../tables";
import {
  transactionsData,
  productsData,
  posShiftsData,
  refundsData,
} from "../data";

export class POSService {
  // Transaction Methods
  static async createTransaction(
    transactionData: Omit<TransactionTable, "id" | "createdAt" | "updatedAt">
  ): Promise<TransactionTable> {
    const newTransaction: TransactionTable = {
      ...transactionData,
      id: `trans-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock database
    transactionsData.push(newTransaction);
    return newTransaction;
  }

  static async getTransactionsByShift(
    shiftId: string
  ): Promise<TransactionTable[]> {
    // In real implementation, transactions would have shiftId field
    // For now, return transactions by date/employee
    const shift = posShiftsData.find((s) => s.id === shiftId);
    if (!shift) return [];

    return transactionsData.filter(
      (t) =>
        t.employeeId === shift.employeeId &&
        t.transactionDate === shift.shiftDate &&
        t.companyId === shift.companyId
    );
  }

  // Shift Methods
  static async openShift(
    employeeId: string,
    companyId: string,
    openingCash: number
  ): Promise<POSShift> {
    // Check if there's already an open shift for this employee
    const existingOpenShift = posShiftsData.find(
      (s) =>
        s.employeeId === employeeId &&
        s.companyId === companyId &&
        s.status === "open"
    );

    if (existingOpenShift) {
      throw new Error(
        "Shift sudah dibuka. Tutup shift sebelumnya terlebih dahulu."
      );
    }

    const newShift: POSShift = {
      id: `shift-${Date.now()}`,
      employeeId,
      companyId,
      shiftDate: new Date().toISOString().split("T")[0],
      openTime: new Date().toLocaleTimeString("id-ID", { hour12: false }),
      openingCash,
      totalSales: 0,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posShiftsData.push(newShift);
    return newShift;
  }

  static async closeShift(
    shiftId: string,
    closingCash: number
  ): Promise<POSShift> {
    const shiftIndex = posShiftsData.findIndex((s) => s.id === shiftId);
    if (shiftIndex === -1) {
      throw new Error("Shift tidak ditemukan");
    }

    if (posShiftsData[shiftIndex].status === "closed") {
      throw new Error("Shift sudah ditutup");
    }

    // Calculate total sales for this shift
    const shiftTransactions = await this.getTransactionsByShift(shiftId);
    const totalSales = shiftTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0
    );

    const updatedShift: POSShift = {
      ...posShiftsData[shiftIndex],
      closeTime: new Date().toLocaleTimeString("id-ID", { hour12: false }),
      closingCash,
      totalSales,
      status: "closed",
      updatedAt: new Date().toISOString(),
    };

    posShiftsData[shiftIndex] = updatedShift;
    return updatedShift;
  }

  static async getCurrentShift(
    employeeId: string,
    companyId: string
  ): Promise<POSShift | null> {
    const currentShift = posShiftsData.find(
      (s) =>
        s.employeeId === employeeId &&
        s.companyId === companyId &&
        s.status === "open" &&
        s.shiftDate === new Date().toISOString().split("T")[0]
    );

    return currentShift || null;
  }

  static async getShiftHistory(
    employeeId: string,
    companyId: string
  ): Promise<POSShift[]> {
    return posShiftsData
      .filter((s) => s.employeeId === employeeId && s.companyId === companyId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  // Refund Methods
  static async createRefund(
    refundData: Omit<Refund, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<Refund> {
    // Check if original transaction exists
    const originalTransaction = transactionsData.find(
      (t) => t.id === refundData.originalTransactionId
    );

    if (!originalTransaction) {
      throw new Error("Transaksi asli tidak ditemukan");
    }

    if (refundData.refundAmount > originalTransaction.totalAmount) {
      throw new Error(
        "Jumlah refund tidak boleh lebih besar dari total transaksi"
      );
    }

    const newRefund: Refund = {
      ...refundData,
      id: `refund-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    refundsData.push(newRefund);
    return newRefund;
  }

  static async approveRefund(refundId: string): Promise<Refund> {
    const refundIndex = refundsData.findIndex((r) => r.id === refundId);
    if (refundIndex === -1) {
      throw new Error("Refund tidak ditemukan");
    }

    const updatedRefund: Refund = {
      ...refundsData[refundIndex],
      status: "approved",
      updatedAt: new Date().toISOString(),
    };

    refundsData[refundIndex] = updatedRefund;
    return updatedRefund;
  }

  static async rejectRefund(refundId: string): Promise<Refund> {
    const refundIndex = refundsData.findIndex((r) => r.id === refundId);
    if (refundIndex === -1) {
      throw new Error("Refund tidak ditemukan");
    }

    const updatedRefund: Refund = {
      ...refundsData[refundIndex],
      status: "rejected",
      updatedAt: new Date().toISOString(),
    };

    refundsData[refundIndex] = updatedRefund;
    return updatedRefund;
  }

  static async getRefundsByCompany(companyId: string): Promise<Refund[]> {
    return refundsData
      .filter((r) => r.companyId === companyId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  // Product Methods for POS
  static async getProductByBarcode(
    barcode: string
  ): Promise<ProductTable | null> {
    const product = productsData.find((p) => p.barcode === barcode);
    return product || null;
  }

  static async searchProducts(
    query: string,
    companyId: string
  ): Promise<ProductTable[]> {
    return productsData.filter(
      (p) =>
        p.companyId === companyId &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.barcode?.includes(query) ||
          p.sku?.includes(query))
    );
  }

  // Utility Methods
  static calculateDiscountAmount(
    subtotal: number,
    discountType: "percentage" | "nominal",
    discountValue: number
  ): number {
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }

  static calculateTax(subtotal: number, taxRate: number = 11): number {
    return (subtotal * taxRate) / 100;
  }

  static calculateTotal(
    subtotal: number,
    discountAmount: number = 0,
    taxAmount: number = 0
  ): number {
    return subtotal - discountAmount + taxAmount;
  }
}
