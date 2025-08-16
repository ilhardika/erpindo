import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { UserRound, ChartNoAxesCombined, CircleArrowLeft, Settings } from 'lucide-react';
import { mockCompanyOwnerStats } from '../../backend/erpMockData';
import { formatCurrency } from '../../backend/stringFormatters';
import { ERPModule } from '../../backend/enums';

const CompanyOwnerDashboard = () => {
  const erpModules = [
    { key: ERPModule.POS, name: 'POS (Kasir)', description: 'Sistem point of sale' },
    { key: ERPModule.SALES_PURCHASING, name: 'Penjualan & Pembelian', description: 'Manajemen transaksi' },
    { key: ERPModule.INVENTORY, name: 'Inventori / Gudang', description: 'Manajemen stok' },
    { key: ERPModule.CUSTOMERS_SUPPLIERS, name: 'Pelanggan & Supplier', description: 'Data mitra bisnis' },
    { key: ERPModule.PROMOTIONS, name: 'Promosi', description: 'Manajemen diskon' },
    { key: ERPModule.HR, name: 'HR / Manajemen Karyawan', description: 'Data karyawan' },
    { key: ERPModule.FINANCE, name: 'Keuangan', description: 'Laporan keuangan' },
    { key: ERPModule.VEHICLES, name: 'Kendaraan', description: 'Manajemen armada' },
    { key: ERPModule.SALESMAN, name: 'Salesman', description: 'Tracking sales' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Karyawan"
          value={mockCompanyOwnerStats.totalEmployees}
          description="Karyawan aktif"
          icon={UserRound}
        />
        <StatsCard
          title="Modul Aktif"
          value={mockCompanyOwnerStats.activeModules}
          description="Dari 9 modul tersedia"
          icon={Settings}
        />
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(mockCompanyOwnerStats.todaySales)}
          description="Transaksi hari ini"
          icon={ChartNoAxesCombined}
        />
        <StatsCard
          title="Stok Menipis"
          value={mockCompanyOwnerStats.lowStock}
          description="Item perlu restok"
          icon={CircleArrowLeft}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kelola Karyawan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <UserRound size={16} className="mr-2" />
              Tambah Karyawan Baru
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings size={16} className="mr-2" />
              Atur Hak Akses Modul
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ChartNoAxesCombined size={16} className="mr-2" />
              Laporan Karyawan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laporan Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <ChartNoAxesCombined size={16} className="mr-2" />
              Laporan Penjualan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CircleArrowLeft size={16} className="mr-2" />
              Laporan Inventori
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings size={16} className="mr-2" />
              Laporan Keuangan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ERP Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Modul ERP Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {erpModules.map((module) => (
              <Card key={module.key} className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{module.name}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Kelola Modul
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOwnerDashboard;