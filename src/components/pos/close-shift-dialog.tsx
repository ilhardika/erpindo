'use client'

import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'
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
import { toast } from 'sonner'
import { closeShift, getShiftSummary } from '@/lib/pos/api'
import type { PosShift, ShiftSummary } from '@/types/pos'

interface CloseShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift: PosShift | null
  onShiftClosed: () => void
}

export function CloseShiftDialog({
  open,
  onOpenChange,
  shift,
  onShiftClosed,
}: CloseShiftDialogProps) {
  const [actualCash, setActualCash] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ShiftSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Load shift summary when dialog opens
  useEffect(() => {
    if (open && shift) {
      loadShiftSummary()
    }
  }, [open, shift])

  const loadShiftSummary = async () => {
    if (!shift) return

    try {
      setLoadingSummary(true)
      const summaryData = await getShiftSummary(shift.id)
      setSummary(summaryData)
      // Set default actual cash to expected cash
      setActualCash(summaryData.expected_cash)
    } catch (error) {
      console.error('Error loading shift summary:', error)
      toast.error('Failed to load shift summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleCloseShift = async () => {
    if (!shift || !summary) return

    if (actualCash < 0) {
      toast.error('Actual cash must be a positive number')
      return
    }

    try {
      setLoading(true)

      await closeShift(shift.id, {
        closing_cash: summary.expected_cash,
        actual_cash: actualCash,
        notes: notes || undefined,
      })

      toast.success('Shift closed successfully')
      onShiftClosed()
      onOpenChange(false)

      // Reset form
      setActualCash(0)
      setNotes('')
      setSummary(null)
    } catch (error) {
      console.error('Error closing shift:', error)
      toast.error('Failed to close shift')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setActualCash(0)
      setNotes('')
      setSummary(null)
    }
  }

  if (!shift) return null

  const variance = summary ? actualCash - summary.expected_cash : 0
  const varianceColor =
    variance > 0
      ? 'text-green-600'
      : variance < 0
        ? 'text-red-600'
        : 'text-gray-600'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogOut className="mr-2 h-5 w-5" />
            Close Shift
          </DialogTitle>
          <DialogDescription>
            Review shift summary and record your closing cash
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingSummary ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : summary ? (
            <>
              {/* Shift Summary */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="mb-3 font-semibold">Shift Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Opening Cash</p>
                    <p className="font-medium">
                      Rp {summary.opening_cash.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Transactions</p>
                    <p className="font-medium">{summary.total_transactions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cash Sales</p>
                    <p className="font-medium">
                      Rp {summary.cash_sales.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Card Sales</p>
                    <p className="font-medium">
                      Rp {summary.card_sales.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transfer Sales</p>
                    <p className="font-medium">
                      Rp {summary.transfer_sales.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Sales</p>
                    <p className="font-medium">
                      Rp {summary.total_sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expected Cash */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Expected Cash in Drawer
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Opening + Cash Sales
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Rp {summary.expected_cash.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actual Cash Input */}
              <div className="space-y-2">
                <Label htmlFor="actual-cash">
                  Actual Cash Counted <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="actual-cash"
                  type="number"
                  placeholder="Count your cash drawer"
                  value={actualCash || ''}
                  onChange={e => setActualCash(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={1000}
                />
                <p className="text-sm text-muted-foreground">
                  Current: Rp {actualCash.toLocaleString()}
                </p>
              </div>

              {/* Variance Display */}
              {actualCash > 0 && (
                <div
                  className={`rounded-lg border p-4 ${
                    variance > 0
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      : variance < 0
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Cash Variance</p>
                      <p className="text-xs text-muted-foreground">
                        {variance > 0
                          ? 'Cash Over (Surplus)'
                          : variance < 0
                            ? 'Cash Short (Shortage)'
                            : 'Balanced'}
                      </p>
                    </div>
                    <p className={`text-2xl font-bold ${varianceColor}`}>
                      {variance >= 0 ? '+' : ''}Rp {variance.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Notes{' '}
                  {variance !== 0 && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="notes"
                  placeholder={
                    variance !== 0
                      ? 'Explain the variance...'
                      : 'Any notes for this shift closure...'
                  }
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                {variance !== 0 && (
                  <p className="text-sm text-amber-600">
                    Please provide a reason for the cash variance
                  </p>
                )}
              </div>

              {/* Warning */}
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="font-medium">Important:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Count your cash drawer carefully before closing</li>
                  <li>Ensure all transactions for this shift are completed</li>
                  <li>Double-check card and transfer transactions</li>
                  <li>Once closed, this shift cannot be reopened</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load shift summary
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleCloseShift}
            disabled={loading || !summary || actualCash <= 0}
            variant={variance === 0 ? 'default' : 'destructive'}
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Closing...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Close Shift
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
