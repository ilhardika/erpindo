export interface AttendanceData {
  id: string;
  companyId: string; // Foreign key to companies table
  employeeId: string; // Foreign key to employees table
  attendanceDate: string; // YYYY-MM-DD format
  shiftId?: string; // Foreign key to shifts table
  checkIn?: string; // ISO timestamp
  checkOut?: string; // ISO timestamp
  breakStart?: string; // ISO timestamp
  breakEnd?: string; // ISO timestamp
  workHours: number; // Total work hours
  overTimeHours: number; // Overtime hours
  lateMinutes: number; // Late arrival in minutes
  earlyLeaveMinutes: number; // Early leave in minutes
  status:
    | "present"
    | "absent"
    | "late"
    | "half_day"
    | "sick"
    | "permission"
    | "holiday";
  location?: string; // Check-in location
  notes?: string;
  approvedBy?: string; // Employee ID who approved (for sick/permission)
  createdAt: string;
  updatedAt: string;
}

export interface ShiftData {
  id: string;
  companyId: string; // Foreign key to companies table
  shiftName: string;
  startTime: string; // HH:MM format (24-hour)
  endTime: string; // HH:MM format (24-hour)
  breakDuration: number; // Break duration in minutes
  totalHours: number; // Total work hours excluding break
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveData {
  id: string;
  companyId: string; // Foreign key to companies table
  employeeId: string; // Foreign key to employees table
  leaveType: "annual" | "sick" | "maternity" | "emergency" | "unpaid";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PayrollData {
  id: string;
  companyId: string; // Foreign key to companies table
  employeeId: string; // Foreign key to employees table
  payPeriod: string; // YYYY-MM format
  baseSalary: number;
  overtimeAmount: number;
  allowances: number; // Transport, meal, etc.
  bonuses: number;
  deductions: number; // Tax, insurance, etc.
  grossPay: number; // Before deductions
  netPay: number; // After deductions
  workDays: number;
  overtimeHours: number;
  leaveDays: number;
  status: "draft" | "approved" | "paid";
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Shifts data
export const shiftsData: ShiftData[] = [
  {
    id: "shift-1-001",
    companyId: "company-1",
    shiftName: "Regular Office Hours",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60,
    totalHours: 7,
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "shift-1-002",
    companyId: "company-1",
    shiftName: "Flexible Hours",
    startTime: "10:00",
    endTime: "18:00",
    breakDuration: 60,
    totalHours: 7,
    isActive: true,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "shift-2-001",
    companyId: "company-2",
    shiftName: "Morning Shift",
    startTime: "07:00",
    endTime: "15:00",
    breakDuration: 30,
    totalHours: 7.5,
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-02-25T00:00:00.000Z",
  },
  {
    id: "shift-2-002",
    companyId: "company-2",
    shiftName: "Afternoon Shift",
    startTime: "13:00",
    endTime: "21:00",
    breakDuration: 30,
    totalHours: 7.5,
    isActive: true,
    createdAt: "2024-02-25T00:00:00.000Z",
    updatedAt: "2024-02-25T00:00:00.000Z",
  },
  {
    id: "shift-5-001",
    companyId: "company-5",
    shiftName: "Morning Shift",
    startTime: "06:00",
    endTime: "14:00",
    breakDuration: 30,
    totalHours: 7.5,
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "shift-5-002",
    companyId: "company-5",
    shiftName: "Evening Shift",
    startTime: "14:00",
    endTime: "22:00",
    breakDuration: 30,
    totalHours: 7.5,
    isActive: true,
    createdAt: "2024-05-15T00:00:00.000Z",
    updatedAt: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "shift-6-001",
    companyId: "company-6",
    shiftName: "Workshop Hours",
    startTime: "08:00",
    endTime: "17:00",
    breakDuration: 60,
    totalHours: 8,
    isActive: true,
    createdAt: "2024-06-20T00:00:00.000Z",
    updatedAt: "2024-06-20T00:00:00.000Z",
  },
];

// Attendance data
export const attendanceData: AttendanceData[] = [
  {
    id: "att-1-001",
    companyId: "company-1",
    employeeId: "emp-1-001",
    attendanceDate: "2024-12-12",
    shiftId: "shift-1-001",
    checkIn: "2024-12-12T08:55:00.000Z",
    checkOut: "2024-12-12T17:10:00.000Z",
    breakStart: "2024-12-12T12:00:00.000Z",
    breakEnd: "2024-12-12T13:00:00.000Z",
    workHours: 7.25,
    overTimeHours: 0.17,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Jakarta Office",
    createdAt: "2024-12-12T08:55:00.000Z",
    updatedAt: "2024-12-12T17:10:00.000Z",
  },
  {
    id: "att-1-002",
    companyId: "company-1",
    employeeId: "emp-1-002",
    attendanceDate: "2024-12-12",
    shiftId: "shift-1-002",
    checkIn: "2024-12-12T10:15:00.000Z",
    checkOut: "2024-12-12T18:00:00.000Z",
    breakStart: "2024-12-12T13:00:00.000Z",
    breakEnd: "2024-12-12T14:00:00.000Z",
    workHours: 6.75,
    overTimeHours: 0,
    lateMinutes: 15,
    earlyLeaveMinutes: 0,
    status: "late",
    location: "Jakarta Office",
    notes: "Terlambat karena macet",
    createdAt: "2024-12-12T10:15:00.000Z",
    updatedAt: "2024-12-12T18:00:00.000Z",
  },
  {
    id: "att-1-003",
    companyId: "company-1",
    employeeId: "emp-1-001",
    attendanceDate: "2024-12-11",
    shiftId: "shift-1-001",
    checkIn: "2024-12-11T09:00:00.000Z",
    checkOut: "2024-12-11T17:00:00.000Z",
    breakStart: "2024-12-11T12:30:00.000Z",
    breakEnd: "2024-12-11T13:30:00.000Z",
    workHours: 7,
    overTimeHours: 0,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Jakarta Office",
    createdAt: "2024-12-11T09:00:00.000Z",
    updatedAt: "2024-12-11T17:00:00.000Z",
  },
  {
    id: "att-2-001",
    companyId: "company-2",
    employeeId: "emp-2-001",
    attendanceDate: "2024-12-12",
    shiftId: "shift-2-001",
    checkIn: "2024-12-12T06:55:00.000Z",
    checkOut: "2024-12-12T15:05:00.000Z",
    breakStart: "2024-12-12T11:00:00.000Z",
    breakEnd: "2024-12-12T11:30:00.000Z",
    workHours: 7.67,
    overTimeHours: 0.17,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Surabaya Warehouse",
    createdAt: "2024-12-12T06:55:00.000Z",
    updatedAt: "2024-12-12T15:05:00.000Z",
  },
  {
    id: "att-2-002",
    companyId: "company-2",
    employeeId: "emp-2-002",
    attendanceDate: "2024-12-12",
    shiftId: "shift-2-002",
    checkIn: "2024-12-12T13:00:00.000Z",
    checkOut: "2024-12-12T21:00:00.000Z",
    breakStart: "2024-12-12T17:00:00.000Z",
    breakEnd: "2024-12-12T17:30:00.000Z",
    workHours: 7.5,
    overTimeHours: 0,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Surabaya Warehouse",
    createdAt: "2024-12-12T13:00:00.000Z",
    updatedAt: "2024-12-12T21:00:00.000Z",
  },
  {
    id: "att-5-001",
    companyId: "company-5",
    employeeId: "emp-5-001",
    attendanceDate: "2024-12-12",
    shiftId: "shift-5-001",
    checkIn: "2024-12-12T05:50:00.000Z",
    checkOut: "2024-12-12T14:10:00.000Z",
    breakStart: "2024-12-12T10:00:00.000Z",
    breakEnd: "2024-12-12T10:30:00.000Z",
    workHours: 7.67,
    overTimeHours: 0.17,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Restaurant Kitchen",
    createdAt: "2024-12-12T05:50:00.000Z",
    updatedAt: "2024-12-12T14:10:00.000Z",
  },
  {
    id: "att-5-002",
    companyId: "company-5",
    employeeId: "emp-5-002",
    attendanceDate: "2024-12-12",
    shiftId: "shift-5-002",
    checkIn: "2024-12-12T14:00:00.000Z",
    checkOut: "2024-12-12T22:05:00.000Z",
    breakStart: "2024-12-12T18:00:00.000Z",
    breakEnd: "2024-12-12T18:30:00.000Z",
    workHours: 7.58,
    overTimeHours: 0.08,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "present",
    location: "Restaurant Floor",
    createdAt: "2024-12-12T14:00:00.000Z",
    updatedAt: "2024-12-12T22:05:00.000Z",
  },
  {
    id: "att-1-004",
    companyId: "company-1",
    employeeId: "emp-1-002",
    attendanceDate: "2024-12-10",
    workHours: 0,
    overTimeHours: 0,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    status: "sick",
    notes: "Sakit demam - ada surat dokter",
    approvedBy: "emp-1-001",
    createdAt: "2024-12-10T08:00:00.000Z",
    updatedAt: "2024-12-10T08:00:00.000Z",
  },
];

// Leave data
export const leavesData: LeaveData[] = [
  {
    id: "leave-1-001",
    companyId: "company-1",
    employeeId: "emp-1-002",
    leaveType: "sick",
    startDate: "2024-12-10",
    endDate: "2024-12-10",
    totalDays: 1,
    reason: "Demam tinggi dan flu",
    status: "approved",
    appliedDate: "2024-12-10T07:00:00.000Z",
    approvedBy: "emp-1-001",
    approvedDate: "2024-12-10T08:00:00.000Z",
    attachments: ["medical_cert_001.pdf"],
    createdAt: "2024-12-10T07:00:00.000Z",
    updatedAt: "2024-12-10T08:00:00.000Z",
  },
  {
    id: "leave-2-001",
    companyId: "company-2",
    employeeId: "emp-2-003",
    leaveType: "annual",
    startDate: "2024-12-25",
    endDate: "2024-12-27",
    totalDays: 3,
    reason: "Liburan Natal bersama keluarga",
    status: "pending",
    appliedDate: "2024-12-05T10:00:00.000Z",
    createdAt: "2024-12-05T10:00:00.000Z",
    updatedAt: "2024-12-05T10:00:00.000Z",
  },
  {
    id: "leave-5-001",
    companyId: "company-5",
    employeeId: "emp-5-003",
    leaveType: "emergency",
    startDate: "2024-12-08",
    endDate: "2024-12-08",
    totalDays: 1,
    reason: "Keluarga sakit mendadak",
    status: "approved",
    appliedDate: "2024-12-08T06:00:00.000Z",
    approvedBy: "emp-5-001",
    approvedDate: "2024-12-08T06:30:00.000Z",
    createdAt: "2024-12-08T06:00:00.000Z",
    updatedAt: "2024-12-08T06:30:00.000Z",
  },
];

// Payroll data
export const payrollData: PayrollData[] = [
  {
    id: "pay-1-001",
    companyId: "company-1",
    employeeId: "emp-1-001",
    payPeriod: "2024-11",
    baseSalary: 15000000,
    overtimeAmount: 500000,
    allowances: 2000000,
    bonuses: 1000000,
    deductions: 1850000,
    grossPay: 18500000,
    netPay: 16650000,
    workDays: 22,
    overtimeHours: 10,
    leaveDays: 0,
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "pay-1-002",
    companyId: "company-1",
    employeeId: "emp-1-002",
    payPeriod: "2024-11",
    baseSalary: 12000000,
    overtimeAmount: 300000,
    allowances: 1800000,
    bonuses: 500000,
    deductions: 1450000,
    grossPay: 14600000,
    netPay: 13150000,
    workDays: 21,
    overtimeHours: 6,
    leaveDays: 1,
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "pay-2-001",
    companyId: "company-2",
    employeeId: "emp-2-001",
    payPeriod: "2024-11",
    baseSalary: 8000000,
    overtimeAmount: 400000,
    allowances: 1200000,
    bonuses: 0,
    deductions: 950000,
    grossPay: 9600000,
    netPay: 8650000,
    workDays: 22,
    overtimeHours: 12,
    leaveDays: 0,
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "pay-2-002",
    companyId: "company-2",
    employeeId: "emp-2-002",
    payPeriod: "2024-11",
    baseSalary: 6000000,
    overtimeAmount: 200000,
    allowances: 1000000,
    bonuses: 0,
    deductions: 720000,
    grossPay: 7200000,
    netPay: 6480000,
    workDays: 22,
    overtimeHours: 8,
    leaveDays: 0,
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "pay-5-001",
    companyId: "company-5",
    employeeId: "emp-5-001",
    payPeriod: "2024-11",
    baseSalary: 7500000,
    overtimeAmount: 600000,
    allowances: 1000000,
    bonuses: 250000,
    deductions: 937500,
    grossPay: 9350000,
    netPay: 8412500,
    workDays: 22,
    overtimeHours: 15,
    leaveDays: 0,
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
];
