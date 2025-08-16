import { UserRole, CompanyStatus, PaymentStatus } from './enums.js';

export const formatUserRole = (role) => {
  switch (role) {
    case UserRole.SUPERADMIN:
      return 'Superadmin';
    case UserRole.COMPANY_OWNER:
      return 'Pemilik Perusahaan';
    case UserRole.EMPLOYEE:
      return 'Karyawan';
    default:
      return 'Tidak Diketahui';
  }
};

export const formatCompanyStatus = (status) => {
  switch (status) {
    case CompanyStatus.ACTIVE:
      return 'Aktif';
    case CompanyStatus.INACTIVE:
      return 'Tidak Aktif';
    default:
      return 'Tidak Diketahui';
  }
};

export const formatPaymentStatus = (status) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'Lunas';
    case PaymentStatus.PENDING:
      return 'Tertunda';
    case PaymentStatus.OVERDUE:
      return 'Terlambat';
    default:
      return 'Tidak Diketahui';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};