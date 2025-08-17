import { posShiftsData } from "../data/posShifts";

export interface POSShiftTable {
  id: string;
  employeeId: string;
  companyId: string;
  shiftDate: string;
  openTime: string;
  closeTime?: string;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

// Import POS shifts data from data layer
export const posShifts = posShiftsData;

// Re-export the type from data layer
export type POSShift = (typeof posShiftsData)[0];
