'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  categoryFormSchema,
  type CategoryFormData,
} from '@/lib/customers/validation'
import { createCustomerCategory } from '@/lib/customers/api'
import type { CustomerCategory } from '@/types/customers'

interface CategoryDialogProps {
  onCategoryCreated: (category: CustomerCategory) => void
}

/**
 * Category Management Dialog
 * Reusable dialog for creating new customer categories
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles category creation
 * - DRY: Reusable across customer forms
 * - Separation of Concerns: UI separated from business logic
 */
export function CategoryDialog({ onCategoryCreated }: CategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      const newCategory = await createCustomerCategory(
        data.name,
        data.description || undefined
      )

      toast.success('Category created successfully')
      onCategoryCreated(newCategory)
      setOpen(false)
      reset()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create category'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new customer category to organize your customers better.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Wholesale"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this category..."
                rows={3}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
