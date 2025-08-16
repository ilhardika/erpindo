import {
  SuperadminDashboardData,
  CompanyOwnerDashboardData,
  EmployeeDashboardData,
  User,
} from "../types/schema";
import {
  db,
  getStatistics,
  getFullCompanyData,
  getFullEmployeeData,
} from "../tables";
import { UserRole } from "../types/enums";

export class DashboardService {
  static async getSuperadminDashboard(): Promise<SuperadminDashboardData> {
    const companies = db.company.findAll().map((company) => ({
      ...company,
      owner: company.ownerId, // Keep backward compatibility
      email: company.email,
    }));

    const stats = getStatistics();

    return {
      companies,
      totalRevenue: stats.totalRevenue,
      activeCompanies: stats.activeCompanies,
      totalUsers: stats.totalUsers,
    };
  }

  static async getCompanyOwnerDashboard(
    user: User
  ): Promise<CompanyOwnerDashboardData | null> {
    if (!user.companyId) return null;

    const fullCompanyData = getFullCompanyData(user.companyId);
    if (!fullCompanyData) return null;

    // Convert to expected format
    const company = {
      ...fullCompanyData,
      owner: fullCompanyData.owner?.name || "",
      email: fullCompanyData.email,
    };

    const employees = fullCompanyData.employees.map((emp) => ({
      id: emp.id,
      name: emp.user?.name || "",
      email: emp.user?.email || "",
      position: emp.position,
      department: emp.department,
      modules: db.employeeModule
        .findByEmployeeId(emp.id)
        .map((em) => em.moduleCode),
      isActive: emp.isActive,
      joinDate: emp.joinDate,
      companyId: emp.companyId,
    }));

    // Calculate module usage
    const moduleUsage: Record<string, number> = {};
    employees.forEach((emp) => {
      emp.modules.forEach((moduleCode) => {
        moduleUsage[moduleCode] = (moduleUsage[moduleCode] || 0) + 1;
      });
    });

    const recentActivities = [
      "Karyawan baru Jane Smith bergabung sebagai Kasir",
      "Modul POS diakses oleh 3 karyawan hari ini",
      "Laporan penjualan bulan ini telah diupdate",
      "Pembayaran langganan akan jatuh tempo dalam 15 hari",
    ];

    return {
      company,
      employees,
      moduleUsage,
      recentActivities,
    };
  }

  static async getEmployeeDashboard(
    user: User
  ): Promise<EmployeeDashboardData | null> {
    if (!user.companyId) return null;

    const employee = db.employee.findByUserId(user.id);
    if (!employee) return null;

    const fullEmployeeData = getFullEmployeeData(employee.id);
    if (!fullEmployeeData) return null;

    // Convert to expected format
    const employeeInfo = {
      id: fullEmployeeData.id,
      name: fullEmployeeData.user?.name || "",
      email: fullEmployeeData.user?.email || "",
      position: fullEmployeeData.position,
      department: fullEmployeeData.department,
      modules: fullEmployeeData.permissions.map((p) => p.moduleCode),
      isActive: fullEmployeeData.isActive,
      joinDate: fullEmployeeData.joinDate,
      companyId: fullEmployeeData.companyId,
    };

    const availableModules = fullEmployeeData.permissions.map(
      (p) => p.moduleCode
    );

    const recentTasks = [
      "Selesaikan laporan penjualan harian",
      "Update data inventory produk baru",
      "Review dan approve purchase order",
      "Konfirmasi delivery schedule",
    ];

    const notifications = [
      "Anda memiliki 3 tugas yang belum selesai",
      "Meeting tim penjualan dijadwalkan besok jam 10:00",
      "Sistem akan maintenance pada hari Minggu",
    ];

    return {
      employee: employeeInfo,
      availableModules,
      recentTasks,
      notifications,
    };
  }

  static async getDashboardDataByRole(user: User) {
    switch (user.role) {
      case UserRole.SUPERADMIN:
        return this.getSuperadminDashboard();

      case UserRole.COMPANY_OWNER:
        return this.getCompanyOwnerDashboard(user);

      case UserRole.EMPLOYEE:
        return this.getEmployeeDashboard(user);

      default:
        throw new Error("Invalid user role");
    }
  }
}
