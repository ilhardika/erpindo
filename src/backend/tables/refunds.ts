import { refundsData } from "../data/refunds";

export interface RefundTable {
  id: string;
  originalTransactionId: string;
  refundDate: string;
  refundAmount: number;
  reason: string;
  employeeId: string;
  companyId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

// Import refunds data from data layer
export const refunds = refundsData;

// Re-export the type from data layer
export type Refund = (typeof refundsData)[0];
