'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Building2, Plus, X, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { PaymentMethod } from '@/types/pos'

interface Payment {
  method: PaymentMethod
  amount: number
  reference?: string
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  onConfirm: (payments: Payment[], shouldPrint: boolean) => void
  loading?: boolean
}

export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  onConfirm,
  loading = false,
}: PaymentDialogProps) {
  const [payments, setPayments] = useState<Payment[]>([
    { method: 'cash', amount: 0, reference: '' },
  ])
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(false)

  // Calculate totals
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const remainingAmount = totalAmount - paidAmount
  const changeAmount =
    payments.length === 1 && payments[0].method === 'cash'
      ? Math.max(0, cashReceived - totalAmount)
      : 0

  const handleAddPayment = () => {
    setPayments([...payments, { method: 'card', amount: 0, reference: '' }])
  }

  const handleRemovePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index))
    }
  }

  const handlePaymentChange = (
    index: number,
    field: keyof Payment,
    value: string | number
  ) => {
    const updated = [...payments]
    updated[index] = { ...updated[index], [field]: value }
    setPayments(updated)
  }

  const handleQuickAmount = (amount: number) => {
    if (payments.length === 1 && payments[0].method === 'cash') {
      setCashReceived(amount)
      handlePaymentChange(0, 'amount', totalAmount)
    }
  }

  const handleConfirm = () => {
    // Validate payments
    if (paidAmount < totalAmount) {
      toast.error(
        `Pembayaran kurang! Masih kurang Rp ${(totalAmount - paidAmount).toLocaleString('id-ID')}`
      )
      return
    }

    // For single cash payment, use the actual payment amount (not cash received)
    const finalPayments = payments.map(p => ({
      method: p.method,
      amount: p.amount,
      reference: p.reference || undefined,
    }))

    onConfirm(finalPayments, shouldPrintReceipt)
  }

  const handleClose = () => {
    // Reset state when closing
    setPayments([{ method: 'cash', amount: 0, reference: '' }])
    setCashReceived(0)
    setShouldPrintReceipt(false)
    onOpenChange(false)
  }

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'transfer':
        return <Building2 className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const isSingleCashPayment =
    payments.length === 1 && payments[0].method === 'cash'
  const canConfirm = paidAmount >= totalAmount && !loading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Select payment method and enter amount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Amount
              </span>
              <span className="text-2xl font-bold">
                Rp {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Amount Buttons (for single cash payment) */}
          {isSingleCashPayment && (
            <div className="space-y-2">
              <Label>Quick Amount (Cash Received)</Label>
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000, 500000].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => handleQuickAmount(amount)}
                    type="button"
                  >
                    Rp {(amount / 1000).toFixed(0)}K
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleQuickAmount(totalAmount)}
                  type="button"
                >
                  Exact
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const rounded = Math.ceil(totalAmount / 1000) * 1000
                    handleQuickAmount(rounded)
                  }}
                  type="button"
                >
                  Round
                </Button>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Payment Details</Label>
              {payments.length < 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPayment}
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment
                </Button>
              )}
            </div>

            {payments.map((payment, index) => (
              <div key={index} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPaymentIcon(payment.method)}
                    <span className="font-medium">
                      Payment {payments.length > 1 ? index + 1 : ''}
                    </span>
                  </div>
                  {payments.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePayment(index)}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={payment.method}
                      onValueChange={value =>
                        handlePaymentChange(index, 'method', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={payment.amount || ''}
                      onChange={e =>
                        handlePaymentChange(
                          index,
                          'amount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                {payment.method !== 'cash' && (
                  <div className="space-y-2">
                    <Label>Reference Number (Optional)</Label>
                    <Input
                      placeholder="Transaction reference"
                      value={payment.reference || ''}
                      onChange={e =>
                        handlePaymentChange(index, 'reference', e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Cash Received (only for single cash payment) */}
                {isSingleCashPayment && (
                  <div className="space-y-2">
                    <Label>Cash Received</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cashReceived || ''}
                      onChange={e => {
                        const received = parseFloat(e.target.value) || 0
                        setCashReceived(received)
                        handlePaymentChange(0, 'amount', totalAmount)
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span>Rp {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">
                Rp {paidAmount.toLocaleString()}
              </span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-600">
                    Rp {remainingAmount.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    Kurang Bayar
                  </Badge>
                </div>
              </div>
            )}
            {isSingleCashPayment && changeAmount > 0 && (
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Change</span>
                <span className="text-lg font-bold text-green-600">
                  Rp {changeAmount.toLocaleString()}
                </span>
              </div>
            )}
            {payments.length > 1 && (
              <div className="pt-2">
                <Badge variant="secondary">Split Payment</Badge>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="print-receipt"
              checked={shouldPrintReceipt}
              onCheckedChange={checked =>
                setShouldPrintReceipt(checked as boolean)
              }
            />
            <label
              htmlFor="print-receipt"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print receipt after payment
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={
                remainingAmount > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Processing...
                </>
              ) : remainingAmount > 0 ? (
                <>Kurang Rp {remainingAmount.toLocaleString('id-ID')}</>
              ) : (
                'Confirm Payment'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
