export interface AttendanceTable {
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

export interface ShiftTable {
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

export interface LeaveTable {
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
  approvedBy?: string; // Employee ID who approved
  approvedDate?: string;
  rejectionReason?: string;
  attachments?: string[]; // URLs to medical certificates, etc.
  createdAt: string;
  updatedAt: string;
}

export interface PayrollTable {
  id: string;
  companyId: string; // Foreign key to companies table
  employeeId: string; // Foreign key to employees table
  payPeriod: string; // YYYY-MM format
  baseSalary: number;
  overtimeAmount: number;
  allowances: number; // Transport, meal, etc.
  bonuses: number;
  deductions: number; // Tax, insurance, etc.
  grossPay: number;
  netPay: number;
  workDays: number;
  overtimeHours: number;
  leaveDays: number;
  status: "draft" | "approved" | "paid";
  paidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Shifts table
export const shifts: ShiftTable[] = [
  // Shifts for Company 1 (PT. Teknologi Maju) - IT Company
  {
    id: "shift-1-001",
    companyId: "company-1",
    shiftName: "Regular Office Hours",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: 60, // 1 hour lunch break
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

  // Shifts for Company 2 (CV. Dagang Sukses Mandiri) - Trading
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

  // Shifts for Company 5 (PT. Berkah Food & Beverage) - Restaurant
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

  // Shifts for Company 6 (CV. Cahaya Motor) - Workshop
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

// Attendance records
export const attendance: AttendanceTable[] = [
  // Recent attendance for Company 1 employees
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

  // Attendance for Company 2 employees
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

  // Attendance for Company 5 restaurant
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

  // Sick leave example
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

// Leave requests
export const leaves: LeaveTable[] = [
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

// Payroll records
export const payroll: PayrollTable[] = [
  // November 2024 payroll for Company 1
  {
    id: "pay-1-001",
    companyId: "company-1",
    employeeId: "emp-1-001",
    payPeriod: "2024-11",
    baseSalary: 15000000,
    overtimeAmount: 500000,
    allowances: 2000000, // Transport + meal
    bonuses: 1000000, // Performance bonus
    deductions: 1850000, // Tax + insurance
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
    leaveDays: 1, // 1 sick day
    status: "paid",
    paidDate: "2024-12-01T00:00:00.000Z",
    createdAt: "2024-11-30T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },

  // November 2024 payroll for Company 2
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

  // November 2024 payroll for Company 5 restaurant
  {
    id: "pay-5-001",
    companyId: "company-5",
    employeeId: "emp-5-001",
    payPeriod: "2024-11",
    baseSalary: 7500000,
    overtimeAmount: 600000,
    allowances: 1000000,
    bonuses: 250000, // Service bonus
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

// Helper functions for shifts
export const getShiftById = (id: string): ShiftTable | undefined => {
  return shifts.find((shift) => shift.id === id);
};

export const getShiftsByCompanyId = (companyId: string): ShiftTable[] => {
  return shifts.filter(
    (shift) => shift.companyId === companyId && shift.isActive
  );
};

// Helper functions for attendance
export const getAttendanceById = (id: string): AttendanceTable | undefined => {
  return attendance.find((att) => att.id === id);
};

export const getAttendanceByEmployeeId = (
  employeeId: string,
  month?: string
): AttendanceTable[] => {
  let empAttendance = attendance.filter((att) => att.employeeId === employeeId);

  if (month) {
    empAttendance = empAttendance.filter((att) =>
      att.attendanceDate.startsWith(month)
    );
  }

  return empAttendance.sort((a, b) =>
    b.attendanceDate.localeCompare(a.attendanceDate)
  );
};

export const getAttendanceByCompanyId = (
  companyId: string,
  date?: string
): AttendanceTable[] => {
  let companyAttendance = attendance.filter(
    (att) => att.companyId === companyId
  );

  if (date) {
    companyAttendance = companyAttendance.filter(
      (att) => att.attendanceDate === date
    );
  }

  return companyAttendance.sort((a, b) =>
    b.attendanceDate.localeCompare(a.attendanceDate)
  );
};

export const getAttendanceByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): AttendanceTable[] => {
  return attendance
    .filter(
      (att) =>
        att.companyId === companyId &&
        att.attendanceDate >= startDate &&
        att.attendanceDate <= endDate
    )
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
};

export const getAttendanceByStatus = (
  companyId: string,
  status: string
): AttendanceTable[] => {
  return attendance
    .filter((att) => att.companyId === companyId && att.status === status)
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
};

// Helper functions for leave
export const getLeaveById = (id: string): LeaveTable | undefined => {
  return leaves.find((leave) => leave.id === id);
};

export const getLeaveByEmployeeId = (employeeId: string): LeaveTable[] => {
  return leaves
    .filter((leave) => leave.employeeId === employeeId)
    .sort(
      (a, b) =>
        new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );
};

export const getLeaveByCompanyId = (
  companyId: string,
  status?: string
): LeaveTable[] => {
  let companyLeaves = leaves.filter((leave) => leave.companyId === companyId);

  if (status) {
    companyLeaves = companyLeaves.filter((leave) => leave.status === status);
  }

  return companyLeaves.sort(
    (a, b) =>
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  );
};

export const getPendingLeaves = (companyId: string): LeaveTable[] => {
  return getLeaveByCompanyId(companyId, "pending");
};

// Helper functions for payroll
export const getPayrollById = (id: string): PayrollTable | undefined => {
  return payroll.find((pay) => pay.id === id);
};

export const getPayrollByEmployeeId = (employeeId: string): PayrollTable[] => {
  return payroll
    .filter((pay) => pay.employeeId === employeeId)
    .sort((a, b) => b.payPeriod.localeCompare(a.payPeriod));
};

export const getPayrollByCompanyId = (
  companyId: string,
  period?: string
): PayrollTable[] => {
  let companyPayroll = payroll.filter((pay) => pay.companyId === companyId);

  if (period) {
    companyPayroll = companyPayroll.filter((pay) => pay.payPeriod === period);
  }

  return companyPayroll.sort((a, b) => b.payPeriod.localeCompare(a.payPeriod));
};

export const getPayrollByStatus = (
  companyId: string,
  status: string
): PayrollTable[] => {
  return payroll
    .filter((pay) => pay.companyId === companyId && pay.status === status)
    .sort((a, b) => b.payPeriod.localeCompare(a.payPeriod));
};

// Statistics helpers
export const getAttendanceStatistics = (companyId: string, month?: string) => {
  let companyAttendance = getAttendanceByCompanyId(companyId);

  if (month) {
    companyAttendance = companyAttendance.filter((att) =>
      att.attendanceDate.startsWith(month)
    );
  }

  const totalRecords = companyAttendance.length;

  return {
    totalRecords,
    presentCount: companyAttendance.filter((att) => att.status === "present")
      .length,
    lateCount: companyAttendance.filter((att) => att.status === "late").length,
    absentCount: companyAttendance.filter((att) => att.status === "absent")
      .length,
    sickCount: companyAttendance.filter((att) => att.status === "sick").length,
    permissionCount: companyAttendance.filter(
      (att) => att.status === "permission"
    ).length,
    halfDayCount: companyAttendance.filter((att) => att.status === "half_day")
      .length,

    attendanceRate:
      totalRecords > 0
        ? (companyAttendance.filter((att) =>
            ["present", "late"].includes(att.status)
          ).length /
            totalRecords) *
          100
        : 0,

    totalWorkHours: companyAttendance.reduce(
      (sum, att) => sum + att.workHours,
      0
    ),
    totalOvertimeHours: companyAttendance.reduce(
      (sum, att) => sum + att.overTimeHours,
      0
    ),
    averageWorkHours:
      totalRecords > 0
        ? companyAttendance.reduce((sum, att) => sum + att.workHours, 0) /
          totalRecords
        : 0,
  };
};

export const getEmployeeAttendanceSummary = (
  employeeId: string,
  month: string
) => {
  const empAttendance = getAttendanceByEmployeeId(employeeId, month);

  return {
    totalDays: empAttendance.length,
    presentDays: empAttendance.filter((att) =>
      ["present", "late"].includes(att.status)
    ).length,
    absentDays: empAttendance.filter((att) => att.status === "absent").length,
    lateDays: empAttendance.filter((att) => att.status === "late").length,
    sickDays: empAttendance.filter((att) => att.status === "sick").length,
    totalWorkHours: empAttendance.reduce((sum, att) => sum + att.workHours, 0),
    totalOvertimeHours: empAttendance.reduce(
      (sum, att) => sum + att.overTimeHours,
      0
    ),
    totalLateMinutes: empAttendance.reduce(
      (sum, att) => sum + att.lateMinutes,
      0
    ),
  };
};

export const getPayrollSummary = (companyId: string, period: string) => {
  const periodPayroll = getPayrollByCompanyId(companyId, period);

  return {
    totalEmployees: periodPayroll.length,
    totalGrossPay: periodPayroll.reduce((sum, pay) => sum + pay.grossPay, 0),
    totalNetPay: periodPayroll.reduce((sum, pay) => sum + pay.netPay, 0),
    totalDeductions: periodPayroll.reduce(
      (sum, pay) => sum + pay.deductions,
      0
    ),
    totalBonuses: periodPayroll.reduce((sum, pay) => sum + pay.bonuses, 0),
    totalOvertimePay: periodPayroll.reduce(
      (sum, pay) => sum + pay.overtimeAmount,
      0
    ),

    averageGrossPay:
      periodPayroll.length > 0
        ? periodPayroll.reduce((sum, pay) => sum + pay.grossPay, 0) /
          periodPayroll.length
        : 0,
    averageNetPay:
      periodPayroll.length > 0
        ? periodPayroll.reduce((sum, pay) => sum + pay.netPay, 0) /
          periodPayroll.length
        : 0,
  };
};
