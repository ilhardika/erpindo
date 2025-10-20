/**
 * Print receipt in new tab
 * Opens a new tab with only the receipt content and auto-triggers print
 */

import type { PosTransactionWithRelations } from '@/types/pos'

export function printReceiptInNewTab(
  transaction: PosTransactionWithRelations,
  companyInfo?: {
    name?: string
    address?: string
    phone?: string
  }
) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print receipt')
    return
  }

  const company = companyInfo || {
    name: 'ERPINDO COMPANY',
    address: 'Jl. Bisnis No. 123, Jakarta',
    phone: '+62 21 1234 5678',
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Build HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receipt - ${transaction.transaction_number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          padding: 20px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .receipt {
          border: 1px dashed #000;
          padding: 10px;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .company-name {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 10px;
          margin: 2px 0;
        }
        
        .transaction-info {
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        
        .items {
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .item {
          margin: 5px 0;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-left: 10px;
        }
        
        .totals {
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        
        .total-row.grand {
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px solid #000;
        }
        
        .payment {
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .footer {
          text-align: center;
          font-size: 10px;
          margin-top: 10px;
        }
        
        .thank-you {
          font-weight: bold;
          margin: 10px 0;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .receipt {
            border: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Header -->
        <div class="header">
          <div class="company-name">${company.name}</div>
          <div class="company-info">${company.address}</div>
          <div class="company-info">Tel: ${company.phone}</div>
        </div>
        
        <!-- Transaction Info -->
        <div class="transaction-info">
          <div class="info-row">
            <span>No. Transaksi:</span>
            <span>${transaction.transaction_number}</span>
          </div>
          <div class="info-row">
            <span>Tanggal:</span>
            <span>${formatDate(transaction.created_at)}</span>
          </div>
          <div class="info-row">
            <span>Kasir:</span>
            <span>${transaction.cashier?.name || 'Unknown'}</span>
          </div>
          ${
            transaction.customer
              ? `
          <div class="info-row">
            <span>Customer:</span>
            <span>${transaction.customer.name}</span>
          </div>
          `
              : ''
          }
        </div>
        
        <!-- Items -->
        <div class="items">
          <div class="item-header">
            <span>Item</span>
            <span>Total</span>
          </div>
          ${transaction.items
            .map(
              item => `
          <div class="item">
            <div class="item-header">
              <span>${item.product?.name || 'Unknown Product'}</span>
              <span>${formatCurrency(item.subtotal)}</span>
            </div>
            <div class="item-details">
              <span>${item.quantity}pc ${formatCurrency(item.unit_price)}</span>
              <span>${formatCurrency(item.quantity * item.unit_price)}</span>
            </div>
          </div>
          `
            )
            .join('')}
        </div>
        
        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(transaction.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Pajak (10%):</span>
            <span>${formatCurrency(transaction.tax_amount)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL:</span>
            <span>${formatCurrency(transaction.total)}</span>
          </div>
        </div>
        
        <!-- Payment -->
        <div class="payment">
          <div class="info-row">
            <span>Pembayaran:</span>
            <span>${transaction.payment_method.toUpperCase()}</span>
          </div>
          ${transaction.payments
            .map(
              payment => `
          <div class="info-row">
            <span>${payment.payment_method}:</span>
            <span>${formatCurrency(payment.amount)}</span>
          </div>
          `
            )
            .join('')}
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Terima Kasih</div>
          <div>Atas Kunjungan Anda</div>
          <div style="margin-top: 10px; font-size: 9px;">
            Barang yang sudah dibeli tidak dapat dikembalikan
          </div>
          <div style="margin-top: 10px; font-size: 9px;">
            ${formatDate(new Date().toISOString())}
          </div>
          <div style="margin-top: 5px; font-size: 9px;">
            Powered by ERPINDO
          </div>
        </div>
      </div>
      
      <script>
        // Auto print when page loads
        window.onload = function() {
          window.print();
          // Close tab after printing (optional)
          // window.onafterprint = function() {
          //   window.close();
          // }
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
