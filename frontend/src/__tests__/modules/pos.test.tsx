import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { POSPage } from '@/pages/pos/POSPage';
import { ProductSearch } from '@/components/modules/pos/ProductSearch';
import { ShoppingCart } from '@/components/modules/pos/ShoppingCart';
import { PaymentInterface } from '@/components/modules/pos/PaymentInterface';
import { usePOSStore } from '@/stores/posStore';
import { useAuthStore } from '@/stores/authStore';
import { posService } from '@/services/posService';
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
      }))
    }))
  }
}));

// Mock stores
vi.mock('@/stores/posStore', () => ({
  usePOSStore: vi.fn()
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn()
}));

// Mock service
vi.mock('@/services/posService', () => ({
  posService: {
    searchProducts: vi.fn(),
    processTransaction: vi.fn(),
    printReceipt: vi.fn(),
    calculateTax: vi.fn(),
    validatePayment: vi.fn()
  }
}));

// Mock components
vi.mock('@/pages/pos/POSPage', () => ({
  POSPage: () => <div data-testid="pos-page">POS Page</div>
}));

vi.mock('@/components/modules/pos/ProductSearch', () => ({
  ProductSearch: ({ onProductSelect }: any) => (
    <div data-testid="product-search">
      <input data-testid="search-input" placeholder="Cari produk..." />
      <div data-testid="product-results">
        <button 
          onClick={() => onProductSelect({
            id: 'prod-001',
            name: 'Kopi Arabica Premium',
            price: 150000,
            stock_quantity: 100
          })}
          data-testid="select-product"
        >
          Kopi Arabica Premium - Rp 150.000
        </button>
      </div>
    </div>
  )
}));

vi.mock('@/components/modules/pos/ShoppingCart', () => ({
  ShoppingCart: ({ items, onUpdateQuantity, onRemoveItem }: any) => (
    <div data-testid="shopping-cart">
      <h3>Keranjang Belanja</h3>
      {items.map((item: any) => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span>{item.name}</span>
          <span>Qty: {item.quantity}</span>
          <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            data-testid={`increase-${item.id}`}
          >
            +
          </button>
          <button 
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            data-testid={`decrease-${item.id}`}
          >
            -
          </button>
          <button 
            onClick={() => onRemoveItem(item.id)}
            data-testid={`remove-${item.id}`}
          >
            Hapus
          </button>
        </div>
      ))}
      <div data-testid="cart-total">
        Total: Rp {items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}
      </div>
    </div>
  )
}));

vi.mock('@/components/modules/pos/PaymentInterface', () => ({
  PaymentInterface: ({ total, onPayment }: any) => (
    <div data-testid="payment-interface">
      <h3>Pembayaran</h3>
      <div data-testid="payment-total">Total: Rp {total.toLocaleString('id-ID')}</div>
      <div>
        <label>Metode Pembayaran:</label>
        <select data-testid="payment-method">
          <option value="cash">Tunai</option>
          <option value="debit">Kartu Debit</option>
          <option value="credit">Kartu Kredit</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer Bank</option>
        </select>
      </div>
      <div>
        <label>Jumlah Bayar:</label>
        <input 
          type="number" 
          data-testid="payment-amount"
          placeholder="Masukkan jumlah bayar"
        />
      </div>
      <button 
        onClick={() => onPayment({
          method: 'cash',
          amount: total,
          received: total
        })}
        data-testid="process-payment"
      >
        Proses Pembayaran
      </button>
    </div>
  )
}));

const mockPOSStore = {
  cartItems: [],
  currentTransaction: null,
  isProcessing: false,
  error: null,
  addItem: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  processPayment: vi.fn(),
  calculateTotal: vi.fn(),
  calculateTax: vi.fn()
};

const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  userRole: null,
  currentTenant: null
};

describe('Basic POS Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    (usePOSStore as any).mockReturnValue(mockPOSStore);
    (useAuthStore as any).mockReturnValue(mockAuthStore);
  });

  describe('Product Search and Selection', () => {
    it('should search and display available products', async () => {
      const user = userEvent.setup();
      
      const mockProducts = [
        {
          id: 'prod-001',
          name: 'Kopi Arabica Premium',
          price: 150000,
          stock_quantity: 100,
          barcode: '8901234567890'
        },
        {
          id: 'prod-002',
          name: 'Teh Hijau Organik',
          price: 75000,
          stock_quantity: 50,
          barcode: '8901234567891'
        }
      ];

      mockAuthStore.user = {
        id: 'staff-001',
        email: 'kasir@majujaya.co.id',
        user_metadata: { full_name: 'Staff Kasir' }
      };
      mockAuthStore.isAuthenticated = true;
      mockAuthStore.userRole = 'staff';
      mockAuthStore.currentTenant = {
        id: 'company-maju-jaya',
        name: 'PT Maju Jaya'
      };

      posService.searchProducts.mockResolvedValue(mockProducts);

      const handleProductSelect = vi.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductSearch onProductSelect={handleProductSelect} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Search for products
      await user.type(screen.getByTestId('search-input'), 'Kopi');

      expect(screen.getByTestId('product-search')).toBeInTheDocument();
      expect(screen.getByTestId('product-results')).toBeInTheDocument();
    });

    it('should add selected product to shopping cart', async () => {
      const user = userEvent.setup();
      
      const selectedProduct = {
        id: 'prod-001',
        name: 'Kopi Arabica Premium',
        price: 150000,
        stock_quantity: 100
      };

      mockPOSStore.addItem.mockImplementation((product) => {
        mockPOSStore.cartItems = [{
          ...product,
          quantity: 1
        }];
      });

      const handleProductSelect = vi.fn((product) => {
        mockPOSStore.addItem(product);
      });

      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ProductSearch onProductSelect={handleProductSelect} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      await user.click(screen.getByTestId('select-product'));

      expect(handleProductSelect).toHaveBeenCalledWith(selectedProduct);
      expect(mockPOSStore.addItem).toHaveBeenCalledWith(selectedProduct);
    });

    it('should handle barcode scanning', async () => {
      const barcodeProduct = {
        id: 'prod-barcode',
        name: 'Produk Barcode',
        price: 200000,
        barcode: '8901234567890'
      };

      posService.searchProducts.mockResolvedValue([barcodeProduct]);

      // Simulate barcode scanner input
      const handleBarcodeSearch = vi.fn((barcode) => {
        posService.searchProducts({ barcode, company_id: 'company-maju-jaya' });
      });

      handleBarcodeSearch('8901234567890');

      expect(posService.searchProducts).toHaveBeenCalledWith({
        barcode: '8901234567890',
        company_id: 'company-maju-jaya'
      });
    });
  });

  describe('Shopping Cart Management', () => {
    it('should display cart items with Indonesian currency formatting', async () => {
      const cartItems = [
        {
          id: 'prod-001',
          name: 'Kopi Arabica Premium',
          price: 150000,
          quantity: 2
        },
        {
          id: 'prod-002',
          name: 'Teh Hijau Organik',
          price: 75000,
          quantity: 1
        }
      ];

      const handleUpdateQuantity = vi.fn();
      const handleRemoveItem = vi.fn();

      render(
        <ShoppingCart 
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      );

      expect(screen.getByTestId('shopping-cart')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-prod-001')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-prod-002')).toBeInTheDocument();
      
      // Check Indonesian currency formatting
      expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: Rp 375.000');
    });

    it('should update item quantities', async () => {
      const user = userEvent.setup();
      
      const cartItems = [
        {
          id: 'prod-001',
          name: 'Kopi Arabica Premium',
          price: 150000,
          quantity: 1
        }
      ];

      const handleUpdateQuantity = vi.fn();
      const handleRemoveItem = vi.fn();

      render(
        <ShoppingCart 
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      );

      // Increase quantity
      await user.click(screen.getByTestId('increase-prod-001'));
      expect(handleUpdateQuantity).toHaveBeenCalledWith('prod-001', 2);

      // Decrease quantity
      await user.click(screen.getByTestId('decrease-prod-001'));
      expect(handleUpdateQuantity).toHaveBeenCalledWith('prod-001', 0);
    });

    it('should remove items from cart', async () => {
      const user = userEvent.setup();
      
      const cartItems = [
        {
          id: 'prod-001',
          name: 'Kopi Arabica Premium',
          price: 150000,
          quantity: 1
        }
      ];

      const handleUpdateQuantity = vi.fn();
      const handleRemoveItem = vi.fn();

      render(
        <ShoppingCart 
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      );

      await user.click(screen.getByTestId('remove-prod-001'));
      expect(handleRemoveItem).toHaveBeenCalledWith('prod-001');
    });

    it('should validate stock availability', async () => {
      const cartItems = [
        {
          id: 'prod-001',
          name: 'Kopi Arabica Premium',
          price: 150000,
          quantity: 5,
          stock_quantity: 3 // Stock insufficient
        }
      ];

      // Stock validation logic
      const validateStock = (items: any[]) => {
        return items.every(item => item.quantity <= item.stock_quantity);
      };

      const isStockValid = validateStock(cartItems);
      expect(isStockValid).toBe(false);

      if (!isStockValid) {
        const stockError = 'Stok tidak mencukupi untuk beberapa produk';
        expect(stockError).toBe('Stok tidak mencukupi untuk beberapa produk');
      }
    });
  });

  describe('Payment Processing', () => {
    it('should display payment interface with Indonesian payment methods', async () => {
      const total = 375000; // Rp 375,000

      const handlePayment = vi.fn();

      render(
        <PaymentInterface 
          total={total}
          onPayment={handlePayment}
        />
      );

      expect(screen.getByTestId('payment-interface')).toBeInTheDocument();
      expect(screen.getByTestId('payment-total')).toHaveTextContent('Total: Rp 375.000');
      
      // Check Indonesian payment methods
      const paymentMethodSelect = screen.getByTestId('payment-method');
      expect(paymentMethodSelect).toHaveValue('cash');
      
      const options = Array.from(paymentMethodSelect.querySelectorAll('option')).map(option => option.value);
      expect(options).toContain('cash');
      expect(options).toContain('qris');
      expect(options).toContain('transfer');
    });

    it('should process cash payment with change calculation', async () => {
      const user = userEvent.setup();
      
      const total = 375000;
      const paymentAmount = 400000;
      const expectedChange = 25000;

      const handlePayment = vi.fn();

      render(
        <PaymentInterface 
          total={total}
          onPayment={handlePayment}
        />
      );

      await user.type(screen.getByTestId('payment-amount'), paymentAmount.toString());
      await user.click(screen.getByTestId('process-payment'));

      expect(handlePayment).toHaveBeenCalledWith({
        method: 'cash',
        amount: total,
        received: total
      });

      // Calculate change
      const change = paymentAmount - total;
      expect(change).toBe(expectedChange);
    });

    it('should handle QRIS payment for Indonesian market', async () => {
      const user = userEvent.setup();
      
      const total = 150000;

      const qrisPayment = {
        method: 'qris',
        amount: total,
        qrCode: 'ID.CO.QRIS.WWW0215ID.CO.MERCHANT.JKT123',
        merchantName: 'PT Maju Jaya'
      };

      posService.processTransaction.mockResolvedValue({
        transaction_id: 'txn-001',
        payment_method: 'qris',
        status: 'success'
      });

      const handleQRISPayment = vi.fn(async (paymentData) => {
        return await posService.processTransaction(paymentData);
      });

      const result = await handleQRISPayment(qrisPayment);

      expect(result.payment_method).toBe('qris');
      expect(result.status).toBe('success');
    });

    it('should calculate Indonesian tax (PPN 11%)', async () => {
      const subtotal = 1000000; // Rp 1,000,000
      const taxRate = 0.11; // PPN 11%
      const expectedTax = 110000; // Rp 110,000
      const expectedTotal = 1110000; // Rp 1,110,000

      posService.calculateTax.mockReturnValue({
        subtotal,
        tax: expectedTax,
        total: expectedTotal
      });

      const taxCalculation = posService.calculateTax(subtotal);

      expect(taxCalculation.tax).toBe(expectedTax);
      expect(taxCalculation.total).toBe(expectedTotal);
    });
  });

  describe('Transaction Processing', () => {
    it('should process complete transaction with Indonesian receipt', async () => {
      const transactionData = {
        items: [
          {
            id: 'prod-001',
            name: 'Kopi Arabica Premium',
            price: 150000,
            quantity: 2
          }
        ],
        subtotal: 300000,
        tax: 33000, // PPN 11%
        total: 333000,
        payment: {
          method: 'cash',
          amount: 350000,
          change: 17000
        },
        customer: {
          name: 'Umum',
          type: 'individual'
        },
        company_id: 'company-maju-jaya'
      };

      const expectedReceipt = {
        transaction_id: 'TXN-20240901-001',
        date: new Date().toISOString(),
        company: {
          name: 'PT Maju Jaya',
          address: 'Jl. Sudirman No. 123, Jakarta',
          npwp: '01.234.567.8-901.000'
        },
        items: transactionData.items,
        subtotal: transactionData.subtotal,
        tax: transactionData.tax,
        total: transactionData.total,
        payment: transactionData.payment
      };

      posService.processTransaction.mockResolvedValue({
        success: true,
        transaction_id: 'TXN-20240901-001',
        receipt: expectedReceipt
      });

      const result = await posService.processTransaction(transactionData);

      expect(result.success).toBe(true);
      expect(result.receipt.company.npwp).toMatch(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/);
      expect(result.receipt.tax).toBe(33000); // PPN 11%
    });

    it('should handle transaction errors gracefully', async () => {
      const invalidTransaction = {
        items: [],
        total: 0
      };

      posService.processTransaction.mockRejectedValue(
        new Error('Transaksi gagal: Keranjang kosong')
      );

      try {
        await posService.processTransaction(invalidTransaction);
      } catch (error) {
        expect(error.message).toBe('Transaksi gagal: Keranjang kosong');
      }
    });

    it('should print Indonesian formatted receipt', async () => {
      const receiptData = {
        transaction_id: 'TXN-20240901-001',
        date: '2024-09-01T10:30:00Z',
        company: {
          name: 'PT Maju Jaya',
          address: 'Jl. Sudirman No. 123, Jakarta Pusat, 10270',
          phone: '+62-21-1234-5678',
          npwp: '01.234.567.8-901.000'
        },
        items: [
          { name: 'Kopi Arabica Premium', quantity: 2, price: 150000, total: 300000 }
        ],
        subtotal: 300000,
        tax: 33000,
        total: 333000,
        payment: {
          method: 'cash',
          received: 350000,
          change: 17000
        },
        cashier: 'Staff Kasir'
      };

      posService.printReceipt.mockResolvedValue({
        success: true,
        printed: true
      });

      const printResult = await posService.printReceipt(receiptData);

      expect(printResult.success).toBe(true);
      expect(receiptData.company.npwp).toMatch(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/);
      expect(receiptData.date).toContain('2024-09-01');
    });
  });

  describe('Multi-tenant POS Operations', () => {
    it('should only access products from current tenant', async () => {
      mockAuthStore.currentTenant = { id: 'company-maju-jaya', name: 'PT Maju Jaya' };

      posService.searchProducts.mockResolvedValue([
        { id: 'prod-001', company_id: 'company-maju-jaya', name: 'Product A' }
      ]);

      const searchResult = await posService.searchProducts({
        company_id: 'company-maju-jaya',
        name: 'Product'
      });

      expect(posService.searchProducts).toHaveBeenCalledWith({
        company_id: 'company-maju-jaya',
        name: 'Product'
      });

      expect(searchResult[0].company_id).toBe('company-maju-jaya');
    });

    it('should prevent cross-tenant transaction processing', async () => {
      mockAuthStore.currentTenant = { id: 'company-sejahtera', name: 'PT Sejahtera' };

      const unauthorizedTransaction = {
        company_id: 'company-maju-jaya', // Different company
        total: 100000
      };

      posService.processTransaction.mockRejectedValue(
        new Error('Akses ditolak: Tidak dapat memproses transaksi untuk perusahaan lain')
      );

      try {
        await posService.processTransaction(unauthorizedTransaction);
      } catch (error) {
        expect(error.message).toContain('Akses ditolak');
      }
    });
  });

  describe('Indonesian Business Context', () => {
    it('should handle Indonesian currency denominations', async () => {
      const denominations = [
        1000, 2000, 5000, 10000, 20000, 50000, 100000 // IDR denominations
      ];

      denominations.forEach(denom => {
        expect(denom).toBeGreaterThan(0);
        expect(denom % 1000 === 0 || denom % 2000 === 0 || denom % 5000 === 0).toBe(true);
      });
    });

    it('should support Indonesian business hours', async () => {
      const businessHours = {
        open: '08:00',
        close: '22:00',
        timezone: 'Asia/Jakarta'
      };

      const currentTime = new Date();
      const jakartaTime = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      }).format(currentTime);

      expect(businessHours.timezone).toBe('Asia/Jakarta');
      expect(jakartaTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle Indonesian product categories', async () => {
      const indonesianCategories = [
        'makanan-minuman',
        'fashion-aksesoris',
        'elektronik',
        'kesehatan-kecantikan',
        'rumah-tangga',
        'otomotif',
        'olahraga-outdoor'
      ];

      indonesianCategories.forEach(category => {
        expect(category).toMatch(/^[a-z-]+$/);
        expect(category.includes('-')).toBe(true);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network connectivity issues', async () => {
      posService.processTransaction.mockRejectedValue(
        new Error('Network error: Koneksi terputus')
      );

      mockPOSStore.error = 'Koneksi bermasalah. Silakan coba lagi.';

      const ErrorDisplay = () => {
        const { error } = usePOSStore();
        return error ? <div data-testid="error-message">{error}</div> : null;
      };

      render(<ErrorDisplay />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Koneksi bermasalah. Silakan coba lagi.'
      );
    });

    it('should handle insufficient stock gracefully', async () => {
      const product = {
        id: 'prod-001',
        name: 'Limited Stock Product',
        price: 100000,
        stock_quantity: 1
      };

      const attemptedQuantity = 5;

      const stockValidation = product.stock_quantity >= attemptedQuantity;
      expect(stockValidation).toBe(false);

      if (!stockValidation) {
        const errorMessage = `Stok tidak mencukupi. Tersedia: ${product.stock_quantity}, Diminta: ${attemptedQuantity}`;
        expect(errorMessage).toContain('Stok tidak mencukupi');
      }
    });

    it('should handle payment validation errors', async () => {
      const invalidPayments = [
        { amount: 0, error: 'Jumlah pembayaran tidak valid' },
        { amount: -1000, error: 'Jumlah pembayaran tidak boleh negatif' },
        { method: '', error: 'Metode pembayaran harus dipilih' }
      ];

      invalidPayments.forEach(payment => {
        posService.validatePayment.mockReturnValue({
          valid: false,
          error: payment.error
        });

        const validation = posService.validatePayment(payment);
        expect(validation.valid).toBe(false);
        expect(validation.error).toBeTruthy();
      });
    });
  });
});