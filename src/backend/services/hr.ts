/**
 * HR Service - Comprehensive Human Resources Management
 *
 * Handles: Employees, Module Access, Attendance, Payroll
 * Consolidates: employee.ts + modules.ts + attendance management
 */

import { employees, EmployeeTable } from "../tables/employees";
import { users, UserTable } from "../tables/users";
import { attendance, shifts, leaves, payroll } from "../tables/attendance";
import {
  getModuleById,
  getModuleByCode,
  getActiveModules,
  getAllModules,
  type ModuleTable,
} from "../tables/modules";
import { getPlanById } from "../tables/subscriptionPlans";
import { UserRole } from "../types/enums";
import { query } from "../tables";

// =============================================================================
// EMPLOYEE MANAGEMENT
// =============================================================================

export const employeeQuery = {
  employees: {
    findById: (id: string) => employees.find((emp) => emp.id === id),
    findByUserId: (userId: string) =>
      employees.find((emp) => emp.userId === userId),
    findByCompanyId: (companyId: string) =>
      employees.filter((emp) => emp.companyId === companyId),
    findActiveByCompanyId: (companyId: string) =>
      employees.filter((emp) => emp.companyId === companyId && emp.isActive),
    findByDepartment: (companyId: string, department: string) =>
      employees.filter(
        (emp) => emp.companyId === companyId && emp.department === department
      ),
    findByModuleAccess: (companyId: string, module: string) =>
      employees.filter(
        (emp) =>
          emp.companyId === companyId && emp.moduleAccess.includes(module)
      ),
  },
};

export const employeeService = {
  // Basic CRUD operations
  create: (
    employeeData: Omit<EmployeeTable, "id" | "createdAt" | "updatedAt">
  ) => {
    const newEmployee: EmployeeTable = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    employees.push(newEmployee);
    return newEmployee;
  },

  update: (id: string, updates: Partial<EmployeeTable>) => {
    const empIndex = employees.findIndex((emp) => emp.id === id);
    if (empIndex === -1) return null;

    employees[empIndex] = {
      ...employees[empIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return employees[empIndex];
  },

  delete: (id: string) => {
    const empIndex = employees.findIndex((emp) => emp.id === id);
    if (empIndex === -1) return false;

    employees[empIndex] = {
      ...employees[empIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    return true;
  },

  // Employee-specific operations
  updateModuleAccess: (employeeId: string, moduleAccess: string[]) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return null;

    employee.moduleAccess = moduleAccess;
    employee.updatedAt = new Date().toISOString();
    return employee;
  },

  getEmployeeStats: (companyId: string) => {
    const companyEmployees = employees.filter(
      (emp) => emp.companyId === companyId
    );

    return {
      total: companyEmployees.length,
      active: companyEmployees.filter((emp) => emp.isActive).length,
      inactive: companyEmployees.filter((emp) => !emp.isActive).length,
      byDepartment: companyEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPosition: companyEmployees.reduce((acc, emp) => {
        acc[emp.position] = (acc[emp.position] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
};

// =============================================================================
// MODULE ACCESS MANAGEMENT
// =============================================================================

export class ModuleService {
  // Module queries
  static getAllModules(): ModuleTable[] {
    return getAllModules();
  }

  static getActiveModules(): ModuleTable[] {
    return getActiveModules();
  }

  static getModuleById(id: string): ModuleTable | undefined {
    return getModuleById(id);
  }

  static getModuleByCode(code: string): ModuleTable | undefined {
    return getModuleByCode(code);
  }

  // Employee module access management
  static getEmployeeModules(employeeId: string): ModuleTable[] {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return [];

    return employee.moduleAccess
      .map((moduleCode) => this.getModuleByCode(moduleCode))
      .filter((module): module is ModuleTable => module !== undefined);
  }

  static hasModuleAccess(employeeId: string, moduleCode: string): boolean {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.moduleAccess.includes(moduleCode) : false;
  }

  static grantModuleAccess(employeeId: string, moduleCode: string): boolean {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return false;

    if (!employee.moduleAccess.includes(moduleCode)) {
      employee.moduleAccess.push(moduleCode);
      employee.updatedAt = new Date().toISOString();
    }
    return true;
  }

  static revokeModuleAccess(employeeId: string, moduleCode: string): boolean {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return false;

    employee.moduleAccess = employee.moduleAccess.filter(
      (code) => code !== moduleCode
    );
    employee.updatedAt = new Date().toISOString();
    return true;
  }

  // Company subscription validation
  static validateCompanyModuleAccess(
    companyId: string,
    moduleCode: string
  ): boolean {
    const company = query.companies.findById(companyId);
    if (!company) return false;

    const plan = getPlanById(company.subscriptionPlanId);
    return plan ? plan.features.includes(moduleCode) : false;
  }

  static getCompanyAvailableModules(companyId: string): ModuleTable[] {
    const company = query.companies.findById(companyId);
    if (!company) return [];

    const plan = getPlanById(company.subscriptionPlanId);
    if (!plan) return [];

    return plan.features
      .map((moduleCode) => this.getModuleByCode(moduleCode))
      .filter((module): module is ModuleTable => module !== undefined);
  }
}

// =============================================================================
// ATTENDANCE MANAGEMENT
// =============================================================================

export const attendanceService = {
  // Clock in/out
  clockIn: (employeeId: string, timestamp?: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    const clockTime = timestamp || new Date().toISOString();
    const today = clockTime.split("T")[0];

    // Check if already clocked in today
    const existingAttendance = attendance.find(
      (att) => att.employeeId === employeeId && att.attendanceDate === today
    );

    if (existingAttendance && existingAttendance.checkIn) {
      throw new Error("Already clocked in today");
    }

    const newAttendance = {
      id: `att-${Date.now()}`,
      companyId: employee.companyId,
      employeeId,
      attendanceDate: today,
      checkIn: clockTime,
      workHours: 0,
      overTimeHours: 0,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      status: "present" as const,
      createdAt: clockTime,
      updatedAt: clockTime,
    };

    if (existingAttendance) {
      const index = attendance.findIndex(
        (att) => att.id === existingAttendance.id
      );
      attendance[index] = { ...attendance[index], ...newAttendance };
      return attendance[index];
    } else {
      attendance.push(newAttendance);
      return newAttendance;
    }
  },

  clockOut: (employeeId: string, timestamp?: string) => {
    const clockTime = timestamp || new Date().toISOString();
    const today = clockTime.split("T")[0];

    const attendanceRecord = attendance.find(
      (att) => att.employeeId === employeeId && att.attendanceDate === today
    );

    if (!attendanceRecord || !attendanceRecord.checkIn) {
      throw new Error("Must clock in first");
    }

    attendanceRecord.checkOut = clockTime;
    attendanceRecord.updatedAt = clockTime;

    // Calculate hours worked
    if (attendanceRecord.checkIn) {
      const clockInTime = new Date(attendanceRecord.checkIn);
      const clockOutTime = new Date(clockTime);
      attendanceRecord.workHours =
        (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    }

    return attendanceRecord;
  },

  // Attendance queries
  getEmployeeAttendance: (employeeId: string, month?: string) => {
    let records = attendance.filter((att) => att.employeeId === employeeId);

    if (month) {
      records = records.filter((att) => att.attendanceDate.startsWith(month));
    }

    return records.sort((a, b) =>
      b.attendanceDate.localeCompare(a.attendanceDate)
    );
  },

  getCompanyAttendance: (companyId: string, date?: string) => {
    let records = attendance.filter((att) => att.companyId === companyId);

    if (date) {
      records = records.filter((att) => att.attendanceDate === date);
    }

    return records;
  },

  // Attendance statistics
  getAttendanceStats: (companyId: string, month: string) => {
    const companyEmployees = employees.filter(
      (emp) => emp.companyId === companyId && emp.isActive
    );

    const monthlyAttendance = attendance.filter((att) => {
      return (
        att.companyId === companyId && att.attendanceDate.startsWith(month)
      );
    });

    const totalWorkingDays = new Date(
      parseInt(month.split("-")[0]),
      parseInt(month.split("-")[1]),
      0
    ).getDate();

    return {
      totalEmployees: companyEmployees.length,
      totalWorkingDays,
      totalAttendanceRecords: monthlyAttendance.length,
      averageAttendanceRate:
        (monthlyAttendance.length /
          (companyEmployees.length * totalWorkingDays)) *
        100,
      presentDays: monthlyAttendance.filter((att) => att.status === "present")
        .length,
      absentDays: monthlyAttendance.filter((att) => att.status === "absent")
        .length,
      lateDays: monthlyAttendance.filter((att) => att.status === "late").length,
    };
  },
};

// =============================================================================
// PAYROLL MANAGEMENT
// =============================================================================

export const payrollService = {
  calculatePayroll: (employeeId: string, month: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return null;

    const monthlyAttendance = attendance.filter(
      (att) =>
        att.employeeId === employeeId && att.attendanceDate.startsWith(month)
    );

    const totalHours = monthlyAttendance.reduce(
      (sum, att) => sum + (att.workHours || 0),
      0
    );

    const presentDays = monthlyAttendance.filter(
      (att) => att.status === "present"
    ).length;

    // Basic salary calculation (simplified)
    const baseSalary = employee.salary || 0;
    const overtimeHours = Math.max(0, totalHours - presentDays * 8);
    const overtimePay = overtimeHours * (baseSalary / 160) * 1.5; // 1.5x overtime rate

    return {
      employeeId,
      month,
      baseSalary,
      overtimeHours,
      overtimePay,
      totalHours,
      presentDays,
      grossSalary: baseSalary + overtimePay,
      deductions: 0, // Simplified
      netSalary: baseSalary + overtimePay,
    };
  },

  getCompanyPayroll: (companyId: string, month: string) => {
    const companyEmployees = employees.filter(
      (emp) => emp.companyId === companyId && emp.isActive
    );

    return companyEmployees
      .map((emp) => payrollService.calculatePayroll(emp.id, month))
      .filter(Boolean);
  },
};

// =============================================================================
// UNIFIED HR EXPORT
// =============================================================================

export const HRService = {
  employees: employeeService,
  modules: ModuleService,
  attendance: attendanceService,
  payroll: payrollService,
  queries: employeeQuery,
};

export default HRService;
