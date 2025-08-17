"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronRight,
  FileText,
  Settings,
  UserPlus,
  BarChart3,
  CreditCard,
  Zap,
} from "lucide-react";
import { User as UserType } from "@/backend/services/auth";
import { UserRole } from "@/backend/tables";
import { HRService } from "@/backend/services/hr";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

interface ModuleItem {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  subModules?: ModuleItem[];
  path?: string; // Add path for navigation
}

export function DashboardLayout({
  children,
  requiredRole,
}: DashboardLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Handle authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    if (user && requiredRole && user.role !== requiredRole) {
      router.push("/dashboard");
      return;
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  const toggleModule = (moduleKey: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((key) => key !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const getModulesForRole = (role: UserRole): ModuleItem[] => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return [
          {
            key: "dashboard",
            name: "Dashboard",
            icon: TrendingUp,
            path: "/dashboard",
          },
          {
            key: "management-plans",
            name: "Management Plans",
            icon: Package,
            path: "/management-plans",
          },
          {
            key: "companies",
            name: "Kelola Perusahaan",
            icon: Building,
            path: "/companies",
          },
          {
            key: "users",
            name: "Kelola Pengguna",
            icon: Users,
            path: "/users",
          },
          {
            key: "reports",
            name: "Laporan Sistem",
            icon: TrendingUp,
            path: "/reports",
          },
        ];

      case UserRole.COMPANY_OWNER:
        return [
          {
            key: "dashboard",
            name: "Dashboard",
            icon: TrendingUp,
            path: "/dashboard",
          },
          {
            key: "employees",
            name: "Kelola Karyawan",
            icon: Users,
            path: "/employees",
          },
          {
            key: "reports",
            name: "Laporan Perusahaan",
            icon: TrendingUp,
            path: "/reports",
          },
          {
            key: "settings",
            name: "Pengaturan",
            icon: Package,
            subModules: [
              {
                key: "company-settings",
                name: "Pengaturan Perusahaan",
                icon: Building,
                path: "/settings/company",
              },
              {
                key: "module-settings",
                name: "Pengaturan Modul",
                icon: Package,
                path: "/settings/modules",
              },
            ],
          },
        ];

      case UserRole.EMPLOYEE:
        // ERP Modules based on blueprint - filtered by user's assigned permissions
        const allErrModules: ModuleItem[] = [
          {
            key: "pos",
            name: "POS (Kasir)",
            icon: ShoppingCart,
            path: "/pos",
            subModules: [
              {
                key: "pos-transaction",
                name: "Transaksi",
                icon: ShoppingCart,
                path: "/pos/transaction",
              },
              {
                key: "pos-shift",
                name: "Buka/Tutup Kasir",
                icon: ShoppingCart,
                path: "/pos/shift",
              },
              {
                key: "pos-refund",
                name: "Refund",
                icon: Package,
                path: "/pos/refund",
              },
            ],
          },
          {
            key: "sales",
            name: "Sales & Purchasing",
            icon: TrendingUp,
            path: "/sales",
            subModules: [
              {
                key: "sales-orders",
                name: "Sales Orders",
                icon: TrendingUp,
                path: "/sales/orders",
              },
              {
                key: "purchasing",
                name: "Purchasing",
                icon: Package,
                path: "/sales/purchasing",
              },
              {
                key: "sales-analysis",
                name: "Analisis Penjualan",
                icon: TrendingUp,
                path: "/sales/analysis",
              },
            ],
          },
          {
            key: "inventory",
            name: "Inventory/Gudang",
            icon: Package,
            path: "/inventory",
            subModules: [
              {
                key: "products",
                name: "Produk & Stok",
                icon: Package,
                path: "/inventory/products",
              },
              {
                key: "stock-transfer",
                name: "Transfer Stok",
                icon: Package,
                path: "/inventory/transfer",
              },
              {
                key: "stock-opname",
                name: "Stock Opname",
                icon: Package,
                path: "/inventory/opname",
              },
            ],
          },
          {
            key: "customers",
            name: "Customers & Suppliers",
            icon: Users,
            path: "/customers",
            subModules: [
              {
                key: "customer-management",
                name: "Kelola Customer",
                icon: Users,
                path: "/customers/management",
              },
              {
                key: "supplier-management",
                name: "Kelola Supplier",
                icon: Users,
                path: "/customers/suppliers",
              },
              {
                key: "customer-history",
                name: "Riwayat Transaksi",
                icon: Users,
                path: "/customers/history",
              },
            ],
          },
          {
            key: "promotions",
            name: "Promosi",
            icon: Gift,
            path: "/promotions",
            subModules: [
              {
                key: "discount-management",
                name: "Kelola Diskon",
                icon: Gift,
                path: "/promotions/discounts",
              },
              {
                key: "bundle-promo",
                name: "Promo Bundling",
                icon: Gift,
                path: "/promotions/bundles",
              },
            ],
          },
          {
            key: "hr",
            name: "Karyawan ",
            icon: UserCheck,
            path: "/hr",
            subModules: [
              {
                key: "attendance",
                name: "Absensi",
                icon: UserCheck,
                path: "/hr/attendance",
              },
              {
                key: "salary-slip",
                name: "Slip Gaji",
                icon: UserCheck,
                path: "/hr/salary",
              },
            ],
          },
          {
            key: "finance",
            name: "Keuangan",
            icon: DollarSign,
            path: "/finance",
            subModules: [
              {
                key: "cash-flow",
                name: "Kas Masuk/Keluar",
                icon: DollarSign,
                path: "/finance/cash",
              },
              {
                key: "journal",
                name: "Jurnal Manual",
                icon: DollarSign,
                path: "/finance/journal",
              },
              {
                key: "reports",
                name: "Laporan Keuangan",
                icon: DollarSign,
                path: "/finance/reports",
              },
            ],
          },
          {
            key: "vehicles",
            name: "Kendaraan",
            icon: Truck,
            path: "/vehicles",
            subModules: [
              {
                key: "vehicle-management",
                name: "Kelola Kendaraan",
                icon: Truck,
                path: "/vehicles/management",
              },
              {
                key: "vehicle-assignment",
                name: "Assignment Kendaraan",
                icon: Truck,
                path: "/vehicles/assignment",
              },
            ],
          },
          {
            key: "salesman",
            name: "Salesman",
            icon: Users,
            path: "/salesman",
            subModules: [
              {
                key: "commission",
                name: "Komisi",
                icon: Users,
                path: "/salesman/commission",
              },
              {
                key: "top-products",
                name: "Top Produk",
                icon: Users,
                path: "/salesman/products",
              },
              {
                key: "top-customers",
                name: "Top Customer",
                icon: Users,
                path: "/salesman/customers",
              },
            ],
          },
        ];

        // TODO: In real implementation, filter based on employee's assigned modules
        // For now, return all modules for demo purposes
        return allErrModules;

      default:
        return [];
    }
  };

  const modules = getModulesForRole(user.role);

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`${
        isMobile ? "w-full" : "w-64"
      } bg-card border-r h-full flex flex-col`}
    >
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
              onClick={() => {
                if (module.subModules) {
                  toggleModule(module.key);
                } else if (module.path) {
                  router.push(module.path);
                }
              }}
            >
              <module.icon className="h-4 w-4 mr-3" />
              {module.name}
              {module.subModules &&
                (expandedModules.includes(module.key) ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ))}
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
              <DropdownMenuItem onClick={logout}>
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
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
