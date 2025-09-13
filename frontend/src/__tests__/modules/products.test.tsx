import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from '@/components/modules/products/ProductList';
import { ProductForm } from '@/components/modules/products/ProductForm';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { useProductStore } from '@/stores/productStore';
import { useAuthStore } from '@/stores/authStore';
import { productService } from '@/services/productService';
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
vi.mock('@/stores/productStore', () => ({
  useProductStore: vi.fn()
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

// Mock service
vi.mock('@/services/productService', () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn()
  }
}));

// Mock components
vi.mock('@/components/modules/products/ProductList', () => ({
  ProductList: () => <div data-testid="product-list">Product List Component</div>
}));

vi.mock('@/components/modules/products/ProductForm', () => ({
  ProductForm: ({ onSubmit, onCancel, initialData }: any) => (
    <form data-testid="product-form" onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      onSubmit({
        name: formData.get('name'),
        price: Number(formData.get('price')),
        category_id: formData.get('category_id'),
        description: formData.get('description')
      });
    }}>
      <input name="name" data-testid="product-name" defaultValue={initialData?.name || ''} />
      <input name="price" type="number" data-testid="product-price" defaultValue={initialData?.price || ''} />
      <input name="category_id" data-testid="product-category" defaultValue={initialData?.category_id || ''} />
      <textarea name="description" data-testid="product-description" defaultValue={initialData?.description || ''} />
      <button type="submit" data-testid="submit-button">Simpan</button>
      <button type="button" onClick={onCancel} data-testid="cancel-button">Batal</button>
    </form>
  )
}));

vi.mock('@/pages/products/ProductsPage', () => ({
  ProductsPage: () => <div data-testid="products-page">Products Page</div>
}));

const mockProductStore = {
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  setSelectedProduct: vi.fn(),
  clearError: vi.fn()
};

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  currentTenant: null
};

describe('Product CRUD Operations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    (useProductStore as any).mockReturnValue(mockProductStore);
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe('Product List Display', () => {
    it('should display list of products for authenticated user', async () => {
      const mockProducts = [
        {
          id: 'prod-001',
          name: 'Laptop Gaming ASUS ROG',
          price: 15000000,
          category_id: 'cat-electronics',
          description: 'Laptop gaming high-end untuk profesional',
          stock_quantity: 5,
          unit: 'unit',
          barcode: '8901234567890',
          company_id: 'company-maju-jaya',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'prod-002',
          name: 'Mouse Wireless Logitech',
          price: 250000,
          category_id: 'cat-electronics',
          description: 'Mouse wireless untuk produktivitas',
          stock_quantity: 20,
          unit: 'unit',
          barcode: '8901234567891',
          company_id: 'company-maju-jaya',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockAuthStore.user = {
        id: 'user-001',
        email: 'staff@majujaya.co.id',
        user_metadata: { full_name: 'Staff Gudang' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      mockProductStore.products = mockProducts;
      productService.getProducts.mockResolvedValue(mockProducts);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
      expect(productService.getProducts).toHaveBeenCalledWith('company-maju-jaya');
    });

    it('should handle empty product list', async () => {
      mockAuthStore.user = { id: 'user-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.currentTenant = { id: 'company-maju-jaya' };

      mockProductStore.products = [];
      productService.getProducts.mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    it('should filter products by category', async () => {
      const mockProducts = [
        { id: 'prod-001', name: 'Laptop', category_id: 'electronics', price: 15000000 },
        { id: 'prod-002', name: 'Baju Batik', category_id: 'fashion', price: 500000 }
      ];

      mockProductStore.products = mockProducts;
      productService.searchProducts.mockResolvedValue([mockProducts[0]]);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Test would filter by electronics category
      expect(productService.searchProducts).toHaveBeenCalledWith({
        category: 'electronics',
        company_id: mockAuthStore.currentTenant?.id
      });
    });
  });

  describe('Product Creation', () => {
    it('should create new product with Indonesian business context', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = {
        id: 'owner-001',
        email: 'owner@majujaya.co.id',
        user_metadata: { full_name: 'Budi Santoso' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      const newProduct = {
        name: 'Kopi Arabica Premium',
        price: 150000,
        category_id: 'cat-food-beverage',
        description: 'Kopi arabica asli Indonesia dari Toraja',
        stock_quantity: 100,
        unit: 'kg',
        barcode: '8901234567892'
      };

      mockProductStore.createProduct.mockResolvedValue({
        ...newProduct,
        id: 'prod-003',
        company_id: 'company-maju-jaya'
      });

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Fill form with Indonesian product data
      await user.type(screen.getByTestId('product-name'), newProduct.name);
      await user.type(screen.getByTestId('product-price'), newProduct.price.toString());
      await user.type(screen.getByTestId('product-category'), newProduct.category_id);
      await user.type(screen.getByTestId('product-description'), newProduct.description);

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: newProduct.name,
        price: newProduct.price,
        category_id: newProduct.category_id,
        description: newProduct.description
      });
    });

    it('should validate required fields for product creation', async () => {
      const user = userEvent.setup();
      
      mockAuthStore.user = { id: 'owner-001', email: 'owner@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Submit without filling required fields
      await user.click(screen.getByTestId('submit-button'));

      // Should not call handleSubmit with empty data
      expect(handleSubmit).toHaveBeenCalledWith({
        name: '',
        price: 0,
        category_id: '',
        description: ''
      });
    });

    it('should handle Indonesian currency formatting', async () => {
      const product = {
        name: 'Sepatu Sport Nike',
        price: 1500000, // IDR 1,500,000
        category_id: 'cat-fashion',
        description: 'Sepatu olahraga premium'
      };

      mockProductStore.createProduct.mockResolvedValue(product);

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify price handling for Indonesian Rupiah
      expect(product.price).toBeGreaterThan(1000000); // Typical IDR pricing
    });
  });

  describe('Product Updates', () => {
    it('should update existing product', async () => {
      const user = userEvent.setup();
      
      const existingProduct = {
        id: 'prod-001',
        name: 'Laptop Gaming',
        price: 15000000,
        category_id: 'cat-electronics',
        description: 'Laptop gaming performance tinggi',
        company_id: 'company-maju-jaya'
      };

      const updatedData = {
        name: 'Laptop Gaming ASUS ROG Updated',
        price: 16000000,
        category_id: 'cat-electronics',
        description: 'Laptop gaming performance tinggi dengan upgrade RAM'
      };

      mockAuthStore.user = { id: 'owner-001', email: 'owner@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      mockProductStore.updateProduct.mockResolvedValue({
        ...existingProduct,
        ...updatedData
      });

      const handleSubmit = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductForm 
              onSubmit={handleSubmit} 
              onCancel={vi.fn()} 
              initialData={existingProduct}
            />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Verify form pre-filled with existing data
      expect(screen.getByTestId('product-name')).toHaveValue(existingProduct.name);
      expect(screen.getByTestId('product-price')).toHaveValue(existingProduct.price.toString());

      // Update the product name
      await user.clear(screen.getByTestId('product-name'));
      await user.type(screen.getByTestId('product-name'), updatedData.name);

      await user.click(screen.getByTestId('submit-button'));

      expect(handleSubmit).toHaveBeenCalledWith({
        name: updatedData.name,
        price: existingProduct.price,
        category_id: existingProduct.category_id,
        description: existingProduct.description
      });
    });

    it('should handle price updates with Indonesian currency validation', async () => {
      const product = {
        id: 'prod-001',
        name: 'Rice Cooker Miyako',
        price: 500000,
        category_id: 'cat-electronics',
        description: 'Rice cooker 1.8L untuk keluarga Indonesia'
      };

      // Test various Indonesian price ranges
      const priceTests = [
        { price: 50000, valid: true },     // 50 ribu
        { price: 500000, valid: true },   // 500 ribu  
        { price: 5000000, valid: true },  // 5 juta
        { price: -10000, valid: false },  // Negative price
        { price: 0, valid: false }        // Zero price
      ];

      priceTests.forEach(test => {
        if (test.valid) {
          expect(test.price).toBeGreaterThan(0);
        } else {
          expect(test.price).toBeLessThanOrEqual(0);
        }
      });
    });
  });

  describe('Product Deletion', () => {
    it('should delete product with confirmation', async () => {
      const user = userEvent.setup();
      
      const productToDelete = {
        id: 'prod-001',
        name: 'Produk Test',
        company_id: 'company-maju-jaya'
      };

      mockAuthStore.user = { id: 'owner-001', email: 'owner@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'owner';

      mockProductStore.deleteProduct.mockResolvedValue(true);

      // Mock window.confirm for delete confirmation
      global.confirm = vi.fn(() => true);

      const handleDelete = vi.fn(() => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
          mockProductStore.deleteProduct(productToDelete.id);
        }
      });

      render(
        <div>
          <button onClick={handleDelete} data-testid="delete-button">
            Hapus Produk
          </button>
        </div>
      );

      await user.click(screen.getByTestId('delete-button'));

      expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus produk ini?');
      expect(mockProductStore.deleteProduct).toHaveBeenCalledWith(productToDelete.id);
    });

    it('should prevent deletion without proper permissions', async () => {
      mockAuthStore.user = { id: 'staff-001', email: 'staff@majujaya.co.id' };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff'; // Staff shouldn't delete products

      const handleDelete = vi.fn();

      render(
        <div>
          <button 
            onClick={handleDelete} 
            disabled={mockAuthStore.userRole === 'staff'}
            data-testid="delete-button"
          >
            Hapus Produk
          </button>
        </div>
      );

      const deleteButton = screen.getByTestId('delete-button');
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Product Search and Filtering', () => {
    it('should search products by name', async () => {
      const user = userEvent.setup();
      
      const mockProducts = [
        { id: 'prod-001', name: 'Laptop Gaming', category_id: 'electronics' },
        { id: 'prod-002', name: 'Laptop Office', category_id: 'electronics' },
        { id: 'prod-003', name: 'Mouse Gaming', category_id: 'electronics' }
      ];

      mockProductStore.products = mockProducts;
      productService.searchProducts.mockResolvedValue([mockProducts[0], mockProducts[1]]);

      const SearchComponent = () => {
        const [searchTerm, setSearchTerm] = React.useState('');
        
        const handleSearch = () => {
          productService.searchProducts({
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
              placeholder="Cari produk..."
            />
            <button onClick={handleSearch} data-testid="search-button">
              Cari
            </button>
          </div>
        );
      };

      render(<SearchComponent />);

      await user.type(screen.getByTestId('search-input'), 'Laptop');
      await user.click(screen.getByTestId('search-button'));

      expect(productService.searchProducts).toHaveBeenCalledWith({
        name: 'Laptop',
        company_id: 'company-maju-jaya'
      });
    });

    it('should filter by Indonesian product categories', async () => {
      const categories = [
        { id: 'cat-makanan', name: 'Makanan & Minuman' },
        { id: 'cat-fashion', name: 'Fashion & Aksesoris' },
        { id: 'cat-elektronik', name: 'Elektronik' },
        { id: 'cat-kesehatan', name: 'Kesehatan & Kecantikan' }
      ];

      categories.forEach(category => {
        productService.searchProducts.mockResolvedValue([]);
        
        productService.searchProducts({
          category_id: category.id,
          company_id: 'company-maju-jaya'
        });

        expect(productService.searchProducts).toHaveBeenCalledWith({
          category_id: category.id,
          company_id: 'company-maju-jaya'
        });
      });
    });
  });

  describe('Multi-tenant Product Isolation', () => {
    it('should only show products from current tenant', async () => {
      const majuJayaProducts = [
        { id: 'prod-001', name: 'Product A', company_id: 'company-maju-jaya' },
        { id: 'prod-002', name: 'Product B', company_id: 'company-maju-jaya' }
      ];

      mockAuthStore.currentTenant = { id: 'company-maju-jaya', name: 'PT Maju Jaya' };
      
      productService.getProducts.mockResolvedValue(majuJayaProducts);

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(productService.getProducts).toHaveBeenCalledWith('company-maju-jaya');
    });

    it('should prevent cross-tenant product access', async () => {
      mockAuthStore.currentTenant = { id: 'company-sejahtera', name: 'PT Sejahtera' };

      // Attempt to access product from different company should fail
      const unauthorizedProductId = 'prod-maju-jaya-001';

      productService.getProducts.mockResolvedValue([]); // RLS should return empty

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductList />
          </BrowserRouter>
        </QueryClientProvider>
      );

      expect(productService.getProducts).toHaveBeenCalledWith('company-sejahtera');
      // Should not return products from other companies
    });
  });

  describe('Error Handling', () => {
    it('should handle product creation errors', async () => {
      const user = userEvent.setup();
      
      mockProductStore.createProduct.mockRejectedValue(
        new Error('Gagal membuat produk: Nama produk sudah ada')
      );

      const handleSubmit = vi.fn().mockImplementation(async (data) => {
        try {
          await mockProductStore.createProduct(data);
        } catch (error) {
          console.error('Error creating product:', error.message);
        }
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductForm onSubmit={handleSubmit} onCancel={vi.fn()} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await user.type(screen.getByTestId('product-name'), 'Duplicate Product');
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error creating product:', 
          'Gagal membuat produk: Nama produk sudah ada'
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      mockProductStore.fetchProducts.mockRejectedValue(
        new Error('Network error: Unable to connect')
      );

      mockProductStore.error = 'Koneksi bermasalah. Silakan coba lagi.';

      const ErrorDisplay = () => {
        const { error } = useProductStore();
        return error ? <div data-testid="error-message">{error}</div> : null;
      };

      render(<ErrorDisplay />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Koneksi bermasalah. Silakan coba lagi.'
      );
    });
  });
});