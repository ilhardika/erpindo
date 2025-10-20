'use client'

import { useState, useEffect } from 'react'
import { DataTableLayout } from '@/components/layouts/data-table-layout'
import { getShifts } from '@/lib/pos/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PosShift } from '@/types/pos'

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<PosShift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    try {
      setLoading(true)
      const data = await getShifts({})
      setShifts(data)
    } catch (error) {
      console.error('Error loading shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DataTableLayout
      title="Shift History"
      description="View all shift records, summaries, and variance reports"
    >
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="text-muted-foreground">Loading shifts...</div>
        </div>
      ) : shifts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">No shifts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shifts.map(shift => (
            <Card key={shift.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {shift.id.slice(0, 8)}
                      </span>
                      <Badge
                        variant={
                          shift.status === 'open' ? 'default' : 'secondary'
                        }
                      >
                        {shift.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      Opened: {formatDate(shift.opened_at)}
                      {shift.closed_at &&
                        ` • Closed: ${formatDate(shift.closed_at)}`}
                    </div>
                    {shift.cashier_id && (
                      <div className="text-sm text-muted-foreground">
                        Cashier: {shift.cashier_id.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm">
                      Opening: {formatCurrency(shift.opening_cash || 0)}
                    </div>
                    {shift.closing_cash !== null && (
                      <div className="text-sm">
                        Closing: {formatCurrency(shift.closing_cash || 0)}
                      </div>
                    )}
                    {shift.variance !== null && shift.variance !== 0 && (
                      <div
                        className={`text-sm font-medium ${shift.variance > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        Variance: {formatCurrency(shift.variance || 0)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DataTableLayout>
  )
}
