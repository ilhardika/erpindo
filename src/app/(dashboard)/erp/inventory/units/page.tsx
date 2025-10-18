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
  getProductUnits,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
} from '@/lib/inventory/api'
import type { ProductUnit } from '@/types/inventory'

export default function ProductUnitsPage() {
  const router = useRouter()
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    is_active: true,
  })

  useEffect(() => {
    loadUnits()
  }, [])

  async function loadUnits() {
    try {
      setLoading(true)
      const data = await getProductUnits()
      setUnits(data)
    } catch (error) {
      console.error('Error loading units:', error)
      alert('Failed to load units')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(unit: ProductUnit) {
    setEditingId(unit.id)
    setFormData({
      name: unit.name,
      symbol: unit.symbol || '',
      is_active: unit.is_active ?? true,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setAddingNew(false)
    setFormData({ name: '', symbol: '', is_active: true })
  }

  async function handleSave(id?: string) {
    if (!formData.name.trim()) {
      alert('Unit name is required')
      return
    }

    try {
      if (id) {
        await updateProductUnit(id, formData)
        alert('Unit updated successfully')
      } else {
        await createProductUnit(formData)
        alert('Unit created successfully')
      }
      await loadUnits()
      cancelEdit()
    } catch (error) {
      console.error('Error saving unit:', error)
      alert('Failed to save unit')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this unit?')) return

    try {
      await deleteProductUnit(id)
      alert('Unit deleted successfully')
      await loadUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
      alert('Failed to delete unit')
    }
  }

  return (
    <DataTableLayout
      title="Product Units"
      description="Manage units of measurement for products (kg, pcs, box, etc.)"
      actions={
        <div className="flex gap-2">
          <Button onClick={() => router.push('/erp/inventory')}>
            Back to Inventory
          </Button>
          <Button onClick={() => setAddingNew(true)} disabled={addingNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Unit
          </Button>
        </div>
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addingNew && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Unit name (e.g., Kilogram)"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Symbol (e.g., kg)"
                    value={formData.symbol}
                    onChange={e =>
                      setFormData({ ...formData, symbol: e.target.value })
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
            {units.map(unit => (
              <TableRow key={unit.id}>
                <TableCell>
                  {editingId === unit.id ? (
                    <Input
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    unit.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === unit.id ? (
                    <Input
                      value={formData.symbol}
                      onChange={e =>
                        setFormData({ ...formData, symbol: e.target.value })
                      }
                    />
                  ) : (
                    unit.symbol || '-'
                  )}
                </TableCell>
                <TableCell>
                  {editingId === unit.id ? (
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
                    <Badge variant={unit.is_active ? 'default' : 'secondary'}>
                      {unit.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === unit.id ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleSave(unit.id)}>
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
                        onClick={() => startEdit(unit)}
                        disabled={addingNew || editingId !== null}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(unit.id)}
                        disabled={addingNew || editingId !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && units.length === 0 && !addingNew && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No units found. Click &quot;Add Unit&quot; to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DataTableLayout>
  )
}
