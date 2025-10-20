'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableLayout } from '@/components/layouts/data-table-layout'
import { PosTransactionTable } from '@/components/pos/pos-transaction-table'
import { getTransactionsWithRelations } from '@/lib/pos/api'
import { printReceiptInNewTab } from '@/lib/pos/print-utils'
import type { PosTransactionWithRelations } from '@/types/pos'
import { toast } from 'sonner'

export default function PosTransactionsPage() {
  const [transactions, setTransactions] = useState<
    PosTransactionWithRelations[]
  >([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactionsWithRelations({})
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleReprint = (transaction: PosTransactionWithRelations) => {
    // Print directly to new tab instead of showing modal
    printReceiptInNewTab(transaction, {
      name: 'ERPINDO COMPANY',
      address: 'Jl. Bisnis No. 123, Jakarta',
      phone: '+62 21 1234 5678',
    })
    toast.success('Opening print preview in new tab...')
  }

  return (
    <DataTableLayout
      title="Transaction History"
      description="View all POS transactions and reprint receipts"
      actions={
        <Link href="/erp/pos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to POS
          </Button>
        </Link>
      }
    >
      <PosTransactionTable
        transactions={transactions}
        loading={loading}
        onRefresh={loadTransactions}
        onReprint={handleReprint}
      />
    </DataTableLayout>
  )
}
