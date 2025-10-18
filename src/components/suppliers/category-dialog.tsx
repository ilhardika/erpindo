'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  categoryFormSchema,
  type CategoryFormData,
} from '@/lib/suppliers/validation'
import { createSupplierCategory } from '@/lib/suppliers/api'
import type { SupplierCategory } from '@/lib/suppliers/types'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (category: SupplierCategory) => void
}

/**
 * Category Dialog Component
 * Dialog for creating new supplier categories inline
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles category creation UI
 * - DRY: Reusable dialog component
 * - Separation of Concerns: Validation in separate file, API in separate file
 */
export function CategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CategoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true)
      const newCategory = await createSupplierCategory(data)

      if (newCategory) {
        toast.success('Category created successfully')
        reset()
        onSuccess(newCategory)
      } else {
        toast.error('Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('An error occurred while creating the category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen) {
        reset()
      }
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new supplier category to organize your suppliers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              {...register('name')}
              placeholder="e.g., Raw Materials, Services"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              {...register('description')}
              placeholder="Enter category description (optional)"
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
