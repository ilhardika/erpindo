'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, DollarSign, LogOut, LayoutGrid } from 'lucide-react';
import { User } from '@/backend/types/schema';
import { mockCompaniesData } from '@/backend/data/erpMockData';
import { formatCompanyStatus, formatPaymentStatus } from '@/backend/utils/formatters';

interface SuperadminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SuperadminDashboard({ user, onLogout }: SuperadminDashboardProps) {
  const companies = mockCompaniesData;
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalEmployees = companies.reduce((sum, c) => sum + c.employeeCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dashboard Superadmin</h1>
              <p className="text-sm text-muted-foreground">Selamat datang, {user.name}</p>
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
              <CardTitle className="text-sm font-medium">Total Perusahaan</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                {activeCompanies} aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Dari semua perusahaan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Bulanan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 15,000,000</div>
              <p className="text-xs text-muted-foreground">
                +20.1% dari bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kelola Perusahaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.owner} • {company.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{company.employeeCount} karyawan</p>
                      <p className="text-xs text-muted-foreground">
                        Terdaftar {new Date(company.registrationDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                        {formatCompanyStatus(company.status)}
                      </Badge>
                      <Badge variant={company.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                        {formatPaymentStatus(company.paymentStatus)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Kelola
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}