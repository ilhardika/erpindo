import {
  attendanceData,
  shiftsData,
  leavesData,
  payrollData,
  type AttendanceData,
  type ShiftData,
  type LeaveData,
  type PayrollData,
} from "../data/attendance";

export interface AttendanceTable extends AttendanceData {}

export interface ShiftTable extends ShiftData {}

export interface LeaveTable extends LeaveData {}

export interface PayrollTable extends PayrollData {}

// Import attendance data from data layer
export const shifts = shiftsData;
export const attendance = attendanceData;
export const leaves = leavesData;
export const payroll = payrollData;

// Helper functions for shifts
export const getShiftById = (id: string): ShiftTable | undefined => {
  return shifts.find((shift) => shift.id === id);
};

export const getShiftsByCompanyId = (companyId: string): ShiftTable[] => {
  return shifts.filter((shift) => shift.companyId === companyId);
};

// Helper functions for attendance
export const getAttendanceById = (id: string): AttendanceTable | undefined => {
  return attendance.find((att) => att.id === id);
};

export const getAttendanceByEmployeeId = (
  employeeId: string,
  month?: string
): AttendanceTable[] => {
  let result = attendance.filter((att) => att.employeeId === employeeId);

  if (month) {
    result = result.filter((att) => att.attendanceDate.startsWith(month));
  }

  return result;
};

export const getAttendanceByCompanyId = (
  companyId: string,
  date?: string
): AttendanceTable[] => {
  let result = attendance.filter((att) => att.companyId === companyId);

  if (date) {
    result = result.filter((att) => att.attendanceDate === date);
  }

  return result;
};

export const getAttendanceByDateRange = (
  companyId: string,
  startDate: string,
  endDate: string
): AttendanceTable[] => {
  return attendance.filter(
    (att) =>
      att.companyId === companyId &&
      att.attendanceDate >= startDate &&
      att.attendanceDate <= endDate
  );
};

export const getAttendanceByStatus = (
  companyId: string,
  status: string
): AttendanceTable[] => {
  return attendance.filter(
    (att) => att.companyId === companyId && att.status === status
  );
};

// Helper functions for leave
export const getLeaveById = (id: string): LeaveTable | undefined => {
  return leaves.find((leave) => leave.id === id);
};

export const getLeaveByEmployeeId = (employeeId: string): LeaveTable[] => {
  return leaves.filter((leave) => leave.employeeId === employeeId);
};

export const getLeaveByCompanyId = (
  companyId: string,
  status?: string
): LeaveTable[] => {
  let result = leaves.filter((leave) => leave.companyId === companyId);

  if (status) {
    result = result.filter((leave) => leave.status === status);
  }

  return result;
};

export const getPendingLeaves = (companyId: string): LeaveTable[] => {
  return leaves.filter(
    (leave) => leave.companyId === companyId && leave.status === "pending"
  );
};

// Helper functions for payroll
export const getPayrollById = (id: string): PayrollTable | undefined => {
  return payroll.find((pay) => pay.id === id);
};

export const getPayrollByEmployeeId = (employeeId: string): PayrollTable[] => {
  return payroll.filter((pay) => pay.employeeId === employeeId);
};

export const getPayrollByCompanyId = (
  companyId: string,
  period?: string
): PayrollTable[] => {
  let result = payroll.filter((pay) => pay.companyId === companyId);

  if (period) {
    result = result.filter((pay) => pay.payPeriod === period);
  }

  return result;
};

export const getPayrollByStatus = (
  companyId: string,
  status: string
): PayrollTable[] => {
  return payroll.filter(
    (pay) => pay.companyId === companyId && pay.status === status
  );
};

// Statistics helpers
export const getAttendanceStatistics = (companyId: string, month?: string) => {
  let filteredAttendance = attendance.filter(
    (att) => att.companyId === companyId
  );

  if (month) {
    filteredAttendance = filteredAttendance.filter((att) =>
      att.attendanceDate.startsWith(month)
    );
  }

  return {
    totalRecords: filteredAttendance.length,
    presentCount: filteredAttendance.filter((att) => att.status === "present")
      .length,
    absentCount: filteredAttendance.filter((att) => att.status === "absent")
      .length,
    lateCount: filteredAttendance.filter((att) => att.status === "late").length,
    sickCount: filteredAttendance.filter((att) => att.status === "sick").length,
    permissionCount: filteredAttendance.filter(
      (att) => att.status === "permission"
    ).length,
    totalWorkHours: filteredAttendance.reduce(
      (sum, att) => sum + att.workHours,
      0
    ),
    totalOvertimeHours: filteredAttendance.reduce(
      (sum, att) => sum + att.overTimeHours,
      0
    ),
    averageWorkHours:
      filteredAttendance.length > 0
        ? filteredAttendance.reduce((sum, att) => sum + att.workHours, 0) /
          filteredAttendance.length
        : 0,
  };
};

export const getEmployeeAttendanceSummary = (
  employeeId: string,
  month: string
) => {
  const employeeAttendance = attendance.filter(
    (att) =>
      att.employeeId === employeeId && att.attendanceDate.startsWith(month)
  );

  return {
    employeeId,
    month,
    totalDays: employeeAttendance.length,
    presentDays: employeeAttendance.filter((att) => att.status === "present")
      .length,
    lateDays: employeeAttendance.filter((att) => att.status === "late").length,
    absentDays: employeeAttendance.filter((att) => att.status === "absent")
      .length,
    sickDays: employeeAttendance.filter((att) => att.status === "sick").length,
    totalWorkHours: employeeAttendance.reduce(
      (sum, att) => sum + att.workHours,
      0
    ),
    totalOvertimeHours: employeeAttendance.reduce(
      (sum, att) => sum + att.overTimeHours,
      0
    ),
    totalLateMinutes: employeeAttendance.reduce(
      (sum, att) => sum + att.lateMinutes,
      0
    ),
  };
};

export const getPayrollSummary = (companyId: string, period: string) => {
  const periodPayroll = payroll.filter(
    (pay) => pay.companyId === companyId && pay.payPeriod === period
  );

  return {
    companyId,
    period,
    totalEmployees: periodPayroll.length,
    totalGrossPay: periodPayroll.reduce((sum, pay) => sum + pay.grossPay, 0),
    totalNetPay: periodPayroll.reduce((sum, pay) => sum + pay.netPay, 0),
    totalDeductions: periodPayroll.reduce(
      (sum, pay) => sum + pay.deductions,
      0
    ),
    totalOvertimeAmount: periodPayroll.reduce(
      (sum, pay) => sum + pay.overtimeAmount,
      0
    ),
    totalBonuses: periodPayroll.reduce((sum, pay) => sum + pay.bonuses, 0),
    averageNetPay:
      periodPayroll.length > 0
        ? periodPayroll.reduce((sum, pay) => sum + pay.netPay, 0) /
          periodPayroll.length
        : 0,
    paidCount: periodPayroll.filter((pay) => pay.status === "paid").length,
    pendingCount: periodPayroll.filter((pay) => pay.status === "approved")
      .length,
  };
};
