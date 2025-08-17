export interface ModuleData {
  id: string;
  code: string; // Unique module code (pos, sales, inventory, etc.)
  name: string;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Modules data - contains all available ERP modules
export const modulesData: ModuleData[] = [
  {
    id: "module-pos",
    code: "pos",
    name: "POS (Kasir)",
    description: "Sistem point of sale untuk transaksi penjualan",
    features: ["Kasir", "Pembayaran", "Invoice", "Refund", "Shift Management"],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-sales",
    code: "sales",
    name: "Penjualan & Pembelian",
    description: "Manajemen penjualan dan pembelian",
    features: [
      "Sales Order",
      "Purchase Order",
      "Invoice",
      "Receipt",
      "Analisis Penjualan",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-inventory",
    code: "inventory",
    name: "Inventori/Gudang",
    description: "Manajemen stok dan gudang",
    features: [
      "Manajemen Produk",
      "Stock Level",
      "Transfer Antar Lokasi",
      "Stock Opname",
      "Mutasi Stok",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-customers",
    code: "customers",
    name: "Pelanggan & Supplier",
    description: "Manajemen pelanggan dan supplier",
    features: [
      "Data Pelanggan",
      "Segmentasi Pelanggan",
      "Data Supplier",
      "Riwayat Transaksi",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-promotions",
    code: "promotions",
    name: "Promosi",
    description: "Manajemen promosi dan diskon",
    features: [
      "Diskon Bertingkat",
      "Bundle Promotion",
      "Durasi Promo",
      "Terms & Conditions",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-hr",
    code: "hr",
    name: "HR/Manajemen Karyawan",
    description: "Manajemen sumber daya manusia",
    features: [
      "Data Karyawan",
      "Absensi Manual",
      "Slip Gaji",
      "Evaluasi Kinerja",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-finance",
    code: "finance",
    name: "Keuangan",
    description: "Manajemen keuangan perusahaan",
    features: [
      "Cash In/Out",
      "Jurnal Manual",
      "General Ledger",
      "Laporan Keuangan",
      "Balance Sheet",
      "P&L",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "module-vehicles",
    code: "vehicles",
    name: "Kendaraan",
    description: "Manajemen kendaraan perusahaan",
    features: [
      "Data Kendaraan",
      "Plat Nomor",
      "Assignment Delivery",
      "Field Sales Tasks",
    ],
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];
