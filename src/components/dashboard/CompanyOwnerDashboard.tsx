'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Settings, LogOut, LayoutGrid } from 'lucide-react';
import { User } from '@/backend/types/schema';
import { mockEmployeesData, mockCompaniesData } from '@/backend/data/erpMockData';

interface CompanyOwnerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CompanyOwnerDashboard({ user, onLogout }: CompanyOwnerDashboardProps) {
  const employees = mockEmployeesData;
  const company = mockCompaniesData.find(c => c.id === user.companyId);
  const activeEmployees = employees.filter(e => e.isActive).length;

  const moduleStats = {
    pos: 2,
    sales: 1,
    inventory: 2,
    purchasing: 1,
    hr: 0,
    finance: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Pemilik Perusahaan</h1>
              <p className="text-sm text-muted-foreground">Selamat datang, {user.name}</p>
              {company && (
                <p className="text-xs text-muted-foreground">{company.name}</p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeEmployees} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modul Aktif</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Semua modul tersedia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Perusahaan</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktif</div>
              <p className="text-xs text-muted-foreground">
                Pembayaran lunas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Penggunaan Modul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">POS</span>
                  <Badge variant="default">{moduleStats.pos} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Penjualan</span>
                  <Badge variant="default">{moduleStats.sales} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inventori</span>
                  <Badge variant="default">{moduleStats.inventory} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pembelian</span>
                  <Badge variant="default">{moduleStats.purchasing} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HR</span>
                  <Badge variant="secondary">{moduleStats.hr} pengguna</Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Keuangan</span>
                  <Badge variant="secondary">{moduleStats.finance} pengguna</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Management */}
        <Card>
          <CardHeader>
            <CardTitle>Kelola Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.modules.map((module) => (
                        <Badge key={module} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button>Tambah Karyawan</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}