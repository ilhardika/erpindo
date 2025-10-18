'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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

import { CategoryDialog } from '@/components/suppliers/category-dialog'
import {
  getSupplierCategories,
  deleteSupplierCategory,
} from '@/lib/suppliers/api'
import type { SupplierCategory } from '@/lib/suppliers/types'

/**
 * Supplier Categories Management Page
 * CRUD operations for supplier categories
 *
 * Clean Code Principles:
 * - Single Responsibility: Only manages supplier categories
 * - DRY: Reuses CategoryDialog component
 * - KISS: Simple table-based interface
 */
export default function SupplierCategoriesPage() {
  const [categories, setCategories] = useState<SupplierCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSupplierCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Handle category creation success
  const handleSuccess = (newCategory: SupplierCategory) => {
    setCategories([...categories, newCategory])
    setDialogOpen(false)
  }

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const success = await deleteSupplierCategory(categoryId)
      if (success) {
        toast.success('Category deleted successfully')
        setCategories(categories.filter(c => c.id !== categoryId))
      } else {
        toast.error('Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      toast.error('An error occurred while deleting the category')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Categories
          </h1>
          <p className="text-muted-foreground">
            Manage your supplier categories
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Organize your suppliers into categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No categories found. Create your first category to get
                    started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="flex justify-start">
        <Link href="/erp/suppliers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Suppliers
          </Button>
        </Link>
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
