/**
 * POS Transaction Service
 * Handles transaction processing, invoice generation, and refund handling
 */

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { 
  SalesOrder, 
  SalesOrderInsert, 
  SalesOrderItem, 
  SalesOrderItemInsert,
  Invoice,
  InvoiceInsert
} from '@/types/database';
import type { PosTransaction, CartItem, RefundRequest } from '@/stores/posStore';

// ============================================================================
// TYPES
// ============================================================================

export interface InvoiceData {
  transaction: PosTransaction;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
}

export interface RefundResult {
  refundId: string;
  refundAmount: number;
  refundItems: Array<{
    productName: string;
    quantity: number;
    amount: number;
  }>;
}

// ============================================================================
// TRANSACTION PROCESSING
// ============================================================================

export class PosTransactionService {
  
  /**
   * Save transaction to database
   */
  static async saveTransaction(transaction: PosTransaction): Promise<boolean> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.tenant_id) {
        throw new Error('User tenant not found');
      }

      // Create sales order
      const salesOrderData: SalesOrderInsert = {
        company_id: user.tenant_id,
        order_number: transaction.orderNumber,
        customer_id: transaction.customer?.id || null,
        salesperson_id: user.id,
        order_date: transaction.timestamp.toISOString(),
        status: 'confirmed',
        subtotal: transaction.subtotal,
        tax_amount: transaction.taxAmount,
        discount_amount: transaction.discountAmount,
        total_amount: transaction.totalAmount,
        payment_status: 'paid',
        notes: transaction.notes,
        created_by: user.id
      };

      const { data: salesOrder, error: salesOrderError } = await supabase
        .from('sales_orders')
        .insert(salesOrderData)
        .select()
        .single();

      if (salesOrderError) throw salesOrderError;

      // Create sales order items
      const salesOrderItems: SalesOrderItemInsert[] = transaction.items.map(item => ({
        company_id: user.tenant_id!,
        sales_order_id: salesOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent,
        discount_amount: item.discountAmount,
        line_total: item.lineTotal
      }));

      const { error: itemsError } = await supabase
        .from('sales_order_items')
        .insert(salesOrderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of transaction.items) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          product_id: item.product.id,
          quantity_change: -item.quantity,
          movement_type: 'out',
          reference_type: 'sales_order',
          reference_id: salesOrder.id,
          notes: `Sale: ${transaction.orderNumber}`
        });

        if (stockError) {
          console.error('Stock update error:', stockError);
          // Continue with other items even if one fails
        }
      }

      // Create transaction record in a custom transactions table if needed
      // This would store POS-specific data like cashier shift, payment method details, etc.

      return true;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return false;
    }
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    
    return `POS${year}${month}${day}${time}`;
  }

  /**
   * Validate transaction before processing
   */
  static validateTransaction(transaction: Partial<PosTransaction>): string[] {
    const errors: string[] = [];

    if (!transaction.items || transaction.items.length === 0) {
      errors.push('Transaksi harus memiliki minimal satu item');
    }

    if (!transaction.totalAmount || transaction.totalAmount <= 0) {
      errors.push('Total transaksi harus lebih dari 0');
    }

    if (!transaction.payment) {
      errors.push('Metode pembayaran harus dipilih');
    }

    if (!transaction.cashierShiftId) {
      errors.push('Sesi kasir harus aktif');
    }

    // Validate stock availability
    transaction.items?.forEach((item, index) => {
      if (item.quantity > item.product.stock_quantity) {
        errors.push(`Stok ${item.product.name} tidak mencukupi (tersedia: ${item.product.stock_quantity})`);
      }
      
      if (item.quantity <= 0) {
        errors.push(`Kuantitas item ke-${index + 1} harus lebih dari 0`);
      }
    });

    return errors;
  }

  // ============================================================================
  // INVOICE GENERATION
  // ============================================================================

  /**
   * Generate PDF invoice
   */
  static async generateInvoicePDF(invoiceData: InvoiceData): Promise<string> {
    try {
      // In a real implementation, this would use a PDF generation library
      // like jsPDF, Puppeteer, or call a backend service
      
      // For now, we'll simulate the process and return a mock URL
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = `invoice-${invoiceData.transaction.orderNumber}.pdf`;
      
      // In a real app, you would:
      // 1. Generate PDF using a library
      // 2. Upload to cloud storage (Supabase Storage, AWS S3, etc.)
      // 3. Return the download URL
      
      return `/invoices/${fileName}`;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Gagal membuat invoice PDF');
    }
  }

  /**
   * Generate invoice HTML for preview or printing
   */
  static generateInvoiceHTML(invoiceData: InvoiceData): string {
    const { transaction, company, customer } = invoiceData;
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${transaction.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .company-info { font-size: 12px; color: #666; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .invoice-info div { flex: 1; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${company.name}</div>
          <div class="company-info">
            ${company.address}<br>
            Telp: ${company.phone} | Email: ${company.email}
          </div>
        </div>

        <div class="invoice-info">
          <div>
            <h3>INVOICE</h3>
            <p><strong>No. Invoice:</strong> ${transaction.orderNumber}</p>
            <p><strong>Tanggal:</strong> ${formatDate(transaction.timestamp)}</p>
          </div>
          <div>
            ${customer ? `
              <h4>Pelanggan:</h4>
              <p><strong>${customer.name}</strong></p>
              ${customer.phone ? `<p>Telp: ${customer.phone}</p>` : ''}
              ${customer.address ? `<p>${customer.address}</p>` : ''}
            ` : '<p>Pelanggan Umum</p>'}
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Diskon</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product.name}</td>
                <td>${item.quantity} ${item.product.unit_of_measure}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${item.discountPercent > 0 ? item.discountPercent + '%' : '-'}</td>
                <td>${formatCurrency(item.lineTotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(transaction.subtotal)}</span>
          </div>
          ${transaction.discountAmount > 0 ? `
            <div class="total-row">
              <span>Diskon:</span>
              <span>-${formatCurrency(transaction.discountAmount)}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>Pajak (11%):</span>
            <span>${formatCurrency(transaction.taxAmount)}</span>
          </div>
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${formatCurrency(transaction.totalAmount)}</span>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <p><strong>Metode Pembayaran:</strong> 
            ${transaction.payment.method === 'cash' ? 'Tunai' : 
              transaction.payment.method === 'bank_transfer' ? 'Transfer Bank' : 'QR Code'}
          </p>
          ${transaction.payment.method === 'cash' && transaction.payment.change ? `
            <p><strong>Uang Diterima:</strong> ${formatCurrency(transaction.payment.receivedAmount || 0)}</p>
            <p><strong>Kembalian:</strong> ${formatCurrency(transaction.payment.change)}</p>
          ` : ''}
          ${transaction.payment.reference ? `
            <p><strong>Referensi:</strong> ${transaction.payment.reference}</p>
          ` : ''}
        </div>

        <div class="footer">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>Barang yang sudah dibeli tidak dapat dikembalikan kecuali ada kesepakatan.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Print invoice directly
   */
  static printInvoice(invoiceData: InvoiceData): void {
    const htmlContent = this.generateInvoiceHTML(invoiceData);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // ============================================================================
  // REFUND PROCESSING
  // ============================================================================

  /**
   * Process refund
   */
  static async processRefund(refundRequest: RefundRequest): Promise<RefundResult | null> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.tenant_id) {
        throw new Error('User tenant not found');
      }

      // Get original transaction
      const { data: originalOrder, error: orderError } = await supabase
        .from('sales_orders')
        .select(`
          *,
          sales_order_items (
            *,
            products (*)
          )
        `)
        .eq('company_id', user.tenant_id)
        .eq('order_number', refundRequest.originalTransactionId.replace('POS-', ''))
        .single();

      if (orderError) throw orderError;

      // Create refund order
      const refundOrderData: SalesOrderInsert = {
        company_id: user.tenant_id,
        order_number: `REF-${originalOrder.order_number}`,
        customer_id: originalOrder.customer_id,
        salesperson_id: user.id,
        order_date: new Date().toISOString(),
        status: 'confirmed',
        subtotal: -refundRequest.refundAmount,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: -refundRequest.refundAmount,
        payment_status: 'paid',
        notes: `Refund: ${refundRequest.reason}`,
        created_by: user.id
      };

      const { data: refundOrder, error: refundOrderError } = await supabase
        .from('sales_orders')
        .insert(refundOrderData)
        .select()
        .single();

      if (refundOrderError) throw refundOrderError;

      // Create refund items and update stock
      const refundItems: Array<{ productName: string; quantity: number; amount: number }> = [];

      for (const refundItem of refundRequest.items) {
        const originalItem = originalOrder.sales_order_items.find(
          (item: any) => item.id === refundItem.cartItemId
        );

        if (!originalItem) continue;

        // Create refund item
        const refundItemData: SalesOrderItemInsert = {
          company_id: user.tenant_id,
          sales_order_id: refundOrder.id,
          product_id: originalItem.product_id,
          quantity: -refundItem.quantityToRefund,
          unit_price: originalItem.unit_price,
          discount_percent: originalItem.discount_percent,
          discount_amount: originalItem.discount_amount,
          line_total: -(refundItem.quantityToRefund * originalItem.unit_price * (1 - originalItem.discount_percent / 100))
        };

        const { error: itemError } = await supabase
          .from('sales_order_items')
          .insert(refundItemData);

        if (itemError) throw itemError;

        // Update stock (add back refunded quantity)
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          product_id: originalItem.product_id,
          quantity_change: refundItem.quantityToRefund,
          movement_type: 'in',
          reference_type: 'refund',
          reference_id: refundOrder.id,
          notes: `Refund: ${refundRequest.reason}`
        });

        if (stockError) {
          console.error('Stock update error:', stockError);
        }

        refundItems.push({
          productName: originalItem.products.name,
          quantity: refundItem.quantityToRefund,
          amount: refundItemData.line_total
        });
      }

      return {
        refundId: refundOrder.id,
        refundAmount: refundRequest.refundAmount,
        refundItems
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return null;
    }
  }

  /**
   * Get refund history for a transaction
   */
  static async getRefundHistory(originalTransactionId: string): Promise<any[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.tenant_id) return [];

      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          sales_order_items (
            *,
            products (name)
          )
        `)
        .eq('company_id', user.tenant_id)
        .like('order_number', `REF-${originalTransactionId}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting refund history:', error);
      return [];
    }
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  /**
   * Get transaction summary for a date range
   */
  static async getTransactionSummary(startDate: Date, endDate: Date) {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.tenant_id) return null;

      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('company_id', user.tenant_id)
        .gte('order_date', startDate.toISOString())
        .lte('order_date', endDate.toISOString())
        .eq('payment_status', 'paid');

      if (error) throw error;

      const transactions = data || [];
      const sales = transactions.filter(t => t.total_amount > 0);
      const refunds = transactions.filter(t => t.total_amount < 0);

      return {
        totalSales: sales.reduce((sum, t) => sum + t.total_amount, 0),
        totalRefunds: Math.abs(refunds.reduce((sum, t) => sum + t.total_amount, 0)),
        transactionCount: sales.length,
        refundCount: refunds.length,
        averageTransaction: sales.length > 0 ? sales.reduce((sum, t) => sum + t.total_amount, 0) / sales.length : 0
      };
    } catch (error) {
      console.error('Error getting transaction summary:', error);
      return null;
    }
  }
}

export default PosTransactionService;