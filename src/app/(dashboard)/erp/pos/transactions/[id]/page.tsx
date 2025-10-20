'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { printReceiptInNewTab } from '@/lib/pos/print-utils'
import { getTransactionById } from '@/lib/pos/api'
import type { PosTransactionWithRelations, PaymentMethod } from '@/types/pos'
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  CreditCard,
  Package,
  Receipt,
  DollarSign,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [transaction, setTransaction] =
    useState<PosTransactionWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadTransaction(params.id as string)
    }
  }, [params.id])

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true)
      const data = await getTransactionById(id)
      if (!data) {
        toast.error('Transaction not found')
        router.push('/erp/pos/transactions')
        return
      }
      setTransaction(data)
    } catch (error) {
      console.error('Error loading transaction:', error)
      toast.error('Failed to load transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleReprint = () => {
    if (!transaction) return
    printReceiptInNewTab(transaction, {
      name: 'ERPINDO COMPANY',
      address: 'Jl. Bisnis No. 123, Jakarta',
      phone: '+62 21 1234 5678',
    })
    toast.success('Opening print preview in new tab...')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const badges: Record<
      PaymentMethod,
      { label: string; variant: 'default' | 'secondary' | 'outline' }
    > = {
      cash: { label: 'Cash', variant: 'default' },
      card: { label: 'Card', variant: 'secondary' },
      transfer: { label: 'Transfer', variant: 'outline' },
      'e-wallet': { label: 'E-Wallet', variant: 'secondary' },
      credit: { label: 'Credit', variant: 'outline' },
      split: { label: 'Split Payment', variant: 'default' },
    }
    const badge = badges[method]
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      paid: 'default',
      pending: 'secondary',
      refunded: 'outline' as 'secondary',
      cancelled: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading transaction...</div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Transaction not found</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction Detail</h1>
            <p className="text-muted-foreground">
              View transaction information and reprint receipt
            </p>
          </div>
          <Button variant="outline" onClick={handleReprint}>
            <Printer className="h-4 w-4 mr-2" />
            Reprint Receipt
          </Button>
        </div>

        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Transaction Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transaction Number */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Transaction Number
                </div>
                <div className="font-mono font-medium">
                  {transaction.transaction_number}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{getPaymentStatusBadge(transaction.payment_status)}</div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Transaction Date
                </div>
                <div className="font-medium">
                  {formatDate(transaction.transaction_date)}
                </div>
              </div>

              {/* Cashier */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Cashier
                </div>
                <div className="font-medium">{transaction.cashier.name}</div>
              </div>

              {/* Customer */}
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Customer
                </div>
                <div className="font-medium">
                  {transaction.customer?.name || 'Walk-in Customer'}
                </div>
              </div>

              {/* Shift */}
              {transaction.shift && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Shift
                  </div>
                  <div className="font-medium">
                    {new Date(transaction.shift.opened_at).toLocaleDateString(
                      'id-ID'
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {transaction.notes && (
              <>
                <Separator />
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    {transaction.notes}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Transaction Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.product.name}</div>
                        {item.promotion && (
                          <div className="text-xs text-green-600">
                            Promotion: {item.promotion.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {item.product.sku}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {item.discount_amount > 0
                          ? `-${formatCurrency(item.discount_amount)}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment Method */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <div>{getPaymentMethodBadge(transaction.payment_method)}</div>
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(transaction.subtotal)}</span>
              </div>
              {transaction.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(transaction.discount_amount)}</span>
                </div>
              )}
              {transaction.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatCurrency(transaction.tax_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  Total
                </span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
            </div>

            {/* Split Payment Details */}
            {transaction.payment_method === 'split' &&
              transaction.payments.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Payment Details</div>
                    {transaction.payments.map(payment => (
                      <div
                        key={payment.id}
                        className="flex justify-between text-sm p-2 bg-muted rounded-md"
                      >
                        <div>
                          <Badge variant="outline" className="mr-2">
                            {payment.payment_method.toUpperCase()}
                          </Badge>
                          {payment.reference_number && (
                            <span className="text-xs text-muted-foreground">
                              Ref: {payment.reference_number}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => router.push('/erp/pos/transactions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transaction List
          </Button>
        </div>
      </div>
    </>
  )
}
