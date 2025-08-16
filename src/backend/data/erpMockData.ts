import { UserRole, CompanyStatus, PaymentStatus } from '../types/enums';

// Mock authentication data
export const mockAuthData = {
  demoCredentials: [
    {
      email: 'superadmin@erpindo.com',
      password: 'super123',
      role: UserRole.SUPERADMIN as const,
      name: 'Super Administrator'
    },
    {
      email: 'owner@company1.com',
      password: 'owner123',
      role: UserRole.COMPANY_OWNER as const,
      name: 'John Doe',
      companyId: 'company-1'
    },
    {
      email: 'employee@company1.com',
      password: 'emp123',
      role: UserRole.EMPLOYEE as const,
      name: 'Jane Smith',
      companyId: 'company-1'
    }
  ]
};

// Mock companies data for superadmin
export const mockCompaniesData = [
  {
    id: 'company-1',
    name: 'PT. Teknologi Maju',
    owner: 'John Doe',
    email: 'owner@company1.com',
    status: CompanyStatus.ACTIVE as const,
    paymentStatus: PaymentStatus.PAID as const,
    employeeCount: 25,
    registrationDate: '2024-01-15T00:00:00.000Z',
    lastPaymentDate: '2024-12-01T00:00:00.000Z',
    subscriptionEndDate: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'company-2',
    name: 'CV. Dagang Sukses',
    owner: 'Maria Santos',
    email: 'owner@company2.com',
    status: CompanyStatus.ACTIVE as const,
    paymentStatus: PaymentStatus.UNPAID as const,
    employeeCount: 12,
    registrationDate: '2024-02-20T00:00:00.000Z',
    lastPaymentDate: '2024-11-01T00:00:00.000Z',
    subscriptionEndDate: '2024-12-20T00:00:00.000Z'
  },
  {
    id: 'company-3',
    name: 'PT. Retail Nusantara',
    owner: 'Budi Santoso',
    email: 'owner@company3.com',
    status: CompanyStatus.SUSPENDED as const,
    paymentStatus: PaymentStatus.OVERDUE as const,
    employeeCount: 8,
    registrationDate: '2024-03-10T00:00:00.000Z',
    lastPaymentDate: '2024-09-15T00:00:00.000Z',
    subscriptionEndDate: '2024-10-15T00:00:00.000Z'
  },
  {
    id: 'company-4',
    name: 'CV. Mandiri Jaya',
    owner: 'Siti Nurhaliza',
    email: 'owner@company4.com',
    status: CompanyStatus.INACTIVE as const,
    paymentStatus: PaymentStatus.UNPAID as const,
    employeeCount: 5,
    registrationDate: '2024-04-05T00:00:00.000Z',
    subscriptionEndDate: '2024-11-05T00:00:00.000Z'
  }
];

// Mock employees data for company owner
export const mockEmployeesData = [
  {
    id: 'emp-1',
    name: 'Jane Smith',
    email: 'employee@company1.com',
    position: 'Kasir',
    department: 'Penjualan',
    modules: ['pos', 'sales'],
    isActive: true,
    joinDate: '2024-03-01T00:00:00.000Z',
    companyId: 'company-1'
  },
  {
    id: 'emp-2',
    name: 'Ahmad Rahman',
    email: 'ahmad@company1.com',
    position: 'Staff Gudang',
    department: 'Operasional',
    modules: ['inventory', 'purchasing'],
    isActive: true,
    joinDate: '2024-03-15T00:00:00.000Z',
    companyId: 'company-1'
  },
  {
    id: 'emp-3',
    name: 'Dewi Sartika',
    email: 'dewi@company1.com',
    position: 'Supervisor Penjualan',
    department: 'Penjualan',
    modules: ['sales', 'customers', 'promotions'],
    isActive: true,
    joinDate: '2024-02-20T00:00:00.000Z',
    companyId: 'company-1'
  },
  {
    id: 'emp-4',
    name: 'Rudi Hartono',
    email: 'rudi@company1.com',
    position: 'Staff Keuangan',
    department: 'Keuangan',
    modules: ['finance'],
    isActive: false,
    joinDate: '2024-01-10T00:00:00.000Z',
    companyId: 'company-1'
  },
  {
    id: 'emp-5',
    name: 'Lisa Permata',
    email: 'lisa@company1.com',
    position: 'HR Specialist',
    department: 'SDM',
    modules: ['hr'],
    isActive: true,
    joinDate: '2024-04-01T00:00:00.000Z',
    companyId: 'company-1'
  }
];

// Mock superadmin dashboard data
export const mockSuperadminStats = {
  totalCompanies: mockCompaniesData.length,
  activeCompanies: mockCompaniesData.filter(c => c.status === CompanyStatus.ACTIVE).length,
  totalRevenue: 15000000,
  totalUsers: mockCompaniesData.reduce((sum, c) => sum + c.employeeCount, 0) + mockCompaniesData.length
};

// Mock company owner dashboard data
export const mockCompanyOwnerStats = {
  totalEmployees: mockEmployeesData.length,
  activeEmployees: mockEmployeesData.filter(e => e.isActive).length,
  moduleUsage: {
    pos: mockEmployeesData.filter(e => e.modules.includes('pos')).length,
    sales: mockEmployeesData.filter(e => e.modules.includes('sales')).length,
    inventory: mockEmployeesData.filter(e => e.modules.includes('inventory')).length,
    purchasing: mockEmployeesData.filter(e => e.modules.includes('purchasing')).length,
    customers: mockEmployeesData.filter(e => e.modules.includes('customers')).length,
    promotions: mockEmployeesData.filter(e => e.modules.includes('promotions')).length,
    hr: mockEmployeesData.filter(e => e.modules.includes('hr')).length,
    finance: mockEmployeesData.filter(e => e.modules.includes('finance')).length,
    vehicles: mockEmployeesData.filter(e => e.modules.includes('vehicles')).length
  },
  recentActivities: [
    'Karyawan baru Lisa Permata telah ditambahkan',
    'Modul HR telah diaktifkan untuk Lisa Permata',
    'Status karyawan Rudi Hartono diubah menjadi tidak aktif',
    'Laporan bulanan telah dibuat',
    'Backup data berhasil dilakukan'
  ]
};

// Mock employee dashboard data
export const mockEmployeeStats = {
  availableModules: ['pos', 'sales', 'inventory', 'customers', 'promotions', 'hr', 'finance', 'vehicles'],
  recentTasks: [
    'Transaksi POS #001 berhasil diproses',
    'Stok produk ABC telah diperbarui',
    'Laporan penjualan harian telah dibuat',
    'Data pelanggan baru telah ditambahkan',
    'Promosi akhir tahun telah diaktifkan'
  ],
  notifications: [
    'Stok produk XYZ hampir habis',
    'Laporan mingguan harus diselesaikan hari ini',
    'Meeting tim penjualan pukul 14:00',
    'Update sistem akan dilakukan malam ini'
  ]
};

// Mock module definitions
export const mockModuleDefinitions = {
  pos: {
    name: 'POS (Kasir)',
    description: 'Sistem point of sale untuk transaksi penjualan',
    features: ['Kasir', 'Pembayaran', 'Invoice', 'Refund', 'Shift Management']
  },
  sales: {
    name: 'Penjualan & Pembelian',
    description: 'Manajemen penjualan dan pembelian',
    features: ['Sales Order', 'Purchase Order', 'Invoice', 'Receipt', 'Analisis Penjualan']
  },
  inventory: {
    name: 'Inventori/Gudang',
    description: 'Manajemen stok dan gudang',
    features: ['Manajemen Produk', 'Stock Level', 'Transfer Antar Lokasi', 'Stock Opname', 'Mutasi Stok']
  },
  customers: {
    name: 'Pelanggan & Supplier',
    description: 'Manajemen pelanggan dan supplier',
    features: ['Data Pelanggan', 'Segmentasi Pelanggan', 'Data Supplier', 'Riwayat Transaksi']
  },
  promotions: {
    name: 'Promosi',
    description: 'Manajemen promosi dan diskon',
    features: ['Diskon Bertingkat', 'Bundle Promotion', 'Durasi Promo', 'Terms & Conditions']
  },
  hr: {
    name: 'HR/Manajemen Karyawan',
    description: 'Manajemen sumber daya manusia',
    features: ['Data Karyawan', 'Absensi Manual', 'Slip Gaji', 'Evaluasi Kinerja']
  },
  finance: {
    name: 'Keuangan',
    description: 'Manajemen keuangan perusahaan',
    features: ['Cash In/Out', 'Jurnal Manual', 'General Ledger', 'Laporan Keuangan', 'Balance Sheet', 'P&L']
  },
  vehicles: {
    name: 'Kendaraan',
    description: 'Manajemen kendaraan perusahaan',
    features: ['Data Kendaraan', 'Plat Nomor', 'Assignment Delivery', 'Field Sales Tasks']
  }
};