/**
 * Payment Interface Component
 * Handles payment methods: cash, bank transfer, and QR code simulation
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Calculator, 
  CheckCircle, 
  ArrowLeft,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePosStore } from '@/stores/posStore';
import type { Payment } from '@/stores/posStore';

interface PaymentInterfaceProps {
  className?: string;
  onPaymentComplete?: (transactionId: string) => void;
  onBack?: () => void;
}

const PaymentInterface: React.FC<PaymentInterfaceProps> = ({
  className = '',
  onPaymentComplete,
  onBack
}) => {
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [qrCodeExpiry, setQrCodeExpiry] = useState(300); // 5 minutes
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const {
    totalAmount,
    currentPayment,
    isProcessingPayment,
    setPaymentMethod: setPosPaymentMethod,
    setReceivedAmount,
    calculateChange,
    processPayment,
    currentShift
  } = usePosStore();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle payment method change
  useEffect(() => {
    setPosPaymentMethod(paymentMethod);
  }, [paymentMethod, setPosPaymentMethod]);

  // Handle cash received change
  useEffect(() => {
    if (paymentMethod === 'cash' && cashReceived) {
      const amount = parseFloat(cashReceived);
      if (!isNaN(amount)) {
        setReceivedAmount(amount);
      }
    }
  }, [cashReceived, paymentMethod, setReceivedAmount]);

  // QR Code countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrCodeDialog && qrCodeExpiry > 0) {
      timer = setInterval(() => {
        setQrCodeExpiry(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [qrCodeDialog, qrCodeExpiry]);

  // Handle payment processing
  const handleProcessPayment = async () => {
    try {
      // Validation
      if (!currentShift) {
        alert('Sesi kasir belum dibuka. Silakan buka sesi kasir terlebih dahulu.');
        return;
      }

      if (paymentMethod === 'cash') {
        const received = parseFloat(cashReceived);
        if (isNaN(received) || received < totalAmount) {
          alert('Jumlah uang yang diterima tidak valid atau kurang dari total pembayaran.');
          return;
        }
      }

      if (paymentMethod === 'bank_transfer' && !bankReference.trim()) {
        alert('Nomor referensi transfer bank wajib diisi.');
        return;
      }

      const transactionId = await processPayment();
      
      if (transactionId) {
        setPaymentCompleted(true);
        setTimeout(() => {
          onPaymentComplete?.(transactionId);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
    }
  };

  // Quick cash amounts
  const quickCashAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 50000) * 50000,
    Math.ceil(totalAmount / 100000) * 100000,
    Math.ceil(totalAmount / 500000) * 500000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index);

  // Format time for QR code expiry
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (paymentCompleted) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Pembayaran Berhasil!
          </h2>
          <p className="text-gray-600 mb-4">
            Transaksi telah diproses dan struk akan dicetak.
          </p>
          <div className="text-lg font-semibold mb-6">
            Total: {formatCurrency(totalAmount)}
          </div>
          {paymentMethod === 'cash' && currentPayment?.change && currentPayment.change > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="text-yellow-800 font-semibold">
                Kembalian: {formatCurrency(currentPayment.change)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pembayaran
          </CardTitle>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Amount */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Pembayaran</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Metode Pembayaran
          </Label>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as Payment['method'])}>
            <div className="space-y-3">
              {/* Cash */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Tunai</div>
                    <div className="text-sm text-gray-500">Pembayaran dengan uang tunai</div>
                  </div>
                </Label>
              </div>

              {/* Bank Transfer */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Transfer Bank</div>
                    <div className="text-sm text-gray-500">Transfer ke rekening toko</div>
                  </div>
                </Label>
              </div>

              {/* QR Code */}
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value="qr_code" id="qr_code" />
                <Label htmlFor="qr_code" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">QR Code</div>
                    <div className="text-sm text-gray-500">Pembayaran menggunakan QR Code</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Payment Details */}
        {paymentMethod === 'cash' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cash-received">Uang Diterima</Label>
              <Input
                id="cash-received"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={formatCurrency(totalAmount)}
                className="text-lg font-semibold"
              />
            </div>

            {/* Quick Cash Buttons */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Nominal Cepat</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickCashAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setCashReceived(amount.toString())}
                    className="text-xs"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Change Calculation */}
            {cashReceived && parseFloat(cashReceived) >= totalAmount && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Kembalian:</span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(calculateChange())}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Informasi Transfer</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Bank: Bank Central Asia (BCA)</div>
                <div>No. Rekening: 1234567890</div>
                <div>Atas Nama: Toko ABC</div>
                <div>Jumlah: {formatCurrency(totalAmount)}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="bank-reference">Nomor Referensi / ID Transaksi</Label>
              <Input
                id="bank-reference"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="Masukkan nomor referensi transfer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nomor referensi dapat ditemukan di bukti transfer atau SMS notifikasi
              </p>
            </div>
          </div>
        )}

        {paymentMethod === 'qr_code' && (
          <div className="space-y-4">
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setQrCodeDialog(true);
                  setQrCodeExpiry(300);
                }}
                className="w-full"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Tampilkan QR Code
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                QR Code akan berlaku selama 5 menit
              </p>
            </div>
          </div>
        )}

        {/* Process Payment Button */}
        <Button
          onClick={handleProcessPayment}
          disabled={
            isProcessingPayment ||
            (paymentMethod === 'cash' && (parseFloat(cashReceived) < totalAmount || !cashReceived)) ||
            (paymentMethod === 'bank_transfer' && !bankReference.trim())
          }
          className="w-full"
          size="lg"
        >
          {isProcessingPayment ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Proses Pembayaran
            </>
          )}
        </Button>
      </CardContent>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialog} onOpenChange={setQrCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran QR Code</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
              <QrCode className="h-16 w-16 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">QR Code Pembayaran</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            {/* Timer and Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant={qrCodeExpiry > 60 ? 'default' : 'destructive'}>
                  {formatTime(qrCodeExpiry)}
                </Badge>
                <span className="text-sm text-gray-600">tersisa</span>
              </div>
              
              <p className="text-sm text-gray-600">
                Scan QR Code dengan aplikasi pembayaran digital Anda
              </p>
              
              {qrCodeExpiry === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQrCodeExpiry(300)}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Perbarui QR Code
                </Button>
              )}
            </div>

            {/* Simulation Button for Demo */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Mode Demo:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQrCodeDialog(false);
                  // Simulate successful QR payment
                  setTimeout(() => {
                    handleProcessPayment();
                  }, 1000);
                }}
                className="w-full"
              >
                Simulasikan Pembayaran Berhasil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PaymentInterface;