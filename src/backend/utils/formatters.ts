import { UserRole, CompanyStatus, PaymentStatus } from "../tables/enums";

export const formatUserRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.SUPERADMIN:
      return "Superadmin";
    case UserRole.COMPANY_OWNER:
      return "Pemilik Perusahaan";
    case UserRole.EMPLOYEE:
      return "Karyawan";
    default:
      return "Tidak Diketahui";
  }
};

export const formatCompanyStatus = (status: CompanyStatus): string => {
  switch (status) {
    case CompanyStatus.ACTIVE:
      return "Aktif";
    case CompanyStatus.INACTIVE:
      return "Tidak Aktif";
    case CompanyStatus.SUSPENDED:
      return "Ditangguhkan";
    default:
      return "Tidak Diketahui";
  }
};

export const formatPaymentStatus = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return "Lunas";
    case PaymentStatus.UNPAID:
      return "Belum Bayar";
    case PaymentStatus.OVERDUE:
      return "Terlambat";
    default:
      return "Tidak Diketahui";
  }
};
