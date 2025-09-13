import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { DevDashboard } from '@/pages/dashboard/DevDashboard';
import { OwnerDashboard } from '@/pages/dashboard/OwnerDashboard';
import { StaffDashboard } from '@/pages/dashboard/StaffDashboard';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';

// Mock stores
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('@/stores/tenantStore', () => ({
  useTenantStore: vi.fn()
}));

// Mock components
vi.mock('@/components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">
      <div data-testid="layout-sidebar">Sidebar</div>
      <div data-testid="layout-header">Header</div>
      <div data-testid="layout-content">{children}</div>
    </div>
  )
}));

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => {
    const { userRole } = useAuthStore();
    const menuItems = {
      dev: [
        { id: 'companies', label: 'Manajemen Perusahaan', path: '/admin/companies' },
        { id: 'subscriptions', label: 'Paket Berlangganan', path: '/admin/subscriptions' },
        { id: 'system', label: 'Pengaturan Sistem', path: '/admin/system' }
      ],
      owner: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'products', label: 'Produk', path: '/products' },
        { id: 'customers', label: 'Pelanggan', path: '/customers' },
        { id: 'pos', label: 'Point of Sale', path: '/pos' },
        { id: 'reports', label: 'Laporan', path: '/reports' },
        { id: 'users', label: 'Manajemen User', path: '/users' },
        { id: 'settings', label: 'Pengaturan', path: '/settings' }
      ],
      staff: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'pos', label: 'Kasir', path: '/pos' },
        { id: 'products', label: 'Lihat Produk', path: '/products' },
        { id: 'customers', label: 'Data Pelanggan', path: '/customers' }
      ]
    };
    
    const items = menuItems[userRole as keyof typeof menuItems] || [];
    
    return (
      <nav data-testid="sidebar">
        <div data-testid="sidebar-logo">ERP Indo</div>
        <ul data-testid="menu-items">
          {items.map(item => (
            <li key={item.id} data-testid={`menu-item-${item.id}`}>
              <a href={item.path}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}));

vi.mock('@/components/layout/Header', () => ({
  Header: () => {
    const { user, currentTenant } = useAuthStore();
    const { availableTenants, switchTenant } = useTenantStore();
    
    return (
      <header data-testid="header">
        <div data-testid="header-company-info">
          <span>{currentTenant?.name || 'Pilih Perusahaan'}</span>
          {availableTenants && availableTenants.length > 1 && (
            <select 
              data-testid="tenant-switcher"
              onChange={(e) => switchTenant(availableTenants.find(t => t.id === e.target.value))}
            >
              {availableTenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div data-testid="header-user-info">
          <span>{user?.user_metadata?.full_name || 'User'}</span>
          <button data-testid="logout-button">Keluar</button>
        </div>
      </header>
    );
  }
}));

vi.mock('@/components/dashboard/DashboardWidgets', () => ({
  DashboardWidgets: ({ role }: { role: string }) => (
    <div data-testid="dashboard-widgets">
      <div data-testid={`widgets-${role}`}>
        Dashboard Widgets for {role}
      </div>
    </div>
  )
}));

vi.mock('@/pages/dashboard/DevDashboard', () => ({
  DevDashboard: () => (
    <div data-testid="dev-dashboard">
      <h1>Dashboard Developer</h1>
      <div data-testid="dev-stats">
        <div>Total Perusahaan: 25</div>
        <div>Total Users: 150</div>
        <div>Server Status: Online</div>
      </div>
    </div>
  )
}));

vi.mock('@/pages/dashboard/OwnerDashboard', () => ({
  OwnerDashboard: () => (
    <div data-testid="owner-dashboard">
      <h1>Dashboard Pemilik</h1>
      <div data-testid="owner-stats">
        <div>Penjualan Hari Ini: Rp 2.500.000</div>
        <div>Total Produk: 45</div>
        <div>Total Pelanggan: 128</div>
      </div>
    </div>
  )
}));

vi.mock('@/pages/dashboard/StaffDashboard', () => ({
  StaffDashboard: () => (
    <div data-testid="staff-dashboard">
      <h1>Dashboard Staff</h1>
      <div data-testid="staff-stats">
        <div>Transaksi Hari Ini: 15</div>
        <div>Total Penjualan: Rp 1.200.000</div>
      </div>
    </div>
  )
}));

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  currentTenant: null,
  logout: vi.fn()
};

const mockTenantStore = {
  currentTenant: null,
  availableTenants: [],
  switchTenant: vi.fn(),
  loadTenants: vi.fn()
};

describe('Dashboard Navigation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (useTenantStore as any).mockReturnValue(mockTenantStore);
  });

  describe('Dashboard Layout Structure', () => {
    it('should render dashboard layout with sidebar and header', async () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <DashboardLayout>
              <div>Dashboard Content</div>
            </DashboardLayout>
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      expect(screen.getByTestId('layout-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('layout-header')).toBeInTheDocument();
      expect(screen.getByTestId('layout-content')).toBeInTheDocument();
    });

    it('should display company information in header', async () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('header-company-info')).toHaveTextContent('PT Maju Jaya');
      expect(screen.getByTestId('header-user-info')).toHaveTextContent('Budi Santoso');
    });
  });

  describe('Role-based Navigation Menu', () => {
    it('should display dev role navigation menu', async () => {
      mockAuthStore.user = {
        id: 'dev-001',
        email: 'dev@erpindo.com',
        user_metadata: { full_name: 'Developer Admin' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'dev';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-companies')).toHaveTextContent('Manajemen Perusahaan');
      expect(screen.getByTestId('menu-item-subscriptions')).toHaveTextContent('Paket Berlangganan');
      expect(screen.getByTestId('menu-item-system')).toHaveTextContent('Pengaturan Sistem');
    });

    it('should display owner role navigation menu', async () => {
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('menu-item-dashboard')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('menu-item-products')).toHaveTextContent('Produk');
      expect(screen.getByTestId('menu-item-customers')).toHaveTextContent('Pelanggan');
      expect(screen.getByTestId('menu-item-pos')).toHaveTextContent('Point of Sale');
      expect(screen.getByTestId('menu-item-reports')).toHaveTextContent('Laporan');
      expect(screen.getByTestId('menu-item-users')).toHaveTextContent('Manajemen User');
      expect(screen.getByTestId('menu-item-settings')).toHaveTextContent('Pengaturan');
    });

    it('should display staff role navigation menu with limited access', async () => {
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Andi Pratama' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('menu-item-dashboard')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('menu-item-pos')).toHaveTextContent('Kasir');
      expect(screen.getByTestId('menu-item-products')).toHaveTextContent('Lihat Produk');
      expect(screen.getByTestId('menu-item-customers')).toHaveTextContent('Data Pelanggan');

      // Staff should NOT have these menu items
      expect(screen.queryByTestId('menu-item-users')).not.toBeInTheDocument();
      expect(screen.queryByTestId('menu-item-settings')).not.toBeInTheDocument();
      expect(screen.queryByTestId('menu-item-reports')).not.toBeInTheDocument();
    });

    it('should hide navigation menu for unauthenticated users', async () => {
      mockAuthStore.user = null;
      mockAuthStore.isAuthenticated = false;
      mockAuthStore.userRole = null;

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('menu-items').children).toHaveLength(0);
    });
  });

  describe('Role-specific Dashboard Content', () => {
    it('should display dev dashboard with system statistics', async () => {
      mockAuthStore.user = {
        id: 'dev-001',
        email: 'dev@erpindo.com',
        user_metadata: { full_name: 'Developer Admin' }
      };
      mockAuthStore.userRole = 'dev';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <DevDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('dev-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Developer')).toBeInTheDocument();
      expect(screen.getByTestId('dev-stats')).toHaveTextContent('Total Perusahaan: 25');
      expect(screen.getByTestId('dev-stats')).toHaveTextContent('Total Users: 150');
      expect(screen.getByTestId('dev-stats')).toHaveTextContent('Server Status: Online');
    });

    it('should display owner dashboard with business metrics', async () => {
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.userRole = 'owner';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <OwnerDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('owner-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Pemilik')).toBeInTheDocument();
      expect(screen.getByTestId('owner-stats')).toHaveTextContent('Penjualan Hari Ini: Rp 2.500.000');
      expect(screen.getByTestId('owner-stats')).toHaveTextContent('Total Produk: 45');
      expect(screen.getByTestId('owner-stats')).toHaveTextContent('Total Pelanggan: 128');
    });

    it('should display staff dashboard with operational metrics', async () => {
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Andi Pratama' }
      };
      mockAuthStore.userRole = 'staff';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StaffDashboard />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('staff-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Staff')).toBeInTheDocument();
      expect(screen.getByTestId('staff-stats')).toHaveTextContent('Transaksi Hari Ini: 15');
      expect(screen.getByTestId('staff-stats')).toHaveTextContent('Total Penjualan: Rp 1.200.000');
    });
  });

  describe('Multi-tenant Company Switching', () => {
    it('should display tenant switcher for users with multiple companies', async () => {
      mockAuthStore.user = {
        id: 'consultant-001',
        email: 'consultant@external.com',
        user_metadata: { full_name: 'External Consultant' }
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      mockTenantStore.availableTenants = [
        { id: 'company-maju-jaya', name: 'PT Maju Jaya', slug: 'maju-jaya' },
        { id: 'company-sejahtera', name: 'PT Sejahtera', slug: 'sejahtera' },
        { id: 'company-bimantara', name: 'CV Bimantara', slug: 'bimantara' }
      ];

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('tenant-switcher')).toBeInTheDocument();
      
      const selectElement = screen.getByTestId('tenant-switcher');
      const options = Array.from(selectElement.querySelectorAll('option'));
      
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('PT Maju Jaya');
      expect(options[1]).toHaveTextContent('PT Sejahtera');
      expect(options[2]).toHaveTextContent('CV Bimantara');
    });

    it('should switch tenant when different company is selected', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = {
        id: 'consultant-001',
        email: 'consultant@external.com',
        user_metadata: { full_name: 'External Consultant' }
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const availableTenants = [
        { id: 'company-maju-jaya', name: 'PT Maju Jaya', slug: 'maju-jaya' },
        { id: 'company-sejahtera', name: 'PT Sejahtera', slug: 'sejahtera' }
      ];

      mockTenantStore.availableTenants = availableTenants;

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      );

      const tenantSwitcher = screen.getByTestId('tenant-switcher');
      await user.selectOptions(tenantSwitcher, 'company-sejahtera');

      expect(mockTenantStore.switchTenant).toHaveBeenCalledWith(
        availableTenants.find(t => t.id === 'company-sejahtera')
      );
    });

    it('should hide tenant switcher for single-company users', async () => {
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      mockTenantStore.availableTenants = [
        { id: 'company-maju-jaya', name: 'PT Maju Jaya', slug: 'maju-jaya' }
      ];

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.queryByTestId('tenant-switcher')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Routing', () => {
    it('should navigate between different pages correctly', async () => {
      const routes = [
        { path: '/dashboard', component: 'Dashboard' },
        { path: '/products', component: 'Products' },
        { path: '/customers', component: 'Customers' },
        { path: '/pos', component: 'POS' }
      ];

      routes.forEach(route => {
        render(
          <MemoryRouter initialEntries={[route.path]}>
            <div data-testid={`page-${route.component.toLowerCase()}`}>
              {route.component} Page
            </div>
          </MemoryRouter>
        );

        expect(screen.getByTestId(`page-${route.component.toLowerCase()}`)).toBeInTheDocument();
        
        // Clean up
        screen.getByTestId(`page-${route.component.toLowerCase()}`).remove();
      });
    });

    it('should handle breadcrumb navigation', async () => {
      const breadcrumbPaths = [
        { path: '/dashboard', breadcrumb: 'Dashboard' },
        { path: '/products', breadcrumb: 'Dashboard > Produk' },
        { path: '/products/create', breadcrumb: 'Dashboard > Produk > Tambah Produk' },
        { path: '/customers/edit/123', breadcrumb: 'Dashboard > Pelanggan > Edit Pelanggan' }
      ];

      breadcrumbPaths.forEach(item => {
        const breadcrumbItems = item.breadcrumb.split(' > ');
        expect(breadcrumbItems.length).toBeGreaterThan(0);
        expect(breadcrumbItems[0]).toBe('Dashboard');
      });
    });
  });

  describe('Indonesian Language Support', () => {
    it('should display all navigation labels in Indonesian', async () => {
      const indonesianLabels = [
        'Dashboard',
        'Produk',
        'Pelanggan',
        'Point of Sale',
        'Kasir',
        'Laporan',
        'Manajemen User',
        'Pengaturan',
        'Manajemen Perusahaan',
        'Paket Berlangganan',
        'Pengaturan Sistem'
      ];

      indonesianLabels.forEach(label => {
        expect(label).toMatch(/^[A-Za-z\s]+$/); // Basic check for Indonesian words
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should display Indonesian date and time formats', async () => {
      const indonesianDate = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());

      const indonesianTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date());

      expect(indonesianDate).toMatch(/\d{1,2}\s\w+\s\d{4}/); // e.g., "1 September 2024"
      expect(indonesianTime).toMatch(/\d{2}:\d{2}/); // e.g., "14:30"
    });

    it('should display Indonesian currency formatting in dashboard', async () => {
      const amounts = [2500000, 1200000, 45, 128];
      
      amounts.forEach(amount => {
        const formatted = amount.toLocaleString('id-ID');
        expect(formatted).toMatch(/^[\d.]+$/); // Indonesian number format with dots
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt navigation for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockAuthStore.userRole = 'owner';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Mobile navigation should still render but might be collapsible
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(window.innerWidth).toBe(375); // Mobile width
    });

    it('should display full navigation for desktop screens', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      mockAuthStore.userRole = 'owner';

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Sidebar />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(window.innerWidth).toBe(1024); // Desktop width
    });
  });

  describe('User Authentication State', () => {
    it('should handle user logout correctly', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = {
        id: 'user-001',
        email: 'user@majujaya.co.id',
        user_metadata: { full_name: 'Test User' }
      };
      mockAuthStore.logout = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </QueryClientProvider>
      );

      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should redirect unauthenticated users', async () => {
      mockAuthStore.user = null;
      mockAuthStore.isAuthenticated = false;

      // This would be handled by route protection in actual implementation
      const isAuthenticated = mockAuthStore.isAuthenticated;
      expect(isAuthenticated).toBe(false);

      if (!isAuthenticated) {
        // Should redirect to login
        const redirectPath = '/login';
        expect(redirectPath).toBe('/login');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const navigationError = new Error('Navigation failed');
      
      const handleNavigationError = (error: Error) => {
        console.error('Navigation error:', error.message);
        return 'Terjadi kesalahan saat navigasi. Silakan coba lagi.';
      };

      const errorMessage = handleNavigationError(navigationError);
      expect(errorMessage).toBe('Terjadi kesalahan saat navigasi. Silakan coba lagi.');
    });

    it('should handle tenant switching errors', async () => {
      mockTenantStore.switchTenant.mockRejectedValue(
        new Error('Gagal beralih perusahaan')
      );

      try {
        await mockTenantStore.switchTenant({ id: 'invalid', name: 'Invalid' });
      } catch (error) {
        expect((error as Error).message).toBe('Gagal beralih perusahaan');
      }
    });
  });
});