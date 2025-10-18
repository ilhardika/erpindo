'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTableLayout } from '@/components/layouts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from '@/lib/inventory/api'
import type { ProductCategory } from '@/types/inventory'

export default function ProductCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await getProductCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      alert('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(category: ProductCategory) {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active ?? true,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setAddingNew(false)
    setFormData({ name: '', description: '', is_active: true })
  }

  async function handleSave(id?: string) {
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      if (id) {
        await updateProductCategory(id, formData)
        alert('Category updated successfully')
      } else {
        await createProductCategory(formData)
        alert('Category created successfully')
      }
      await loadCategories()
      cancelEdit()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteProductCategory(id)
      alert('Category deleted successfully')
      await loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  return (
    <DataTableLayout
      title="Product Categories"
      description="Manage product categories for inventory classification"
      actions={
        <div className="flex gap-2">
          <Button onClick={() => router.push('/erp/inventory')}>
            Back to Inventory
          </Button>
          <Button onClick={() => setAddingNew(true)} disabled={addingNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addingNew && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Category name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Description"
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.is_active}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, is_active: !!checked })
                      }
                    />
                    <label className="text-sm">Active</label>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleSave()}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>
                  {editingId === category.id ? (
                    <Input
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === category.id ? (
                    <Input
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    category.description || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === category.id ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.is_active}
                        onCheckedChange={checked =>
                          setFormData({ ...formData, is_active: !!checked })
                        }
                      />
                      <label className="text-sm">Active</label>
                    </div>
                  ) : (
                    <Badge
                      variant={category.is_active ? 'default' : 'secondary'}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === category.id ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleSave(category.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(category)}
                        disabled={addingNew || editingId !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        disabled={addingNew || editingId !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && categories.length === 0 && !addingNew && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No categories found. Click &quot;Add Category&quot; to create
                  one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DataTableLayout>
  )
}
