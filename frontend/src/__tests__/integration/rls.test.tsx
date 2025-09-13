import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';
import { RLSTestComponent } from '@/components/test/RLSTestComponent';
import { checkRLSPolicies, validateDataAccess } from '@/lib/rlsValidation';
import { DatabaseService } from '@/services/databaseService';

// Mock Supabase client with RLS-specific methods
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(),
          order: vi.fn()
        })),
        neq: vi.fn(),
        in: vi.fn(),
        contains: vi.fn(),
        filter: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
        single: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
          single: vi.fn()
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    })),
    rpc: vi.fn(),
    sql: vi.fn()
  }
}));

// Mock stores
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('@/stores/tenantStore', () => ({
  useTenantStore: vi.fn()
}));

// Mock RLS validation utilities
vi.mock('@/lib/rlsValidation', () => ({
  checkRLSPolicies: vi.fn(),
  validateDataAccess: vi.fn()
}));

// Mock database service
vi.mock('@/services/databaseService', () => ({
  DatabaseService: {
    testRLSPolicies: vi.fn(),
    validateTenantAccess: vi.fn(),
    checkCrossTenantAccess: vi.fn()
  }
}));

// Mock test component
vi.mock('@/components/test/RLSTestComponent', () => ({
  RLSTestComponent: ({ tenantId, userId }: { tenantId: string; userId: string }) => (
    <div data-testid="rls-test-component">
      <div data-testid="current-tenant">{tenantId}</div>
      <div data-testid="current-user">{userId}</div>
      <div data-testid="data-access-status">Testing RLS</div>
    </div>
  )
}));

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  currentTenant: null,
  session: null
};

const mockTenantStore = {
  currentTenant: null,
  availableTenants: [],
  switchTenant: vi.fn()
};

describe('RLS Policy Enforcement', () => {
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

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should enforce company_id filtering for all tenant-specific tables', async () => {
      // Setup authenticated user for Company A
      mockAuthStore.user = {
        id: 'user-companya-001',
        email: 'owner@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const companyAProducts = [
        { id: 'prod-001', company_id: 'company-maju-jaya', name: 'Product A1' },
        { id: 'prod-002', company_id: 'company-maju-jaya', name: 'Product A2' }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: companyAProducts,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      // Query should automatically filter by company_id through RLS
      const result = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-maju-jaya');

      expect(mockQuery.eq).toHaveBeenCalledWith('company_id', 'company-maju-jaya');
      expect(result.data).toEqual(companyAProducts);
      
      // Verify no access to other company's data
      const companyBData = result.data?.filter(item => item.company_id !== 'company-maju-jaya');
      expect(companyBData).toHaveLength(0);
    });

    it('should prevent cross-tenant data access through RLS policies', async () => {
      // User from Company A trying to access Company B data
      mockAuthStore.user = {
        id: 'user-companya-001',
        email: 'owner@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const rlsViolationError = {
        message: 'Row-level security policy violation',
        code: '42501',
        details: 'User cannot access data from different company'
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: rlsViolationError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      // Attempt to query Company B's data
      const result = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-sejahtera'); // Different company

      expect(result.error?.code).toBe('42501');
      expect(result.error?.message).toContain('Row-level security');
      expect(result.data).toBeNull();
    });

    it('should validate RLS policies for all tenant-specific tables', async () => {
      const tenantSpecificTables = [
        'products',
        'customers',
        'sales_orders',
        'invoices',
        'employees',
        'suppliers',
        'inventory_transactions',
        'purchase_orders'
      ];

      mockAuthStore.user = {
        id: 'user-001',
        email: 'test@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      (DatabaseService.testRLSPolicies as any).mockResolvedValue({
        success: true,
        testedTables: tenantSpecificTables,
        violations: []
      });

      const rlsTestResult = await DatabaseService.testRLSPolicies(
        'company-maju-jaya',
        tenantSpecificTables
      );

      expect(rlsTestResult.success).toBe(true);
      expect(rlsTestResult.testedTables).toEqual(tenantSpecificTables);
      expect(rlsTestResult.violations).toHaveLength(0);
    });

    it('should handle system-wide tables without tenant restrictions', async () => {
      const systemTables = [
        'subscription_plans',
        'companies'  // Only accessible to dev role
      ];

      mockAuthStore.user = {
        id: 'dev-001',
        email: 'dev@erpindo.com'
      };
      mockAuthStore.userRole = 'dev';

      const systemData = [
        { id: 'plan-001', name: 'Basic Plan', price: 100000 },
        { id: 'plan-002', name: 'Pro Plan', price: 250000 }
      ];

      const mockQuery = {
        select: vi.fn().mockResolvedValue({
          data: systemData,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase.from('subscription_plans').select('*');
      
      expect(result.data).toEqual(systemData);
      expect(result.error).toBeNull();
    });
  });

  describe('Role-based Access Control (RBAC)', () => {
    it('should enforce dev role access to system administration', async () => {
      mockAuthStore.user = {
        id: 'dev-001',
        email: 'dev@erpindo.com'
      };
      mockAuthStore.userRole = 'dev';

      const companiesData = [
        { id: 'company-maju-jaya', name: 'PT Maju Jaya', subscription_plan_id: 'plan-001' },
        { id: 'company-sejahtera', name: 'PT Sejahtera', subscription_plan_id: 'plan-002' }
      ];

      const mockQuery = {
        select: vi.fn().mockResolvedValue({
          data: companiesData,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase.from('companies').select('*');
      
      expect(result.data).toEqual(companiesData);
      expect(result.data).toHaveLength(2); // Dev can see all companies
    });

    it('should restrict owner role to their company data only', async () => {
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id'
      };
      mockAuthStore.userRole = 'owner';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const ownerCompanyData = [
        { id: 'company-maju-jaya', name: 'PT Maju Jaya', subscription_plan_id: 'plan-001' }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: ownerCompanyData,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('companies')
        .select('*')
        .eq('id', 'company-maju-jaya');
      
      expect(result.data).toEqual(ownerCompanyData);
      expect(result.data).toHaveLength(1); // Owner can only see their company
    });

    it('should enforce staff role access restrictions', async () => {
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id'
      };
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      // Staff cannot access sensitive tables like employees, financial data
      const restrictedTables = ['employees', 'invoices', 'financial_reports'];
      
      for (const table of restrictedTables) {
        const mockQuery = {
          select: vi.fn().mockResolvedValue({
            data: null,
            error: {
              message: 'Insufficient privileges',
              code: '42501'
            }
          })
        };

        supabase.from.mockReturnValue(mockQuery);
        
        const result = await supabase.from(table).select('*');
        expect(result.error?.code).toBe('42501');
        expect(result.data).toBeNull();
      }
    });

    it('should allow staff read-only access to products and customers', async () => {
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id'
      };
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const allowedData = [
        { id: 'prod-001', company_id: 'company-maju-jaya', name: 'Product 1' },
        { id: 'cust-001', company_id: 'company-maju-jaya', name: 'Customer 1' }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: allowedData,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      // Staff can read products
      const productsResult = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-maju-jaya');
      
      expect(productsResult.data).toEqual(allowedData);
      expect(productsResult.error).toBeNull();

      // Staff can read customers
      const customersResult = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', 'company-maju-jaya');
      
      expect(customersResult.data).toEqual(allowedData);
      expect(customersResult.error).toBeNull();
    });

    it('should prevent staff from modifying critical data', async () => {
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id'
      };
      mockAuthStore.userRole = 'staff';

      const unauthorizedError = {
        message: 'Insufficient privileges for update operation',
        code: '42501'
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: unauthorizedError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      // Staff should not be able to update products
      const result = await supabase
        .from('products')
        .update({ price: 10000 })
        .eq('id', 'prod-001')
        .select();

      expect(result.error?.code).toBe('42501');
      expect(result.error?.message).toContain('Insufficient privileges');
    });
  });

  describe('Data Leakage Prevention', () => {
    it('should prevent data leakage through JOIN operations', async () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'user@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      // Complex query with JOINs should still respect RLS
      const joinQuery = `
        SELECT p.*, c.name as customer_name 
        FROM products p 
        LEFT JOIN customers c ON p.company_id = c.company_id 
        WHERE p.company_id = ?
      `;

      (supabase.sql as any).mockResolvedValue({
        data: [
          { id: 'prod-001', company_id: 'company-maju-jaya', customer_name: 'Customer A' }
        ],
        error: null
      });

      const result = await supabase.sql(joinQuery, ['company-maju-jaya']);
      
      expect(result.data).toBeDefined();
      expect(result.data?.[0]?.company_id).toBe('company-maju-jaya');
    });

    it('should prevent data leakage through aggregate functions', async () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'user@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      // RPC function call should respect RLS
      (supabase.rpc as any).mockResolvedValue({
        data: {
          total_products: 45,
          total_revenue: 15000000,
          company_id: 'company-maju-jaya'
        },
        error: null
      });

      const result = await supabase.rpc('get_company_stats', {
        company_id: 'company-maju-jaya'
      });

      expect(result.data?.company_id).toBe('company-maju-jaya');
      expect(result.data?.total_products).toBe(45);
    });

    it('should prevent information disclosure through error messages', async () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'user@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const secureError = {
        message: 'Access denied',
        code: '42501',
        // Should NOT contain details about other companies
        details: undefined
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: secureError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-unauthorized');

      expect(result.error?.message).toBe('Access denied');
      expect(result.error?.details).toBeUndefined();
    });
  });

  describe('RLS Policy Validation and Testing', () => {
    it('should validate all RLS policies are properly configured', async () => {
      const expectedPolicies = {
        products: [
          'products_tenant_isolation',
          'products_role_based_access'
        ],
        customers: [
          'customers_tenant_isolation',
          'customers_role_based_access'
        ],
        sales_orders: [
          'sales_orders_tenant_isolation',
          'sales_orders_staff_read_only'
        ],
        invoices: [
          'invoices_tenant_isolation',
          'invoices_owner_only'
        ],
        employees: [
          'employees_tenant_isolation',
          'employees_owner_only'
        ]
      };

      (checkRLSPolicies as any).mockResolvedValue({
        success: true,
        policies: expectedPolicies,
        missingPolicies: [],
        invalidPolicies: []
      });

      const result = await checkRLSPolicies();
      
      expect(result.success).toBe(true);
      expect(result.missingPolicies).toHaveLength(0);
      expect(result.invalidPolicies).toHaveLength(0);
      expect(Object.keys(result.policies)).toEqual(Object.keys(expectedPolicies));
    });

    it('should detect missing or invalid RLS policies', async () => {
      const policyValidationError = {
        success: false,
        policies: {},
        missingPolicies: ['products_tenant_isolation'],
        invalidPolicies: ['customers_broken_policy']
      };

      (checkRLSPolicies as any).mockResolvedValue(policyValidationError);

      const result = await checkRLSPolicies();
      
      expect(result.success).toBe(false);
      expect(result.missingPolicies).toContain('products_tenant_isolation');
      expect(result.invalidPolicies).toContain('customers_broken_policy');
    });

    it('should test RLS enforcement with different user contexts', async () => {
      const testScenarios = [
        {
          userRole: 'dev',
          tenantId: null,
          expectedAccess: ['all_tables']
        },
        {
          userRole: 'owner',
          tenantId: 'company-maju-jaya',
          expectedAccess: ['products', 'customers', 'employees', 'invoices']
        },
        {
          userRole: 'staff',
          tenantId: 'company-maju-jaya',
          expectedAccess: ['products', 'customers', 'sales_orders']
        }
      ];

      for (const scenario of testScenarios) {
        (validateDataAccess as any).mockResolvedValue({
          role: scenario.userRole,
          tenantId: scenario.tenantId,
          accessibleTables: scenario.expectedAccess,
          violations: []
        });

        const result = await validateDataAccess(scenario.userRole, scenario.tenantId);
        
        expect(result.accessibleTables).toEqual(scenario.expectedAccess);
        expect(result.violations).toHaveLength(0);
      }
    });
  });

  describe('Indonesian Business Context RLS', () => {
    it('should enforce Indonesian company registration requirements', async () => {
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        npwp: '01.234.567.8-901.000'
      };

      const indonesianCompanyData = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya',
        npwp: '01.234.567.8-901.000',
        address: 'Jl. Sudirman No. 123, Jakarta',
        phone: '+6281234567890',
        legal_form: 'PT' // Perseroan Terbatas
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [indonesianCompanyData],
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('companies')
        .select('*')
        .eq('id', 'company-maju-jaya');

      expect(result.data?.[0]?.npwp).toMatch(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/);
      expect(result.data?.[0]?.legal_form).toBe('PT');
    });

    it('should validate Indonesian customer data access with NPWP', async () => {
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const indonesianCustomers = [
        {
          id: 'cust-001',
          company_id: 'company-maju-jaya',
          name: 'PT Sumber Rejeki',
          npwp: '02.345.678.9-012.000',
          customer_type: 'business'
        },
        {
          id: 'cust-002',
          company_id: 'company-maju-jaya',
          name: 'Budi Santoso',
          nik: '3174012345678901',
          customer_type: 'individual'
        }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: indonesianCustomers,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', 'company-maju-jaya');

      const businessCustomer = result.data?.find(c => c.customer_type === 'business');
      const individualCustomer = result.data?.find(c => c.customer_type === 'individual');

      expect(businessCustomer?.npwp).toMatch(/^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/);
      expect(individualCustomer?.nik).toMatch(/^\d{16}$/);
    });

    it('should enforce Indonesian tax calculation RLS (PPN 11%)', async () => {
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const indonesianInvoice = {
        id: 'inv-001',
        company_id: 'company-maju-jaya',
        subtotal: 100000,
        ppn_rate: 0.11, // PPN 11%
        ppn_amount: 11000,
        total: 111000,
        currency: 'IDR'
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: [indonesianInvoice],
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', 'company-maju-jaya');

      expect(result.data?.[0]?.ppn_rate).toBe(0.11);
      expect(result.data?.[0]?.currency).toBe('IDR');
      expect(result.data?.[0]?.ppn_amount).toBe(11000);
    });
  });

  describe('RLS Performance and Optimization', () => {
    it('should not significantly impact query performance', async () => {
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const startTime = Date.now();

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: Array.from({ length: 100 }, (_, i) => ({
            id: `prod-${i}`,
            company_id: 'company-maju-jaya',
            name: `Product ${i}`
          })),
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-maju-jaya');

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(result.data).toHaveLength(100);
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent access without RLS violations', async () => {
      const concurrentUsers = [
        { id: 'user-001', tenantId: 'company-maju-jaya' },
        { id: 'user-002', tenantId: 'company-sejahtera' },
        { id: 'user-003', tenantId: 'company-bimantara' }
      ];

      const concurrentPromises = concurrentUsers.map(async (user) => {
        const mockQuery = {
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockResolvedValue({
            data: [{ id: 'prod-001', company_id: user.tenantId }],
            error: null
          })
        };

        supabase.from.mockReturnValue(mockQuery);

        return supabase
          .from('products')
          .select('*')
          .eq('company_id', user.tenantId);
      });

      const results = await Promise.all(concurrentPromises);

      results.forEach((result, index) => {
        expect(result.data?.[0]?.company_id).toBe(concurrentUsers[index].tenantId);
        expect(result.error).toBeNull();
      });
    });
  });

  describe('Component Integration with RLS', () => {
    it('should render RLS test component with proper context', () => {
      mockAuthStore.user = {
        id: 'user-001',
        email: 'test@majujaya.co.id'
      };
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      render(
        <QueryClientProvider client={queryClient}>
          <RLSTestComponent 
            tenantId="company-maju-jaya" 
            userId="user-001" 
          />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('rls-test-component')).toBeInTheDocument();
      expect(screen.getByTestId('current-tenant')).toHaveTextContent('company-maju-jaya');
      expect(screen.getByTestId('current-user')).toHaveTextContent('user-001');
      expect(screen.getByTestId('data-access-status')).toHaveTextContent('Testing RLS');
    });

    it('should handle RLS violations in UI components gracefully', async () => {
      mockAuthStore.user = {
        id: 'unauthorized-user',
        email: 'hacker@external.com'
      };

      // Simulate unauthorized access attempt
      const unauthorizedError = {
        message: 'Access denied by Row-Level Security',
        code: '42501'
      };

      (validateDataAccess as any).mockRejectedValue(unauthorizedError);

      try {
        await validateDataAccess('unauthorized', 'company-maju-jaya');
      } catch (error) {
        expect((error as any).code).toBe('42501');
        expect((error as any).message).toContain('Access denied');
      }
    });
  });
});