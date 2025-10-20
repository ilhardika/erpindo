'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
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
import { openShift } from '@/lib/pos/api'
import type { PosShift } from '@/types/pos'

interface OpenShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShiftOpened: (shift: PosShift) => void
}

export function OpenShiftDialog({
  open,
  onOpenChange,
  onShiftOpened,
}: OpenShiftDialogProps) {
  const [openingCash, setOpeningCash] = useState<number>(500000)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleOpenShift = async () => {
    if (openingCash < 0) {
      toast.error('Opening cash must be a positive number')
      return
    }

    try {
      setLoading(true)

      const shift = await openShift({
        opening_cash: openingCash,
        notes: notes || undefined,
      })

      toast.success('Shift opened successfully')
      onShiftOpened(shift)
      onOpenChange(false)

      // Reset form
      setOpeningCash(500000)
      setNotes('')
    } catch (error) {
      console.error('Error opening shift:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to open shift. You may already have an active shift.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setOpeningCash(500000)
      setNotes('')
    }
  }

  const quickAmounts = [100000, 200000, 500000, 1000000]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogIn className="mr-2 h-5 w-5" />
            Open Shift
          </DialogTitle>
          <DialogDescription>
            Record your opening cash to start your shift
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opening Cash Input */}
          <div className="space-y-2">
            <Label htmlFor="opening-cash">
              Opening Cash <span className="text-red-500">*</span>
            </Label>
            <Input
              id="opening-cash"
              type="number"
              placeholder="500000"
              value={openingCash || ''}
              onChange={e => setOpeningCash(parseFloat(e.target.value) || 0)}
              min={0}
              step={1000}
            />
            <p className="text-sm text-muted-foreground">
              Current: Rp {openingCash.toLocaleString()}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick Amounts</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setOpeningCash(amount)}
                  type="button"
                >
                  Rp {(amount / 1000).toFixed(0)}K
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any notes for this shift..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Before opening shift:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Count your cash drawer carefully</li>
              <li>Ensure all bills are in good condition</li>
              <li>Keep small denominations ready</li>
              <li>Only one shift can be open at a time</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleOpenShift} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Opening...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Open Shift
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
