import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import StatsCard from './StatsCard';
import { Hotel, UserRound, CircleArrowLeft, ChartNoAxesCombined } from 'lucide-react';
import { mockSuperadminStats, mockCompanies } from '../../backend/erpMockData';
import { formatCurrency, formatDate, formatCompanyStatus, formatPaymentStatus } from '../../backend/stringFormatters';
import { CompanyStatus } from '../../backend/enums';

const SuperadminDashboard = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  
  const handleToggleStatus = (companyId) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { 
            ...company, 
            status: company.status === CompanyStatus.ACTIVE 
              ? CompanyStatus.INACTIVE 
              : CompanyStatus.ACTIVE 
          }
        : company
    ));
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return 'default';
      case CompanyStatus.INACTIVE:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPaymentBadgeVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Perusahaan"
          value={mockSuperadminStats.totalCompanies}
          description="Terdaftar di sistem"
          icon={Hotel}
        />
        <StatsCard
          title="Perusahaan Aktif"
          value={mockSuperadminStats.activeCompanies}
          description="Sedang beroperasi"
          icon={ChartNoAxesCombined}
        />
        <StatsCard
          title="Pembayaran Tertunda"
          value={mockSuperadminStats.pendingPayments}
          description="Memerlukan tindak lanjut"
          icon={CircleArrowLeft}
        />
        <StatsCard
          title="Pendapatan Bulanan"
          value={formatCurrency(mockSuperadminStats.monthlyRevenue)}
          description="Total dari semua perusahaan"
          icon={ChartNoAxesCombined}
        />
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Perusahaan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Perusahaan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead>Karyawan</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Pendapatan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(company.status)}>
                      {formatCompanyStatus(company.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentBadgeVariant(company.paymentStatus)}>
                      {formatPaymentStatus(company.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.employeeCount}</TableCell>
                  <TableCell>{formatDate(company.registrationDate)}</TableCell>
                  <TableCell>{formatCurrency(company.monthlyRevenue)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(company.id)}
                    >
                      {company.status === CompanyStatus.ACTIVE ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperadminDashboard;