'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  User, 
  LogOut, 
  Building, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Gift, 
  UserCheck, 
  DollarSign, 
  Truck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { User as UserType } from '@/backend/types/schema';
import { UserRole } from '@/backend/types/enums';
import { mockModuleDefinitions } from '@/backend/data/erpMockData';

interface DashboardLayoutProps {
  user: UserType;
  children: React.ReactNode;
  onLogout: () => void;
}

interface ModuleItem {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subModules?: ModuleItem[];
}

export function DashboardLayout({ user, children, onLogout }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(key => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const getModulesForRole = (role: UserRole): ModuleItem[] => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return [
          { key: 'companies', name: 'Kelola Perusahaan', icon: Building },
          { key: 'users', name: 'Kelola Pengguna', icon: Users },
          { key: 'reports', name: 'Laporan Sistem', icon: TrendingUp },
        ];
      
      case UserRole.COMPANY_OWNER:
        return [
          { key: 'dashboard', name: 'Dashboard', icon: TrendingUp },
          { key: 'employees', name: 'Kelola Karyawan', icon: Users },
          { key: 'modules', name: 'Pengaturan Modul', icon: Package },
          { key: 'reports', name: 'Laporan Perusahaan', icon: TrendingUp },
        ];
      
      case UserRole.EMPLOYEE:
        // Get available modules from user's permissions
        const availableModules: ModuleItem[] = [];
        
        // Mock employee modules - in real app, this would come from user permissions
        const employeeModules = ['pos', 'sales', 'inventory', 'customers'];
        
        employeeModules.forEach(moduleKey => {
          const moduleConfig = mockModuleDefinitions[moduleKey as keyof typeof mockModuleDefinitions];
          if (moduleConfig) {
            let icon = Package;
            switch (moduleKey) {
              case 'pos': icon = ShoppingCart; break;
              case 'sales': icon = TrendingUp; break;
              case 'inventory': icon = Package; break;
              case 'customers': icon = Users; break;
              case 'promotions': icon = Gift; break;
              case 'hr': icon = UserCheck; break;
              case 'finance': icon = DollarSign; break;
              case 'vehicles': icon = Truck; break;
            }
            
            availableModules.push({
              key: moduleKey,
              name: moduleConfig.name,
              icon,
              subModules: moduleConfig.features.map(feature => ({
                key: `${moduleKey}-${feature.toLowerCase().replace(/\s+/g, '-')}`,
                name: feature,
                icon: Package
              }))
            });
          }
        });
        
        return availableModules;
      
      default:
        return [];
    }
  };

  const modules = getModulesForRole(user.role);

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-card border-r h-full flex flex-col`}>
      {/* Mobile brand header */}
      {isMobile && (
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold">ERP Indonesia</h1>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => (
          <div key={module.key}>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => module.subModules && toggleModule(module.key)}
            >
              <module.icon className="h-4 w-4 mr-3" />
              {module.name}
              {module.subModules && (
                expandedModules.includes(module.key) 
                  ? <ChevronDown className="h-4 w-4 ml-auto" />
                  : <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </Button>
            
            {/* Sub-modules */}
            {module.subModules && expandedModules.includes(module.key) && (
              <div className="ml-6 mt-2 space-y-1">
                {module.subModules.map((subModule) => (
                  <Button
                    key={subModule.key}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  >
                    <subModule.icon className="h-3 w-3 mr-2" />
                    {subModule.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Mobile menu + Brand */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <Sidebar isMobile />
              </SheetContent>
            </Sheet>
            
            {/* Brand name - hidden on mobile */}
            <h1 className="hidden md:block text-xl font-bold">ERP Indonesia</h1>
          </div>

          {/* Right side - User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}