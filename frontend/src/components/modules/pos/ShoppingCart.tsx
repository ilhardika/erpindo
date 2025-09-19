/**
 * Shopping Cart Component
 * Handles cart display, item management, discount application, and total calculations
 */

import React, { useState } from 'react';
import { Trash2, Minus, Plus, Percent, Receipt, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePosStore } from '@/stores/posStore';
import type { Discount } from '@/stores/posStore';

interface ShoppingCartProps {
  className?: string;
  showPaymentButton?: boolean;
  onProceedToPayment?: () => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  className = '',
  showPaymentButton = true,
  onProceedToPayment
}) => {
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [discountDescription, setDiscountDescription] = useState('');

  const {
    cart,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    discount,
    taxRate,
    selectedCustomer,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeFromCart,
    applyDiscount,
    removeDiscount,
    clearCart
  } = usePosStore();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle discount application
  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) return;

    const newDiscount: Discount = {
      type: discountType,
      value,
      description: discountDescription || `${discountType === 'percentage' ? value + '%' : formatCurrency(value)} diskon`
    };

    applyDiscount(newDiscount);
    setDiscountDialogOpen(false);
    setDiscountValue('');
    setDiscountDescription('');
  };

  // Handle quantity change with validation
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateCartItemQuantity(itemId, newQuantity);
    }
  };

  // Handle item discount change
  const handleItemDiscountChange = (itemId: string, discountPercent: number) => {
    if (discountPercent >= 0 && discountPercent <= 100) {
      updateCartItemDiscount(itemId, discountPercent);
    }
  };

  if (cart.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang Belanja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Keranjang masih kosong</p>
            <p className="text-sm text-gray-400">
              Tambahkan produk untuk memulai transaksi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Keranjang Belanja ({cart.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Bersihkan
          </Button>
        </div>
        
        {selectedCustomer && (
          <div className="text-sm text-gray-600">
            Pelanggan: <span className="font-medium">{selectedCustomer.name}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Cart Items */}
        <ScrollArea className="max-h-96">
          <div className="space-y-2 p-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    SKU: {item.product.sku}
                  </p>
                  {item.barcode && (
                    <p className="text-xs text-gray-500 truncate">
                      Barcode: {item.barcode}
                    </p>
                  )}
                  
                  {/* Unit Price and Item Discount */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatCurrency(item.unitPrice)}
                    </span>
                    {item.discountPercent > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        -{item.discountPercent}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-6 text-center text-xs"
                      min="0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(item.lineTotal)}
                    </div>
                    {item.discountPercent > 0 && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                    )}
                  </div>

                  {/* Item Actions */}
                  <div className="flex gap-1">
                    {/* Item Discount */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2">
                          <Percent className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Diskon Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Persentase Diskon (%)</Label>
                            <Input
                              type="number"
                              value={item.discountPercent}
                              onChange={(e) => handleItemDiscountChange(item.id, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Remove Item */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-red-600 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        {/* Cart Summary */}
        <div className="p-4 space-y-3">
          {/* Global Discount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Diskon Keseluruhan</span>
              {discount && (
                <Badge variant="secondary" className="text-xs">
                  {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {discount ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeDiscount}
                  className="text-red-600 hover:text-red-700"
                >
                  Hapus
                </Button>
              ) : (
                <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Percent className="h-4 w-4 mr-1" />
                      Tambah
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tambah Diskon</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Tipe Diskon</Label>
                        <RadioGroup value={discountType} onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed_amount')}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">Persentase (%)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed_amount" id="fixed_amount" />
                            <Label htmlFor="fixed_amount">Nominal (Rp)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label>
                          Nilai {discountType === 'percentage' ? 'Persentase' : 'Nominal'}
                        </Label>
                        <Input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === 'percentage' ? '10' : '50000'}
                          min="0"
                          max={discountType === 'percentage' ? '100' : undefined}
                        />
                      </div>
                      <div>
                        <Label>Keterangan (Opsional)</Label>
                        <Input
                          value={discountDescription}
                          onChange={(e) => setDiscountDescription(e.target.value)}
                          placeholder="Diskon pelanggan VIP"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDiscountDialogOpen(false)} className="flex-1">
                          Batal
                        </Button>
                        <Button onClick={handleApplyDiscount} className="flex-1">
                          Terapkan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span>Pajak ({(taxRate * 100).toFixed(0)}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Button */}
          {showPaymentButton && (
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={onProceedToPayment}
              disabled={cart.length === 0}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Lanjut ke Pembayaran
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShoppingCartComponent;