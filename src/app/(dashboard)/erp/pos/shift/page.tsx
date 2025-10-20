'use client'

import { useEffect, useState } from 'react'
import { LogIn, LogOut, RefreshCw, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTableLayout } from '@/components/layouts/data-table-layout'
import { OpenShiftDialog } from '@/components/pos/open-shift-dialog'
import { CloseShiftDialog } from '@/components/pos/close-shift-dialog'
import { getShifts, getCurrentShift } from '@/lib/pos/api'
import type { PosShift, PosShiftWithCashier } from '@/types/pos'

export default function ShiftManagementPage() {
  const [currentShift, setCurrentShift] = useState<PosShift | null>(null)
  const [shifts, setShifts] = useState<PosShiftWithCashier[]>([])
  const [loading, setLoading] = useState(true)
  const [openShiftDialogOpen, setOpenShiftDialogOpen] = useState(false)
  const [closeShiftDialogOpen, setCloseShiftDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [shiftData, shiftsData] = await Promise.all([
        getCurrentShift('current'),
        getShifts({ status: undefined }), // Get all shifts
      ])
      setCurrentShift(shiftData)
      setShifts(shiftsData)
    } catch (error) {
      console.error('Error loading shift data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShiftOpened = (shift: PosShift) => {
    setCurrentShift(shift)
    loadData() // Reload to update shift list
  }

  const handleShiftClosed = () => {
    setCurrentShift(null)
    loadData() // Reload to update shift list
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`
  }

  return (
    <DataTableLayout
      title="Shift Management"
      description="Manage cashier shifts and view shift history"
    >
      <div className="space-y-6">
        {/* Current Shift Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Shift Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : currentShift ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-600">
                        SHIFT OPEN
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{currentShift.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Opened:</span>
                        <span className="font-medium">
                          {formatDate(currentShift.opened_at)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Opening Cash:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(currentShift.opening_cash)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setCloseShiftDialogOpen(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Close Shift
                  </Button>
                </div>
                {currentShift.notes && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Notes:</p>
                    <p className="text-muted-foreground">
                      {currentShift.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <LogIn className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">No Active Shift</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Open a new shift to start cashier operations
                </p>
                <Button onClick={() => setOpenShiftDialogOpen(true)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Open New Shift
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shift History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shift History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {shifts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No shift history available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Cashier</th>
                      <th className="pb-3">Opened</th>
                      <th className="pb-3">Closed</th>
                      <th className="pb-3 text-right">Opening Cash</th>
                      <th className="pb-3 text-right">Expected Cash</th>
                      <th className="pb-3 text-right">Actual Cash</th>
                      <th className="pb-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(shift => {
                      const variance =
                        shift.status === 'closed'
                          ? (shift.actual_cash || 0) -
                            (shift.expected_cash || 0)
                          : 0

                      return (
                        <tr
                          key={shift.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3">
                            <Badge
                              variant={
                                shift.status === 'open'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className={
                                shift.status === 'open'
                                  ? 'bg-green-600'
                                  : 'bg-gray-600'
                              }
                            >
                              {shift.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {shift.cashier?.name || 'N/A'}
                          </td>
                          <td className="py-3 text-sm">
                            {formatDate(shift.opened_at)}
                          </td>
                          <td className="py-3 text-sm">
                            {shift.closed_at
                              ? formatDate(shift.closed_at)
                              : '-'}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {formatCurrency(shift.opening_cash)}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {shift.expected_cash
                              ? formatCurrency(shift.expected_cash)
                              : '-'}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {shift.actual_cash
                              ? formatCurrency(shift.actual_cash)
                              : '-'}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {shift.status === 'closed' ? (
                              <span
                                className={
                                  variance > 0
                                    ? 'text-green-600'
                                    : variance < 0
                                      ? 'text-red-600'
                                      : 'text-gray-600'
                                }
                              >
                                {variance >= 0 ? '+' : ''}
                                {formatCurrency(variance)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <OpenShiftDialog
        open={openShiftDialogOpen}
        onOpenChange={setOpenShiftDialogOpen}
        onShiftOpened={handleShiftOpened}
      />

      <CloseShiftDialog
        open={closeShiftDialogOpen}
        onOpenChange={setCloseShiftDialogOpen}
        shift={currentShift}
        onShiftClosed={handleShiftClosed}
      />
    </DataTableLayout>
  )
}
