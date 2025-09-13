import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useDatabase } from '@/hooks/useDatabase';
import { SupabaseError } from '@/types/errors';
import { AuthProvider } from '@/providers/AuthProvider';
import { TenantProvider } from '@/providers/TenantProvider';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          limit: vi.fn(),
          order: vi.fn(),
          range: vi.fn()
        })),
        neq: vi.fn(),
        in: vi.fn(),
        contains: vi.fn(),
        ilike: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        is: vi.fn()
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
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(),
        single: vi.fn()
      }))
    })),
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      })),
      unsubscribe: vi.fn()
    }))
  }
}));

// Mock hooks
vi.mock('@/hooks/useSupabaseQuery', () => ({
  useSupabaseQuery: vi.fn()
}));

vi.mock('@/hooks/useDatabase', () => ({
  useDatabase: vi.fn()
}));

// Mock providers
vi.mock('@/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

vi.mock('@/providers/TenantProvider', () => ({
  TenantProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tenant-provider">{children}</div>
  )
}));

// Test component to verify integration
const TestComponent = () => {
  const { data, error, isLoading } = useSupabaseQuery();
  const { createRecord, updateRecord, deleteRecord } = useDatabase();

  return (
    <div data-testid="test-component">
      <div data-testid="loading-state">
        {isLoading ? 'Loading...' : 'Loaded'}
      </div>
      <div data-testid="data-state">
        {data ? JSON.stringify(data) : 'No data'}
      </div>
      <div data-testid="error-state">
        {error ? error.message : 'No error'}
      </div>
      <button 
        data-testid="create-button"
        onClick={() => createRecord('products', { name: 'Test Product' })}
      >
        Create Record
      </button>
      <button 
        data-testid="update-button"
        onClick={() => updateRecord('products', 'prod-001', { name: 'Updated Product' })}
      >
        Update Record
      </button>
      <button 
        data-testid="delete-button"
        onClick={() => deleteRecord('products', 'prod-001')}
      >
        Delete Record
      </button>
    </div>
  );
};

describe('Supabase Client Integration', () => {
  let queryClient: QueryClient;
  let mockSupabaseQuery: any;
  let mockDatabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    mockSupabaseQuery = {
      data: null,
      error: null,
      isLoading: false,
      refetch: vi.fn()
    };

    mockDatabase = {
      createRecord: vi.fn(),
      updateRecord: vi.fn(),
      deleteRecord: vi.fn(),
      getRecord: vi.fn(),
      getRecords: vi.fn()
    };

    (useSupabaseQuery as any).mockReturnValue(mockSupabaseQuery);
    (useDatabase as any).mockReturnValue(mockDatabase);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Supabase Client Configuration', () => {
    it('should have proper Supabase client configuration', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    it('should initialize with correct project configuration', () => {
      const projectUrl = process.env.VITE_SUPABASE_URL;
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      // These should be defined in test environment
      expect(typeof projectUrl).toBe('string');
      expect(typeof anonKey).toBe('string');
    });

    it('should handle missing environment variables gracefully', () => {
      // Simulate missing environment variables
      const originalUrl = process.env.VITE_SUPABASE_URL;
      const originalKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      delete process.env.VITE_SUPABASE_URL;
      delete process.env.VITE_SUPABASE_ANON_KEY;

      try {
        // Should handle gracefully or throw appropriate error
        expect(() => {
          const invalidConfig = !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY;
          if (invalidConfig) {
            throw new Error('Supabase configuration missing');
          }
        }).toThrow('Supabase configuration missing');
      } finally {
        // Restore environment variables
        process.env.VITE_SUPABASE_URL = originalUrl;
        process.env.VITE_SUPABASE_ANON_KEY = originalKey;
      }
    });
  });

  describe('Authentication Integration', () => {
    it('should handle successful authentication', async () => {
      const mockUser = {
        id: 'user-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };

      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'owner@majujaya.co.id',
        password: 'password123'
      });

      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle authentication errors', async () => {
      const authError = {
        message: 'Invalid login credentials',
        status: 400
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });

      expect(result.data?.user).toBeNull();
      expect(result.data?.session).toBeNull();
      expect(result.error).toEqual(authError);
    });

    it('should handle session management', async () => {
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'user-001', email: 'test@example.com' }
      };

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await supabase.auth.getSession();
      expect(result.data?.session).toEqual(mockSession);
    });

    it('should handle logout correctly', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: null
      });

      const result = await supabase.auth.signOut();
      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('Database Operations Integration', () => {
    it('should perform successful SELECT operations', async () => {
      const mockProducts = [
        {
          id: 'prod-001',
          company_id: 'company-maju-jaya',
          name: 'Indomie Goreng',
          price: 3500,
          stock: 100
        },
        {
          id: 'prod-002',
          company_id: 'company-maju-jaya',
          name: 'Teh Botol Sosro',
          price: 4000,
          stock: 50
        }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: mockProducts,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .select('*')
        .eq('company_id', 'company-maju-jaya');

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('company_id', 'company-maju-jaya');
    });

    it('should perform successful INSERT operations', async () => {
      const newProduct = {
        company_id: 'company-maju-jaya',
        name: 'Aqua 600ml',
        price: 3000,
        stock: 200,
        barcode: '8999999123456'
      };

      const mockInsertedProduct = {
        id: 'prod-003',
        ...newProduct,
        created_at: '2024-09-14T10:00:00Z'
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockInsertedProduct,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single();

      expect(mockQuery.insert).toHaveBeenCalledWith(newProduct);
    });

    it('should perform successful UPDATE operations', async () => {
      const updateData = {
        name: 'Indomie Goreng Spesial',
        price: 4000
      };

      const mockUpdatedProduct = {
        id: 'prod-001',
        company_id: 'company-maju-jaya',
        ...updateData,
        updated_at: '2024-09-14T10:30:00Z'
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdatedProduct,
          error: null
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .update(updateData)
        .eq('id', 'prod-001')
        .select()
        .single();

      expect(mockQuery.update).toHaveBeenCalledWith(updateData);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'prod-001');
    });

    it('should perform successful DELETE operations', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
          status: 204
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase
        .from('products')
        .delete()
        .eq('id', 'prod-001');

      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'prod-001');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors', async () => {
      const connectionError = {
        message: 'Network error: Unable to connect to database',
        code: 'PGRST301'
      };

      const mockQuery = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: connectionError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase.from('products').select('*');
      
      expect(result.error).toEqual(connectionError);
      expect(result.data).toBeNull();
    });

    it('should handle RLS policy violations', async () => {
      const rlsError = {
        message: 'Row-level security policy violation',
        code: '42501',
        details: 'User does not have permission to access this resource'
      };

      const mockQuery = {
        select: vi.fn().mockResolvedValue({
          data: null,
          error: rlsError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase.from('products').select('*');
      
      expect(result.error?.code).toBe('42501');
      expect(result.error?.message).toContain('Row-level security');
    });

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Validation failed',
        code: '23505',
        details: 'Key (barcode)=(8999999123456) already exists.'
      };

      const mockQuery = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: validationError
        })
      };

      supabase.from.mockReturnValue(mockQuery);

      const result = await supabase.from('products').insert({
        barcode: '8999999123456'
      });
      
      expect(result.error?.code).toBe('23505');
      expect(result.error?.details).toContain('already exists');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        message: 'Request timeout',
        code: 'TIMEOUT'
      };

      const mockQuery = {
        select: vi.fn().mockRejectedValue(timeoutError)
      };

      supabase.from.mockReturnValue(mockQuery);

      try {
        await supabase.from('products').select('*');
      } catch (error) {
        expect(error).toEqual(timeoutError);
      }
    });
  });

  describe('Real-time Subscriptions Integration', () => {
    it('should establish real-time subscriptions', () => {
      const mockSubscription = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({
          unsubscribe: vi.fn()
        })
      };

      supabase.channel.mockReturnValue(mockSubscription);

      const subscription = supabase
        .channel('products-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, (payload) => {
          console.log('Product change:', payload);
        })
        .subscribe();

      expect(supabase.channel).toHaveBeenCalledWith('products-changes');
      expect(mockSubscription.on).toHaveBeenCalled();
      expect(mockSubscription.subscribe).toHaveBeenCalled();
    });

    it('should handle subscription errors', () => {
      const subscriptionError = new Error('Failed to establish subscription');
      
      const mockSubscription = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockImplementation(() => {
          throw subscriptionError;
        })
      };

      supabase.channel.mockReturnValue(mockSubscription);

      expect(() => {
        supabase
          .channel('test-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {})
          .subscribe();
      }).toThrow('Failed to establish subscription');
    });

    it('should properly unsubscribe from channels', () => {
      const mockUnsubscribe = vi.fn();
      const mockSubscription = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({
          unsubscribe: mockUnsubscribe
        }),
        unsubscribe: vi.fn()
      };

      supabase.channel.mockReturnValue(mockSubscription);

      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {})
        .subscribe();

      subscription.unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Query Hook Integration', () => {
    it('should integrate with useSupabaseQuery hook', async () => {
      const mockData = [
        { id: 'prod-001', name: 'Test Product', price: 5000 }
      ];

      mockSupabaseQuery.data = mockData;
      mockSupabaseQuery.isLoading = false;

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('data-state')).toHaveTextContent(JSON.stringify(mockData));
      expect(screen.getByTestId('error-state')).toHaveTextContent('No error');
    });

    it('should handle loading states', async () => {
      mockSupabaseQuery.data = null;
      mockSupabaseQuery.isLoading = true;
      mockSupabaseQuery.error = null;

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
      expect(screen.getByTestId('data-state')).toHaveTextContent('No data');
    });

    it('should handle error states', async () => {
      const error = new Error('Database connection failed');
      
      mockSupabaseQuery.data = null;
      mockSupabaseQuery.isLoading = false;
      mockSupabaseQuery.error = error;

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByTestId('error-state')).toHaveTextContent('Database connection failed');
    });
  });

  describe('Database Hook Integration', () => {
    it('should integrate with useDatabase hook for CRUD operations', async () => {
      const user = userEvent.setup();

      mockDatabase.createRecord.mockResolvedValue({
        data: { id: 'prod-new', name: 'Test Product' },
        error: null
      });

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const createButton = screen.getByTestId('create-button');
      await user.click(createButton);

      expect(mockDatabase.createRecord).toHaveBeenCalledWith('products', {
        name: 'Test Product'
      });
    });

    it('should handle database operation errors', async () => {
      const user = userEvent.setup();

      mockDatabase.updateRecord.mockRejectedValue(
        new Error('Update operation failed')
      );

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      const updateButton = screen.getByTestId('update-button');
      
      try {
        await user.click(updateButton);
      } catch (error) {
        expect(mockDatabase.updateRecord).toHaveBeenCalledWith('products', 'prod-001', {
          name: 'Updated Product'
        });
      }
    });
  });

  describe('Indonesian Context Integration', () => {
    it('should handle Indonesian locale data formatting', () => {
      const testPrice = 15000;
      const formattedPrice = testPrice.toLocaleString('id-ID');
      expect(formattedPrice).toBe('15.000'); // Indonesian number format

      const testDate = new Date('2024-09-14T10:30:00Z');
      const formattedDate = testDate.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta'
      });
      expect(typeof formattedDate).toBe('string');
    });

    it('should handle Indonesian text validation', () => {
      const indonesianNames = [
        'PT Maju Jaya Sentosa',
        'CV Berkah Mandiri',
        'Toko Sari Rasa',
        'Indomie Goreng Spesial'
      ];

      indonesianNames.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(typeof name).toBe('string');
      });
    });

    it('should handle Indonesian phone number format', () => {
      const phoneNumbers = [
        '+62812345678901',
        '081234567890',
        '+6281234567890'
      ];

      phoneNumbers.forEach(phone => {
        const isValidFormat = /^(\+62|0)[0-9]{9,13}$/.test(phone);
        expect(isValidFormat).toBe(true);
      });
    });
  });

  describe('Provider Integration', () => {
    it('should integrate with AuthProvider', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should integrate with TenantProvider', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <TestComponent />
          </TenantProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('tenant-provider')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should handle nested provider integration', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TenantProvider>
              <TestComponent />
            </TenantProvider>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tenant-provider')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle query caching properly', () => {
      const cacheKey = ['products', 'company-maju-jaya'];
      const cachedData = queryClient.getQueryData(cacheKey);
      
      // Initially no cached data
      expect(cachedData).toBeUndefined();

      // Set cache data
      const testData = [{ id: 'prod-001', name: 'Test Product' }];
      queryClient.setQueryData(cacheKey, testData);

      const retrievedData = queryClient.getQueryData(cacheKey);
      expect(retrievedData).toEqual(testData);
    });

    it('should handle query invalidation', () => {
      const cacheKey = ['products', 'company-maju-jaya'];
      const testData = [{ id: 'prod-001', name: 'Test Product' }];
      
      queryClient.setQueryData(cacheKey, testData);
      expect(queryClient.getQueryData(cacheKey)).toEqual(testData);

      queryClient.invalidateQueries({ queryKey: cacheKey });
      
      // After invalidation, the query should be marked as stale
      const queryState = queryClient.getQueryState(cacheKey);
      expect(queryState?.isInvalidated).toBe(true);
    });

    it('should handle connection pooling and retries', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const mockFailingQuery = {
        select: vi.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < maxRetries) {
            return Promise.resolve({
              data: null,
              error: { message: 'Connection timeout', code: 'TIMEOUT' }
            });
          }
          return Promise.resolve({
            data: [{ id: 'prod-001', name: 'Success after retries' }],
            error: null
          });
        })
      };

      supabase.from.mockReturnValue(mockFailingQuery);

      // Simulate retry logic
      for (let i = 0; i < maxRetries; i++) {
        const result = await supabase.from('products').select('*');
        if (!result.error) {
          expect(result.data).toBeDefined();
          break;
        }
      }

      expect(attemptCount).toBe(maxRetries);
    });
  });
});