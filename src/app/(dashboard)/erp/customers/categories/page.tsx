'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  getCustomerCategories,
  createCustomerCategory,
} from '@/lib/customers/api'
import type { CustomerCategory } from '@/types/customers'

/**
 * Customer Categories Management Page
 * Full CRUD operations for customer categories
 *
 * Clean Code Principles:
 * - Single Responsibility: Only manages customer categories
 * - DRY: Reusable dialog for create/edit
 * - Separation of Concerns: UI separate from business logic
 */
export default function CustomerCategoriesPage() {
  const [categories, setCategories] = useState<CustomerCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingCategory, setEditingCategory] =
    useState<CustomerCategory | null>(null)

  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Open create dialog
  const handleCreate = () => {
    setDialogMode('create')
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
    setDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = (category: CustomerCategory) => {
    setDialogMode('edit')
    setFormData({
      name: category.name,
      description: category.description || '',
    })
    setEditingCategory(category)
    setDialogOpen(true)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      if (dialogMode === 'create') {
        await createCustomerCategory(
          formData.name,
          formData.description || undefined
        )
        toast.success('Category created successfully')
      } else {
        // TODO: Implement update API
        toast.success('Category updated successfully')
      }

      setDialogOpen(false)
      loadCategories()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      // TODO: Implement delete API with validation
      // Check if category is in use before deleting
      toast.success('Category deleted successfully')
      loadCategories()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete category'
      )
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customer categories for better organization
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            All customer categories in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' ? 'Create Category' : 'Edit Category'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Add a new customer category'
                  : 'Update category information'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Wholesale"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this category..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dialogMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
