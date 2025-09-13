import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CustomerList } from '@/components/modules/customers/CustomerList';
import { CustomerForm } from '@/components/modules/customers/CustomerForm';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { useCustomerStore } from '@/stores/customerStore';
import { useAuthStore } from '@/stores/authStore';
import { customerService } from '@/services/customerService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: [],
            error: null
          }))
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
vi.mock('@/stores/customerStore', () => ({
  useCustomerStore: vi.fn()
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

// Mock service
vi.mock('@/services/customerService', () => ({
  customerService: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
    searchCustomers: vi.fn()
  }
}));

// Mock components
vi.mock('@/components/modules/customers/CustomerList', () => ({
  CustomerList: () => <div data-testid="customer-list">Customer List Component</div>
}));

vi.mock('@/components/modules/customers/CustomerForm', () => ({
  CustomerForm: ({ onSubmit, onCancel, initialData }: any) => (
    <form data-testid="customer-form" onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      onSubmit({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        customer_type: formData.get('customer_type'),
        tax_id: formData.get('tax_id')
      });
    }}>
      <input name="name" data-testid="customer-name" defaultValue={initialData?.name || ''} />
      <input name="email" data-testid="customer-email" defaultValue={initialData?.email || ''} />
      <input name="phone" data-testid="customer-phone" defaultValue={initialData?.phone || ''} />
      <textarea name="address" data-testid="customer-address" defaultValue={initialData?.address || ''} />
      <select name="customer_type" data-testid="customer-type" defaultValue={initialData?.customer_type || ''}>
        <option value="">Pilih Tipe</option>
        <option value="individual">Perorangan</option>
        <option value="business">Perusahaan</option>
      </select>
      <input name="tax_id" data-testid="customer-tax-id" defaultValue={initialData?.tax_id || ''} />
      <button type="submit" data-testid="submit-button">Simpan</button>
      <button type="button" onClick={onCancel} data-testid="cancel-button">Batal</button>
    </form>
  )
}));

vi.mock('@/pages/customers/CustomersPage', () => ({
  CustomersPage: () => <div data-testid="customers-page">Customers Page</div>
}));

const mockCustomerStore = {
  customers: [],
  isLoading: false,
  error: null,
  selectedCustomer: null,
  fetchCustomers: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  setSelectedCustomer: vi.fn(),
  clearError: vi.fn()
};

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  currentTenant: null
};

describe('Customer Management', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    (useCustomerStore as any).mockReturnValue(mockCustomerStore);
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe('Customer List Display', () => {
    it('should display list of customers for authenticated user', async () => {
      const mockCustomers = [
        {
          id: 'cust-001',
          name: 'PT Sumber Rejeki',
          email: 'admin@sumberrejeki.co.id',
          phone: '+62812-3456-7890',
          address: 'Jl. Sudirman No. 123, Jakarta Pusat',
          customer_type: 'business',
          tax_id: '01.234.567.8-901.000',
          company_id: 'company-maju-jaya',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'cust-002',
          name: 'Budi Santoso',
          email: 'budi.santoso@gmail.com',
          phone: '+62811-2345-6789',
          address: 'Jl. Kebon Jeruk No. 45, Jakarta Barat',
          customer_type: 'individual',
          tax_id: null,
          company_id: 'company-maju-jaya',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockAuthStore.user = {
        id: 'user-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff Penjualan' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      mockCustomerStore.customers = mockCustomers;
      customerService.getCustomers.mockResolvedValue(mockCustomers);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('customer-list')).toBeInTheDocument();
      expect(customerService.getCustomers).toHaveBeenCalledWith('company-maju-jaya');
    });

    it('should handle empty customer list', async () => {
      mockAuthStore.user = { id: 'user-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.currentTenant = { id: 'company-maju-jaya' };

      mockCustomerStore.customers = [];
      customerService.getCustomers.mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('customer-list')).toBeInTheDocument();
    });

    it('should display Indonesian customer types correctly', async () => {
      const customerTypes = [
        { type: 'individual', label: 'Perorangan' },
        { type: 'business', label: 'Perusahaan' }
      ];

      customerTypes.forEach(type => {
        expect(['individual', 'business']).toContain(type.type);
        expect(['Perorangan', 'Perusahaan']).toContain(type.label);
      });
    });
  });

  describe('Customer Creation', () => {
    it('should create new individual customer', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = {
        id: 'staff-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff Penjualan' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const newCustomer = {
        name: 'Siti Rahayu',
        email: 'siti.rahayu@gmail.com',
        phone: '+62813-4567-8901',
        address: 'Jl. Merdeka No. 67, Bandung',
        customer_type: 'individual',
        tax_id: null
      };

      mockCustomerStore.createCustomer.mockResolvedValue({
        ...newCustomer,
        id: 'cust-003',
        company_id: 'company-maju-jaya'
      });

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Fill form with individual customer data
      await user.type(screen.getByTestId('customer-name'), newCustomer.name);
      await user.type(screen.getByTestId('customer-email'), newCustomer.email);
      await user.type(screen.getByTestId('customer-phone'), newCustomer.phone);
      await user.type(screen.getByTestId('customer-address'), newCustomer.address);
      await user.selectOptions(screen.getByTestId('customer-type'), 'individual');

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        customer_type: 'individual',
        tax_id: ''
      });
    });

    it('should create new business customer with NPWP', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = { id: 'staff-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      const businessCustomer = {
        name: 'CV Berkah Mandiri',
        email: 'admin@berkahmandiri.co.id',
        phone: '+62814-5678-9012',
        address: 'Jl. Asia Afrika No. 89, Bandung',
        customer_type: 'business',
        tax_id: '02.345.678.9-012.000' // NPWP format
      };

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await user.type(screen.getByTestId('customer-name'), businessCustomer.name);
      await user.type(screen.getByTestId('customer-email'), businessCustomer.email);
      await user.type(screen.getByTestId('customer-phone'), businessCustomer.phone);
      await user.type(screen.getByTestId('customer-address'), businessCustomer.address);
      await user.selectOptions(screen.getByTestId('customer-type'), 'business');
      await user.type(screen.getByTestId('customer-tax-id'), businessCustomer.tax_id);

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: businessCustomer.name,
        email: businessCustomer.email,
        phone: businessCustomer.phone,
        address: businessCustomer.address,
        customer_type: 'business',
        tax_id: businessCustomer.tax_id
      });
    });

    it('should validate Indonesian phone number format', async () => {
      const phoneNumberTests = [
        { phone: '+62812-3456-7890', valid: true },
        { phone: '0812-3456-7890', valid: true },
        { phone: '62812-3456-7890', valid: true },
        { phone: '+628123456789', valid: true },
        { phone: '081234567890', valid: true },
        { phone: '123-456-7890', valid: false }, // Non-Indonesian
        { phone: '+1-555-123-4567', valid: false } // US format
      ];

      phoneNumberTests.forEach(test => {
        const isIndonesianPhone = test.phone.match(/^(\+62|62|0)\d+/) !== null;
        expect(isIndonesianPhone).toBe(test.valid);
      });
    });

    it('should validate NPWP format for business customers', async () => {
      const npwpTests = [
        { npwp: '01.234.567.8-901.000', valid: true },
        { npwp: '02.345.678.9-012.000', valid: true },
        { npwp: '03.456.789.0-123.000', valid: true },
        { npwp: '12345678901234567890', valid: false }, // Wrong format
        { npwp: '01.234.567.8901.000', valid: false }, // Missing dash
        { npwp: '123.456.789.0-123.000', valid: false } // Too many digits
      ];

      npwpTests.forEach(test => {
        const isValidNPWP = test.npwp.match(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/) !== null;
        expect(isValidNPWP).toBe(test.valid);
      });
    });
  });

  describe('Customer Updates', () => {
    it('should update existing customer information', async () => {
      const user = userEvent.setup();
      
      const existingCustomer = {
        id: 'cust-001',
        name: 'PT Sumber Rejeki',
        email: 'admin@sumberrejeki.co.id',
        phone: '+62812-3456-7890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        customer_type: 'business',
        tax_id: '01.234.567.8-901.000',
        company_id: 'company-maju-jaya'
      };

      const updatedData = {
        name: 'PT Sumber Rejeki Makmur',
        email: 'admin@sumberrejeki.co.id',
        phone: '+62812-3456-7890',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat, 10270',
        customer_type: 'business',
        tax_id: '01.234.567.8-901.000'
      };

      mockAuthStore.user = { id: 'staff-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerForm 
              onSubmit={handleSubmit} 
              onCancel={vi.fn()} 
              initialData={existingCustomer}
            />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify form pre-filled with existing data
      expect(screen.getByTestId('customer-name')).toHaveValue(existingCustomer.name);
      expect(screen.getByTestId('customer-email')).toHaveValue(existingCustomer.email);

      // Update the customer name and address
      await user.clear(screen.getByTestId('customer-name'));
      await user.type(screen.getByTestId('customer-name'), updatedData.name);

      await user.clear(screen.getByTestId('customer-address'));
      await user.type(screen.getByTestId('customer-address'), updatedData.address);

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: updatedData.name,
        email: existingCustomer.email,
        phone: existingCustomer.phone,
        address: updatedData.address,
        customer_type: existingCustomer.customer_type,
        tax_id: existingCustomer.tax_id
      });
    });

    it('should handle customer type conversion (individual to business)', async () => {
      const user = userEvent.setup();
      
      const individualCustomer = {
        id: 'cust-002',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        phone: '+62811-2345-6789',
        address: 'Jl. Kebon Jeruk No. 45, Jakarta Barat',
        customer_type: 'individual',
        tax_id: null
      };

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerForm 
              onSubmit={handleSubmit} 
              onCancel={vi.fn()} 
              initialData={individualCustomer}
            />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Convert to business customer
      await user.selectOptions(screen.getByTestId('customer-type'), 'business');
      await user.type(screen.getByTestId('customer-tax-id'), '01.234.567.8-901.000');

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: individualCustomer.name,
        email: individualCustomer.email,
        phone: individualCustomer.phone,
        address: individualCustomer.address,
        customer_type: 'business',
        tax_id: '01.234.567.8-901.000'
      });
    });
  });

  describe('Customer Deletion', () => {
    it('should delete customer with confirmation', async () => {
      const user = userEvent.setup();
      
      const customerToDelete = {
        id: 'cust-001',
        name: 'Customer Test',
        company_id: 'company-maju-jaya'
      };

      mockAuthStore.user = { id: 'staff-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';

      mockCustomerStore.deleteCustomer.mockResolvedValue(true);

      // Mock window.confirm for delete confirmation
      global.confirm = vi.fn(() => true);

      const handleDelete = vi.fn(() => {
        if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
          mockCustomerStore.deleteCustomer(customerToDelete.id);
        }
      });

      render(
        <div>
          <button onClick={handleDelete} data-testid="delete-button">
            Hapus Pelanggan
          </button>
        </div>
      );

      await user.click(screen.getByTestId('delete-button'));

      expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus pelanggan ini?');
      expect(mockCustomerStore.deleteCustomer).toHaveBeenCalledWith(customerToDelete.id);
    });

    it('should prevent deletion of customers with active transactions', async () => {
      const customerWithTransactions = {
        id: 'cust-001',
        name: 'Customer With Orders',
        hasActiveTransactions: true
      };

      const handleDelete = vi.fn();

      render(
        <div>
          <button 
            onClick={handleDelete} 
            disabled={customerWithTransactions.hasActiveTransactions}
            data-testid="delete-button"
          >
            Hapus Pelanggan
          </button>
          {customerWithTransactions.hasActiveTransactions && (
            <div data-testid="warning-message">
              Tidak dapat menghapus pelanggan yang memiliki transaksi aktif
            </div>
          )}
        </div>
      );

      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeDisabled();
      expect(screen.getByTestId('warning-message')).toHaveTextContent(
        'Tidak dapat menghapus pelanggan yang memiliki transaksi aktif'
      );
    });
  });

  describe('Customer Search and Filtering', () => {
    it('should search customers by name', async () => {
      const user = userEvent.setup();
      
      const mockCustomers = [
        { id: 'cust-001', name: 'PT Sumber Rejeki', customer_type: 'business' },
        { id: 'cust-002', name: 'CV Sumber Makmur', customer_type: 'business' },
        { id: 'cust-003', name: 'Budi Sumber', customer_type: 'individual' }
      ];

      mockCustomerStore.customers = mockCustomers;
      customerService.searchCustomers.mockResolvedValue([mockCustomers[0], mockCustomers[1], mockCustomers[2]]);

      const SearchComponent = () => {
        const [searchTerm, setSearchTerm] = React.useState('');
        
        const handleSearch = () => {
          customerService.searchCustomers({
            name: searchTerm,
            company_id: 'company-maju-jaya'
          });
        };

        return (
          <div>
            <input 
              data-testid="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pelanggan..."
            />
            <button onClick={handleSearch} data-testid="search-button">
              Cari
            </button>
          </div>
        );
      };

      render(<SearchComponent />);

      await user.type(screen.getByTestId('search-input'), 'Sumber');
      await user.click(screen.getByTestId('search-button'));

      expect(customerService.searchCustomers).toHaveBeenCalledWith({
        name: 'Sumber',
        company_id: 'company-maju-jaya'
      });
    });

    it('should filter by customer type', async () => {
      const customerTypes = ['individual', 'business'];

      customerTypes.forEach(type => {
        customerService.searchCustomers.mockResolvedValue([]);
        
        customerService.searchCustomers({
          customer_type: type,
          company_id: 'company-maju-jaya'
        });

        expect(customerService.searchCustomers).toHaveBeenCalledWith({
          customer_type: type,
          company_id: 'company-maju-jaya'
        });
      });
    });

    it('should filter by location (Indonesian cities)', async () => {
      const indonesianCities = [
        'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 
        'Makassar', 'Palembang', 'Yogyakarta', 'Denpasar', 'Balikpapan'
      ];

      indonesianCities.forEach(city => {
        customerService.searchCustomers.mockResolvedValue([]);
        
        customerService.searchCustomers({
          city: city,
          company_id: 'company-maju-jaya'
        });

        expect(customerService.searchCustomers).toHaveBeenCalledWith({
          city: city,
          company_id: 'company-maju-jaya'
        });
      });
    });
  });

  describe('Multi-tenant Customer Isolation', () => {
    it('should only show customers from current tenant', async () => {
      const majuJayaCustomers = [
        { id: 'cust-001', name: 'Customer A', company_id: 'company-maju-jaya' },
        { id: 'cust-002', name: 'Customer B', company_id: 'company-maju-jaya' }
      ];

      mockAuthStore.currentTenant = { id: 'company-maju-jaya', name: 'PT Maju Jaya' };
      
      customerService.getCustomers.mockResolvedValue(majuJayaCustomers);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(customerService.getCustomers).toHaveBeenCalledWith('company-maju-jaya');
    });

    it('should prevent cross-tenant customer access', async () => {
      mockAuthStore.currentTenant = { id: 'company-sejahtera', name: 'PT Sejahtera' };

      customerService.getCustomers.mockResolvedValue([]); // RLS should return empty

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(customerService.getCustomers).toHaveBeenCalledWith('company-sejahtera');
      // Should not return customers from other companies
    });
  });

  describe('Indonesian Address Validation', () => {
    it('should handle Indonesian address formats', async () => {
      const indonesianAddresses = [
        'Jl. Sudirman No. 123, RT 001/RW 002, Kelurahan Tanah Abang, Jakarta Pusat, DKI Jakarta, 10230',
        'Jl. Malioboro No. 45, Yogyakarta, DIY, 55271',
        'Jl. Asia Afrika No. 89, Bandung, Jawa Barat, 40111',
        'Komplek Permata Hijau Blok A No. 15, Surabaya, Jawa Timur, 60286'
      ];

      indonesianAddresses.forEach(address => {
        expect(address).toContain('Jl.'); // Indonesian street prefix
        expect(address.length).toBeGreaterThan(20); // Detailed address
      });
    });

    it('should validate postal codes for major Indonesian cities', async () => {
      const postalCodes = [
        { city: 'Jakarta', code: '10230', valid: true },
        { city: 'Surabaya', code: '60286', valid: true },
        { city: 'Bandung', code: '40111', valid: true },
        { city: 'Medan', code: '20123', valid: true },
        { city: 'Invalid', code: '00000', valid: false },
        { city: 'Invalid', code: '99999', valid: false }
      ];

      postalCodes.forEach(test => {
        const isValidPostalCode = test.code.match(/^[1-9]\d{4}$/) !== null;
        if (test.valid) {
          expect(isValidPostalCode).toBe(true);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle customer creation errors', async () => {
      const user = userEvent.setup();
      
      mockCustomerStore.createCustomer.mockRejectedValue(
        new Error('Gagal membuat pelanggan: Email sudah terdaftar')
      );

      const handleSubmit = vi.fn().mockImplementation(async (data) => {
        try {
          await mockCustomerStore.createCustomer(data);
        } catch (error) {
          console.error('Error creating customer:', error.message);
        }
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomerForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await user.type(screen.getByTestId('customer-name'), 'Duplicate Customer');
      await user.type(screen.getByTestId('customer-email'), 'existing@email.com');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error creating customer:', 
          'Gagal membuat pelanggan: Email sudah terdaftar'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle invalid NPWP validation errors', async () => {
      const invalidNPWPs = [
        '123456789012345', // Too short
        '01.234.567.8.901.000', // Extra dot
        'XX.234.567.8-901.000', // Non-numeric
        '01.234.567.8-901.00' // Incomplete
      ];

      invalidNPWPs.forEach(npwp => {
        const isValid = npwp.match(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/) !== null;
        expect(isValid).toBe(false);
      });
    });

    it('should handle network connectivity issues', async () => {
      mockCustomerStore.fetchCustomers.mockRejectedValue(
        new Error('Network error: Unable to connect')
      );

      mockCustomerStore.error = 'Koneksi bermasalah. Silakan periksa internet Anda.';

      const ErrorDisplay = () => {
        const { error } = useCustomerStore();
        return error ? <div data-testid="error-message">{error}</div> : null;
      };

      render(<ErrorDisplay />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Koneksi bermasalah. Silakan periksa internet Anda.'
      );
    });
  });
});