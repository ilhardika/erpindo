"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Receipt,
  X,
} from "lucide-react";
import { ProductTable } from "@/backend/tables/products";
import { CustomerTable } from "@/backend/tables/customers";

interface CartItem {
  productId: string;
  product: ProductTable;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  customers: CustomerTable[];
  selectedCustomer: string;
  setSelectedCustomer: (value: string) => void;
  discountPercent: number;
  setDiscountPercent: (value: number) => void;
  taxPercent: number;
  setTaxPercent: (value: number) => void;
  paymentMethod: "cash" | "transfer" | "credit_card" | "debit_card";
  setPaymentMethod: (
    value: "cash" | "transfer" | "credit_card" | "debit_card"
  ) => void;
  amountPaid: number;
  setAmountPaid: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  isProcessing: boolean;
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  processTransaction: () => Promise<void>;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  discountPercent,
  setDiscountPercent,
  taxPercent,
  setTaxPercent,
  paymentMethod,
  setPaymentMethod,
  amountPaid,
  setAmountPaid,
  notes,
  setNotes,
  isProcessing,
  updateQuantity,
  removeFromCart,
  processTransaction,
}: CheckoutModalProps) {
  const [alertDialog, setAlertDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    description: "",
    type: "success",
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const globalDiscountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - globalDiscountAmount;
  const taxAmount = (subtotalAfterDiscount * taxPercent) / 100;
  const totalAmount = subtotalAfterDiscount + taxAmount;
  const changeAmount = amountPaid - totalAmount;

  const handleProcessTransaction = async () => {
    if (paymentMethod === "cash" && amountPaid < totalAmount) {
      setAlertDialog({
        isOpen: true,
        title: "Pembayaran Tidak Cukup",
        description:
          "Jumlah bayar tidak mencukupi untuk menyelesaikan transaksi.",
        type: "error",
      });
      return;
    }

    try {
      await processTransaction();
      setAlertDialog({
        isOpen: true,
        title: "Transaksi Berhasil",
        description:
          "Transaksi telah berhasil diproses dan invoice telah dibuat.",
        type: "success",
      });
      onClose(); // Close modal after successful transaction
    } catch (error) {
      setAlertDialog({
        isOpen: true,
        title: "Transaksi Gagal",
        description:
          "Terjadi kesalahan saat memproses transaksi. Silakan coba lagi.",
        type: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              Checkout ({cart.length} item)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4">
            {/* Cart Items */}
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm leading-tight line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.product.sku}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary mt-1">
                      Rp {item.unitPrice.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs sm:text-sm w-6 sm:w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Total Price & Remove */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-xs sm:text-sm font-medium">
                      Rp {item.totalPrice.toLocaleString("id-ID")}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                Pelanggan:
              </label>
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Pelanggan Umum</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Discount & Tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium">
                  Diskon (%):
                </label>
                <Input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium">
                  Pajak (%):
                </label>
                <Input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                Metode Pembayaran:
              </label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Tunai</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="transfer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Kartu Kredit</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="debit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Kartu Debit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Paid (for cash) */}
            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  Jumlah Bayar:
                </label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="Masukkan jumlah bayar..."
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                />
                {amountPaid > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm p-2 bg-muted/30 rounded">
                    <span>Kembalian:</span>
                    <span
                      className={
                        changeAmount < 0
                          ? "text-destructive font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      Rp {Math.abs(changeAmount).toLocaleString("id-ID")}
                      {changeAmount < 0 && " (Kurang)"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Catatan:</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            {/* Summary */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">
                  Rp {subtotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Diskon:</span>
                <span className="font-medium text-red-600">
                  - Rp {globalDiscountAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Pajak ({taxPercent}%):</span>
                <span className="font-medium">
                  Rp {taxAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2 bg-primary/5 p-2 rounded">
                <span>TOTAL:</span>
                <span className="text-primary">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcessTransaction}
              disabled={
                isProcessing ||
                cart.length === 0 ||
                (paymentMethod === "cash" && amountPaid < totalAmount)
              }
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium"
              size="lg"
            >
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {isProcessing ? "Memproses..." : "Proses Transaksi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.isOpen}
        onOpenChange={(open) =>
          setAlertDialog({ ...alertDialog, isOpen: open })
        }
      >
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })}
              className="h-9 sm:h-10 text-sm sm:text-base"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
