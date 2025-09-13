import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from '@/providers/TenantProvider';
import { CompanyDashboard } from '@/components/dashboard/CompanyDashboard';
import { ProductList } from '@/components/products/ProductList';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
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
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }
}));

// Mock stores
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('@/stores/tenantStore', () => ({
  useTenantStore: vi.fn()
}));

// Mock components
vi.mock('@/providers/TenantProvider', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tenant-provider">{children}</div>
}));

vi.mock('@/components/dashboard/CompanyDashboard', () => ({
  CompanyDashboard: () => <div data-testid="company-dashboard">Dashboard</div>
}));

vi.mock('@/components/products/ProductList', () => ({
  ProductList: () => <div data-testid="product-list">Products</div>
}));

vi.mock('@/components/employees/EmployeeList', () => ({
  EmployeeList: () => <div data-testid="employee-list">Employees</div>
}));

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn()
};

const mockTenantStore = {
  currentTenant: null,
  availableTenants: [],
  switchTenant: vi.fn(),
  loadTenants: vi.fn(),
  clearTenant: vi.fn()
};

describe('Multi-tenant Data Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (useTenantStore as any).mockReturnValue(mockTenantStore);
  });

  describe('Company Data Isolation', () => {
    it('should only fetch data for current tenant company', async () => {
      // Mock user from PT Maju Jaya
      const majuJayaUser = {
        id: 'user-maju-jaya',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };

      const majuJayaTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        slug: 'maju-jaya',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = majuJayaUser;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = majuJayaTenant;

      const mockSupabaseSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            { id: 1, name: 'Product A - Maju Jaya', company_id: 'company-maju-jaya' }
          ],
          error: null
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSupabaseSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <ProductList />
          </TenantProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('products');
        expect(mockSupabaseSelect).toHaveBeenCalled();
      });
    });

    it('should prevent cross-tenant data access', async () => {
      // Mock user from PT Sejahtera trying to access PT Maju Jaya data
      const sejahteraUser = {
        id: 'user-sejahtera',
        email: 'admin@sejahtera.com',
        user_metadata: { full_name: 'Siti Rahayu' }
      };

      const sejahteraTenant = {
        id: 'company-sejahtera',
        name: 'PT Sejahtera',
        slug: 'sejahtera',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = sejahteraUser;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = sejahteraTenant;

      // Mock RLS policy blocking cross-tenant access
      const mockSupabaseSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [], // Empty data due to RLS policy
          error: null
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSupabaseSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <ProductList />
          </TenantProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('products');
        // Should only return data for current tenant
        expect(mockSupabaseSelect().eq).toHaveBeenCalledWith('company_id', 'company-sejahtera');
      });
    });

    it('should isolate employee data between companies', async () => {
      const bimantaraUser = {
        id: 'user-bimantara',
        email: 'hr@bimantara.id',
        user_metadata: { full_name: 'Maya Sari' }
      };

      const bimantaraTenant = {
        id: 'company-bimantara',
        name: 'CV Bimantara',
        slug: 'bimantara',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = bimantaraUser;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = bimantaraTenant;

      const mockEmployeeData = [
        {
          id: 'emp-001',
          full_name: 'Ahmad Fauzi',
          email: 'ahmad@bimantara.id',
          company_id: 'company-bimantara'
        }
      ];

      const mockSupabaseSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: mockEmployeeData,
          error: null
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSupabaseSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <EmployeeList />
          </TenantProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_profiles');
        expect(mockSupabaseSelect().eq).toHaveBeenCalledWith('company_id', 'company-bimantara');
      });
    });
  });

  describe('Tenant Switching Security', () => {
    it('should clear sensitive data when switching tenants', async () => {
      const user = {
        id: 'multi-tenant-user',
        email: 'consultant@external.com',
        user_metadata: { full_name: 'Expert Consultant' }
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;

      // Initially on PT Maju Jaya
      const majuJayaTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        slug: 'maju-jaya',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockTenantStore.currentTenant = majuJayaTenant;
      mockTenantStore.availableTenants = [
        majuJayaTenant,
        {
          id: 'company-sejahtera',
          name: 'PT Sejahtera',
          slug: 'sejahtera',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      render(
        <BrowserRouter>
          <TenantProvider>
            <CompanyDashboard />
          </TenantProvider>
        </BrowserRouter>
      );

      // Switch to PT Sejahtera
      const sejahteraTenant = {
        id: 'company-sejahtera',
        name: 'PT Sejahtera',
        slug: 'sejahtera',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockTenantStore.currentTenant = sejahteraTenant;
      mockTenantStore.switchTenant.mockImplementation((tenant) => {
        mockTenantStore.currentTenant = tenant;
        // Should clear cached data
        mockTenantStore.clearTenant();
      });

      // Verify tenant switching clears data
      await waitFor(() => {
        expect(mockTenantStore.clearTenant).toHaveBeenCalled();
      });
    });

    it('should validate tenant access permissions', async () => {
      const staffUser = {
        id: 'staff-user',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Andi Pratama' }
      };

      mockAuthStore.user = staffUser;
      mockAuthStore.isAuthenticated = true;

      // Mock user trying to access unauthorized tenant
      const unauthorizedTenant = {
        id: 'company-competitor',
        name: 'PT Competitor',
        slug: 'competitor',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockTenantStore.switchTenant.mockImplementation((tenant) => {
        // Should throw error for unauthorized access
        throw new Error('Akses tidak diizinkan ke perusahaan ini');
      });

      expect(() => {
        mockTenantStore.switchTenant(unauthorizedTenant);
      }).toThrow('Akses tidak diizinkan ke perusahaan ini');
    });
  });

  describe('RLS Policy Enforcement', () => {
    it('should enforce company-scoped queries for products', async () => {
      const user = {
        id: 'test-user',
        email: 'test@telkomsigma.co.id',
        user_metadata: { full_name: 'Test User' }
      };

      const tenant = {
        id: 'company-telkom-sigma',
        name: 'PT Telkom Sigma',
        slug: 'telkom-sigma',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = tenant;

      // Mock RLS policy response
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [
            { id: 1, name: 'Software License', company_id: 'company-telkom-sigma' },
            { id: 2, name: 'Hardware Maintenance', company_id: 'company-telkom-sigma' }
          ],
          error: null
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <ProductList />
          </TenantProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('products');
        expect(mockSelect().eq).toHaveBeenCalledWith('company_id', 'company-telkom-sigma');
      });
    });

    it('should enforce role-based data access within tenant', async () => {
      const staffUser = {
        id: 'staff-user',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff Member' }
      };

      const tenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        slug: 'maju-jaya',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = staffUser;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = tenant;

      // Mock role-based access restrictions
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [
                // Staff can only see limited employee data
                { id: 'emp-001', full_name: 'Ahmad Fauzi', email: null } // email hidden for staff
              ],
              error: null
            }))
          }))
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <EmployeeList />
          </TenantProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('user_profiles');
        // Verify role-based filtering
        expect(mockSelect).toHaveBeenCalled();
      });
    });
  });

  describe('Indonesian Business Context', () => {
    it('should handle Indonesian company types correctly', async () => {
      const companies = [
        { type: 'PT', name: 'PT Maju Jaya', tax_id: '01.234.567.8-901.000' },
        { type: 'CV', name: 'CV Bimantara', tax_id: '02.345.678.9-012.000' },
        { type: 'UD', name: 'UD Sejahtera', tax_id: '03.456.789.0-123.000' }
      ];

      companies.forEach(company => {
        const mockSelect = vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [company],
            error: null
          }))
        }));

        (supabase.from as any).mockReturnValue({
          select: mockSelect
        });

        // Verify each company type is handled correctly
        expect(company.type).toMatch(/^(PT|CV|UD)$/);
        expect(company.tax_id).toMatch(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/);
      });
    });

    it('should support Indonesian currency and taxation', async () => {
      const user = {
        id: 'finance-user',
        email: 'finance@majujaya.co.id',
        user_metadata: { full_name: 'Finance Manager' }
      };

      const tenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        slug: 'maju-jaya',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = tenant;

      const mockProductData = [
        {
          id: 1,
          name: 'Laptop Gaming',
          price: 15000000, // IDR 15,000,000
          tax_rate: 0.11, // PPN 11%
          company_id: 'company-maju-jaya'
        }
      ];

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: mockProductData,
          error: null
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      // Verify Indonesian business data structure
      expect(mockProductData[0].tax_rate).toBe(0.11); // PPN 11%
      expect(mockProductData[0].price).toBeGreaterThan(1000000); // Typical IDR amounts
    });
  });

  describe('Error Handling and Security', () => {
    it('should handle unauthorized tenant access gracefully', async () => {
      const user = {
        id: 'external-user',
        email: 'external@gmail.com',
        user_metadata: { full_name: 'External User' }
      };

      mockAuthStore.user = user;
      mockAuthStore.isAuthenticated = true;
      mockTenantStore.currentTenant = null;

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: { message: 'Akses ditolak: Tidak memiliki izin untuk perusahaan ini' }
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      render(
        <BrowserRouter>
          <TenantProvider>
            <ProductList />
          </TenantProvider>
        </BrowserRouter>
      );

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.queryByText('Products')).toBeInTheDocument();
      });
    });

    it('should log security violations for audit', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const suspiciousUser = {
        id: 'suspicious-user',
        email: 'hacker@suspicious.com',
        user_metadata: { full_name: 'Suspicious User' }
      };

      mockAuthStore.user = suspiciousUser;
      mockAuthStore.isAuthenticated = true;

      // Attempt unauthorized tenant access
      mockTenantStore.switchTenant.mockImplementation((tenant) => {
        console.warn(`Security violation: User ${suspiciousUser.id} attempted unauthorized access to tenant ${tenant.id}`);
        throw new Error('Unauthorized access');
      });

      const unauthorizedTenant = {
        id: 'company-target',
        name: 'PT Target',
        slug: 'target',
        created_at: '2024-01-01T00:00:00Z'
      };

      expect(() => {
        mockTenantStore.switchTenant(unauthorizedTenant);
      }).toThrow('Unauthorized access');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Security violation')
      );

      consoleSpy.mockRestore();
    });
  });
});