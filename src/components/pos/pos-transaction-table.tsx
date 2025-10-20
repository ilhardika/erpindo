'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  RefreshCw,
  Eye,
  Printer,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { PosTransactionWithRelations, PaymentMethod } from '@/types/pos'

interface PosTransactionTableProps {
  transactions: PosTransactionWithRelations[]
  loading: boolean
  onRefresh: () => void
  onReprint?: (transaction: PosTransactionWithRelations) => void
}

export function PosTransactionTable({
  transactions,
  loading,
  onRefresh,
  onReprint,
}: PosTransactionTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const matchesSearch =
      !search ||
      transaction.transaction_number
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      transaction.customer?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      transaction.cashier?.name?.toLowerCase().includes(search.toLowerCase())

    // Payment method filter
    const matchesPaymentMethod =
      paymentMethodFilter === 'all' ||
      transaction.payment_method === paymentMethodFilter

    // Date range filter
    const transactionDate = new Date(transaction.transaction_date)
    const matchesDateFrom =
      !dateFrom || transactionDate >= new Date(dateFrom + 'T00:00:00')
    const matchesDateTo =
      !dateTo || transactionDate <= new Date(dateTo + 'T23:59:59')

    return (
      matchesSearch && matchesPaymentMethod && matchesDateFrom && matchesDateTo
    )
  })

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
      split: { label: 'Split', variant: 'default' },
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

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction number, customer, or cashier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Payment Method Filter */}
            <Select
              value={paymentMethodFilter}
              onValueChange={setPaymentMethodFilter}
            >
              <SelectTrigger>
                <CreditCard className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="e-wallet">E-Wallet</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="split">Split Payment</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="pl-10"
                placeholder="From Date"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="pl-10"
                placeholder="To Date"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="default"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredTransactions.length} of {transactions.length}{' '}
          transactions
        </div>

        {/* Table */}
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Transaction #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Cashier
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Items
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">
                        Loading transactions...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="text-muted-foreground">
                      No transactions found
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(transaction => (
                  <tr
                    key={transaction.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono">
                      {transaction.transaction_number}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {transaction.customer?.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.cashier?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {transaction.items.length}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getPaymentMethodBadge(transaction.payment_method)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getPaymentStatusBadge(transaction.payment_status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/erp/pos/transactions/${transaction.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onReprint && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReprint(transaction)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
