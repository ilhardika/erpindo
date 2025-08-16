import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import StatsCard from './StatsCard';
import { ChartNoAxesCombined, CircleArrowLeft, UserRound, Settings } from 'lucide-react';
import { mockEmployeeStats } from '../../backend/erpMockData';
import { formatCurrency } from '../../backend/stringFormatters';
import { ERPModule } from '../../backend/enums';

const EmployeeDashboard = ({ user }) => {
  const availableModules = [
    { key: ERPModule.POS, name: 'POS (Kasir)', description: 'Sistem point of sale', icon: ChartNoAxesCombined },
    { key: ERPModule.INVENTORY, name: 'Inventori / Gudang', description: 'Manajemen stok', icon: Settings }
  ];

  // Filter modules based on user permissions
  const userModules = availableModules.filter(module => 
    user.permissions?.includes(module.key)
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatCurrency(mockEmployeeStats.todaySales)}
          description="Total transaksi Anda"
          icon={ChartNoAxesCombined}
        />
        <StatsCard
          title="Jumlah Transaksi"
          value={mockEmployeeStats.transactionCount}
          description="Transaksi hari ini"
          icon={CircleArrowLeft}
        />
        <StatsCard
          title="Rata-rata Transaksi"
          value={formatCurrency(mockEmployeeStats.averageTransaction)}
          description="Per transaksi"
          icon={UserRound}
        />
        <StatsCard
          title="Produk Terlaris"
          value={mockEmployeeStats.topProduct}
          description="Hari ini"
          icon={Settings}
        />
      </div>

      {/* Available Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Modul yang Dapat Diakses</CardTitle>
        </CardHeader>
        <CardContent>
          {userModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userModules.map((module) => (
                <Card key={module.key} className="p-4">
                  <div className="flex items-center space-x-3">
                    <module.icon size={24} className="text-primary" />
                    <div className="flex-1">
                      <h3 className="font-medium">{module.name}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Button size="sm">
                      Buka
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserRound size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak Ada Akses Modul</h3>
              <p className="text-muted-foreground">
                Hubungi pemilik perusahaan untuk mendapatkan akses ke modul ERP
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center space-y-2">
              <ChartNoAxesCombined size={24} />
              <span>Buat Transaksi Baru</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Settings size={24} />
              <span>Cek Stok Barang</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <UserRound size={24} />
              <span>Profil Saya</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;