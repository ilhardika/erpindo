import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, Settings, UserRound } from 'lucide-react';
import { formatUserRole } from '../../backend/stringFormatters';

const DashboardHeader = ({ user, onLogout }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserRound size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                Selamat Datang, {user.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatUserRole(user.role)} - Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings size={16} className="mr-2" />
              Pengaturan
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <ArrowLeft size={16} className="mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;