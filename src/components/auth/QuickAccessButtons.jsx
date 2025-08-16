import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UserRole } from '../../backend/enums';
import { Settings, Hotel, UserRound } from 'lucide-react';

const QuickAccessButtons = ({ onQuickLogin }) => {
  const roles = [
    {
      role: UserRole.SUPERADMIN,
      title: 'Superadmin',
      description: 'Kelola semua perusahaan dan sistem',
      icon: Settings,
      variant: 'default'
    },
    {
      role: UserRole.COMPANY_OWNER,
      title: 'Pemilik Perusahaan',
      description: 'Kelola karyawan dan laporan perusahaan',
      icon: Hotel,
      variant: 'secondary'
    },
    {
      role: UserRole.EMPLOYEE,
      title: 'Karyawan',
      description: 'Akses modul sesuai hak akses',
      icon: UserRound,
      variant: 'outline'
    }
  ];

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Akses Cepat</CardTitle>
        <CardDescription>
          Pilih role untuk masuk langsung (Development Mode)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map(({ role, title, description, icon: Icon, variant }) => (
          <Button
            key={role}
            variant={variant}
            className="w-full h-auto p-4 flex items-start space-x-3"
            onClick={() => onQuickLogin(role)}
          >
            <Icon size={20} className="mt-0.5 shrink-0" />
            <div className="text-left">
              <div className="font-medium">{title}</div>
              <div className="text-xs opacity-70">{description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickAccessButtons;