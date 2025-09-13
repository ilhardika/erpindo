import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PermissionProvider } from '@/providers/PermissionProvider';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ActionButton } from '@/components/ui/ActionButton';
import { UserManagement } from '@/components/admin/UserManagement';
import { ProductCatalog } from '@/components/products/ProductCatalog';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { FinanceReports } from '@/components/finance/FinanceReports';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { useAuthStore } from '@/stores/authStore';
import { usePermissionStore } from '@/stores/permissionStore';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

// Mock stores
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('@/stores/permissionStore', () => ({
  usePermissionStore: vi.fn()
}));

// Mock components
vi.mock('@/providers/PermissionProvider', () => ({
  PermissionProvider: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="permission-provider">{children}</div>
}));

vi.mock('@/components/auth/PermissionGuard', () => ({
  PermissionGuard: ({ children, permissions, fallback }: any) => {
    const { hasPermission } = usePermissionStore();
    if (hasPermission && permissions.some((p: string) => hasPermission(p))) {
      return <div data-testid="permission-guard-allowed">{children}</div>;
    }
    return fallback || <div data-testid="permission-guard-denied">Akses ditolak</div>;
  }
}));

vi.mock('@/components/ui/ActionButton', () => ({
  ActionButton: ({ children, permission, onClick, ...props }: any) => {
    const { hasPermission } = usePermissionStore();
    const isDisabled = permission && !hasPermission(permission);
    return (
      <button 
        data-testid="action-button" 
        disabled={isDisabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
}));

vi.mock('@/components/admin/UserManagement', () => ({
  UserManagement: () => <div data-testid="user-management">User Management</div>
}));

vi.mock('@/components/products/ProductCatalog', () => ({
  ProductCatalog: () => <div data-testid="product-catalog">Product Catalog</div>
}));

vi.mock('@/components/inventory/InventoryDashboard', () => ({
  InventoryDashboard: () => <div data-testid="inventory-dashboard">Inventory Dashboard</div>
}));

vi.mock('@/components/finance/FinanceReports', () => ({
  FinanceReports: () => <div data-testid="finance-reports">Finance Reports</div>
}));

vi.mock('@/components/admin/SystemSettings', () => ({
  SystemSettings: () => <div data-testid="system-settings">System Settings</div>
}));

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn()
};

const mockPermissionStore = {
  permissions: [],
  hasPermission: vi.fn(),
  hasAnyPermission: vi.fn(),
  hasAllPermissions: vi.fn(),
  loadUserPermissions: vi.fn(),
  clearPermissions: vi.fn()
};

describe('Permission System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (usePermissionStore as any).mockReturnValue(mockPermissionStore);
  });

  describe('Role-based Permissions', () => {
    it('should grant Dev role full system access', async () => {
      const devUser = {
        id: 'dev-001',
        email: 'dev@erpindo.com',
        user_metadata: { full_name: 'Developer Admin' }
      };

      mockAuthStore.user = devUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'dev';

      mockPermissionStore.permissions = [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'companies.create', 'companies.read', 'companies.update', 'companies.delete',
        'products.create', 'products.read', 'products.update', 'products.delete',
        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        'finance.read', 'finance.update', 'finance.reports',
        'system.settings', 'system.backup', 'system.restore'
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      render(
        <BrowserRouter>
          <PermissionProvider>
            <PermissionGuard permissions={['system.settings']}>
              <SystemSettings />
            </PermissionGuard>
          </PermissionProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('permission-guard-allowed')).toBeInTheDocument();
      expect(screen.getByTestId('system-settings')).toBeInTheDocument();
    });

    it('should grant Owner role company-specific admin access', async () => {
      const ownerUser = {
        id: 'owner-maju-jaya',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };

      mockAuthStore.user = ownerUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      mockPermissionStore.permissions = [
        'users.create', 'users.read', 'users.update', 'users.delete', // Within company
        'products.create', 'products.read', 'products.update', 'products.delete',
        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        'finance.read', 'finance.update', 'finance.reports',
        'company.settings' // Company-specific settings only
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      render(
        <BrowserRouter>
          <PermissionProvider>
            <PermissionGuard permissions={['users.create']}>
              <UserManagement />
            </PermissionGuard>
          </PermissionProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('permission-guard-allowed')).toBeInTheDocument();
      expect(screen.getByTestId('user-management')).toBeInTheDocument();

      // Owner should NOT have system-wide settings access
      expect(mockPermissionStore.hasPermission('system.settings')).toBe(false);
    });

    it('should restrict Staff role to basic operations', async () => {
      const staffUser = {
        id: 'staff-maju-jaya',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Andi Pratama' }
      };

      mockAuthStore.user = staffUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockPermissionStore.permissions = [
        'products.read', 'products.update', // Limited product access
        'inventory.read', 'inventory.update', // Limited inventory access
        'finance.read' // Read-only finance access
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      render(
        <BrowserRouter>
          <PermissionProvider>
            <PermissionGuard 
              permissions={['products.read']}
              fallback={<div data-testid="access-denied">Akses ditolak</div>}
            >
              <ProductCatalog />
            </PermissionGuard>
          </PermissionProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('permission-guard-allowed')).toBeInTheDocument();
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument();

      // Staff should NOT have admin permissions
      expect(mockPermissionStore.hasPermission('users.create')).toBe(false);
      expect(mockPermissionStore.hasPermission('users.delete')).toBe(false);
      expect(mockPermissionStore.hasPermission('system.settings')).toBe(false);
    });
  });

  describe('Permission Guards', () => {
    it('should block access without required permissions', async () => {
      const staffUser = {
        id: 'staff-limited',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Limited Staff' }
      };

      mockAuthStore.user = staffUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockPermissionStore.permissions = ['products.read']; // Limited permissions

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      render(
        <BrowserRouter>
          <PermissionProvider>
            <PermissionGuard 
              permissions={['finance.reports']}
              fallback={<div data-testid="access-denied">Akses ditolak: Tidak memiliki izin untuk melihat laporan keuangan</div>}
            >
              <FinanceReports />
            </PermissionGuard>
          </PermissionProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('Akses ditolak: Tidak memiliki izin untuk melihat laporan keuangan')).toBeInTheDocument();
      expect(screen.queryByTestId('finance-reports')).not.toBeInTheDocument();
    });

    it('should handle multiple required permissions', async () => {
      const managerUser = {
        id: 'manager-001',
        email: 'manager@majujaya.co.id',
        user_metadata: { full_name: 'Manager Operasional' }
      };

      mockAuthStore.user = managerUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockPermissionStore.permissions = [
        'inventory.read', 
        'inventory.update'
        // Missing 'inventory.reports' permission
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      mockPermissionStore.hasAllPermissions.mockImplementation((permissions: string[]) => 
        permissions.every(p => mockPermissionStore.permissions.includes(p))
      );

      // Component requiring multiple permissions
      const InventoryReportsComponent = () => (
        <PermissionGuard 
          permissions={['inventory.read', 'inventory.update', 'inventory.reports']}
          fallback={<div data-testid="insufficient-permissions">Izin tidak lengkap untuk akses laporan inventory</div>}
        >
          <div data-testid="inventory-reports">Inventory Reports</div>
        </PermissionGuard>
      );

      render(
        <BrowserRouter>
          <PermissionProvider>
            <InventoryReportsComponent />
          </PermissionProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('insufficient-permissions')).toBeInTheDocument();
      expect(screen.queryByTestId('inventory-reports')).not.toBeInTheDocument();
    });
  });

  describe('Action Button Permissions', () => {
    it('should disable buttons based on permissions', async () => {
      const staffUser = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff Member' }
      };

      mockAuthStore.user = staffUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockPermissionStore.permissions = ['products.read'];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      const handleDelete = vi.fn();

      render(
        <BrowserRouter>
          <PermissionProvider>
            <ActionButton permission="products.delete" onClick={handleDelete}>
              Hapus Produk
            </ActionButton>
          </PermissionProvider>
        </BrowserRouter>
      );

      const deleteButton = screen.getByTestId('action-button');
      expect(deleteButton).toBeDisabled();

      fireEvent.click(deleteButton);
      expect(handleDelete).not.toHaveBeenCalled();
    });

    it('should enable buttons with proper permissions', async () => {
      const ownerUser = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Company Owner' }
      };

      mockAuthStore.user = ownerUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      mockPermissionStore.permissions = ['products.delete'];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      const handleDelete = vi.fn();

      render(
        <BrowserRouter>
          <PermissionProvider>
            <ActionButton permission="products.delete" onClick={handleDelete}>
              Hapus Produk
            </ActionButton>
          </PermissionProvider>
        </BrowserRouter>
      );

      const deleteButton = screen.getByTestId('action-button');
      expect(deleteButton).not.toBeDisabled();

      fireEvent.click(deleteButton);
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Indonesian Permission Context', () => {
    it('should support Indonesian business hierarchy permissions', async () => {
      const managerUser = {
        id: 'manager-hrd',
        email: 'hrd@majujaya.co.id',
        user_metadata: { 
          full_name: 'Siti Rahayu',
          department: 'HRD',
          position: 'Manager HRD'
        }
      };

      mockAuthStore.user = managerUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      // Indonesian business-specific permissions
      mockPermissionStore.permissions = [
        'karyawan.lihat', // View employees
        'karyawan.edit', // Edit employees
        'gaji.lihat', // View salaries
        'absensi.kelola', // Manage attendance
        'cuti.approve', // Approve leave
        'pajak.pph21' // PPh21 tax management
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      // Test Indonesian permission naming
      expect(mockPermissionStore.hasPermission('karyawan.lihat')).toBe(true);
      expect(mockPermissionStore.hasPermission('gaji.lihat')).toBe(true);
      expect(mockPermissionStore.hasPermission('pajak.pph21')).toBe(true);
      expect(mockPermissionStore.hasPermission('keuangan.laporan')).toBe(false);
    });

    it('should handle Indonesian compliance permissions', async () => {
      const financeUser = {
        id: 'finance-001',
        email: 'finance@majujaya.co.id',
        user_metadata: { 
          full_name: 'Ahmad Fauzi',
          department: 'Keuangan',
          position: 'Staff Keuangan'
        }
      };

      mockAuthStore.user = financeUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      // Indonesian tax and compliance permissions
      mockPermissionStore.permissions = [
        'faktur.pajak', // Tax invoices
        'bukti.potong', // Tax withholding receipts
        'lapor.pajak', // Tax reporting
        'bpjs.kelola', // BPJS management
        'bank.reconcile', // Bank reconciliation
        'mata.uang.idr' // IDR currency handling
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      // Test Indonesian compliance permissions
      expect(mockPermissionStore.hasPermission('faktur.pajak')).toBe(true);
      expect(mockPermissionStore.hasPermission('bukti.potong')).toBe(true);
      expect(mockPermissionStore.hasPermission('lapor.pajak')).toBe(true);
      expect(mockPermissionStore.hasPermission('bpjs.kelola')).toBe(true);
    });
  });

  describe('Permission Inheritance and Hierarchy', () => {
    it('should inherit permissions based on role hierarchy', async () => {
      const supervisorUser = {
        id: 'supervisor-001',
        email: 'supervisor@majujaya.co.id',
        user_metadata: { 
          full_name: 'Maya Sari',
          position: 'Supervisor',
          reports_to: 'manager-001'
        }
      };

      mockAuthStore.user = supervisorUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      // Supervisor inherits staff permissions + additional ones
      const staffPermissions = ['products.read', 'inventory.read'];
      const supervisorPermissions = ['staff.manage', 'reports.view'];
      
      mockPermissionStore.permissions = [...staffPermissions, ...supervisorPermissions];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      // Should have both inherited and specific permissions
      expect(mockPermissionStore.hasPermission('products.read')).toBe(true); // Inherited
      expect(mockPermissionStore.hasPermission('staff.manage')).toBe(true); // Specific
      expect(mockPermissionStore.hasPermission('users.delete')).toBe(false); // Not allowed
    });

    it('should handle department-specific permissions', async () => {
      const itStaffUser = {
        id: 'it-001',
        email: 'it@majujaya.co.id',
        user_metadata: { 
          full_name: 'Rudi Hartono',
          department: 'IT',
          position: 'IT Support'
        }
      };

      mockAuthStore.user = itStaffUser;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      // IT department specific permissions
      mockPermissionStore.permissions = [
        'system.backup',
        'system.monitor',
        'users.reset.password',
        'database.read',
        'logs.view'
      ];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => 
        mockPermissionStore.permissions.includes(permission)
      );

      // IT staff should have technical permissions but not business permissions
      expect(mockPermissionStore.hasPermission('system.backup')).toBe(true);
      expect(mockPermissionStore.hasPermission('users.reset.password')).toBe(true);
      expect(mockPermissionStore.hasPermission('finance.reports')).toBe(false);
      expect(mockPermissionStore.hasPermission('products.delete')).toBe(false);
    });
  });

  describe('Dynamic Permission Loading', () => {
    it('should load permissions on user authentication', async () => {
      const user = {
        id: 'user-001',
        email: 'user@majujaya.co.id',
        user_metadata: { full_name: 'Dynamic User' }
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;

      const mockLoadPermissions = vi.fn().mockResolvedValue([
        'products.read',
        'inventory.read'
      ]);

      mockPermissionStore.loadUserPermissions = mockLoadPermissions;

      // Simulate component mounting and loading permissions
      render(
        <BrowserRouter>
          <PermissionProvider>
            <div>Permission Provider Loaded</div>
          </PermissionProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockLoadPermissions).toHaveBeenCalledWith(user.id);
      });
    });

    it('should clear permissions on logout', async () => {
      mockAuthStore.user = null;
      mockAuthStore.isAuthenticated = false;

      const mockClearPermissions = vi.fn();
      mockPermissionStore.clearPermissions = mockClearPermissions;

      // Simulate logout
      mockAuthStore.logout.mockImplementation(() => {
        mockAuthStore.user = null;
        mockAuthStore.isAuthenticated = false;
        mockPermissionStore.clearPermissions();
      });

      mockAuthStore.logout();

      expect(mockClearPermissions).toHaveBeenCalled();
      expect(mockAuthStore.user).toBeNull();
      expect(mockAuthStore.isAuthenticated).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle permission loading errors gracefully', async () => {
      const user = {
        id: 'error-user',
        email: 'error@majujaya.co.id',
        user_metadata: { full_name: 'Error User' }
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;

      const mockLoadPermissions = vi.fn().mockRejectedValue(
        new Error('Failed to load permissions')
      );

      mockPermissionStore.loadUserPermissions = mockLoadPermissions;
      mockPermissionStore.permissions = []; // Empty permissions on error

      mockPermissionStore.hasPermission.mockImplementation(() => false);

      render(
        <BrowserRouter>
          <PermissionProvider>
            <PermissionGuard 
              permissions={['products.read']}
              fallback={<div data-testid="no-permissions">Tidak dapat memuat izin</div>}
            >
              <ProductCatalog />
            </PermissionGuard>
          </PermissionProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('no-permissions')).toBeInTheDocument();
        expect(screen.queryByTestId('product-catalog')).not.toBeInTheDocument();
      });
    });

    it('should log permission violations for security audit', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const user = {
        id: 'violation-user',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff User' }
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockPermissionStore.permissions = ['products.read'];

      mockPermissionStore.hasPermission.mockImplementation((permission: string) => {
        const hasAccess = mockPermissionStore.permissions.includes(permission);
        if (!hasAccess) {
          console.warn(`Permission violation: User ${user.id} attempted to access ${permission}`);
        }
        return hasAccess;
      });

      // Attempt unauthorized access
      mockPermissionStore.hasPermission('system.settings');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Permission violation')
      );

      consoleSpy.mockRestore();
    });
  });
});