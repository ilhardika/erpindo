/**
 * Complete POS Page
 * Integrates all POS components with cashier shift management and full workflow
 */

import React, { useState } from 'react';
import { 
  Package, 
  Receipt,
  Settings,
  RotateCcw,
  Calculator,
  ShoppingCart as ShoppingCartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// POS Components
import ProductSearch from '@/components/modules/pos/ProductSearch';
import ShoppingCart from '@/components/modules/pos/ShoppingCart';
import PaymentInterface from '@/components/modules/pos/PaymentInterface';

// Store and utils
import { usePosStore } from '@/stores/posStore';
import { useAuthStore } from '@/stores/authStore';

const POSPage: React.FC = () => {
  // State
  const [currentView, setCurrentView] = useState<'shopping' | 'payment'>('shopping');
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [startingCash, setStartingCash] = useState('');
  const [endingCash, setEndingCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  // Store
  const {
    cart,
    currentShift,
    transactions,
    openShift,
    closeShift,
    getCurrentShiftSummary,
    generateInvoice,
    downloadInvoice,
    resetTransaction
  } = usePosStore();

  const { user } = useAuthStore();

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format time helper
  const formatTimeHelper = (date: Date | string | null) => {
    if (!date) return '--:--';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '--:--';
      return dateObj.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '--:--';
    }
  };

  // Get shift summary
  const shiftSummary = getCurrentShiftSummary();

  // Handlers
  const handleOpenShift = async () => {
    try {
      openShift(user?.id || 'unknown', user?.email || 'Unknown', Number(startingCash));
      setShiftDialogOpen(false);
      setStartingCash('');
    } catch (error) {
      console.error('Error opening shift:', error);
      alert('Gagal membuka sesi kasir');
    }
  };

  const handleCloseShift = async () => {
    try {
      closeShift(Number(endingCash), shiftNotes);
      setShiftDialogOpen(false);
      setEndingCash('');
      setShiftNotes('');
    } catch (error) {
      console.error('Error closing shift:', error);
      alert('Gagal menutup sesi kasir');
    }
  };

  // Handle payment completion
  const handlePaymentComplete = async (transactionId: string) => {
    try {
      // Generate invoice
      const invoiceUrl = await generateInvoice(transactionId);
      
      if (invoiceUrl) {
        // Auto-download invoice
        downloadInvoice(invoiceUrl);
      }

      // Reset to shopping view
      setCurrentView('shopping');
      resetTransaction();
      
      // Show success message
      alert('Transaksi berhasil! Invoice telah diunduh.');
    } catch (error) {
      console.error('Error completing payment:', error);
      alert('Gagal menyelesaikan pembayaran');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600">Sistem kasir terintegrasi</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Shift Info */}
            {currentShift && (
              <div className="bg-white rounded-md border p-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Badge variant="default" className="bg-green-600 text-xs px-1.5 py-0.5">
                      Aktif
                    </Badge>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(shiftSummary.totalSales)}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {currentShift.cashierName}
                  </span>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShiftDialogOpen(true)}
                className="flex-1 sm:flex-none"
              >
                <Settings className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">
                  {currentShift ? 'Tutup Sesi' : 'Buka Sesi'}
                </span>
                <span className="sm:hidden">Sesi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Section - Product Search */}
        <div className="flex-1 min-h-0">
          <ProductSearch
            onProductSelect={() => {}}
            className="h-full"
          />
        </div>

        {/* Right Section - Cart & Analytics */}
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
          {/* Cart/Payment Panel */}
          <div className="order-1">
            {currentView === 'shopping' ? (
              <ShoppingCart
                onProceedToPayment={() => setCurrentView('payment')}
                showPaymentButton={cart.length > 0}
              />
            ) : (
              <PaymentInterface
                onPaymentComplete={handlePaymentComplete}
                onBack={() => setCurrentView('shopping')}
              />
            )}
          </div>

          {/* Analytics Panel - Compact for mobile */}
          <div className="order-2 space-y-4">
            {/* Recent Transactions - Hidden on mobile to save space */}
            <Card className="hidden lg:block">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Transaksi Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {transactions.slice(-5).reverse().map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 border rounded text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {transaction.orderNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeHelper(transaction.timestamp)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(transaction.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.payment.method === 'cash' ? 'Tunai' :
                             transaction.payment.method === 'bank_transfer' ? 'Transfer' : 'QR'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Belum ada transaksi</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Compact buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentView('shopping')}
                  >
                    <ShoppingCartIcon className="h-3 w-3 mr-2" />
                    Belanja Baru
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Proses Refund
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    <Calculator className="h-3 w-3 mr-2" />
                    Kalkulator
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                  >
                    <Package className="h-3 w-3 mr-2" />
                    Cek Stok
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentShift ? 'Tutup Sesi Kasir' : 'Buka Sesi Kasir'}
            </DialogTitle>
          </DialogHeader>
          
          {!currentShift ? (
            // Open Shift
            <div className="space-y-4">
              <div>
                <Label htmlFor="starting-cash">Modal Awal (Rp)</Label>
                <Input
                  id="starting-cash"
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="100000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Jumlah uang tunai di laci kasir untuk mulai hari
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Kasir:</strong> {user?.email}</p>
                <p><strong>Waktu:</strong> {formatTimeHelper(new Date())}</p>
              </div>

              <Button onClick={handleOpenShift} className="w-full">
                Buka Sesi Kasir
              </Button>
            </div>
          ) : (
            // Close Shift
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Modal Awal:</span>
                  <span>{formatCurrency(currentShift.startingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Penjualan:</span>
                  <span>{formatCurrency(shiftSummary.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Transaksi:</span>
                  <span>{shiftSummary.totalTransactions}</span>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="ending-cash">Uang Akhir di Kasir (Rp)</Label>
                <Input
                  id="ending-cash"
                  type="number"
                  value={endingCash}
                  onChange={(e) => setEndingCash(e.target.value)}
                  placeholder={formatCurrency(currentShift.startingCash + shiftSummary.totalSales)}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="shift-notes">Catatan (Opsional)</Label>
                <Textarea
                  id="shift-notes"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Catatan khusus untuk sesi ini..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShiftDialogOpen(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleCloseShift} className="flex-1">
                  Tutup Sesi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSPage;